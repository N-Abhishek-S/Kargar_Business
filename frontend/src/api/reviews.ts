import { apiClient } from '@/api/client';
import type {
  ApiResponse,
  ClientLogo,
  PaginatedResponse,
  PublicReview,
  ReviewStats,
  ReviewSubmissionPayload,
  ServiceOption,
} from '@/types';

export interface ReviewListParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  sortBy?: 'featured' | 'newest' | 'rating';
}

export interface ReviewSubmissionResponse {
  id: string;
  status: 'pending';
}

function unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success || response.data.data === null) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response.data.data;
}

export async function fetchPublicReviews(params: ReviewListParams = {}) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<PublicReview>>>('/reviews', {
    params,
  });
  return unwrapResponse(response);
}

export async function fetchReviewStats() {
  const response = await apiClient.get<ApiResponse<ReviewStats>>('/reviews/stats');
  return unwrapResponse(response);
}

export async function submitPublicReview(payload: ReviewSubmissionPayload) {
  const response = await apiClient.post<ApiResponse<ReviewSubmissionResponse>>('/reviews', payload);
  return unwrapResponse(response);
}

export async function fetchServiceOptions() {
  const response = await apiClient.get<ApiResponse<ServiceOption[]>>('/services');
  return unwrapResponse(response);
}

export async function fetchClientLogos() {
  const response = await apiClient.get<ApiResponse<ClientLogo[]>>('/client-logos');
  return unwrapResponse(response);
}
