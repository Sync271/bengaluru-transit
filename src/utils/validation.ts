import { z } from 'zod';
import { TransitValidationError } from './errors';

/**
 * Validation utility functions
 */

/**
 * Parse a string ID to a number (base 10)
 * Used consistently throughout the wrapper to convert string IDs to numbers for API calls
 * @param id - String ID to parse
 * @returns Parsed number
 */
export function parseId(id: string): number {
	return parseInt(id, 10);
}

/**
 * Convert a number ID to a string
 * Used consistently throughout the wrapper to convert number IDs to strings for user-facing types
 * @param id - Number ID to convert
 * @returns String representation of the ID
 */
export function stringifyId(id: number): string {
	return id.toString();
}

/**
 * Validates data against a Zod schema and throws a formatted error if invalid
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string,
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Add detailed validation errors
    const details = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    throw new TransitValidationError(
      errorMessage || 'Validation failed',
      details
    );
  }

  return result.data;
}

/**
 * Safely validates data and returns a result object
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: { message: string; code: string; details?: Array<{ path: string; message: string }> } } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
