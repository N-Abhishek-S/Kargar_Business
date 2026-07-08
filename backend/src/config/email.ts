import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Nodemailer transporter for sending emails.
 * Falls back gracefully if SMTP credentials are not configured.
 */
function createTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('⚠️  SMTP credentials not configured. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export const emailTransporter = createTransporter();
