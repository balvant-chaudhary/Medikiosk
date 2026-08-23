// backend/src/config/db.js
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(uri) {
  if (isConnected) return;
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[DB] MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected.');
  isConnected = false;
});
