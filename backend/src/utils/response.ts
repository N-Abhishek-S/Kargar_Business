import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standardized API response helpers.
 * Every response follows the ApiResponse envelope format.
 */

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
  });
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Created successfully',
): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Array<{ field?: string; message: string }>,
): void {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
  });
}
