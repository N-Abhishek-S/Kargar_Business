/**
 * Backend shared types.
 */

export interface AdminPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
