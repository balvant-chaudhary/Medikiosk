import express from 'express';
import { getSystemStats, getDoctorWorkload } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require ADMIN role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// Analytics and Statistics
router.get('/stats', getSystemStats);
router.get('/workload', getDoctorWorkload);

export default router;
