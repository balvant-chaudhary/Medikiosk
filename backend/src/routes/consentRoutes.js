// backend/src/routes/consentRoutes.js
import { Router } from 'express';
import { createConsent } from '../controllers/consentController.js';
import { requirePatientAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const consentRules = {
  patientId: { required: true },
  accepted:  { required: true },
};

/**
 * POST /api/consents
 * Patient JWT required.
 */
router.post('/', requirePatientAuth, validateBody(consentRules), createConsent);

export default router;
