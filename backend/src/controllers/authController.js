// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Helpers ──────────────────────────────────────────────

function signToken(userId, role) {
  return jwt.sign(
    { userId: userId.toString(), role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sendTokenResponse(res, user, statusCode = 200) {
  const token = signToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toPublic(),
  });
}

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password, role?, phone?, specialty?, department?, hospital? }
 *
 * Notes:
 *  - role defaults to PATIENT
 *  - Registering as ADMIN requires an existing ADMIN account (checked server-side)
 *    OR the system has no users yet (first-user bootstrap)
 */
export async function register(req, res, next) {
  try {
    const {
      name, email, password, role = 'PATIENT',
      phone, specialty, department, licenseNumber, hospital,
    } = req.body;

    // Guard: only ADMIN can create DOCTOR or ADMIN accounts
    // Exception: if there are zero users, allow creating the first ADMIN
    if (role === 'DOCTOR' || role === 'ADMIN') {
      const userCount = await User.countDocuments();
      const isBootstrap = userCount === 0;

      if (!isBootstrap) {
        // Require caller to be authenticated admin
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(403).json({
            success: false,
            message: `Creating a ${role} account requires admin authentication.`,
          });
        }
        const token = authHeader.slice(7);
        let payload;
        try {
          payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
          return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (payload.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can create DOCTOR or ADMIN accounts.',
          });
        }
      }
    }

    // Check for existing email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      phone: phone || null,
      specialty: specialty || null,
      department: department || null,
      licenseNumber: licenseNumber || null,
      hospital: hospital || null,
    });

    sendTokenResponse(res, user, 201);
  } catch (err) {
    // Mongoose duplicate key (race condition)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select passwordHash (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash');

    if (!user) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact your administrator.',
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * JWT is stateless — client deletes the token.
 * Server logs the event.
 */
export async function logout(req, res) {
  res.json({
    success: true,
    message: 'Logged out successfully. Please discard your token.',
  });
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Protected by requireAuth middleware.
 */
export async function getMe(req, res, next) {
  try {
    // req.user is already attached by requireAuth
    // Fetch fresh from DB to ensure up-to-date data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 * Protected by requireAuth.
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both currentPassword and newPassword are required.',
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}
