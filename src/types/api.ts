/**
 * Base types for BMTC API requests and responses
 */

export interface BMTCApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface BMTCApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Common API request parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
