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
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base request parameters that can be extended
 */
export type BaseRequestParams = PaginationParams & SortParams;
