// backend/src/tests/ai.test.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
const mockExtract = jest.fn();
const mockDetermineNext = jest.fn().mockResolvedValue({ questionId: null, reason: 'Default mock' });
const mockGenerateSummary = jest.fn();

jest.unstable_mockModule('../services/geminiService.js', () => ({
  extractStructuredData: mockExtract,
  determineNextQuestion: mockDetermineNext,
  generateClinicalSummary: mockGenerateSummary
}));

const { extractStructuredData, determineNextQuestion, generateClinicalSummary } = await import('../services/geminiService.js');
const patientRoutes = (await import('../routes/patientRoutes.js')).default;
const interviewRoutes = (await import('../routes/interviewRoutes.js')).default;
const consentRoutes = (await import('../routes/consentRoutes.js')).default;
const { errorHandler, notFound } = await import('../middleware/errorHandler.js');

jest.setTimeout(60000);

const app = express();
app.use(express.json());
app.use('/api/patients', patientRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/consents', consentRoutes);
app.use(notFound);
app.use(errorHandler);

let mongoServer;
let patientToken;
let patientId;
let interviewId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // Create patient to get token
  const res = await request(app).post('/api/patients').send({
    name: 'AI Test Patient', age: 30, gender: 'Female', phone: '8888888888'
  });
  patientToken = res.body.token;
  patientId = res.body.patient._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

import Interview from '../models/Interview.js';

beforeEach(async () => {
  await Interview.deleteMany({});
  
  // Create a new interview for each test to keep state clean
  const res = await request(app)
    .post('/api/interviews')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ patientId });
  interviewId = res.body.interview._id;
  
  // Clear mock
  jest.restoreAllMocks();
});

describe('Phase 10B AI Extraction', () => {
  
  it('handles Gemini success', async () => {
    // Mock success
    mockExtract.mockResolvedValue({
      extractedData: { symptoms: ['fever', 'cough'], duration: '3 days', severity: 'high' },
      status: 'success'
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'I have a fever and cough for 3 days and it is high' });
    
    expect(res.status).toBe(200);
    const lastResponse = res.body.interview.responses[res.body.interview.responses.length - 1];
    expect(lastResponse.answer).toBe('I have a fever and cough for 3 days and it is high');
    expect(lastResponse.extractionStatus).toBe('success');
    expect(lastResponse.extractedData.symptoms).toEqual(['fever', 'cough']);
  });

  it('handles malformed AI response (fails gracefully)', async () => {
    // Mock failure (e.g. JSON parse error caught inside geminiService)
    mockExtract.mockResolvedValue({
      extractedData: null,
      status: 'failed'
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'Headache' });
    
    expect(res.status).toBe(200); // UI must not crash
    const lastResponse = res.body.interview.responses[res.body.interview.responses.length - 1];
    expect(lastResponse.answer).toBe('Headache'); // Original answer preserved
    expect(lastResponse.extractionStatus).toBe('failed');
    expect(lastResponse.extractedData || {}).toEqual({}); // Default empty object or undefined
  });

  it('handles Gemini timeout gracefully', async () => {
    // Mock timeout
    mockExtract.mockResolvedValue({
      extractedData: null,
      status: 'failed'
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'Headache' });
    
    expect(res.status).toBe(200);
    const lastResponse = res.body.interview.responses[res.body.interview.responses.length - 1];
    expect(lastResponse.extractionStatus).toBe('failed');
  });

  it('fallback to rule engine works after AI failure', async () => {
    // Mock failure
    mockExtract.mockResolvedValue({
      extractedData: null,
      status: 'failed'
    });

    // Answer Q1
    await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'Headache' });
    
    // Check next question
    const nextRes = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    // Engine still provides the correct next question!
    expect(nextRes.status).toBe(200);
    expect(nextRes.body.question.questionId).toBe('q_duration');
  });

  it('handles skipped extraction when AI is not configured', async () => {
    mockExtract.mockResolvedValue({
      extractedData: null,
      status: 'skipped'
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'Headache' });
    
    expect(res.status).toBe(200);
    const lastResponse = res.body.interview.responses[res.body.interview.responses.length - 1];
    expect(lastResponse.extractionStatus).toBe('skipped');
  });

});

describe('Phase 10C AI Next-Question Generation', () => {

  beforeEach(() => {
    // By default, extractStructuredData succeeds so answers save normally
    mockExtract.mockResolvedValue({
      extractedData: {},
      status: 'success'
    });
  });

  it('valid AI selection overrides rule engine', async () => {
    // If we have 0 answers, rule engine would suggest q_cc.
    // Let's pretend AI suggests q_allergies (a valid, unanswered question).
    mockDetermineNext.mockResolvedValue({
      questionId: 'q_allergies',
      reason: 'Testing AI override'
    });

    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.question.questionId).toBe('q_allergies');
  });

  it('invalid questionId falls back to rule engine', async () => {
    // AI suggests a fake ID
    mockDetermineNext.mockResolvedValue({
      questionId: 'q_fake_123',
      reason: 'Hallucination'
    });

    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.question.questionId).toBe('q_cc'); // Rule engine default
  });

  it('already answered questionId falls back to rule engine', async () => {
    // First, answer q_cc
    await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'CC?', answer: 'Pain' });

    // AI suggests q_cc again (which is already answered)
    mockDetermineNext.mockResolvedValue({
      questionId: 'q_cc',
      reason: 'AI wants to ask it again'
    });

    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.question.questionId).toBe('q_duration'); // Rule engine next step
  });

  it('AI failure falls back to rule engine', async () => {
    mockDetermineNext.mockResolvedValue({
      questionId: null,
      reason: 'API Error'
    });

    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.question.questionId).toBe('q_cc'); // Rule engine default
  });

  it('AI suggesting completion (null) falls back to rule engine if incomplete', async () => {
    mockDetermineNext.mockResolvedValue({
      questionId: null,
      reason: 'AI thinks interview is complete'
    });

    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    // Since we answered 0 questions, rule engine overrides completion and returns q_cc
    expect(res.body.question.questionId).toBe('q_cc');
  });

});

describe('Phase 10D AI Clinical Summary Generation', () => {
  beforeEach(async () => {
    // Answer a few questions to have data for the summary
    await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'CC?', answer: 'Fever' });

    // Mark as completed
    await request(app)
      .post(`/api/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${patientToken}`);
  });

  it('generates a successful AI summary', async () => {
    mockGenerateSummary.mockResolvedValue({
      status: 'completed',
      clinicalSummary: {
        chiefComplaint: 'Fever',
        duration: '3 days',
        severity: 'High',
        symptoms: ['Fever'],
        medicalHistory: [],
        medications: [],
        allergies: [],
        previousAdmissions: [],
        relevantResponses: [],
        aiSummaryText: 'Patient reports fever.'
      }
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/summary`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summaryStatus).toBe('completed');
    expect(res.body.clinicalSummary.aiSummaryText).toBe('Patient reports fever.');
    
    // Check it's saved in DB
    const getRes = await request(app)
      .get(`/api/interviews/${interviewId}/summary`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(getRes.body.summaryStatus).toBe('completed');
    expect(getRes.body.clinicalSummary.chiefComplaint).toBe('Fever');
  });

  it('idempotency: returns existing summary without calling Gemini again', async () => {
    // Generate it first
    mockGenerateSummary.mockResolvedValue({
      status: 'completed',
      clinicalSummary: {
        chiefComplaint: 'Fever', duration: '', severity: '', symptoms: [],
        medicalHistory: [], medications: [], allergies: [], previousAdmissions: [],
        relevantResponses: [], aiSummaryText: 'Idempotent text'
      }
    });

    await request(app).post(`/api/interviews/${interviewId}/summary`).set('Authorization', `Bearer ${patientToken}`);
    
    // Call again
    mockGenerateSummary.mockClear();
    const res = await request(app).post(`/api/interviews/${interviewId}/summary`).set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.clinicalSummary.aiSummaryText).toBe('Idempotent text');
    expect(mockGenerateSummary).not.toHaveBeenCalled(); // AI wasn't called again
  });

  it('deterministic fallback works on AI failure', async () => {
    mockGenerateSummary.mockResolvedValue({
      status: 'failed',
      clinicalSummary: null
    });

    const res = await request(app)
      .post(`/api/interviews/${interviewId}/summary`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.summaryStatus).toBe('fallback');
    expect(res.body.clinicalSummary.chiefComplaint).toBe('Not provided');
    expect(res.body.clinicalSummary.aiSummaryText).toContain('AI summarization unavailable');
  });

  it('rejects generating summary for incomplete interview without responses', async () => {
    // Create new empty interview
    const resNew = await request(app).post('/api/interviews').set('Authorization', `Bearer ${patientToken}`).send({ patientId });
    const newInterviewId = resNew.body.interview._id;

    const res = await request(app)
      .post(`/api/interviews/${newInterviewId}/summary`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(400);
  });
});
