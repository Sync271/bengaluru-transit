/**
 * Types for stop/station-related API endpoints
 */

import type { z } from "zod";
import type {
	rawAroundBusStopsResponseSchema,
	rawNearbyBusStopsResponseSchema,
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
 * Station flag type for FindNearByBusStop_v2
 * Human-readable values that map to API numeric codes
 */
export type StationFlag =
	| "bmtc" // 1: BMTC Bus Stops (default)
	| "chartered" // 2: Chartered Stops
	| "metro" // 163: Metro Stops
	| "ksrtc"; // 164: KSRTC bus stops

/**
 * Map human-readable station flag to API numeric value
 */
export function stationFlagToNumber(flag: StationFlag): number {
	const map: Record<StationFlag, number> = {
		bmtc: 1,
		chartered: 2,
		metro: 163,
		ksrtc: 164,
	};
	return map[flag];
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
	 * Station flag (optional, defaults to "bmtc")
	 * - "bmtc": BMTC Bus Stops (default)
	 * - "chartered": Chartered Stops
	 * - "metro": Metro Stops
	 * - "ksrtc": KSRTC bus stops
	 */
	stationFlag?: StationFlag;
}
