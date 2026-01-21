/**
 * Types for route-related API endpoints
 */

import type { z } from "zod";

/**
 * Route direction type - lowercase normalized values
 */
export type RouteDirection = "up" | "down";
import type {
	rawRoutePointsResponseSchema,
	rawRouteSearchResponseSchema,
	rawAllRoutesResponseSchema,
	rawTimetableResponseSchema,
	rawRouteDetailsResponseSchema,
	rawRoutesBetweenStationsResponseSchema,
	rawFareDataResponseSchema,
	rawTripPlannerResponseSchema,
	rawPathDetailsResponseSchema,
	rawTimetableByStationResponseSchema,
} from "../schemas/routes";
import type {
	RouteFeatureCollection,
	LocationFeatureCollection,
	StopProperties,
} from "./geojson";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Coordinate } from "./coordinates";

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
	 * Parent route ID (groups multiple subroutes, used for endpoints like getRoutePoints, always string for consistency)
	 */
	parentRouteId: string;
}

/**
 * Clean, normalized route search response
 */
export interface RouteSearchResponse {
	items: RouteSearchItem[];
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
	 * Subroute ID (specific directional variant, e.g., "89-C UP" or "89-C DOWN", always string for consistency)
	 */
	subrouteId: string;
	/**
	 * Route number (e.g., "89-C UP", "89-C DOWN")
	 */
	routeNo: string;
	/**
	 * Route name (e.g., "KBS-CVN", "CVN-KBS")
	 */
	routeName: string;
	/**
	 * From stop ID (always string for consistency)
	 * Note: "stop" refers to any bus stop. Use "station" only for major bus stations with facilities.
	 */
	fromStopId: string;
	/**
	 * From stop name
	 */
	fromStop: string;
	/**
	 * To stop ID (always string for consistency)
	 * Note: "stop" refers to any bus stop. Use "station" only for major bus stations with facilities.
	 */
	toStopId: string;
	/**
	 * To stop name
	 */
	toStop: string;
}

/**
 * Clean, normalized all routes response
 */
export interface AllRoutesResponse {
	items: RouteListItem[];
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
	 * From stop name
	 */
	fromStopName: string;
	/**
	 * To stop name
	 */
	toStopName: string;
	/**
	 * From stop ID (string as returned by API)
	 */
	fromStopId: string;
	/**
	 * To stop ID (string as returned by API)
	 */
	toStopId: string;
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
 * Parameters for getting timetable with specific stops
 */
export interface TimetableByRouteParamsWithStops
	extends TimetableByRouteBaseParams {
	/**
	 * From stop ID (required with toStopId, string as returned by API)
	 */
	fromStopId: string;
	/**
	 * To stop ID (required with fromStopId, string as returned by API)
	 */
	toStopId: string;
}

/**
 * Parameters for getting timetable without specific stops (uses route start/end)
 */
export interface TimetableByRouteParamsWithoutStops
	extends TimetableByRouteBaseParams {
	/**
	 * From stop ID must not be provided
	 */
	fromStopId?: never;
	/**
	 * To stop ID must not be provided
	 */
	toStopId?: never;
}

/**
 * Parameters for getting timetable by route ID
 * Type-safe: either both fromStopId and toStopId are provided, or neither
 */
export type TimetableByRouteParams =
	| TimetableByRouteParamsWithStops
	| TimetableByRouteParamsWithoutStops;

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
	/**
	 * Subroute ID (specific directional variant from the parent route)
	 * This is the subroute ID for the specific direction (UP or DOWN)
	 */
	subrouteId: string;
	from: string;
	to: string;
	routeNo: string;
	distanceOnStation: number;
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
}

/**
 * Parameters for searching route details
 */
export interface RouteDetailsParams {
	/**
	 * Parent route ID (from searchRoutes().parentRouteId, always string for consistency)
	 * This is the parent route that groups multiple subroutes (UP/DOWN directions)
	 */
	parentRouteId: string;
	/**
	 * Service type ID (optional - from GetAllServiceTypes)
	 */
	serviceTypeId?: string;
}

/**
 * Raw route between stations item from GetFareRoutes API
 */
export interface RawRouteBetweenStationsItem {
	id: number;
	fromstationid: number;
	source_code: string;
	from_displayname: string;
	tostationid: number;
	destination_code: string;
	to_displayname: string;
	fromdistance: number;
	todistance: number;
	routeid: number;
	routeno: string;
	routename: string;
	route_direction: string;
	fromstationname: string;
	tostationname: string;
}

/**
 * Raw routes between stations API response from BMTC API
 * Uses Zod inferred type to match schema exactly
 */
export type RawRoutesBetweenStationsResponse = z.infer<
	typeof rawRoutesBetweenStationsResponseSchema
>;

/**
 * Clean, normalized route between stops item
 */
export interface RouteBetweenStopsItem {
	id: string;
	fromStopId: string;
	sourceCode: string;
	fromDisplayName: string;
	toStopId: string;
	destinationCode: string;
	toDisplayName: string;
	fromDistance: number;
	toDistance: number;
	/**
	 * Subroute ID (specific to direction/variant as indicated by routeDirection)
	 * Can be used with searchByRouteDetails() endpoint
	 * Note: This differs from parentRouteId returned by searchRoutes()
	 */
	subrouteId: string;
	routeNo: string;
	routeName: string;
	/**
	 * Route direction ("up" or "down" - lowercase normalized)
	 * Indicates this is a directional subroute
	 */
	routeDirection: RouteDirection;
	fromStopName: string;
	toStopName: string;
}

/**
 * Clean, normalized routes between stops response
 */
export interface RoutesBetweenStopsResponse {
	items: RouteBetweenStopsItem[];
}

/**
 * Parameters for getting routes between stops
 */
export interface RoutesBetweenStopsParams {
	/**
	 * From stop ID (always string for consistency)
	 */
	fromStopId: string;
	/**
	 * To stop ID (always string for consistency)
	 */
	toStopId: string;
}

/**
 * Raw fare data item from GetMobileFareData_v2 API
 */
export interface RawFareDataItem {
	servicetype: string;
	fare: string;
}

/**
 * Raw fare data response from GetMobileFareData_v2 API
 * Uses Zod inferred type to match schema exactly
 */
export type RawFareDataResponse = z.infer<typeof rawFareDataResponseSchema>;

/**
 * Clean, normalized fare data item
 */
export interface FareDataItem {
	/**
	 * Service type name (e.g., "Vajra", "Volvo Electric")
	 */
	serviceType: string;
	/**
	 * Fare amount as string (always string for consistency, even if numeric)
	 */
	fare: string;
}

/**
 * Clean, normalized fare data response
 */
export interface FareDataResponse {
	items: FareDataItem[];
}

/**
 * Parameters for getting fare data
 * These parameters match the response from getRoutesBetweenStations()
 */
export interface FareDataParams {
	/**
	 * Route number (from RouteBetweenStationsItem.routeNo)
	 */
	routeNo: string;
	/**
	 * Subroute ID (from RouteBetweenStationsItem.subrouteId)
	 * This is the subroute ID for the specific direction
	 */
	subrouteId: string;
	/**
	 * Route direction ("up" or "down" - lowercase normalized) from RouteBetweenStationsItem.routeDirection
	 */
	routeDirection: RouteDirection;
	/**
	 * Source code (from RouteBetweenStationsItem.sourceCode)
	 */
	sourceCode: string;
	/**
	 * Destination code (from RouteBetweenStationsItem.destinationCode)
	 */
	destinationCode: string;
}

/**
 * Filter option for trip planner
 * Human-readable values that map to API numeric codes
 */
export type TripPlannerFilter = "minimum-transfers" | "shortest-time";

/**
 * Map human-readable filter option to API numeric value
 */
export function tripPlannerFilterToNumber(filter: TripPlannerFilter): 1 | 2 {
	const map: Record<TripPlannerFilter, 1 | 2> = {
		"minimum-transfers": 1,
		"shortest-time": 2,
	};
	return map[filter];
}

/**
 * Base parameters for trip planner (common fields)
 */
type TripPlannerParamsBase = {
	/**
	 * Service type ID (from getAllServiceTypes)
	 * Optional - if not provided, searches all service types
	 */
	serviceTypeId?: string;
	/**
	 * Start date/time for the trip (must be in the future)
	 * The wrapper converts this to "YYYY-MM-DD HH:mm" format
	 * Optional - if not provided, uses current time
	 */
	fromDateTime?: Date;
	/**
	 * Filter option for route selection
	 * - "minimum-transfers": Prioritize fewer transfers
	 * - "shortest-time": Prioritize faster routes
	 * Optional - if not provided, API uses default sorting
	 */
	filterBy?: TripPlannerFilter;
};

/**
 * Stop to Stop trip parameters
 */
type TripPlannerStopToStop = TripPlannerParamsBase & {
	/**
	 * From stop ID (always string for consistency)
	 */
	fromStopId: string;
	/**
	 * To stop ID (always string for consistency)
	 */
	toStopId: string;
	/**
	 * From coordinates are not used for stop-to-stop trips
	 */
	fromCoordinates?: never;
	/**
	 * To coordinates are not used for stop-to-stop trips
	 */
	toCoordinates?: never;
};

/**
 * Stop to Location trip parameters
 */
type TripPlannerStopToLocation = TripPlannerParamsBase & {
	/**
	 * From stop ID (always string for consistency)
	 */
	fromStopId: string;
	/**
	 * To coordinates [latitude, longitude]
	 */
	toCoordinates: Coordinate;
	/**
	 * To stop ID is not used for stop-to-location trips
	 */
	toStopId?: never;
	/**
	 * From coordinates are not used for stop-to-location trips
	 */
	fromCoordinates?: never;
};

/**
 * Location to Stop trip parameters
 */
type TripPlannerLocationToStop = TripPlannerParamsBase & {
	/**
	 * From coordinates [latitude, longitude]
	 */
	fromCoordinates: Coordinate;
	/**
	 * To stop ID (always string for consistency)
	 */
	toStopId: string;
	/**
	 * From stop ID is not used for location-to-stop trips
	 */
	fromStopId?: never;
	/**
	 * To coordinates are not used for location-to-stop trips
	 */
	toCoordinates?: never;
};

/**
 * Location to Location trip parameters
 */
type TripPlannerLocationToLocation = TripPlannerParamsBase & {
	/**
	 * From coordinates [latitude, longitude]
	 */
	fromCoordinates: Coordinate;
	/**
	 * To coordinates [latitude, longitude]
	 */
	toCoordinates: Coordinate;
	/**
	 * Stop IDs are not used for location-to-location trips
	 */
	fromStopId?: never;
	toStopId?: never;
};

/**
 * Parameters for trip planner
 * Supports 4 combinations: Stop-Stop, Stop-Location, Location-Stop, Location-Location
 */
export type TripPlannerParams =
	| TripPlannerStopToStop
	| TripPlannerStopToLocation
	| TripPlannerLocationToStop
	| TripPlannerLocationToLocation;

/**
 * Raw trip planner path leg item from TripPlannerMSMD API
 */
export interface RawTripPlannerPathLeg {
	pathSrno: number;
	transferSrNo: number;
	tripId: number;
	routeid: number;
	routeno: string;
	schNo: string | null;
	vehicleId: number;
	busNo: string | null;
	distance: number;
	duration: string;
	fromStationId: number;
	fromStationName: string;
	toStationId: number;
	toStationName: string;
	etaFromStation: string | null;
	etaToStation: string | null;
	serviceTypeId: number;
	fromLatitude: number;
	fromLongitude: number;
	toLatitude: number;
	toLongitude: number;
	routeParentId: number;
	totalDuration: string;
	waitingDuration: string | null;
	platformnumber: string;
	baynumber: number;
	devicestatusnameflag: string;
	devicestatusflag: number;
	srno: number;
	approx_fare: number;
	fromstagenumber: number;
	tostagenumber: number;
	minsrno: number;
	maxsrno: number;
	tollfees: number;
	totalStages: number | null;
}

/**
 * Raw trip planner response from TripPlannerMSMD API
 * Uses Zod inferred type to match schema exactly
 */
export type RawTripPlannerResponse = z.infer<typeof rawTripPlannerResponseSchema>;

/**
 * Clean, normalized trip planner path leg
 */
export interface TripPlannerPathLeg {
	/**
	 * Path sequence number
	 */
	pathSrNo: number;
	/**
	 * Transfer sequence number (0 for direct routes, increments for transfers)
	 */
	transferSrNo: number;
	/**
	 * Trip ID (0 for walking segments)
	 */
	tripId: string;
	/**
	 * Subroute ID (specific directional variant, 0 for walking segments)
	 * This is the subroute ID for the specific direction/variant
	 */
	subrouteId: string;
	/**
	 * Route number (e.g., "285-M", "walk_source")
	 */
	routeNo: string;
	/**
	 * Schedule number (null for walking segments)
	 */
	scheduleNo: string | null;
	/**
	 * Vehicle ID (0 for walking segments)
	 */
	vehicleId: string;
	/**
	 * Bus registration number (null for walking segments)
	 */
	busNo: string | null;
	/**
	 * Distance in kilometers
	 */
	distance: number;
	/**
	 * Duration (format: "HH:mm:ss")
	 */
	duration: string;
	/**
	 * Duration in seconds (computed from duration string for easier comparisons)
	 */
	durationSeconds: number;
	/**
	 * From stop ID (0 for "Your Location")
	 */
	fromStopId: string;
	/**
	 * From stop name
	 */
	fromStopName: string;
	/**
	 * To stop ID (0 for "Your Location")
	 */
	toStopId: string;
	/**
	 * To stop name
	 */
	toStopName: string;
	/**
	 * ETA at from stop (null for walking segments)
	 */
	etaFromStop: string | null;
	/**
	 * ETA at to stop (null for walking segments)
	 */
	etaToStop: string | null;
	/**
	 * Service type ID (0 for walking segments)
	 */
	serviceTypeId: string;
	/**
	 * From latitude
	 */
	fromLatitude: number;
	/**
	 * From longitude
	 */
	fromLongitude: number;
	/**
	 * To latitude
	 */
	toLatitude: number;
	/**
	 * To longitude
	 */
	toLongitude: number;
	/**
	 * Route parent ID (0 for walking segments)
	 */
	routeParentId: string;
	/**
	 * Total duration for this leg (format: "HH:mm:ss")
	 */
	totalDuration: string;
	/**
	 * Total duration for this leg in seconds (computed from totalDuration string)
	 */
	totalDurationSeconds: number;
	/**
	 * Waiting duration before next leg (null if not applicable)
	 */
	waitingDuration: string | null;
	/**
	 * Platform number
	 */
	platformNumber: string;
	/**
	 * Bay number
	 */
	bayNumber: number;
	/**
	 * Device status name (e.g., "Running", "Tracking device is not installed")
	 */
	deviceStatusName: string;
	/**
	 * Device status flag
	 * - 1: Tracking device is installed
	 * - 3: Tracking device is not installed
	 * - 4: Running
	 */
	deviceStatusFlag: number;
	/**
	 * Sequence number
	 */
	srNo: number;
	/**
	 * Approximate fare (0 for walking segments)
	 */
	approxFare: number;
	/**
	 * From stage number
	 */
	fromStageNumber: number;
	/**
	 * To stage number
	 */
	toStageNumber: number;
	/**
	 * Minimum sequence number
	 */
	minSrNo: number;
	/**
	 * Maximum sequence number
	 */
	maxSrNo: number;
	/**
	 * Toll fees
	 */
	tollFees: number;
	/**
	 * Total stages (null if not applicable)
	 */
	totalStages: number | null;
}

/**
 * Trip planner route with computed totals
 * Represents a complete route path (array of legs) with aggregated statistics
 */
export interface TripPlannerRoute {
	/**
	 * Route legs (ordered sequence of path segments)
	 */
	legs: TripPlannerPathLeg[];
	/**
	 * Total duration across all legs (format: "HH:mm:ss")
	 * Sum of all leg durations plus waiting times
	 */
	totalDuration: string;
	/**
	 * Total duration in seconds (computed from totalDuration for easier comparisons)
	 */
	totalDurationSeconds: number;
	/**
	 * Total fare in rupees (sum of all leg fares)
	 * Walking segments have 0 fare
	 */
	totalFare: number;
	/**
	 * Total distance in kilometers (sum of all leg distances)
	 */
	totalDistance: number;
	/**
	 * Number of transfers (number of bus segments minus 1, or 0 for direct routes)
	 */
	transferCount: number;
	/**
	 * Whether this route includes walking segments
	 */
	hasWalking: boolean;
}

/**
 * Clean, normalized trip planner response
 */
export interface TripPlannerResponse {
	/**
	 * All available routes (merged from directRoutes and transferRoutes)
	 * Each route includes computed totals for easy comparison
	 * Filter by `transferCount === 0` to identify direct routes (no transfers)
	 */
	routes: TripPlannerRoute[];
}

/**
 * Path detail request item - represents a trip leg segment
 * Used to get detailed stop-by-stop information for a specific trip segment
 * Typically derived from TripPlannerPathLeg (tripId, fromStopId, toStopId)
 * All IDs are strings (converted to numbers internally for API call)
 */
export interface PathDetailRequestItem {
	/** Trip ID for the bus journey (always string) */
	tripId: string;
	/** Starting stop ID (always string) */
	fromStopId: string;
	/** Ending stop ID (always string) */
	toStopId: string;
}

/**
 * Path detail request parameters
 */
export interface PathDetailsParams {
	/** Array of trip leg segments to get stops for */
	trips: PathDetailRequestItem[];
}

/**
 * Single path detail item from GetPathDetails API
 * Represents a single station in a trip's path
 */
export interface PathDetailItem {
	/** Trip ID for the bus journey */
	tripId: string;
	/** Subroute ID (specific directional variant) */
	subrouteId: string;
	/** Route number (e.g., "285-M", "25-A") */
	routeNo: string;
	/** Stop ID */
	stopId: string;
	/** Stop name */
	stopName: string;
	/** Station latitude */
	latitude: number;
	/** Station longitude */
	longitude: number;
	/** Estimated time of arrival (may be empty string) */
	eta: string | null;
	/** Scheduled arrival time (format: "MM/DD/YYYY HH:mm:ss") */
	scheduledArrivalTime: string | null;
	/** Scheduled departure time (format: "MM/DD/YYYY HH:mm:ss") */
	scheduledDepartureTime: string | null;
	/** Actual arrival time (may be empty string) */
	actualArrivalTime: string | null;
	/** Actual departure time (may be empty string) */
	actualDepartureTime: string | null;
	/** Distance from previous station (in km) */
	distance: number;
	/** Duration (may be null) */
	duration: string | null;
	/** Whether this is a transfer point */
	isTransfer: boolean;
}

/**
 * Raw path details response from GetPathDetails API
 */
export type RawPathDetailsResponse = z.infer<typeof rawPathDetailsResponseSchema>;

/**
 * Path details response from GetPathDetails API
 * Returns GeoJSON FeatureCollection of Point features (bus stops)
 */
export type PathDetailsResponse = FeatureCollection;

/**
 * Waypoints request parameters for getWaypoints_v1 API
 * The first point is the origin, the last point is the destination.
 */
export interface WaypointsParams {
	/** Bus stops along the route path.
	 * Can be either:
	 * - Array of Coordinate [latitude, longitude] tuples
	 * - GeoJSON FeatureCollection with Point features (coordinates will be extracted, properties ignored)
	 * Must have at least 2 points (origin and destination).
	 */
	viaPoints: Array<Coordinate> | FeatureCollection;
}

/**
 * Raw waypoints response from getWaypoints_v1 API
 */
export type RawWaypointsResponse = string[];

/**
 * Trip path response from getWaypoints_v1 API
 * Returns GeoJSON FeatureCollection with LineString features (route path segments)
 */
export type TripPathResponse = FeatureCollection;

/**
 * Raw timetable by station item from GetTimetableByStation_v4 API
 */
export interface RawTimetableByStationItem {
	routeid: number;
	id: number;
	fromstationid: number;
	tostationid: number;
	f: number;
	t: number;
	routeno: string;
	routename: string;
	fromstationname: string;
	tostationname: string;
	traveltime: string;
	distance: number;
	apptime: string;
	apptimesecs: string;
	starttime: string;
	platformname: string | null;
	platformnumber: string | null;
	baynumber: string | null;
}

/**
 * Raw timetable by station API response from BMTC API (for validation)
 */
export type RawTimetableByStationResponse = z.infer<
	typeof rawTimetableByStationResponseSchema
>;

/**
 * Route that passes through both stations (in sequence) with schedule information
 * Note: This is NOT a full timetable - it contains one startTime per route, not multiple scheduled trips.
 * The route may start before fromStation and/or continue after toStation.
 */
export interface TimetableByStationItem {
	/** Route ID */
	routeId: string;
	/** Internal ID */
	id: number;
	/** From stop ID */
	fromStopId: string;
	/** To stop ID */
	toStopId: string;
	/** Distance from route start (first stop) to fromStop (km) - cumulative distance along route */
	fromStopOffset: number;
	/** Total distance from route start (first stop) to toStop (km) - cumulative distance along route */
	toStopOffset: number;
	/** Route number */
	routeNo: string;
	/** Route name */
	routeName: string;
	/** From stop name */
	fromStopName: string;
	/** To stop name */
	toStopName: string;
	/** Travel time in format "HH:mm:ss" - actual/scheduled travel time between stops */
	travelTime: string;
	/** Distance from fromStop to toStop (km) - distance along the route path between stops (calculated as toStopOffset - fromStopOffset) */
	distance: number;
	/** Approximate time in format "HH:mm:ss" - approximate travel time (always <= travelTime) */
	approximateTime: string;
	/** Approximate time in seconds - approximate travel time in seconds (always <= travelTime) */
	approximateTimeSeconds: number;
	/** Start time in format "HH:mm:ss" */
	startTime: string;
	/** Platform name (may be null) */
	platformName: string | null;
	/** Platform number (may be null) */
	platformNumber: string | null;
	/** Bay number (may be null) */
	bayNumber: string | null;
}

/**
 * Routes that pass through both stops (in sequence) with schedule information
 * Note: This is NOT a full timetable - each route has one startTime, not multiple scheduled trips.
 * Routes may start before fromStop and/or continue after toStop.
 */
export interface TimetableByStationResponse {
	items: TimetableByStationItem[];
}

/**
 * Parameters for getting route options between stops
 */
export interface TimetableByStationParams {
	/** From stop ID (always string for consistency) */
	fromStopId: string;
	/** To stop ID (always string for consistency) */
	toStopId: string;
	/** Optional: Filter by specific route ID */
	routeId?: string;
	/** Optional: Date for timetable (defaults to current date) */
	date?: Date;
}
