import axios from 'axios';
import type { ApiResponse } from '@/types';
import { config } from '@/config';

/**
 * Preconfigured Axios instance for all API calls.
 * - Base URL from environment config
 * - JSON content type
 * - 15 second timeout
 * - Standardized error transformation
 */
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Attach JWT token to admin requests */
apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

/** Transform error responses into a consistent format */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const apiError: ApiResponse<null> = (error.response?.data as ApiResponse<null> | undefined) ?? {
        success: false,
        message: error.message || 'An unexpected error occurred',
        data: null,
        errors: [],
        timestamp: new Date().toISOString(),
        requestId: 'unknown',
      };
      return Promise.reject(new Error(apiError.message));
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export { apiClient };
