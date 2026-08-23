// backend/src/models/Consent.js
import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: 'general_intake',
    },
    version: {
      type: String,
      required: true,
      default: '1.0',
    },
    accepted: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
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

consentSchema.index({ patientId: 1 });

export default mongoose.model('Consent', consentSchema);
