import { z } from 'zod';

/**
 * Common Zod schemas for validation
 */

/**
 * Schema for sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for API error response
 */
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
});
