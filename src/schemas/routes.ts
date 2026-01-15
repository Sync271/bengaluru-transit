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

/**
 * Schema for raw route search result item from BMTC API
 */
export const rawRouteSearchItemSchema = z.object({
	union_rowno: z.number(),
	row: z.number(),
	routeno: z.string(),
	responsecode: z.number(),
	routeparentid: z.number(),
});

/**
 * Schema for raw route search API response from BMTC API
 */
export const rawRouteSearchResponseSchema = z.object({
	data: z.array(rawRouteSearchItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for route search request parameters
 */
export const routeSearchParamsSchema = z.object({
	routetext: z.string().min(1, "Route text is required"),
});
