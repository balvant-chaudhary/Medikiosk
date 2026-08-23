// backend/src/routes/interviewRoutes.js
import { Router } from 'express';
import { createInterview, getInterview, addAnswer, completeInterview, getNextQuestion, generateSummary, getSummary } from '../controllers/interviewController.js';
import { requirePatientAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const createRules = { patientId: { required: true } };

/**
 * All interview routes require patient authentication (JWT)
 */
router.use(requirePatientAuth);

router.post('/', validateBody(createRules), createInterview);
router.get('/:id', getInterview);
router.get('/:id/next', getNextQuestion);
router.post('/:id/answer', addAnswer);
router.post('/:id/complete', completeInterview);
router.post('/:id/summary', generateSummary);
router.get('/:id/summary', getSummary);

export default router;
