import { Router } from 'express';
import { createPatient, getPatient, updatePatient } from '../controllers/patientController.js';
import { getPatientDocuments } from '../controllers/documentController.js';
import { requirePatientAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const patientRules = {
  name:   { required: true, min: 2, max: 100 },
  age:    { required: true },
  gender: { required: true },
  phone:  { required: true, type: 'phone' },
};

/**
 * POST /api/patients
 * Public route for Kiosk registration. Returns a Patient JWT.
 */
router.post('/', validateBody(patientRules), createPatient);

/**
 * GET /api/patients/:id
 * Patient JWT required. Must match ID.
 */
router.get('/:id', requirePatientAuth, getPatient);

/**
 * PUT /api/patients/:id
 * Patient JWT required. Must match ID.
 */
router.put('/:id', requirePatientAuth, updatePatient);

/**
 * GET /api/patients/:id/documents
 * Patient JWT required. Must match ID.
 */
router.get('/:id/documents', requirePatientAuth, getPatientDocuments);

export default router;
