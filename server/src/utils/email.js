/**
 * email.js — Email Utility
 *
 * Sends emails via Nodemailer using SMTP configuration from environment variables.
 * Falls back to console logging the email content if SMTP is not configured,
 * making development easier without requiring an email service.
 */

import nodemailer from 'nodemailer';

/**
 * Check if SMTP is configured
 */
const isSmtpConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

/**
 * Create Nodemailer transporter (lazy initialization)
 */
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!isSmtpConfigured()) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Send a password reset email.
 *
 * @param {string} to       — Recipient email address
 * @param {string} resetUrl — Full password reset URL with token
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = 'GatiShakti Local — Password Reset Request';

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #6366F1, #3B82F6); color: white; font-weight: 700; font-size: 24px; width: 56px; height: 56px; line-height: 56px; border-radius: 12px;">
          GS
        </div>
      </div>
      <h2 style="color: #1E293B; font-size: 22px; text-align: center; margin-bottom: 16px;">
        Password Reset Request
      </h2>
      <p style="color: #64748B; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
        You requested a password reset for your GatiShakti Local account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #3B82F6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Reset Password
        </a>
      </div>
      <p style="color: #94A3B8; font-size: 13px; text-align: center; line-height: 1.5;">
        If you didn't request this, you can safely ignore this email.<br/>
        Your password will not be changed.
      </p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0 16px;" />
      <p style="color: #CBD5E1; font-size: 11px; text-align: center;">
        GatiShakti Local — Bhopal Edition
      </p>
    </div>
  `;

  const text = `Password Reset Request\n\nYou requested a password reset for your GatiShakti Local account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`;

  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    // Fallback: log to console for development
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║         📧 PASSWORD RESET EMAIL (DEV MODE)       ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║ To:    ${to}`);
    console.log(`║ Reset: ${resetUrl}`);
    console.log('╚══════════════════════════════════════════════════╝\n');
    return;
  }

  await mailTransporter.sendMail({
    from: process.env.SMTP_FROM || `GatiShakti Local <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
