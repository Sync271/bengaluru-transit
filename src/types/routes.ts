/**
 * Types for route-related API endpoints
 */

import type { z } from "zod";
import type { rawRoutePointsResponseSchema } from "../schemas/routes";
import type { RouteFeatureCollection } from "./geojson";

/**
 * Raw route point data item from BMTC API
 */
export interface RawRoutePointItem {
	latitude: string; // API returns as string
	longitude: string; // API returns as string
	responsecode: number;
}

/**
 * Raw route points API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawRoutePointsResponse = z.infer<
	typeof rawRoutePointsResponseSchema
>;

/**
 * Clean, normalized route points response
 */
export interface RoutePointsResponse {
	/**
	 * Route path as GeoJSON FeatureCollection (LineString feature)
	 */
	routePath: RouteFeatureCollection;
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for getting route points
 */
export interface RoutePointsParams {
	/**
	 * Route ID (obtained from getVehicleTrip)
	 */
	routeId: number;
}
