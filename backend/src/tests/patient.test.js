// backend/src/tests/patient.test.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import patientRoutes from '../routes/patientRoutes.js';
import { errorHandler, notFound } from '../middleware/errorHandler.js';
import Patient from '../models/Patient.js';

jest.setTimeout(600000);

const app = express();
app.use(express.json());
app.use('/api/patients', patientRoutes);
app.use(notFound);
app.use(errorHandler);

let mongoServer;
let patient1Token;
let patient2Token;
let patient1Id;
let patient2Id;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Patient APIs', () => {
  it('POST /api/patients - creates patient and returns JWT', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '9876543210'
    });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.patient.name).toBe('John Doe');
    
    patient1Token = res.body.token;
    patient1Id = res.body.patient._id;
  });

  it('POST /api/patients - creates second patient', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'Jane Smith',
      age: 30,
      gender: 'Female',
      phone: '1234567890'
    });
    expect(res.status).toBe(201);
    patient2Token = res.body.token;
    patient2Id = res.body.patient._id;
  });

  it('POST /api/patients - fails on missing required fields', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'No Phone'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/patients/:id - retrieves own data', async () => {
    const res = await request(app)
      .get(`/api/patients/${patient1Id}`)
      .set('Authorization', `Bearer ${patient1Token}`);
    expect(res.status).toBe(200);
    expect(res.body.patient.name).toBe('John Doe');
  });

  it('GET /api/patients/:id - rejects accessing other patient data (403)', async () => {
    const res = await request(app)
      .get(`/api/patients/${patient2Id}`)
      .set('Authorization', `Bearer ${patient1Token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/patients/:id - rejects unauthenticated access (401)', async () => {
    const res = await request(app).get(`/api/patients/${patient1Id}`);
    expect(res.status).toBe(401);
  });

  it('PUT /api/patients/:id - updates own data', async () => {
    const res = await request(app)
      .put(`/api/patients/${patient1Id}`)
      .set('Authorization', `Bearer ${patient1Token}`)
      .send({ language: 'hi' });
    
    expect(res.status).toBe(200);
    expect(res.body.patient.language).toBe('hi');
  });
});
