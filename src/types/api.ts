/**
 * Base types for transit API requests and responses
 */

/**
 * Optional request options supported by all API methods.
 * Pass an AbortSignal to cancel in-flight requests.
 */
export interface RequestOptions {
	/**
	 * AbortSignal for request cancellation (e.g. from AbortController).
	 * When aborted, the request throws DOMException with name "AbortError".
	 */
	signal?: AbortSignal;
}

export interface TransitApiError {
  message: string;
  code?: string;
  statusCode?: number;
}
