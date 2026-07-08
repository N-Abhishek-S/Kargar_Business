import { z } from 'zod';

/**
 * Admin login validation schema.
 */
export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Admin review update schema.
 */
export const adminReviewUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'spam', 'archived']).optional(),
  featured: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
  adminReply: z.string().trim().max(1000).optional().or(z.literal('')),
  admin_reply: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type AdminReviewUpdateInput = z.infer<typeof adminReviewUpdateSchema>;

/**
 * Admin contact update schema.
 */
export const adminContactUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigned_to: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export type AdminContactUpdateInput = z.infer<typeof adminContactUpdateSchema>;
