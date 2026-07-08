import { Router } from 'express';
import { sendCreated, sendError, sendSuccess } from '../utils/response.js';
import { formRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { sanitizeMiddleware } from '../middlewares/sanitize.middleware.js';
import { reviewListQuerySchema, reviewSchema, type ReviewInput } from '../schemas/review.schema.js';
import {
  getPublicReviewStats,
  listPublicReviews,
  submitReview,
} from '../services/review.service.js';

/**
 * Review/testimonial routes.
 * GET  /api/reviews       - approved public reviews
 * GET  /api/reviews/stats - aggregate approved review metrics
 * POST /api/reviews       - public review submission
 */
export const reviewRoutes = Router();

reviewRoutes.get('/', async (req, res) => {
  const result = reviewListQuerySchema.safeParse(req.query);
  if (!result.success) {
    sendError(res, 'Invalid review query parameters', 400);
    return;
  }

  const reviews = await listPublicReviews(result.data);
  sendSuccess(res, reviews, 'Reviews retrieved');
});

reviewRoutes.get('/stats', async (_req, res) => {
  const stats = await getPublicReviewStats();
  sendSuccess(res, stats, 'Review stats retrieved');
});

reviewRoutes.post(
  '/',
  formRateLimiter,
  validateRequest(reviewSchema),
  sanitizeMiddleware,
  async (req, res) => {
    try {
      const submitted = await submitReview(req.body as ReviewInput, {
        ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown',
        userAgent: req.get('user-agent') ?? null,
      });

      sendCreated(res, submitted, 'Review submitted for approval');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Review submission failed';
      const statusCode = message.includes('already submitted') ? 409 : 400;
      sendError(res, message, statusCode);
    }
  },
);
