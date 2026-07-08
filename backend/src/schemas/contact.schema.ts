import { z } from 'zod';

/**
 * Contact form validation schema.
 * Matches the contact_messages table structure.
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(20).optional().or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200).optional(),
  service: z.string().min(1, 'Please select a service').max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
}).refine((value) => value.subject || value.service, {
  path: ['subject'],
  message: 'Subject or service is required',
});

export type ContactInput = z.infer<typeof contactSchema>;
