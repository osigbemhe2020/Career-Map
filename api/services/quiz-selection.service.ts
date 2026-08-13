// services/quiz/quizSelectionService.ts
import QuizAttempt from '../models/quiz-attempts.model';
import QuizQuestion from '../models/quiz-question.model';
import QuizAnswerOption from '../models/quiz-options.model';
import QuizResponse from '../models/quiz-response.model';
import Trait from '../models/traits.model';
import CareerTraitWeight from '../models/career-trait-weights.model';
import {
  CONTENDER_POOL_SIZE,
  TRAIT_CONFIDENCE_SATURATION,
  PRIORITY_WEIGHTS,
  VALIDATION_TRIGGER_MIN_QUESTIONS,
  VALIDATION_TRIGGER_MAX_GAP
} from './constants';


class QuizSelectionService {
  // ---- shared helpers ----

  // Current leading careers given trait_scores_raw so far. Unnormalized dot
  // product against career_trait_weights -- fine for relative ranking mid-quiz,
  // not meant to be read as a final percentage (see finalizeResults for that).
  static computeCareerScores(
    traitScoresRaw: Record<string, number>,
    matrix: Record<string, Record<string, number>>
  ): { careerId: string; score: number }[] {
    const scores: { careerId: string; score: number }[] = [];
    for (const [careerId, weights] of Object.entries(matrix)) {
      let score = 0;
      for (const [traitCode, weight] of Object.entries(weights)) {
        score += (traitScoresRaw[traitCode] ?? 0) * weight;
      }
      scores.push({ careerId, score });
    }
    return scores.sort((a, b) => b.score - a.score);
  }

  static async getTopContenders(traitScoresRaw: Record<string, number>) {
    const matrix = await CareerTraitWeight.findAllAsMatrix();
    const ranked = this.computeCareerScores(traitScoresRaw, matrix);
    return { top: ranked.slice(0, CONTENDER_POOL_SIZE), matrix };
  }

  // how many answered (non-skip, non-reflection) questions have measured this trait so far
  static async countQuestionsMeasuringTrait(attemptId: string, traitCode: string) {
    const history = await QuizResponse.findTraitHistoryForAttempt(attemptId);
    let count = 0;
    for (const r of history) {
      if (r.trait_points_awarded && Object.prototype.hasOwnProperty.call(r.trait_points_awarded, traitCode)) {
        count += 1;
      }
    }
    return count;
  }

  // ---- Priority Score components ----

  static async traitUncertainty(attemptId: string, question: any) {
    const traitConfidence = async (traitId: number | null) => {
      if (!traitId) return 100; // no trait to be uncertain about -> treat as fully "known", contributes 0 uncertainty
      const trait = await Trait.findById(traitId);
      if (!trait) return 100;
      const timesAsked = await this.countQuestionsMeasuringTrait(attemptId, trait.code);
      return Math.min(100, timesAsked * TRAIT_CONFIDENCE_SATURATION);
    };

    const primaryConfidence = await traitConfidence(question.primary_trait_id);
    const secondaryConfidence = await traitConfidence(question.secondary_trait_id);

    return 0.7 * (100 - primaryConfidence) + 0.3 * (100 - secondaryConfidence);
  }

  static async informationGain(
    question: any,
    contenders: { careerId: string; score: number }[],
    matrix: Record<string, Record<string, number>>
  ) {
    const options = await QuizAnswerOption.findByQuestion(question.id);
    if (options.length === 0) return 0;

    const spreads: number[] = [];
    for (const option of options) {
      const deltas = contenders.map(c => {
        const careerWeights = matrix[c.careerId] ?? {};
        let delta = 0;
        for (const [traitCode, weight] of Object.entries(option.trait_weights)) {
          delta += Number(weight) * (careerWeights[traitCode] ?? 0);
        }
        return delta;
      });
      const spread = Math.max(...deltas) - Math.min(...deltas);
      spreads.push(spread);
    }

    return spreads.reduce((a, b) => a + b, 0) / spreads.length;
  }

  static async diversityBonus(attemptId: string, question: any) {
    const attempt = await QuizAttempt.findById(attemptId);
    const totalAsked = attempt.asked_question_ids.length;
    if (totalAsked === 0) return 100; // guard against divide-by-zero on the first pick

    if (!question.primary_trait_id) return 100;
    const trait = await Trait.findById(question.primary_trait_id);
    if (!trait) return 100;

    const timesAsked = await this.countQuestionsMeasuringTrait(attemptId, trait.code);
    return 100 * (1 - timesAsked / totalAsked);
  }

  // ---- main selection entry point ----

  static async pickNextQuestion(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    // Pool A is fixed and the same for every user -- it must be fully
    // exhausted before adaptive selection ever runs. Without this check,
    // the very first Pool A answer would jump straight to Pool B and skip
    // the remaining 6 discovery questions entirely.
    const poolAQuestions = await QuizQuestion.findPoolA(); // already ordered by id
    const unaskedPoolA = poolAQuestions.filter(q => !attempt.asked_question_ids.includes(q.id));
    if (unaskedPoolA.length > 0) {
      return unaskedPoolA[0];
    }

    const { top: contenders, matrix } = await this.getTopContenders(attempt.trait_scores_raw);

    const inValidation = this.shouldEnterValidation(attempt, contenders);
    const pools = inValidation ? ['C'] : ['B'];

    let candidates = await QuizQuestion.findCandidates(pools, attempt.asked_question_ids);

    // fall back to Pool B if Pool C has nothing left (e.g. already exhausted)
    if (candidates.length === 0 && inValidation) {
      candidates = await QuizQuestion.findCandidates(['B'], attempt.asked_question_ids);
    }
    if (candidates.length === 0) return null; // question bank exhausted

    let best: any = null;
    let bestScore = -Infinity;

    for (const question of candidates) {
      const uncertainty = await this.traitUncertainty(attemptId, question);
      const gain = await this.informationGain(question, contenders, matrix);
      const diversity = await this.diversityBonus(attemptId, question);

      const priorityScore =
        PRIORITY_WEIGHTS.traitUncertainty * uncertainty +
        PRIORITY_WEIGHTS.informationGain * gain +
        PRIORITY_WEIGHTS.diversityBonus * diversity;

      if (priorityScore > bestScore) {
        bestScore = priorityScore;
        best = question;
      }
    }

    return best;
  }

  // Stage 4 trigger: top 2 contenders are close, and we're reasonably far into the quiz.
  // Thresholds are provisional -- see constants.ts.
  static shouldEnterValidation(attempt: any, contenders: { careerId: string; score: number }[]) {
    if (attempt.asked_question_ids.length < VALIDATION_TRIGGER_MIN_QUESTIONS) return false;
    if (contenders.length < 2) return false;
    const [first, second] = contenders;
    if (first.score === 0) return false; // no real signal yet
    const gapPercent = ((first.score - second.score) / first.score) * 100;
    return gapPercent <= VALIDATION_TRIGGER_MAX_GAP;
  }
}

export default QuizSelectionService;