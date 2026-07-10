/**
 * authRoutes.js — Express Router for Authentication
 *
 * Defines endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   POST /api/auth/google
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   GET /api/auth/profile
 */

import express from 'express';
import {
  register,
  login,
  googleLogin,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateGoogleLogin,
} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', validateGoogleLogin, googleLogin);
router.post('/logout', logout);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;
