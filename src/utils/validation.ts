import { z } from 'zod';
import type { BMTCApiError } from '../types/api';

/**
 * Validation utility functions
 */

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
    const error: BMTCApiError = {
      message: errorMessage || 'Validation failed',
      code: 'VALIDATION_ERROR',
    };

    // Add detailed validation errors
    const details = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    throw new Error(
      `${error.message}: ${JSON.stringify(details, null, 2)}`,
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
): { success: true; data: T } | { success: false; error: BMTCApiError } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
