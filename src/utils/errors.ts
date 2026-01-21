/**
 * Custom error classes for Bangalore Transit SDK
 */

/**
 * Base error class for all transit SDK errors
 */
export class TransitError extends Error {
	/**
	 * Error code (e.g., 'VALIDATION_ERROR', 'API_ERROR')
	 */
	public readonly code: string;

	/**
	 * Optional cause (original error)
	 */
	public readonly cause?: Error;

	constructor(message: string, code: string = 'TRANSIT_ERROR', cause?: Error) {
		super(message);
		this.name = 'TransitError';
		this.code = code;
		this.cause = cause;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, TransitError);
		}
	}
}

/**
 * Validation error thrown when input parameters fail Zod schema validation
 */
export class TransitValidationError extends TransitError {
	/**
	 * Validation error details from Zod
	 */
	public readonly details: Array<{ path: string; message: string }>;

	constructor(
		message: string,
		details: Array<{ path: string; message: string }>,
		cause?: Error
	) {
		super(message, 'VALIDATION_ERROR', cause);
		this.name = 'TransitValidationError';
		this.details = details;
	}
}
