// backend/src/tests/doctor.test.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import doctorRoutes from '../routes/doctorRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import patientRoutes from '../routes/patientRoutes.js';
import { errorHandler, notFound } from '../middleware/errorHandler.js';
import Interview from '../models/Interview.js';
import Patient from '../models/Patient.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/patients', patientRoutes);
app.use(notFound);
app.use(errorHandler);

let mongoServer;
let doctorToken;
let patientToken;
let interviewId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // 1. Create Patient
  const pRes = await request(app).post('/api/patients').send({
    name: 'Doctor Queue Test Patient', age: 30, gender: 'Male', phone: '9999999999'
  });
  patientToken = pRes.body.token;
  const patientId = pRes.body.patient._id;

  // 2. Create Doctor
  await request(app).post('/api/auth/register').send({
    name: 'Dr. Test', email: 'doc@test.com', phone: '1111111111', password: 'password123', role: 'DOCTOR'
  });
  const dRes = await request(app).post('/api/auth/login').send({
    email: 'doc@test.com', password: 'password123'
  });
  doctorToken = dRes.body.token;

  // 3. Create Interview
  const iRes = await request(app)
    .post('/api/interviews')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ patientId });
  interviewId = iRes.body.interview._id;

  // 4. Mark interview as completed
  await request(app)
    .post(`/api/interviews/${interviewId}/complete`)
    .set('Authorization', `Bearer ${patientToken}`);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase 11: Doctor Queue API', () => {

  it('Patient cannot access doctor queue (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/doctor/queue')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

  it('Patient cannot access doctor patient detail (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/doctor/patients/${interviewId}`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

  it('Doctor can access the queue and sees completed interviews', async () => {
    const res = await request(app)
      .get('/api/doctor/queue')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.queue.length).toBeGreaterThan(0);
    expect(res.body.queue[0]._id.toString()).toBe(interviewId.toString());
  });

  it('Doctor can view patient detail and it marks queueStatus as IN_REVIEW', async () => {
    const res = await request(app)
      .get(`/api/doctor/patients/${interviewId}`)
      .set('Authorization', `Bearer ${doctorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.record.patientId.name).toBe('Doctor Queue Test Patient');
    expect(res.body.record.queueStatus).toBe('IN_REVIEW');
  });

  it('Doctor can search queue by patient name', async () => {
    const res = await request(app)
      .get('/api/doctor/queue?search=doctor queue')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.queue.length).toBe(1);

    const emptyRes = await request(app)
      .get('/api/doctor/queue?search=nobody')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(emptyRes.body.queue.length).toBe(0);
  });

  it('Doctor can mark an interview as REVIEWED', async () => {
    const res = await request(app)
      .patch(`/api/doctor/interviews/${interviewId}/review`)
      .set('Authorization', `Bearer ${doctorToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.record.queueStatus).toBe('REVIEWED');
    expect(res.body.record.reviewedBy).toBeDefined();
    expect(res.body.record.reviewedAt).toBeDefined();
  });

});
