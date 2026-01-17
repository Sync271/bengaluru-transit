/**
 * Types for route-related API endpoints
 */

import type { z } from "zod";
import type {
	rawRoutePointsResponseSchema,
	rawRouteSearchResponseSchema,
	rawAllRoutesResponseSchema,
	rawTimetableResponseSchema,
	rawRouteDetailsResponseSchema,
} from "../schemas/routes";
import type {
	RouteFeatureCollection,
	StopFeatureCollection,
	LocationFeatureCollection,
	StopProperties,
} from "./geojson";
import type { Feature, FeatureCollection, Point } from "geojson";

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
	 * Route ID (obtained from getVehicleTrip, always string for consistency)
	 */
	routeId: string;
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
	 * Route parent ID (used for other endpoints like getRoutePoints, always string for consistency)
	 */
	routeParentId: string;
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
	 * Route ID (always string for consistency)
	 */
	routeId: string;
	/**
	 * Route number (e.g., "89-C UP", "89-C DOWN")
	 */
	routeNo: string;
	/**
	 * Route name (e.g., "KBS-CVN", "CVN-KBS")
	 */
	routeName: string;
	/**
	 * From station ID (always string for consistency)
	 */
	fromStationId: string;
	/**
	 * From station name
	 */
	fromStation: string;
	/**
	 * To station ID (always string for consistency)
	 */
	toStationId: string;
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

/**
 * Raw trip detail item from timetable API
 */
export interface RawTripDetailItem {
	starttime: string; // Format: "HH:mm"
	endtime: string; // Format: "HH:mm"
}

/**
 * Raw timetable data item from BMTC API
 */
export interface RawTimetableItem {
	fromstationname: string;
	tostationname: string;
	fromstationid: string; // API returns as string
	tostationid: string; // API returns as string
	apptime: string; // Format: "HH:mm:ss"
	distance: string; // API returns as string
	platformname: string;
	platformnumber: string;
	baynumber: string;
	tripdetails: RawTripDetailItem[];
}

/**
 * Raw timetable API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawTimetableResponse = z.infer<typeof rawTimetableResponseSchema>;

/**
 * Clean, normalized trip detail item
 */
export interface TripDetailItem {
	/**
	 * Start time in format "HH:mm"
	 */
	startTime: string;
	/**
	 * End time in format "HH:mm"
	 */
	endTime: string;
}

/**
 * Clean, normalized timetable item
 */
export interface TimetableItem {
	/**
	 * From station name
	 */
	fromStationName: string;
	/**
	 * To station name
	 */
	toStationName: string;
	/**
	 * From station ID (string as returned by API)
	 */
	fromStationId: string;
	/**
	 * To station ID (string as returned by API)
	 */
	toStationId: string;
	/**
	 * Approximate travel time in format "HH:mm:ss"
	 */
	approximateTime: string;
	/**
	 * Distance in kilometers
	 */
	distance: number;
	/**
	 * Platform name
	 */
	platformName: string;
	/**
	 * Platform number
	 */
	platformNumber: string;
	/**
	 * Bay number
	 */
	bayNumber: string;
	/**
	 * List of trip details with start and end times
	 */
	tripDetails: TripDetailItem[];
}

/**
 * Clean, normalized timetable response
 */
export interface TimetableResponse {
	items: TimetableItem[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Base parameters for getting timetable by route ID
 */
interface TimetableByRouteBaseParams {
	/**
	 * Route ID (always string for consistency)
	 */
	routeId: string;
	/**
	 * Start time (optional - defaults to current time)
	 * The wrapper converts this to "YYYY-MM-DD HH:mm" format
	 */
	startTime?: Date;
	/**
	 * End time (optional - defaults to "23:59" of startTime date)
	 * The wrapper converts this to "YYYY-MM-DD HH:mm" format
	 */
	endTime?: Date;
}

/**
 * Parameters for getting timetable with specific stations
 */
export interface TimetableByRouteParamsWithStations
	extends TimetableByRouteBaseParams {
	/**
	 * From station ID (required with toStationId, string as returned by API)
	 */
	fromStationId: string;
	/**
	 * To station ID (required with fromStationId, string as returned by API)
	 */
	toStationId: string;
}

/**
 * Parameters for getting timetable without specific stations (uses route start/end)
 */
export interface TimetableByRouteParamsWithoutStations
	extends TimetableByRouteBaseParams {
	/**
	 * From station ID must not be provided
	 */
	fromStationId?: never;
	/**
	 * To station ID must not be provided
	 */
	toStationId?: never;
}

/**
 * Parameters for getting timetable by route ID
 * Type-safe: either both fromStationId and toStationId are provided, or neither
 */
export type TimetableByRouteParams =
	| TimetableByRouteParamsWithStations
	| TimetableByRouteParamsWithoutStations;

/**
 * Raw vehicle detail item from SearchByRouteDetails_v4 API
 */
export interface RawRouteDetailVehicleItem {
	vehicleid: number;
	vehiclenumber: string;
	servicetypeid: number;
	servicetype: string;
	centerlat: number;
	centerlong: number;
	eta: string;
	sch_arrivaltime: string;
	sch_departuretime: string;
	actual_arrivaltime: string;
	actual_departuretime: string;
	sch_tripstarttime: string;
	sch_tripendtime: string;
	lastlocationid: number;
	currentlocationid: number;
	nextlocationid: number;
	currentstop: string | null;
	nextstop: string | null;
	laststop: string | null;
	stopCoveredStatus: number;
	heading: number;
	lastrefreshon: string;
	lastreceiveddatetimeflag: number;
	tripposition: number;
}

/**
 * Raw station data item from SearchByRouteDetails_v4 API
 */
export interface RawRouteDetailStationItem {
	routeid: number;
	stationid: number;
	stationname: string;
	from: string;
	to: string;
	routeno: string;
	distance_on_station: number;
	centerlat: number;
	centerlong: number;
	responsecode: number;
	isnotify: number;
	vehicleDetails: RawRouteDetailVehicleItem[];
}

/**
 * Raw direction data (up or down) from SearchByRouteDetails_v4 API
 */
export interface RawRouteDetailDirectionData {
	data: RawRouteDetailStationItem[];
	mapData: RawRouteDetailVehicleItem[];
}

/**
 * Raw SearchByRouteDetails_v4 API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawRouteDetailsResponse = z.infer<
	typeof rawRouteDetailsResponseSchema
>;

/**
 * Clean, normalized vehicle detail item (for station vehicles)
 * Note: This is used as properties in GeoJSON features, excluding centerLat/centerLong
 */
export interface RouteDetailVehicleProperties {
	vehicleId: string;
	vehicleNumber: string;
	serviceTypeId: string;
	serviceType: string;
	/**
	 * Station ID where this vehicle is at/near
	 */
	stationId?: string;
	eta: string;
	scheduledArrivalTime: string;
	scheduledDepartureTime: string;
	actualArrivalTime: string;
	actualDepartureTime: string;
	scheduledTripStartTime: string;
	scheduledTripEndTime: string;
	lastLocationId: string;
	currentLocationId: string;
	nextLocationId: string;
	currentStop: string | null;
	nextStop: string | null;
	lastStop: string | null;
	stopCoveredStatus: number;
	heading: number;
	lastRefreshOn: string;
	lastReceivedDateTimeFlag: number;
	tripPosition: number;
}

/**
 * Clean, normalized vehicle detail item (deprecated - use RouteDetailVehicleProperties in GeoJSON)
 * @deprecated Use RouteDetailVehicleProperties instead
 */
export interface RouteDetailVehicleItem extends RouteDetailVehicleProperties {
	centerLat: number;
	centerLong: number;
}

/**
 * Properties for a route detail station feature
 * Extends StopProperties with route-specific fields
 */
export interface RouteDetailStationProperties extends StopProperties {
	routeId: string;
	from: string;
	to: string;
	routeNo: string;
	distanceOnStation: number;
	responseCode: number;
	isNotify: number;
}

/**
 * A route detail station represented as a GeoJSON Point Feature
 */
export type RouteDetailStationFeature = Feature<Point, RouteDetailStationProperties>;

/**
 * Clean, normalized direction data (up or down)
 * All spatial data is returned as GeoJSON FeatureCollections
 */
export interface RouteDetailDirectionData {
	/**
	 * Bus stops/stations along the route as GeoJSON FeatureCollection (Point features)
	 */
	stops: FeatureCollection<Point, RouteDetailStationProperties>;
	/**
	 * Vehicles at/near stations as GeoJSON FeatureCollection (Point features)
	 * These are vehicles that are currently at or near specific stops
	 */
	stationVehicles: FeatureCollection<Point, RouteDetailVehicleProperties>;
	/**
	 * Live vehicles currently on the route for map display as GeoJSON FeatureCollection (Point features)
	 */
	liveVehicles: LocationFeatureCollection;
}

/**
 * Clean, normalized route details response
 */
export interface RouteDetailsResponse {
	up: RouteDetailDirectionData;
	down: RouteDetailDirectionData;
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for searching route details
 */
export interface RouteDetailsParams {
	/**
	 * Route ID (can be from searchRoute or other APIs, always string for consistency)
	 */
	routeId: string;
	/**
	 * Service type ID (optional - from GetAllServiceTypes)
	 */
	serviceTypeId?: string;
}
