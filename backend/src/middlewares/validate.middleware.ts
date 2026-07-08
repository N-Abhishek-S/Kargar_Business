import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request validation middleware factory.
 * Validates req.body against a Zod schema.
 * Returns standardized error response on validation failure.
 *
 * @param schema - Zod schema to validate the request body against
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * router.post('/contact', validateRequest(contactSchema), contactController.create);
 * ```
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: null,
        errors,
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
      return;
    }

    // Replace body with parsed data (handles transformations/defaults)
    req.body = result.data;
    next();
  };
}
