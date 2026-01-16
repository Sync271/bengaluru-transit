/**
 * Zod schemas for location-related API endpoints
 */

import { z } from "zod";

/**
 * Schema for raw place item from GetSearchPlaceData API
 */
export const rawPlaceItemSchema = z.object({
	title: z.string(),
	placename: z.string(),
	lat: z.number(),
	lng: z.number(),
});

/**
 * Schema for raw search places API response from BMTC API
 */
export const rawSearchPlacesResponseSchema = z.object({
	data: z.array(rawPlaceItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for search places request parameters
 */
export const searchPlacesParamsSchema = z.object({
	placename: z.string().min(1, "Place name cannot be empty"),
});