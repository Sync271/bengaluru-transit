/**
 * Types for route-related API endpoints
 */

import type { z } from "zod";
import type {
	rawRoutePointsResponseSchema,
	rawRouteSearchResponseSchema,
	rawAllRoutesResponseSchema,
} from "../schemas/routes";
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

/**
 * Raw route search result item from BMTC API
 */
export interface RawRouteSearchItem {
	union_rowno: number;
	row: number;
	routeno: string;
	responsecode: number;
	routeparentid: number;
}

/**
 * Raw route search API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawRouteSearchResponse = z.infer<
	typeof rawRouteSearchResponseSchema
>;

/**
 * Clean, normalized route search result item
 */
export interface RouteSearchItem {
	/**
	 * Union row number (grouping identifier)
	 */
	unionRowNo: number;
	/**
	 * Row number within the union group
	 */
	row: number;
	/**
	 * Route number/name (e.g., "80-A", "80-A D31G-KBS")
	 */
	routeNo: string;
	/**
	 * Route parent ID (used for other endpoints like getRoutePoints)
	 */
	routeParentId: number;
}

/**
 * Clean, normalized route search response
 */
export interface RouteSearchResponse {
	items: RouteSearchItem[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for searching routes
 */
export interface RouteSearchParams {
	/**
	 * Search query for routes (partial match supported)
	 * e.g., "80-a" will match "80-A", "180-A", "280-A", etc.
	 */
	query: string;
}

/**
 * Raw route list item from GetAllRouteList API
 */
export interface RawRouteListItem {
	routeid: number;
	routeno: string;
	routename: string;
	fromstationid: number;
	fromstation: string;
	tostationid: number;
	tostation: string;
	responsecode: number;
}

/**
 * Raw all routes API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawAllRoutesResponse = z.infer<typeof rawAllRoutesResponseSchema>;

/**
 * Clean, normalized route list item
 */
export interface RouteListItem {
	/**
	 * Route ID
	 */
	routeId: number;
	/**
	 * Route number (e.g., "89-C UP", "89-C DOWN")
	 */
	routeNo: string;
	/**
	 * Route name (e.g., "KBS-CVN", "CVN-KBS")
	 */
	routeName: string;
	/**
	 * From station ID
	 */
	fromStationId: number;
	/**
	 * From station name
	 */
	fromStation: string;
	/**
	 * To station ID
	 */
	toStationId: number;
	/**
	 * To station name
	 */
	toStation: string;
}

/**
 * Clean, normalized all routes response
 */
export interface AllRoutesResponse {
	items: RouteListItem[];
	message: string;
	success: boolean;
	rowCount: number;
}
