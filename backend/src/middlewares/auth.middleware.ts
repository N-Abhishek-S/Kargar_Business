import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';

interface JwtPayload {
  adminId: string;
  email: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware for admin routes.
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches the decoded admin payload to req.admin.
 *
 * @throws {AppError} 401 if token is missing, invalid, or expired
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.admin = decoded;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401, 'AUTH_INVALID');
  }
}
