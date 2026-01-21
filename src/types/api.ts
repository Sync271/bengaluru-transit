/**
 * Base types for transit API requests and responses
 */

export interface TransitApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
