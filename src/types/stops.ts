/**
 * Types for stop/station-related API endpoints
 */

import type { z } from "zod";
import type { rawAroundBusStopsResponseSchema } from "../schemas/stops";
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
