// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['PATIENT', 'DOCTOR', 'ADMIN'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Phone must be a 10-digit number'],
      default: null,
    },

    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: { values: ROLES, message: 'Role must be PATIENT, DOCTOR, or ADMIN' },
      required: [true, 'Role is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Doctor-specific fields
    specialty: { type: String, default: null },
    department: { type: String, default: null },
    licenseNumber: { type: String, default: null },

    // Admin-specific fields
    hospital: { type: String, default: null },

    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,  // adds createdAt, updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// ── Instance methods ──────────────────────────────────────

/** Compare a plain-text password against the stored hash */
userSchema.methods.comparePassword = async function (plainPassword) {
  // passwordHash is not selected by default; caller must use .select('+passwordHash')
  if (!this.passwordHash) throw new Error('Password hash not loaded');
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/** Return a safe public object (no hash) */
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    specialty: this.specialty,
    department: this.department,
    hospital: this.hospital,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

// ── Static helpers ────────────────────────────────────────

/** Hash a plain-text password. Use this before saving. */
userSchema.statics.hashPassword = async function (plain) {
  return bcrypt.hash(plain, 12);
};

export default mongoose.model('User', userSchema);
