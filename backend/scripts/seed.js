import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Setup env
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Interview from '../src/models/Interview.js';
import Document from '../src/models/Document.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medikiosk';

async function seed() {
  try {
    console.log(`Connecting to ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Clear existing
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Interview.deleteMany({});
    await Document.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Admin
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@medikiosk.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      hospital: 'MediKiosk Central'
    });

    // 2. Create Doctors
    const docHash = await bcrypt.hash('doctor123', 12);
    const doctor1 = await User.create({
      name: 'Dr. Sarah Smith',
      email: 'doctor1@medikiosk.in',
      passwordHash: docHash,
      role: 'DOCTOR',
      specialty: 'Cardiology'
    });
    
    const doctor2 = await User.create({
      name: 'Dr. Raj Patel',
      email: 'doctor2@medikiosk.in',
      passwordHash: docHash,
      role: 'DOCTOR',
      specialty: 'General Medicine'
    });

    // 3. Create Patients (Spread over last 7 days)
    const patients = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 7)); // random day in last 7 days
      
      const p = await Patient.create({
        name: `Mock Patient ${i + 1}`,
        age: 20 + Math.floor(Math.random() * 50),
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        phone: `999000${i.toString().padStart(4, '0')}`,
        createdAt: d,
        updatedAt: d
      });
      patients.push(p);
    }
    console.log(`Created ${patients.length} patients.`);

    // 4. Create Interviews
    const interviews = [];
    for (let i = 0; i < 20; i++) {
      const p = patients[i];
      // Random states
      const rand = Math.random();
      let status = 'in-progress';
      let queueStatus = 'READY_FOR_REVIEW';
      let reviewedBy = null;
      let aiExtraction = null;
      
      if (rand > 0.3) {
        status = 'completed';
        queueStatus = 'READY_FOR_REVIEW';
        aiExtraction = { symptoms: ['Fever'], duration: '2 days', severity: 'Mild' };
      }
      if (rand > 0.6) {
        status = 'completed';
        queueStatus = 'IN_REVIEW';
        aiExtraction = { symptoms: ['Cough', 'Fever'], duration: '1 week', severity: 'Moderate' };
      }
      if (rand > 0.8) {
        status = 'completed';
        queueStatus = 'REVIEWED';
        reviewedBy = i % 2 === 0 ? doctor1._id : doctor2._id;
        aiExtraction = { symptoms: ['Chest Pain'], duration: '1 hour', severity: 'Severe' };
      }

      const inv = await Interview.create({
        patientId: p._id,
        status,
        queueStatus,
        reviewedBy,
        chiefComplaint: 'Feeling unwell',
        extractedData: aiExtraction || {},
        clinicalSummary: aiExtraction ? { chiefComplaint: 'Feeling unwell', duration: aiExtraction.duration, severity: aiExtraction.severity } : {},
        summaryStatus: aiExtraction ? 'completed' : 'pending'
      });
      interviews.push(inv);
    }
    console.log(`Created ${interviews.length} interviews.`);

    // 5. Create Documents
    for (let i = 0; i < 10; i++) {
      const p = patients[i];
      const rand = Math.random();
      let ocrStatus = 'COMPLETED';
      let aiExtraction = null;

      if (rand > 0.2) {
        aiExtraction = { summary: 'Blood test report normal.' };
      } else if (rand > 0.8) {
        ocrStatus = 'FAILED';
      }

      await Document.create({
        patientId: p._id,
        filename: `mock-${i}.jpg`,
        originalName: `mock_report_${i}.jpg`,
        mimetype: 'image/jpeg',
        size: 102400,
        storageUrl: `/uploads/mock-${i}.jpg`,
        ocrStatus,
        extractedText: ocrStatus === 'COMPLETED' ? 'Mock OCR text data.' : null,
        aiExtraction
      });
    }
    console.log(`Created 10 documents.`);

    console.log('\n--- SEED COMPLETE ---');
    console.log(`Admin Login: admin@medikiosk.in / admin123`);
    console.log(`Doctor Login: doctor1@medikiosk.in / doctor123`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
