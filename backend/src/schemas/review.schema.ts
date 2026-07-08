import { z } from 'zod';

/**
 * Review/testimonial submission validation schema.
 * Matches the reviews table structure.
 */
const imageUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  data: z.string().min(32),
});

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));
const phoneRegex = /^[+()\-\s\d]{7,20}$/;

export const reviewSchema = z.object({
  customerName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  companyName: optionalText(160),
  email: z.string().trim().email('Please enter a valid email address').max(160).transform((value) => value.toLowerCase()),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
  serviceId: z.string().uuid('Please select a valid service'),
  location: optionalText(120),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  reviewTitle: z.string().trim().min(4, 'Review title must be at least 4 characters').max(140),
  reviewText: z.string().trim().min(40, 'Review must be at least 40 characters').max(1500),
  recommend: z.boolean().default(true),
  permissionToDisplay: z.boolean(),
  profileImage: imageUploadSchema.optional(),
  companyLogo: imageUploadSchema.optional(),
  websiteTrap: z.string().max(0).optional().or(z.literal('')),
}).refine((value) => value.permissionToDisplay, {
  path: ['permissionToDisplay'],
  message: 'Permission to display the review is required',
});

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
  featured: z.coerce.boolean().optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['featured', 'newest', 'rating']).default('featured'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
export type ReviewImageUploadInput = z.infer<typeof imageUploadSchema>;
