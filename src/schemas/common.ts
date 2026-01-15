import { z } from 'zod';

/**
 * Common Zod schemas for validation
 */

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * Schema for sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Base request parameters schema
 */
export const baseRequestParamsSchema = paginationSchema.merge(sortSchema);

/**
 * Schema for API error response
 */
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Schema for generic API response wrapper
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
  });
