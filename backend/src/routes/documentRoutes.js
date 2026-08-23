import { Router } from 'express';
import { uploadDocument, getDocument, getPatientDocuments } from '../controllers/documentController.js';
import upload from '../middleware/upload.js';

// We need a combined middleware approach for auth because a document could be uploaded by a kiosk patient,
// or viewed by a doctor/patient.
// We already have `requirePatientAuth` and `requireAuth` in auth.js.

// We will implement an `optionalAuth` or just check headers inline for unified auth,
// but for simplicity, we can let the controller handle it if we have a flexible middleware.
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * unifiedAuth — allows EITHER a Kiosk Patient OR a valid User (Doctor/Admin).
 * Sets req.patientId if patient, or req.user if user.
 */
async function unifiedAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (payload.role === 'PATIENT' && payload.patientId && !payload.userId) {
      // It's a Kiosk Patient
      req.patientId = payload.patientId;
      req.userRole = 'PATIENT';
      return next();
    }

    // Otherwise, check if valid User
    if (payload.userId) {
      const user = await User.findById(payload.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userRole = user.role;
        return next();
      }
    }

    return res.status(403).json({ success: false, message: 'Access denied.' });
  } catch (err) {
    next(err);
  }
}

const router = Router();

// unifiedAuth handles both Kiosk Patients (who upload) and Doctors (who view)
router.use(unifiedAuth);

// Upload a document (requires multipart/form-data with 'document' field)
router.post('/', upload.single('document'), uploadDocument);

// Get a single document by ID
router.get('/:id', getDocument);

export default router;
