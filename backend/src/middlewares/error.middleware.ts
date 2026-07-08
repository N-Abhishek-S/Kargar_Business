import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

/**
 * Custom application error class with structured error information.
 * Supports operation classification for error handling decisions.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly requestId: string;

  constructor(
    message: string,
    statusCode: number,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.requestId = uuidv4();
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware.
 * Catches all errors and returns a standardized API response.
 * Logs all errors with structured metadata.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const requestId = isAppError ? err.requestId : uuidv4();
  const isOperational = isAppError ? err.isOperational : false;

  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`[${requestId}] ${code}: ${err.message}`, {
    statusCode,
    code,
    isOperational,
    stack: statusCode >= 500 ? err.stack : undefined,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred',
    data: null,
    errors: [{ message: err.message }],
    timestamp: new Date().toISOString(),
    requestId,
  });
}
