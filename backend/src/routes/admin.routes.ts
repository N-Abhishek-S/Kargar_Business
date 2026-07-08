import crypto from 'node:crypto';
import { Router } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { adminLoginSchema, adminReviewUpdateSchema, type AdminReviewUpdateInput } from '../schemas/admin.schema.js';
import { reviewListQuerySchema } from '../schemas/review.schema.js';
import {
  getAdminReviews,
  getReviewStats,
  softDeleteReview,
  updateReviewStatus,
} from '../repositories/review.repository.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const adminRoutes = Router();

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.byteLength !== rightBuffer.byteLength) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

adminRoutes.post('/login', authRateLimiter, validateRequest(adminLoginSchema), (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const isValidEmail = safeCompare(email.toLowerCase(), env.ADMIN_EMAIL.toLowerCase());
  const isValidPassword = safeCompare(password, env.ADMIN_PASSWORD);

  if (!isValidEmail || !isValidPassword) {
    sendError(res, 'Invalid admin credentials', 401);
    return;
  }

  const tokenOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  const token = jwt.sign(
    {
      adminId: crypto.createHash('sha256').update(email).digest('hex'),
      email,
      role: 'super_admin',
    },
    env.JWT_SECRET,
    tokenOptions,
  );

  sendSuccess(
    res,
    {
      token,
      expiresIn: env.JWT_EXPIRES_IN,
      admin: {
        email,
        role: 'super_admin',
      },
    },
    'Login successful',
  );
});

adminRoutes.get('/dashboard', authMiddleware, async (_req, res) => {
  const [{ count: totalContacts }, { count: newContacts }, { count: pendingReviews }, { count: approvedReviews }, stats] =
    await Promise.all([
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'approved').is('deleted_at', null),
      getReviewStats(),
    ]);

  sendSuccess(
    res,
    {
      totalReviews: stats.totalReviews,
      pendingReviews: pendingReviews ?? 0,
      approvedReviews: approvedReviews ?? 0,
      averageRating: stats.averageRating,
      totalContacts: totalContacts ?? 0,
      newContacts: newContacts ?? 0,
      totalSubscribers: 0,
    },
    'Dashboard data retrieved',
  );
});

adminRoutes.get('/reviews', authMiddleware, async (req, res) => {
  const result = reviewListQuerySchema.safeParse(req.query);
  if (!result.success) {
    sendError(res, 'Invalid review query parameters', 400);
    return;
  }

  const reviews = await getAdminReviews(result.data);
  sendSuccess(res, reviews, 'Reviews retrieved');
});

adminRoutes.patch(
  '/reviews/:id',
  authMiddleware,
  validateRequest(adminReviewUpdateSchema),
  async (req, res) => {
    const { id } = req.params as { id?: string };
    if (!id) {
      sendError(res, 'Review id is required', 400);
      return;
    }

    const body = req.body as AdminReviewUpdateInput;
    await updateReviewStatus(id, {
      status: body.status,
      featured: body.featured ?? body.is_featured,
      displayOrder: body.displayOrder ?? body.display_order,
      adminReply: body.adminReply ?? body.admin_reply,
    });

    sendSuccess(res, null, 'Review updated');
  },
);

adminRoutes.delete('/reviews/:id', authMiddleware, async (req, res) => {
  const { id } = req.params as { id?: string };
  if (!id) {
    sendError(res, 'Review id is required', 400);
    return;
  }

  await softDeleteReview(id);
  sendSuccess(res, null, 'Review deleted');
});

adminRoutes.get('/contacts', authMiddleware, (_req, res) => {
  sendSuccess(res, { items: [], total: 0, page: 1, limit: 10, totalPages: 0 }, 'Contacts retrieved');
});

adminRoutes.patch('/contacts/:id', authMiddleware, (_req, res) => {
  sendSuccess(res, null, 'Contact updated');
});

adminRoutes.get('/reviews/export', authMiddleware, async (_req, res) => {
  const reviews = await getAdminReviews({ page: 1, limit: 500, sortBy: 'newest' });
  const header = 'id,customer_name,company_name,rating,status,created_at';
  const rows = reviews.items.map((review) =>
    [
      review.id,
      `"${review.customerName.replaceAll('"', '""')}"`,
      `"${review.companyName.replaceAll('"', '""')}"`,
      review.rating,
      review.status,
      review.createdAt,
    ].join(','),
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv');
  res.send([header, ...rows].join('\n'));
});

adminRoutes.get('/contacts/export', authMiddleware, (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
  res.send('id,name,email,company,subject,status,created_at\n');
});
