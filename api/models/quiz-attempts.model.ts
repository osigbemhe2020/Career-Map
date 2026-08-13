import { pool } from '../config/db';

export interface QuizAttemptRecord {
  id: string;
  user_id: string;
  started_at: Date;
  completed_at: Date | null;
  trait_scores_raw: Record<string, number>;
  trait_scores_normalized: Record<string, number> | null;
  cluster_scores: Record<string, number> | null;
  asked_question_ids: number[];
  pending_question_id: number | null;
  coverage: number | null;
  consistency: number | null;
  separation: number | null;
  confidence: number | null;
  final_recommended_clusters: number[] | null;
  final_recommended_careers: string[] | null;
}

class QuizAttempt {
  static async create(userId: string) {
    const result = await pool.query(
      `INSERT INTO quiz_attempts (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  static async findById(id: string) {
    const result = await pool.query('SELECT * FROM quiz_attempts WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateAfterAnswer(
    id: string,
    traitScoresRaw: Record<string, number>,
    askedQuestionIds: number[]
  ) {
    const result = await pool.query(
      `UPDATE quiz_attempts
       SET trait_scores_raw = $1, asked_question_ids = $2
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(traitScoresRaw), askedQuestionIds, id]
    );
    return result.rows[0];
  }

  // Persists which question the user is currently sitting on -- lets a
  // refresh/lost-connection resume exactly where they left off, without
  // relying on the frontend to remember anything. Pass null once the quiz
  // is finalized (nothing left to resume).
  static async setPendingQuestion(id: string, questionId: number | null) {
    const result = await pool.query(
      `UPDATE quiz_attempts SET pending_question_id = $1 WHERE id = $2 RETURNING *`,
      [questionId, id]
    );
    return result.rows[0];
  }

  static async updateConfidence(
    id: string,
    coverage: number,
    consistency: number,
    separation: number,
    confidence: number
  ) {
    const result = await pool.query(
      `UPDATE quiz_attempts
       SET coverage = $1, consistency = $2, separation = $3, confidence = $4
       WHERE id = $5
       RETURNING *`,
      [coverage, consistency, separation, confidence, id]
    );
    return result.rows[0];
  }

  static async finalize(
    id: string,
    traitScoresNormalized: Record<string, number>,
    finalRecommendedCareers: string[]
  ) {
    const result = await pool.query(
      `UPDATE quiz_attempts
       SET completed_at = now(),
           trait_scores_normalized = $1,
           final_recommended_careers = $2,
           pending_question_id = NULL
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(traitScoresNormalized), finalRecommendedCareers, id]
    );
    return result.rows[0];
  }

  static async findInProgressForUser(userId: string) {
    const result = await pool.query(
      `SELECT * FROM quiz_attempts WHERE user_id = $1 AND completed_at IS NULL ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }
}

export default QuizAttempt;