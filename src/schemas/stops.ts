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

/**
 * Schema for raw nearby bus stop item from FindNearByBusStop_v2 API
 */
export const rawNearbyBusStopItemSchema = z.object({
	srno: z.number(),
	routeno: z.string(),
	routeid: z.number(),
	center_lat: z.number(),
	center_lon: z.number(),
	responsecode: z.number(),
	routetypeid: z.string(),
	routename: z.string(),
	route: z.string(),
});

/**
 * Schema for raw nearby bus stops API response from FindNearByBusStop_v2
 */
export const rawNearbyBusStopsResponseSchema = z.object({
	data: z.array(rawNearbyBusStopItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number().int().nonnegative(),
	responsecode: z.number().int(),
});

/**
 * Schema for nearby bus stops request parameters (internal - validates after conversion)
 */
export const nearbyBusStopsParamsSchema = z.object({
	stationname: z.string().min(1, "Station name is required"),
	stationflag: z.number().int().positive(), // Converted to number for API
});

/**
 * Schema for raw nearby station item from NearbyStations_v2 API
 */
export const rawNearbyStationItemSchema = z.object({
	rowno: z.number().int().positive(),
	geofenceid: z.number().int().positive(),
	geofencename: z.string(),
	center_lat: z.number(),
	center_lon: z.number(),
	towards: z.string(),
	distance: z.number().nonnegative(),
	totalminute: z.number().nonnegative(),
	responsecode: z.number().int(),
	radiuskm: z.number().nonnegative(),
});

/**
 * Schema for raw nearby stations API response from NearbyStations_v2
 */
export const rawNearbyStationsResponseSchema = z.object({
	data: z.array(rawNearbyStationItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number().int().nonnegative(),
	responsecode: z.number().int(),
});

/**
 * Schema for nearby stations request parameters
 */
export const nearbyStationsParamsSchema = z.object({
	latitude: z
		.number()
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	longitude: z
		.number()
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
	radiuskm: z.number().positive("Radius must be positive"), // API expects "radiuskm"
	stationflag: z.number().int().positive().optional(),
	flexiflag: z.number().int().positive().optional(),
});
