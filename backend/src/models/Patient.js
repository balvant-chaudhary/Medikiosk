// backend/src/models/Patient.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age must be at most 120'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      // Keep it somewhat flexible since multiple languages are supported in the UI
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^\d{10}$/, 'Phone must be a 10-digit number'],
    },
    abhaId: {
      type: String,
      trim: true,
      default: null,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
patientSchema.index({ phone: 1 });

export default mongoose.model('Patient', patientSchema);
