// backend/src/config/env.js
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];

export function validateEnv() {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-2.0-flash',
  },

  ocr: {
    provider: process.env.OCR_PROVIDER || 'tesseract',
    apiKey: process.env.OCR_API_KEY || '',
  },

  speech: {
    sttProvider: process.env.STT_PROVIDER || 'browser',
    ttsProvider: process.env.TTS_PROVIDER || 'browser',
    sttApiKey: process.env.STT_API_KEY || '',
    ttsApiKey: process.env.TTS_API_KEY || '',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
};
