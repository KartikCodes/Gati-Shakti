import mongoose from 'mongoose';

/**
 * dbCheck.js — Database Availability Middleware
 *
 * Checks if MongoDB is connected before proceeding with the request.
 * If not connected, returns an HTTP 503 Service Unavailable status with a clear error message,
 * preventing server crashes or timed-out connections.
 */
const dbCheckMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn(`[dbCheck] Request blocked: Database connection is offline (readyState = ${mongoose.connection.readyState})`);
    return res.status(503).json({
      success: false,
      message: 'Database connection is currently unavailable. Please check if your MongoDB server is running and configured correctly.',
    });
  }
  next();
};

export default dbCheckMiddleware;
