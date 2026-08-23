// backend/src/controllers/patientController.js
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';

function signPatientToken(patientId) {
  return jwt.sign(
    { patientId: patientId.toString(), role: 'PATIENT' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' } // Kiosk sessions are short-lived
  );
}

/**
 * POST /api/patients
 * Body: { name, age, gender, phone, abhaId, language }
 */
export async function createPatient(req, res, next) {
  try {
    const { name, age, gender, phone, abhaId, language } = req.body;

    // We do NOT check for duplicate patients right now because 
    // a patient might visit the kiosk multiple times without an account.
    // In a real system, you'd match phone+name or abhaId and return existing.
    let patient;
    if (abhaId) {
      patient = await Patient.findOne({ abhaId });
    } else if (phone && name) {
      patient = await Patient.findOne({ phone, name });
    }

    if (!patient) {
      patient = await Patient.create({
        name,
        age,
        gender,
        phone,
        abhaId: abhaId || null,
        language: language || 'en',
      });
    }

    const token = signPatientToken(patient._id);

    res.status(201).json({
      success: true,
      token,
      patient,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/patients/:id
 * Protected by requirePatientAuth OR requireAuth (doctor/admin)
 */
export async function getPatient(req, res, next) {
  try {
    const { id } = req.params;

    // Security check: if patient auth is used, ID must match
    if (req.patientId && req.patientId !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot access another patient\'s data' });
    }

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/patients/:id
 * Protected by requirePatientAuth
 */
export async function updatePatient(req, res, next) {
  try {
    const { id } = req.params;

    if (req.patientId && req.patientId !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const patient = await Patient.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}
