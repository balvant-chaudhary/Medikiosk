// backend/src/server.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// ── Route imports ────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import patientRoutes  from './routes/patientRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// TODO Phase 10: import aiRoutes       from './routes/aiRoutes.js';

const app = express();

// ── Security ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 20,                    // 20 attempts per window
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { success: false, message: 'Too many requests. Please wait.' },
}));

// ── Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──────────────────────────────────────────
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Logging ───────────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediKiosk API is running',
    version: '1.0.0',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/patients',   patientRoutes);
app.use('/api/consents',   consentRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/documents',  documentRoutes);
app.use('/api/doctor',     doctorRoutes);
app.use('/api/admin',      adminRoutes);
// app.use('/api/ai',         aiRoutes);

// ── 404 + Error handling ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
async function start() {
  await connectDB(config.mongoUri);

  app.listen(config.port, () => {
    console.log(`\n🏥 MediKiosk API  →  http://localhost:${config.port}`);
    console.log(`   Environment  :  ${config.nodeEnv}`);
    console.log(`   Health       :  http://localhost:${config.port}/api/health`);
    console.log(`   Auth         :  http://localhost:${config.port}/api/auth\n`);
  });
}

start();
