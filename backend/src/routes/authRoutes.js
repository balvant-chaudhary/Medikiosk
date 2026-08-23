// backend/src/routes/authRoutes.js
import { Router } from 'express';
import { register, login, logout, getMe, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// ── Validation schemas ────────────────────────────────────

const registerRules = {
  name:     { required: true, min: 2, max: 100 },
  email:    { required: true, type: 'email' },
  password: { required: true, min: 8, message: 'Password must be at least 8 characters' },
  role:     { required: false, enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
};

const loginRules = {
  email:    { required: true, type: 'email' },
  password: { required: true, min: 1 },
};

// ── Routes ────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public — but creating DOCTOR/ADMIN roles requires admin JWT
 */
router.post('/register', validateBody(registerRules), register);

/**
 * POST /api/auth/login
 * Public
 */
router.post('/login', validateBody(loginRules), login);

/**
 * POST /api/auth/logout
 * Protected — so we can log the event on server side
 */
router.post('/logout', requireAuth, logout);

/**
 * GET /api/auth/me
 * Protected
 */
router.get('/me', requireAuth, getMe);

/**
 * PUT /api/auth/change-password
 * Protected
 */
router.put('/change-password', requireAuth, changePassword);

export default router;
