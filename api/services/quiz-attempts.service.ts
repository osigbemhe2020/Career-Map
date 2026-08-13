// services/quiz/quizAttemptService.ts
import QuizAttempt from '../models/quiz-attempts.model';
//import QuizQuestion from '../models/quiz-question.model';
import QuizScoringService, { SubmitAnswerInput } from './quiz-scoring.service';
import QuizSelectionService from './quiz-selection.service';
import QuizConfidenceService from './quiz-confidence.service';
import QuizResultsService from './quiz-result.service';


class QuizAttemptService {
  // Now returns a single question, same shape as every other step --
  // no more bulk-returning all of Pool A. pickNextQuestion() (fixed in
  // quizSelectionService.ts) knows to walk through Pool A first, then
  // fall through to adaptive selection once it's exhausted. This means
  // starting a brand-new attempt and resuming an in-progress one now go
  // through the exact same code path.
  static async startAttempt(userId: string) {
    const attempt = await QuizAttempt.findInProgressForUser(userId) ?? (await QuizAttempt.create(userId));

    // if this attempt already has a pending question saved (e.g. resuming
    // after a refresh), just return that instead of picking a new one
    if (attempt.pending_question_id) {
      return { attempt, question: null, resumedQuestionId: attempt.pending_question_id };
    }

    const question = await QuizSelectionService.pickNextQuestion(attempt.id);
    if (question) {
      await QuizAttempt.setPendingQuestion(attempt.id, question.id);
    }
    return { attempt, question, resumedQuestionId: null };
  }

  static async submitAnswer(input: SubmitAnswerInput) {
    await QuizScoringService.submitAnswer(input);
    return this.afterScoringUpdate(input.attemptId);
  }

  static async skipQuestion(attemptId: string, questionId: number) {
    await QuizScoringService.submitSkip(attemptId, questionId);
    return this.afterScoringUpdate(attemptId);
  }

  // shared "what happens after any trait_scores_raw update" logic --
  // used by both a real answer and a skip
  private static async afterScoringUpdate(attemptId: string) {
    const shouldStop = await QuizConfidenceService.shouldStopQuiz(attemptId);
    if (shouldStop) {
      const results = await QuizResultsService.finalizeResults(attemptId);
      // finalize() already clears pending_question_id -- nothing left to resume
      return { done: true, results };
    }

    const nextQuestion = await QuizSelectionService.pickNextQuestion(attemptId);
    if (!nextQuestion) {
      const results = await QuizResultsService.finalizeResults(attemptId);
      return { done: true, results };
    }

    await QuizAttempt.setPendingQuestion(attemptId, nextQuestion.id);

    return { done: false, nextQuestion };
  }
}

export default QuizAttemptService;