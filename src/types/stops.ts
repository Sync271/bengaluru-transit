/**
 * Types for stop/station-related API endpoints
 */

import type { z } from "zod";
import type {
	rawAroundBusStopsResponseSchema,
	rawNearbyBusStopsResponseSchema,
	rawNearbyStationsResponseSchema,
} from "../schemas/stops";
import type { FacilityFeatureCollection } from "./geojson";

/**
 * Raw facility item from AroundBusStops API
 */
export interface RawFacilityItem {
	name: string;
	latitude: string; // API returns as string
	longitude: string; // API returns as string
	distance: string; // Distance in km as string
}

/**
 * Raw facility type group from AroundBusStops API
 */
export interface RawFacilityTypeGroup {
	type: string;
	typeid: string;
	icon: string;
	list: RawFacilityItem[];
}

/**
 * Raw station data item from AroundBusStops API
 */
export interface RawStationDataItem {
	stationname: string;
	distance: string; // Distance in km as string
	Arounds: RawFacilityTypeGroup[];
}

/**
 * Raw around bus stops API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawAroundBusStopsResponse = z.infer<
	typeof rawAroundBusStopsResponseSchema
>;

/**
 * Facility type group with GeoJSON features
 */
export interface FacilityTypeGroup {
	type: string;
	typeId: string;
	icon: string;
	facilities: FacilityFeatureCollection;
}

/**
 * Nearby station with facilities
 */
export interface NearbyStation {
	stationName: string;
	distance: number; // Distance in km
	facilityTypes: FacilityTypeGroup[];
}

/**
 * Clean, normalized around bus stops response
 */
export interface AroundBusStopsResponse {
	stations: NearbyStation[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for finding nearby bus stations
 */
export interface AroundBusStopsParams {
	/**
	 * Latitude of the search location
	 */
	latitude: number;
	/**
	 * Longitude of the search location
	 */
	longitude: number;
}

/**
 * Station type for filtering stops by transport operator
 * Human-readable values that map to API numeric codes
 */
export type StationType =
	| "bmtc" // 1: BMTC Bus Stops (default)
	| "chartered" // 2: Chartered Stops
	| "metro" // 163: Metro Stops
	| "ksrtc"; // 164: KSRTC bus stops

/**
 * Map human-readable station type to API numeric value
 */
export function stationTypeToNumber(type: StationType): number {
	const map: Record<StationType, number> = {
		bmtc: 1,
		chartered: 2,
		metro: 163,
		ksrtc: 164,
	};
	return map[type];
}

/**
 * Raw bus stop item from FindNearByBusStop_v2 API
 */
export interface RawNearbyBusStopItem {
	srno: number;
	routeno: string;
	routeid: number;
	center_lat: number;
	center_lon: number;
	responsecode: number;
	routetypeid: string;
	routename: string;
	route: string;
}

/**
 * Raw nearby bus stops API response from FindNearByBusStop_v2
 * Uses Zod inferred type to match schema exactly
 */
export type RawNearbyBusStopsResponse = z.infer<
	typeof rawNearbyBusStopsResponseSchema
>;

/**
 * Clean, normalized nearby bus stop item
 */
export interface NearbyBusStopItem {
	/**
	 * Serial number/order
	 */
	serialNumber: number;
	/**
	 * Route number (often empty)
	 */
	routeNo: string;
	/**
	 * Station ID (always string for consistency)
	 */
	stationId: string;
	/**
	 * Latitude coordinate
	 */
	latitude: number;
	/**
	 * Longitude coordinate
	 */
	longitude: number;
	/**
	 * Response code
	 */
	responseCode: number;
	/**
	 * Route type ID (as string for consistency)
	 */
	routeTypeId: string;
	/**
	 * Station name
	 */
	stationName: string;
	/**
	 * Route name (often empty)
	 */
	route: string;
}

/**
 * Clean, normalized nearby bus stops response
 */
export interface NearbyBusStopsResponse {
	items: NearbyBusStopItem[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for finding nearby bus stops by name
 */
export interface NearbyBusStopsParams {
	/**
	 * Station name query (partial match)
	 */
	stationName: string;
	/**
	 * Station type (optional, defaults to "bmtc")
	 * - "bmtc": BMTC Bus Stops (default)
	 * - "chartered": Chartered Stops
	 * - "metro": Metro Stops
	 * - "ksrtc": KSRTC bus stops
	 */
	stationType?: StationType;
}

/**
 * BMTC category type for NearbyStations_v2
 * Used to filter specific subsets of BMTC stops
 * Only valid when stationType is "bmtc"
 */
export type BMTCCategory = "airport" | "all";

/**
 * Map human-readable BMTC category to API numeric value
 */
export function bmtcCategoryToNumber(category: BMTCCategory): number {
	const map: Record<BMTCCategory, number> = {
		airport: 1, // Airport bus stops
		all: 3, // All BMTC stops
	};
	return map[category];
}

/**
 * Raw station item from NearbyStations_v2 API
 */
export interface RawNearbyStationItem {
	rowno: number;
	geofenceid: number;
	geofencename: string;
	center_lat: number;
	center_lon: number;
	towards: string;
	distance: number;
	totalminute: number;
	responsecode: number;
	radiuskm: number;
}

/**
 * Raw nearby stations API response from NearbyStations_v2
 * Uses Zod inferred type to match schema exactly
 */
export type RawNearbyStationsResponse = z.infer<
	typeof rawNearbyStationsResponseSchema
>;

/**
 * Clean, normalized nearby station item
 */
export interface NearbyStationItem {
	/**
	 * Row number/order
	 */
	rowNumber: number;
	/**
	 * Station ID (geofence ID, always string for consistency)
	 */
	stationId: string;
	/**
	 * Station name
	 */
	stationName: string;
	/**
	 * Latitude coordinate
	 */
	latitude: number;
	/**
	 * Longitude coordinate
	 */
	longitude: number;
	/**
	 * Direction indicator (towards)
	 */
	towards: string;
	/**
	 * Distance from search point in kilometers
	 */
	distance: number;
	/**
	 * Estimated travel time in minutes
	 */
	travelTimeMinutes: number;
	/**
	 * Response code
	 */
	responseCode: number;
	/**
	 * Search radius used in kilometers (from the API response)
	 */
	radius: number;
}

/**
 * Clean, normalized nearby stations response
 */
export interface NearbyStationsResponse {
	items: NearbyStationItem[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Base parameters for finding nearby stations by location
 */
type NearbyStationsParamsBase = {
	/**
	 * Latitude of the search location
	 */
	latitude: number;
	/**
	 * Longitude of the search location
	 */
	longitude: number;
	/**
	 * Search radius in kilometers
	 */
	radius: number;
};

/**
 * Parameters when stationType is "bmtc" - allows bmtcCategory
 */
type NearbyStationsParamsBMTC = NearbyStationsParamsBase & {
	/**
	 * Station type set to "bmtc" (required when using bmtcCategory)
	 */
	stationType: "bmtc";
	/**
	 * BMTC category (optional) - filter specific subsets of BMTC stops
	 * - "airport": Airport bus stops only (API value: 1)
	 * - "all": All BMTC stops (API value: 3)
	 */
	bmtcCategory?: BMTCCategory;
};

/**
 * Parameters when stationType is not "bmtc" - bmtcCategory not allowed
 */
type NearbyStationsParamsOther = NearbyStationsParamsBase & {
	/**
	 * Station type (optional, defaults to "bmtc" if not provided)
	 * - "chartered": Chartered Stops
	 * - "metro": Metro Stops
	 * - "ksrtc": KSRTC bus stops
	 */
	stationType?: "chartered" | "metro" | "ksrtc";
	/**
	 * BMTC category is not allowed when stationType is not "bmtc"
	 */
	bmtcCategory?: never;
};

/**
 * Parameters for finding nearby stations by location
 * When bmtcCategory is provided, stationType must be "bmtc"
 */
export type NearbyStationsParams =
	| NearbyStationsParamsBMTC
	| NearbyStationsParamsOther;
