import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { sendCreated, sendError } from '../utils/response.js';
import { formRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { sanitizeMiddleware } from '../middlewares/sanitize.middleware.js';
import { contactSchema, type ContactInput } from '../schemas/contact.schema.js';

/**
 * Contact form routes.
 * POST /api/contact — Submit a contact inquiry.
 */
export const contactRoutes = Router();

contactRoutes.post(
  '/',
  formRateLimiter,
  validateRequest(contactSchema),
  sanitizeMiddleware,
  async (req, res) => {
    const body = req.body as ContactInput;
    const subject = body.subject?.trim() || `Service: ${body.service?.trim() ?? 'General inquiry'}`;

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        subject,
        message: body.message,
        status: 'new',
        priority: 'medium',
        source: 'website',
      })
      .select('id')
      .single();

    if (error) {
      sendError(res, error.message || 'Contact form submission failed', 400);
      return;
    }

    sendCreated(res, { id: data.id }, 'Contact form submitted successfully');
  },
);
