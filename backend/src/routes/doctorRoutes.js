// backend/src/routes/doctorRoutes.js
import { Router } from 'express';
import { getQueue, getPatientDetail, markReviewed } from '../controllers/doctorController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all doctor routes
router.use(requireAuth);
router.use(requireRole('DOCTOR', 'ADMIN'));

router.get('/queue', getQueue);
router.get('/patients/:id', getPatientDetail);
router.patch('/interviews/:id/review', markReviewed);

export default router;
