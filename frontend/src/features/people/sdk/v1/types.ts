import { z } from 'zod';

// Base Models
export const MentorProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bio: z.string().nullable(),
  headline: z.string().nullable(),
  hourlyRate: z.number().nullable(),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended', 'archived']),
  averageRating: z.number(),
  totalReviews: z.number(),
});

export type MentorProfile = z.infer<typeof MentorProfileSchema>;

// DTOs (Data Transfer Objects)
export const SearchMentorsQuerySchema = z.object({
  search: z.string().min(1),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(10),
});

export type SearchMentorsQuery = z.infer<typeof SearchMentorsQuerySchema>;

export const SearchMentorsResponseSchema = z.array(z.object({
  mentor_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  headline: z.string().nullable(),
  average_rating: z.number(),
  similarity_score: z.number()
}));

export type SearchMentorsResponse = z.infer<typeof SearchMentorsResponseSchema>;
