import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { sendCreated, sendError } from '../utils/response.js';
import { formRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { newsletterSchema, type NewsletterInput } from '../schemas/newsletter.schema.js';

/**
 * Newsletter subscription routes.
 * POST /api/newsletter — Subscribe email address.
 */
export const newsletterRoutes = Router();

newsletterRoutes.post(
  '/',
  formRateLimiter,
  validateRequest(newsletterSchema),
  async (req, res) => {
    const { email } = req.body as NewsletterInput;
    const normalizedEmail = email.toLowerCase();

    const { error: subscriberError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          is_active: true,
          source: 'website',
          unsubscribed_at: null,
        },
        { onConflict: 'email' },
      );

    if (subscriberError) {
      sendError(res, subscriberError.message || 'Newsletter subscription failed', 400);
      return;
    }

    const { error: legacyError } = await supabase
      .from('newsletter')
      .upsert(
        {
          email: normalizedEmail,
          is_active: true,
          source: 'website',
          unsubscribed_at: null,
        },
        { onConflict: 'email' },
      );

    if (legacyError) {
      sendError(res, legacyError.message || 'Newsletter subscription failed', 400);
      return;
    }

    sendCreated(res, { subscribed: true }, 'Subscribed successfully');
  },
);
