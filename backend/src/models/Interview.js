// backend/src/models/Interview.js
import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    chiefComplaint: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
    },
    responses: [
      {
        questionId: { type: String }, // Phase 9: For conditional logic tracking
        question: { type: String, required: true },
        answer: { type: String, required: true },
        extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
        extractionStatus: { type: String, enum: ['pending', 'success', 'failed', 'skipped'], default: 'skipped' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        symptoms: [],
        duration: '',
        severity: '',
        history: [],
        medications: [],
        allergies: [],
      },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    clinicalSummary: {
      chiefComplaint: { type: String, default: '' },
      duration: { type: String, default: '' },
      severity: { type: String, default: '' },
      symptoms: [{ type: String }],
      medicalHistory: [{ type: String }],
      medications: [{ type: String }],
      allergies: [{ type: String }],
      previousAdmissions: [{ type: String }],
      relevantResponses: [{ type: String }],
      aiSummaryText: { type: String, default: '' },
      generatedAt: { type: Date, default: null }
    },
    summaryStatus: { 
      type: String, 
      enum: ['pending', 'generating', 'completed', 'fallback', 'failed'], 
      default: 'pending' 
    },
    queueStatus: {
      type: String,
      enum: ['READY_FOR_REVIEW', 'IN_REVIEW', 'REVIEWED'],
      default: 'READY_FOR_REVIEW'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
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

interviewSchema.index({ patientId: 1 });
interviewSchema.index({ status: 1 });

export default mongoose.model('Interview', interviewSchema);
