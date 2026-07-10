/**
 * db.js — MongoDB Connection via Mongoose
 *
 * Connects to MongoDB Atlas using the MONGODB_URI environment variable.
 * Includes asynchronous reconnection loop if the initial connection fails.
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB initial connection failed:', error.message);
    console.log('⚠️  Server will start without active DB connection. Retrying in 5 seconds...');
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }

  // Handle connection events (register listeners once)
  if (mongoose.connection.listeners('error').length === 0) {
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;
