// backend/src/tests/interview.test.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import patientRoutes from '../routes/patientRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import consentRoutes from '../routes/consentRoutes.js';
import { errorHandler, notFound } from '../middleware/errorHandler.js';

jest.setTimeout(600000);

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
    name: 'Interview Test Patient', age: 25, gender: 'Male', phone: '9999999999'
  });
  patientToken = res.body.token;
  patientId = res.body.patient._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Consent & Interview APIs', () => {
  it('POST /api/consents - saves consent', async () => {
    const res = await request(app)
      .post('/api/consents')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ patientId, accepted: true });
    
    expect(res.status).toBe(201);
    expect(res.body.consent.accepted).toBe(true);
  });

  it('POST /api/interviews - creates interview session', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ patientId });
    
    expect(res.status).toBe(201);
    expect(res.body.interview.status).toBe('in-progress');
    interviewId = res.body.interview._id;
  });

  it('GET /api/interviews/:id/next - returns first question', async () => {
    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.isComplete).toBe(false);
    expect(res.body.question.questionId).toBe('q_cc');
  });

  it('POST /api/interviews/:id/answer - fails on empty answer', async () => {
    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: '   ' });
    
    expect(res.status).toBe(400);
  });

  it('POST /api/interviews/:id/answer - adds Q&A', async () => {
    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_cc', question: 'What brings you here?', answer: 'I have a headache' });
    
    expect(res.status).toBe(200);
    expect(res.body.interview.responses.length).toBe(1);
    expect(res.body.interview.responses[0].answer).toBe('I have a headache');
  });

  it('GET /api/interviews/:id/next - returns second question', async () => {
    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.question.questionId).toBe('q_duration');
  });

  it('POST /api/interviews/:id/answer - sets chief complaint', async () => {
    const res = await request(app)
      .post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_duration', question: 'How long?', answer: '2 days', chiefComplaint: 'Headache for 2 days' });
    
    expect(res.status).toBe(200);
    expect(res.body.interview.chiefComplaint).toBe('Headache for 2 days');
  });

  it('Test conditional branching: medical conditions', async () => {
    // Skip to q_conditions for testing
    await request(app).post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_severity', question: 'Severity?', answer: '5/10' });
    
    await request(app).post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_symptoms', question: 'Symptoms?', answer: 'Fever' });

    // Answer YES to conditions
    await request(app).post(`/api/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ questionId: 'q_conditions', question: 'Conditions?', answer: 'yes' });

    // Next question should be specify
    const nextRes = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(nextRes.body.question.questionId).toBe('q_conditions_specify');
  });

  it('POST /api/interviews/:id/complete - completes interview', async () => {
    const res = await request(app)
      .post(`/api/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.interview.status).toBe('completed');
    expect(res.body.interview.completedAt).toBeDefined();
  });

  it('GET /api/interviews/:id/next - returns isComplete true when interview is completed', async () => {
    const res = await request(app)
      .get(`/api/interviews/${interviewId}/next`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.isComplete).toBe(true);
  });
});

