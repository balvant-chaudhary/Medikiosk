// backend/src/tests/auth.test.js
/**
 * Auth integration tests.
 *
 * Run: npm test
 *
 * These tests use a real MongoDB connection (from .env).
 * Each test suite clears the User collection before running.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import { errorHandler, notFound } from '../middleware/errorHandler.js';
import User from '../models/User.js';

// ── Build a minimal express app for testing ──────────────
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

// ── Helpers ──────────────────────────────────────────────
jest.setTimeout(600000); // 10 mins to allow MongoDB binary download

const ADMIN  = { name: 'Test Admin',  email: 'admin@test.mk',  password: 'Admin@1234',  role: 'ADMIN'  };
const DOCTOR = { name: 'Test Doctor', email: 'doctor@test.mk', password: 'Doctor@1234', role: 'DOCTOR' };
const PATIENT= { name: 'Test Patient',email: 'patient@test.mk',password: 'Patient@1234' };

let adminToken  = '';
let doctorToken = '';
let patientToken= '';
let mongoServer;

// ── Setup / teardown ─────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  it('registers first ADMIN (bootstrap — no existing users of these test emails)', async () => {
    const res = await request(app).post('/api/auth/register').send(ADMIN);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user.passwordHash).toBeUndefined();
    adminToken = res.body.token;
  });

  it('registers DOCTOR with admin token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(DOCTOR);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('DOCTOR');
    doctorToken = res.body.token;
  });

  it('registers PATIENT without any token', async () => {
    const res = await request(app).post('/api/auth/register').send(PATIENT);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PATIENT');
    patientToken = res.body.token;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(PATIENT);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'x@x.com', password: 'Test@1234',
    });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test', email: 'not-an-email', password: 'Test@1234',
    });
    expect(res.status).toBe(400);
  });

  it('rejects short password (< 8 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test', email: 'short@x.com', password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('rejects creating DOCTOR without admin token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Rogue Doctor', email: 'rogue@test.mk', password: 'Rogue@1234', role: 'DOCTOR',
    });
    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  it('logs in admin with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: ADMIN.email, password: ADMIN.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('logs in doctor', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: DOCTOR.email, password: DOCTOR.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('DOCTOR');
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: ADMIN.email, password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    // Must NOT distinguish between wrong password vs wrong email
    expect(res.body.message).toContain('Invalid');
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.mk', password: 'Whatever@1234',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email });
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════
describe('GET /api/auth/me', () => {
  it('returns user for valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid/tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken.bad.data');
    expect(res.status).toBe(401);
  });

  it('rejects expired token (malformed simulate)', async () => {
    const fakeExpired = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NiIsInJvbGUiOiJET0NUT1IiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMX0.bad';
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeExpired}`);
    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════
describe('Role authorization', () => {
  it('patient token returns PATIENT role', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.body.user.role).toBe('PATIENT');
  });

  it('doctor token returns DOCTOR role', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.body.user.role).toBe('DOCTOR');
  });

  it('admin token returns ADMIN role', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.user.role).toBe('ADMIN');
  });
});

// ════════════════════════════════════════════════════════
describe('POST /api/auth/logout', () => {
  it('returns success for authenticated user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects unauthenticated logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});
