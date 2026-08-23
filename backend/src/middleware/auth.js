// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * requireAuth — verifies the JWT in the Authorization header.
 * Attaches req.user (safe public object) on success.
 * Rejects with 401 on invalid/expired/missing token.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.slice(7); // strip "Bearer "

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid authentication token.';
      return res.status(401).json({ success: false, message });
    }

    if (payload.role === 'PATIENT' && payload.patientId && !payload.userId) {
      return res.status(403).json({ success: false, message: 'Access denied. Kiosk patients cannot access this resource.' });
    }

    // Fetch fresh user to ensure still active and role is current
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    req.user = user.toPublic();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireRole — factory that returns a middleware enforcing a specific role.
 * Must be used AFTER requireAuth.
 *
 * @example
 *   router.get('/queue', requireAuth, requireRole('DOCTOR'), controller)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
}

/**
 * requirePatientAuth — verifies the JWT in the Authorization header specifically for Kiosk Patients.
 * Attaches req.patientId on success.
 */
export async function requirePatientAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Patient authentication required.',
      });
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired patient token.' });
    }

    if (payload.role !== 'PATIENT' || !payload.patientId) {
      return res.status(403).json({ success: false, message: 'Access denied. Patient token required.' });
    }

    req.patientId = payload.patientId;
    next();
  } catch (err) {
    next(err);
  }
}
