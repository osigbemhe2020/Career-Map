// controllers/quizController.ts
import QuizAttemptService from '../services/quiz-attempts.service';
import QuizAttempt from '../models/quiz-attempts.model';
import QuizResultsService from '../services/quiz-result.service';
//import { HTTP_STATUS } from '../utils/const';
import QuizQuestion from '../models/quiz-question.model';
import QuizAnswerOption from '../models/quiz-options.model';


import type { Request, Response } from 'express';





function getUserId(req: Request): string {
  return (req as any).user.id;
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    const err: any = new Error(`Missing or invalid route parameter: ${name}`);
    err.status = 400;
    throw err;
  }
  return value;
}

async function hydrateQuestion(question: any) {
  if (question.question_type === 'scale' || question.question_type === 'reflection_text') {
    return question;
  }
  const options = await QuizAnswerOption.findByQuestion(question.id);
  return {
    ...question,
    options: options.map((o: any) => ({ id: o.id, label: o.option_label }))
  };
}

async function assertOwnsAttempt(attemptId: string, userId: string) {
  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt) {
    const err: any = new Error('Quiz attempt not found');
    err.status = 404;
    throw err;
  }
  if (attempt.user_id !== userId) {
    const err: any = new Error('This quiz attempt does not belong to you');
    err.status = 403;
    throw err;
  }
  return attempt;
}

export const startQuiz = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { attempt, question, resumedQuestionId } = await QuizAttemptService.startAttempt(userId);

  let questionToReturn = question;
  if (!questionToReturn && resumedQuestionId) {
    questionToReturn = await QuizQuestion.findById(resumedQuestionId);
  }

  res.status(200).json({
    attempt: {
      id: attempt.id,
      startedAt: attempt.started_at,
      askedQuestionIds: attempt.asked_question_ids
    },
    // single question, same shape every other step returns -- null only if
    // the attempt is somehow already complete with nothing left to resume
    nextQuestion: questionToReturn ? await hydrateQuestion(questionToReturn) : null
  });
};

export const getAttemptStatus = async (req: Request, res: Response) => {
  try {
    const attempt = await assertOwnsAttempt(getParam(req, 'attemptId'), getUserId(req));

    let pendingQuestion = null;
    if (attempt.pending_question_id) {
      const question = await QuizQuestion.findById(attempt.pending_question_id);
      if (question) pendingQuestion = await hydrateQuestion(question);
    }

    res.status(200).json({
      id: attempt.id,
      completed: !!attempt.completed_at,
      questionsAnswered: attempt.asked_question_ids.length,
      confidence: attempt.confidence,
      pendingQuestion
    });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));

    const { questionId, selectedOptionIds, rankingOrder, scaleValue, reflectionText } = req.body;
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const result = await QuizAttemptService.submitAnswer({
      attemptId,
      questionId,
      selectedOptionIds,
      rankingOrder,
      scaleValue,
      reflectionText
    });

    if (result.done) {
      return res.status(200).json({ done: true, results: result.results });
    }

    res.status(200).json({ done: false, nextQuestion: await hydrateQuestion(result.nextQuestion) });
  } catch (err: any) {
    res.status(err.status ?? 200).json({ message: err.message });
  }
};

export const skipQuestion = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));

    const { questionId } = req.body;
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const result = await QuizAttemptService.skipQuestion(attemptId, questionId);

    if (result.done) {
      return res.status(200).json({ done: true, results: result.results });
    }

    res.status(200).json({ done: false, nextQuestion: await hydrateQuestion(result.nextQuestion) });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

export const getResults = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));
    const results = await QuizResultsService.getStoredResults(attemptId);
    res.status(200).json({ results });
  } catch (err: any) {
    res.status(err.status ?? 200).json({ message: err.message });
  }
};