/**
 * Base types for BMTC API requests and responses
 */

export interface BMTCApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Common API request parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
