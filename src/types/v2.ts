import type { Coordinate } from "./coordinates";
import type { RequestOptions } from "./api";

/**
 * Weekday name sent to the current transit app API.
 */
export type V2Weekday =
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday"
	| "sunday";

/**
 * Occupancy icon the app shows for a vehicle status number.
 * `hidden` and `unknown` draw no icon.
 */
export type V2OccupancyLevel =
	| "hidden"
	| "seats-available"
	| "standing-available"
	| "overcrowded"
	| "unknown";

export interface BengaluruTransitClientV2Config {
	/**
	 * Base URL for the current transit app API.
	 * @default 'https://chalo.com/app/api'
	 */
	baseURL?: string;
	/**
	 * City path segment.
	 * @default 'bengaluru'
	 */
	city?: string;
	/**
	 * Request timeout in milliseconds.
	 */
	timeout?: number;
	/**
	 * Extra headers merged onto every request.
	 */
	headers?: Record<string, string>;
}

export interface V2SearchParams extends RequestOptions {
	/**
	 * Stop name, place name, or route number.
	 */
	query: string;
	/**
	 * Search center as [latitude, longitude].
	 */
	coordinates: Coordinate;
	/**
	 * Search day as `DD-MM-YYYY`. Defaults to today in local time.
	 */
	day?: string;
	/**
	 * Limit results to stops or routes. Omit to receive both stops and places.
	 */
	filter?: "stops" | "routes";
}

export interface V2RouteSummary {
	routeId: string;
	routeName: string;
	agencyName: string;
	firstStopName: string;
	lastStopName: string;
	directionStopName: string;
	serviceTypes: string[];
	ticketEnabled: boolean;
}

export interface V2StopSummary {
	stopId: string;
	name: string;
	latitude: number;
	longitude: number;
	stationType: string;
}

export interface V2PlaceSummary {
	placeId: string;
	description: string;
}

export interface V2SearchResponse {
	routes: V2RouteSummary[];
	stops: V2StopSummary[];
	places: V2PlaceSummary[];
}

export interface V2TripPlanParams extends RequestOptions {
	fromCoordinates: Coordinate;
	toCoordinates: Coordinate;
	/**
	 * Departure time as seconds from local midnight.
	 */
	startTimeSeconds: number;
	day: V2Weekday;
	mode?: string;
	stationType?: string;
	includeAc?: boolean;
	includeNonAc?: boolean;
	maxWalkDistanceMeters?: number;
	maxTaxiDistanceMeters?: number;
	itineraryCount?: number;
}

export interface V2TripLeg {
	mode: string;
	routeId?: string;
	routeName?: string;
	agencyName?: string;
	fromStopId?: string;
	toStopId?: string;
	fromStopName?: string;
	toStopName?: string;
	startTimeSeconds?: number;
	endTimeSeconds?: number;
	travelTimeSeconds?: number;
	distanceMeters?: number;
}

export interface V2Itinerary {
	totalFare?: number;
	durationSeconds?: number;
	distanceMeters?: number;
	legs: V2TripLeg[];
}

export interface V2TripPlanResponse {
	itineraries: V2Itinerary[];
	nearbyItineraries: V2Itinerary[];
}

export interface V2RouteDetailsParams extends RequestOptions {
	routeId: string;
	day: V2Weekday;
}

export interface V2Stop {
	stopId: string;
	name: string;
	latitude: number;
	longitude: number;
	shortId?: number;
}

export interface V2Trip {
	tripId: string;
	startTimeSeconds: number;
	endTimeSeconds?: number;
	durationSeconds?: number;
	agencyName?: string;
	serviceType?: string;
	frequencyTrip: boolean;
	extrapolated: boolean;
}

export interface V2TimetableEntry {
	startTimeSeconds: number;
	frequency: boolean;
	extrapolated: boolean;
}

export interface V2RouteDetails {
	routeId: string;
	routeName: string;
	agencyName: string;
	direction?: string;
	live: boolean;
	ticketEnabled: boolean;
	firstStop?: V2Stop;
	lastStop?: V2Stop;
	stops: V2Stop[];
	trips: V2Trip[];
	timetable: V2TimetableEntry[];
}

export interface V2LiveVehiclesParams extends RequestOptions {
	routeId: string;
	/**
	 * Stop ids to include in the arrival map. The live call requires at least one.
	 */
	stopIds: string[];
}

export interface V2VehiclePosition {
	id: string;
	number: string;
	latitude?: number;
	longitude?: number;
	bearing?: number;
	halted: boolean;
	lastStopId?: string;
	updatedAt?: number;
}

export interface V2StopArrival {
	stopId: string;
	vehicleId: string;
	vehicleNumber: string;
	routeId?: string;
	routeName?: string;
	etaSeconds?: number;
	distanceMeters?: number;
	destination?: string;
	halted: boolean;
	updatedAt?: number;
}

export interface V2LiveVehicles {
	vehicles: V2VehiclePosition[];
	arrivals: V2StopArrival[];
}

export interface V2StopRoutePair {
	stopId: string;
	routeId: string;
}

export interface V2StopArrivalsParams extends RequestOptions {
	pairs: V2StopRoutePair[];
}

export interface V2StopArrivals {
	arrivals: Array<V2StopArrival & { stopRouteKey: string }>;
}

export interface V2OccupancyVehicle {
	number: string;
	/**
	 * Timestamp from the live vehicle payload, in epoch milliseconds.
	 */
	updatedAt: number;
	routeId: string;
	stopId: string;
}

export interface V2OccupancyParams extends RequestOptions {
	vehicles: V2OccupancyVehicle[];
}

export interface V2NearbyBusesParams extends RequestOptions {
	/**
	 * Search center as [latitude, longitude].
	 */
	coordinates: Coordinate;
	/**
	 * Weekday. Defaults to today in local time.
	 */
	day?: V2Weekday;
	/**
	 * Time of day as seconds from local midnight. Defaults to the current local time.
	 */
	startTimeSeconds?: number;
}

export interface V2NearbyVehicle {
	id: string;
	number: string;
	etaSeconds?: number;
	distanceMeters?: number;
	halted: boolean;
}

export interface V2NearbyBus {
	routeId: string;
	routeName: string;
	tripId: string;
	agencyName: string;
	destinationName: string;
	/**
	 * Scheduled arrival as seconds from local midnight.
	 */
	arrivalTimeSeconds?: number;
	vehicles: V2NearbyVehicle[];
}

export interface V2NearbyStop {
	stop: V2Stop;
	/**
	 * Distance from the search center, in kilometers, as returned by the API.
	 */
	distanceKilometers?: number;
	agencyName: string;
	buses: V2NearbyBus[];
}

export interface V2NearbyBuses {
	stops: V2NearbyStop[];
}

export interface V2OccupancyItem {
	number: string;
	status: number;
	level: V2OccupancyLevel;
}

export interface V2Occupancy {
	vehicles: V2OccupancyItem[];
}
