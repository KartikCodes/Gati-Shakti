/**
 * validate.js — Input Validation Middleware
 *
 * Uses express-validator to validate and sanitize request bodies
 * for all auth endpoints.
 */

import { body, validationResult } from 'express-validator';

// ─── Validation Result Handler ─────────────────────────────────

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return the first error message for cleaner UX
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
    });
  }

  next();
};

// ─── Registration Validation ───────────────────────────────────

export const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters.')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),

  handleValidationErrors,
];

// ─── Login Validation ──────────────────────────────────────────

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.'),

  handleValidationErrors,
];

// ─── Forgot Password Validation ────────────────────────────────

export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  handleValidationErrors,
];

// ─── Reset Password Validation ─────────────────────────────────

export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required.'),

  body('password')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),

  handleValidationErrors,
];

export const validateGoogleLogin = [
  body().custom((value, { req }) => {
    if (!req.body.idToken && !req.body.accessToken) {
      throw new Error('Google token (idToken or accessToken) is required.');
    }
    return true;
  }),
  handleValidationErrors,
];

