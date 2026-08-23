import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

const { default: User } = await import('../models/User.js');
const { default: adminRoutes } = await import('../routes/adminRoutes.js');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

let adminToken;
let doctorToken;
let patientToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({ name: 'Admin User', email: 'admin@medikiosk.in', passwordHash: 'hash', role: 'ADMIN' });
  adminToken = jwt.sign({ userId: admin._id, role: 'ADMIN' }, process.env.JWT_SECRET);

  const doctor = await User.create({ name: 'Doctor User', email: 'doc@medikiosk.in', passwordHash: 'hash', role: 'DOCTOR' });
  doctorToken = jwt.sign({ userId: doctor._id, role: 'DOCTOR' }, process.env.JWT_SECRET);

  patientToken = jwt.sign({ patientId: new mongoose.Types.ObjectId(), role: 'PATIENT' }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase 14: Admin Analytics & Authorization', () => {

  it('1. Rejects Patient access to Admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Kiosk patients cannot access this resource');
  });

  it('2. Rejects Doctor access to Admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Required role: ADMIN');
  });

  it('3. Allows Admin access and returns empty stats for empty DB', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.patients.total).toBe(0);
    expect(res.body.stats.interviews.total).toBe(0);
    expect(res.body.stats.documents.total).toBe(0);
  });

  it('4. Returns doctor workload', async () => {
    const res = await request(app)
      .get('/api/admin/workload')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctors).toBeDefined();
    // One doctor is registered in beforeAll
    expect(res.body.doctors.length).toBe(1);
    expect(res.body.globalWaiting).toBe(0);
  });

});
