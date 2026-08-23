import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    default: null,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  storageUrl: {
    type: String,
    required: true,
  },
  ocrStatus: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'UPLOADED',
  },
  extractedText: {
    type: String,
    default: null,
  },
  aiExtraction: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
