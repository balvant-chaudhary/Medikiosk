// backend/src/controllers/consentController.js
import Consent from '../models/Consent.js';

/**
 * POST /api/consents
 * Body: { patientId, type, version, accepted }
 */
export async function createConsent(req, res, next) {
  try {
    const { patientId, type, version, accepted } = req.body;

    if (req.patientId && req.patientId !== patientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot create consent for another patient' });
    }

    const consent = await Consent.create({
      patientId,
      type: type || 'general_intake',
      version: version || '1.0',
      accepted,
    });

    res.status(201).json({ success: true, consent });
  } catch (err) {
    next(err);
  }
}
