// routes/quizRoutes.ts
import { Router } from 'express';

import { startQuiz, getAttemptStatus, submitAnswer, skipQuestion, getResults } from '../controllers/quiz.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/start', startQuiz);
router.get('/:attemptId', getAttemptStatus);
router.post('/:attemptId/answer', submitAnswer);
router.post('/:attemptId/skip', skipQuestion);
router.get('/:attemptId/results', getResults);

export default router;