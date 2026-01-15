import { z } from "zod";

/**
 * Zod schemas for route-related endpoints
 */

/**
 * Schema for raw route point data item from BMTC API
 */
export const rawRoutePointItemSchema = z.object({
	latitude: z.string(),
	longitude: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw route points API response from BMTC API
 */
export const rawRoutePointsResponseSchema = z.object({
	data: z.array(rawRoutePointItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for route points request parameters
 */
export const routePointsParamsSchema = z.object({
	routeid: z.number().int().positive("Route ID must be a positive integer"),
});
