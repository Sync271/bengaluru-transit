import { z } from "zod";

/**
 * Zod schemas for stop/station-related endpoints
 */

/**
 * Schema for raw facility item from AroundBusStops API
 */
export const rawFacilityItemSchema = z.object({
	name: z.string(),
	latitude: z.string(),
	longitude: z.string(),
	distance: z.string(),
});

/**
 * Schema for raw facility type group from AroundBusStops API
 */
export const rawFacilityTypeGroupSchema = z.object({
	type: z.string(),
	typeid: z.string(),
	icon: z.string().url(),
	list: z.array(rawFacilityItemSchema),
});

/**
 * Schema for raw station data item from AroundBusStops API
 */
export const rawStationDataItemSchema = z.object({
	stationname: z.string(),
	distance: z.string(),
	Arounds: z.array(rawFacilityTypeGroupSchema),
});

/**
 * Schema for raw around bus stops API response from BMTC API
 */
export const rawAroundBusStopsResponseSchema = z.object({
	data: z.array(rawStationDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for around bus stops request parameters
 */
export const aroundBusStopsParamsSchema = z.object({
	latitude: z
		.number()
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	longitude: z
		.number()
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
});
