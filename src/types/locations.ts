/**
 * Types for location-related API endpoints
 */

import type { z } from "zod";
import type { rawSearchPlacesResponseSchema } from "../schemas/locations";

/**
 * Raw place item from GetSearchPlaceData API
 */
export interface RawPlaceItem {
	title: string;
	placename: string;
	lat: number;
	lng: number;
}

/**
 * Raw search places API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawSearchPlacesResponse = z.infer<
	typeof rawSearchPlacesResponseSchema
>;

/**
 * Clean, normalized place item
 */
export interface PlaceItem {
	/**
	 * Short title/name of the place
	 */
	title: string;
	/**
	 * Full formatted address of the place
	 */
	address: string;
	/**
	 * Latitude coordinate
	 */
	latitude: number;
	/**
	 * Longitude coordinate
	 */
	longitude: number;
}

/**
 * Clean, normalized search places response
 */
export interface SearchPlacesResponse {
	/**
	 * List of matching places
	 */
	items: PlaceItem[];
	/**
	 * Response message
	 */
	message: string;
	/**
	 * Whether the request was successful
	 */
	success: boolean;
	/**
	 * Number of results returned
	 */
	rowCount: number;
}

/**
 * Parameters for searching places
 */
export interface SearchPlacesParams {
	/**
	 * Search query for places (partial match supported)
	 */
	query: string;
}