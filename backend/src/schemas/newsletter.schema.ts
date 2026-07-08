import { z } from 'zod';

/**
 * Newsletter subscription validation schema.
 */
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
