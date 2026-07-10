/**
 * authController.js — Authentication Controllers
 *
 * Implements register, login, logout, googleLogin, forgotPassword, resetPassword, getProfile.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/email.js';

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── Register User ──────────────────────────────────────────────────
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check whether the email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user. Mongoose pre-save hook will hash password
    const user = await User.create({
      fullName,
      email,
      password,
      authProvider: 'email',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// ─── Login User ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verify email exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    if (user.authProvider !== 'email') {
      return res.status(400).json({
        success: false,
        message: `This account was registered using Google. Please log in using Google.`,
      });
    }

    // Compare password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Save Last Login timestamp
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// ─── Google OAuth Login ──────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  const { idToken, accessToken } = req.body;

  try {
    let email, name;

    if (idToken) {
      try {
        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
      } catch (err) {
        console.error('Google ID token verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid Google ID token.',
        });
      }
    } else if (accessToken) {
      try {
        // Fetch from openidconnect UserInfo endpoint
        const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`UserInfo endpoint returned status ${response.status}`);
        }

        const payload = await response.json();
        email = payload.email;
        name = payload.name;
      } catch (err) {
        console.error('Google Access token verification failed:', err.message);
        return res.status(400).json({
          success: false,
          message: 'Invalid Google Access token.',
        });
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not retrieve email from Google login.',
      });
    }

    // Check if account already exists
    let user = await User.findOne({ email });

    if (!user) {
      // First-time Google login: Create a user record in MongoDB
      user = await User.create({
        fullName: name || 'Google User',
        email,
        authProvider: 'google',
      });
    } else if (user.authProvider !== 'google') {
      // If user exists but registered with email/password, merge/allow google login
      user.authProvider = 'google';
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Save Last Login timestamp
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google login.',
    });
  }
};

// ─── Logout User ────────────────────────────────────────────────────
export const logout = async (req, res) => {
  // Since JWT is stateless, logout on the server is a success response.
  // The client side will delete the token from local storage.
  return res.status(200).json({
    success: true,
    message: 'Logout successful. Session cleared.',
  });
};

// ─── Forgot Password ────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't tell the user that the email doesn't exist,
      // but the requirements say "Show appropriate success/error messages."
      // Let's return error if email doesn't exist to match standard custom app flows
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    if (user.authProvider !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'This email is registered using Google OAuth. Password reset is not supported.',
      });
    }

    // Generate secure password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set expiry (1 hour)
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/#reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email.',
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Clear token since email failed
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Error sending reset email. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during forgot password process.',
    });
  }
};

// ─── Reset Password ─────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Hash token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with token and not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset.',
    });
  }
};

// ─── Get User Profile ───────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.',
    });
  }
};
