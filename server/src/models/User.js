/**
 * User.js — Mongoose User Model
 *
 * Schema fields:
 *   fullName, email, password, role, authProvider,
 *   department, lastLogin, passwordResetToken, passwordResetExpires
 *
 * Timestamps (createdAt, updatedAt) are auto-managed by Mongoose.
 * Passwords are automatically hashed via a pre-save hook using bcrypt.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude from queries by default
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },

    department: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ─── Pre-save Hook: Hash password ──────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare password ─────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Return safe user object (no password) ────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    authProvider: this.authProvider,
    department: this.department,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
