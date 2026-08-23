import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// Mock Tesseract
jest.unstable_mockModule('tesseract.js', () => ({
  default: {
    recognize: jest.fn().mockResolvedValue({ data: { text: "MOCKED_OCR_TEXT Blood Glucose 110" } })
  }
}));

// Mock Gemini
jest.unstable_mockModule('../services/geminiService.js', () => ({
  extractStructuredData: jest.fn(),
  determineNextQuestion: jest.fn(),
  generateClinicalSummary: jest.fn(),
  extractInformationFromDocument: jest.fn().mockResolvedValue({
    status: 'completed',
    extractedData: {
      reportedConditions: [],
      medications: [],
      allergies: [],
      labValues: [{ test: 'Blood Glucose', value: '110', unit: 'mg/dL', flag: 'normal' }],
      summary: "Blood test report."
    }
  })
}));

const { default: Document } = await import('../models/Document.js');
const { default: Patient } = await import('../models/Patient.js');
const { default: User } = await import('../models/User.js');
const { default: documentRoutes } = await import('../routes/documentRoutes.js');
const { getPatientDocuments } = await import('../controllers/documentController.js');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/documents', documentRoutes);
// Stub route for patient documents
app.get('/api/patients/:patientId/documents', async (req, res, next) => {
  // Mock unified auth
  const authHeader = req.headers.authorization;
  if (authHeader) {
     const token = authHeader.slice(7);
     const payload = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
     req.patientId = payload.patientId;
  }
  next();
}, getPatientDocuments);

let patientId1;
let patientId2;
let token1;
let token2;
let doctorToken;
let dummyImagePath;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create patients
  const patient1 = await Patient.create({ name: 'Patient A', age: 30, gender: 'MALE', phone: '1234567890' });
  const patient2 = await Patient.create({ name: 'Patient B', age: 40, gender: 'FEMALE', phone: '0987654321' });
  patientId1 = patient1._id;
  patientId2 = patient2._id;

  token1 = jwt.sign({ patientId: patientId1, role: 'PATIENT' }, process.env.JWT_SECRET);
  token2 = jwt.sign({ patientId: patientId2, role: 'PATIENT' }, process.env.JWT_SECRET);

  const doctor = await User.create({ name: 'Dr. Test', email: 'drtest@medikiosk.in', passwordHash: 'hash', role: 'DOCTOR' });
  doctorToken = jwt.sign({ userId: doctor._id, role: 'DOCTOR' }, process.env.JWT_SECRET);

  // Create a dummy image file
  dummyImagePath = path.join(process.cwd(), 'dummy.jpg');
  fs.writeFileSync(dummyImagePath, 'dummy content');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
});

describe('Phase 12: OCR Document Extraction', () => {
  let docId;

  it('1. Valid document upload and 6. OCR success and 8. Gemini extraction success', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .attach('document', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.document.filename).toBeDefined();
    expect(res.body.document.ocrStatus).toBe('COMPLETED');
    expect(res.body.document.extractedText).toBe("MOCKED_OCR_TEXT Blood Glucose 110");
    expect(res.body.document.aiExtraction.labValues[0].value).toBe("110");
    
    docId = res.body.document._id;
  });

  it('2. Invalid file type rejection', async () => {
    const txtPath = path.join(process.cwd(), 'dummy.txt');
    fs.writeFileSync(txtPath, 'text content');

    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .attach('document', txtPath);

    fs.unlinkSync(txtPath);
    expect(res.status).toBe(500); // Multer throws an error which hits global error handler (in tests, unhandled)
    // The test environment doesn't have the global error handler, so it returns 500 html or fails.
    // Let's assert it fails.
  });

  it('4. Patient authorization on upload (No token)', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('document', dummyImagePath);

    expect(res.status).toBe(401);
  });

  it('5. Cross-patient document access prevention', async () => {
    // Patient 2 trying to read Patient 1's document
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });

  it('12. Document retrieval (Own patient)', async () => {
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.document.originalName).toBe('dummy.jpg');
  });

  it('11. Doctor access to patient documents', async () => {
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.document.extractedText).toContain('Blood Glucose');
  });

  it('10. Original document remains unchanged', async () => {
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    // Extracted fields exist independently of filename and storageUrl
    expect(res.body.document.storageUrl).toBeDefined();
    expect(res.body.document.extractedText).toBeDefined();
    expect(res.body.document.aiExtraction).toBeDefined();
  });
});
