import { apiClient } from '@/api/client';
import type { AdminDashboardSummary, AdminReview, ApiResponse, PaginatedResponse } from '@/types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  expiresIn: string;
  admin: {
    email: string;
    role: string;
  };
}

export interface AdminReviewUpdatePayload {
  status?: AdminReview['status'];
  featured?: boolean;
  displayOrder?: number;
  adminReply?: string;
}

function unwrapResponse<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success || response.data.data === null) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response.data.data;
}

export async function loginAdmin(payload: AdminLoginPayload) {
  const response = await apiClient.post<ApiResponse<AdminLoginResponse>>('/admin/login', payload);
  return unwrapResponse(response);
}

export async function fetchAdminDashboard() {
  const response = await apiClient.get<ApiResponse<AdminDashboardSummary>>('/admin/dashboard');
  return unwrapResponse(response);
}

export async function fetchAdminReviews() {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminReview>>>('/admin/reviews', {
    params: { page: 1, limit: 100, sortBy: 'newest' },
  });
  return unwrapResponse(response);
}

export async function updateAdminReview(id: string, payload: AdminReviewUpdatePayload) {
  const response = await apiClient.patch<ApiResponse<null>>(`/admin/reviews/${id}`, payload);
  return response.data;
}

export async function deleteAdminReview(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/admin/reviews/${id}`);
  return response.data;
}
