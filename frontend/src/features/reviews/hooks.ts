import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchClientLogos,
  fetchPublicReviews,
  fetchReviewStats,
  fetchServiceOptions,
  submitPublicReview,
  type ReviewListParams,
} from '@/services/reviews.service';
import type { ReviewSubmissionPayload } from '@/types';

interface QueryStateOptions {
  enabled?: boolean;
}

export const reviewQueryKeys = {
  all: ['reviews'] as const,
  list: (params: ReviewListParams) => ['reviews', 'list', params] as const,
  stats: ['reviews', 'stats'] as const,
  services: ['services'] as const,
  clientLogos: ['client-logos'] as const,
};

export function usePublicReviews(params: ReviewListParams = {}, options: QueryStateOptions = {}) {
  return useQuery({
    queryKey: reviewQueryKeys.list(params),
    queryFn: () => fetchPublicReviews(params),
    enabled: options.enabled,
  });
}

export function useReviewStats(options: QueryStateOptions = {}) {
  return useQuery({
    queryKey: reviewQueryKeys.stats,
    queryFn: fetchReviewStats,
    enabled: options.enabled,
  });
}

export function useServiceOptions(options: QueryStateOptions = {}) {
  return useQuery({
    queryKey: reviewQueryKeys.services,
    queryFn: fetchServiceOptions,
    enabled: options.enabled,
  });
}

export function useClientLogos(options: QueryStateOptions = {}) {
  return useQuery({
    queryKey: reviewQueryKeys.clientLogos,
    queryFn: fetchClientLogos,
    enabled: options.enabled,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewSubmissionPayload) => submitPublicReview(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
    },
  });
}
