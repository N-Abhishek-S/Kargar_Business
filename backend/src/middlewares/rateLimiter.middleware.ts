import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Global rate limiter — applies to all routes.
 * Configurable via environment variables.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    data: null,
    timestamp: new Date().toISOString(),
    requestId: 'rate-limited',
  },
});

/**
 * Strict rate limiter for form submissions.
 * 5 requests per 15 minutes.
 */
export const formRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions, please try again later',
    data: null,
    timestamp: new Date().toISOString(),
    requestId: 'rate-limited',
  },
});

/**
 * Strict rate limiter for authentication attempts.
 * 5 attempts per 15 minutes.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    data: null,
    timestamp: new Date().toISOString(),
    requestId: 'rate-limited',
  },
});
