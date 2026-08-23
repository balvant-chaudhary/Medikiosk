// backend/src/scripts/seed.js
/**
 * Seed script — creates default users for development/demo.
 *
 * Usage:
 *   node src/scripts/seed.js
 *
 * Creates (if they don't already exist):
 *   - 1 ADMIN user
 *   - 2 DOCTOR users
 *
 * Safe to run multiple times (uses upsert logic).
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const SEED_USERS = [
  {
    name: 'System Admin',
    email: 'admin@medikiosk.in',
    password: 'Admin@1234',
    role: 'ADMIN',
    hospital: 'City General Hospital',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'doctor@medikiosk.in',
    password: 'Doctor@1234',
    role: 'DOCTOR',
    specialty: 'General Medicine',
    department: 'OPD',
    licenseNumber: 'MCI-2025-001',
  },
  {
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@medikiosk.in',
    password: 'Doctor@1234',
    role: 'DOCTOR',
    specialty: 'Cardiology',
    department: 'Cardiology',
    licenseNumber: 'MCI-2025-002',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⏭  Skipped (already exists): ${userData.email}`);
      continue;
    }

    const passwordHash = await User.hashPassword(userData.password);
    await User.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: userData.role,
      specialty: userData.specialty || null,
      department: userData.department || null,
      licenseNumber: userData.licenseNumber || null,
      hospital: userData.hospital || null,
    });

    console.log(`✅ Created ${userData.role}: ${userData.email} / ${userData.password}`);
  }

  console.log('\n🌱 Seed complete.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
