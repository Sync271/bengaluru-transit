import type { Coordinate } from "./coordinates.js";
import type { RequestOptions } from "./api.js";

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

/**
 * Place autocomplete (`GET scheduler_v4/v5/search/place`).
 * Returns geocoded places (with coordinates), unlike city `search` place hits.
 */
export interface V2SearchPlacesParams extends RequestOptions {
	/**
	 * Free-text place query.
	 */
	query: string;
	/**
	 * Optional bias point as [latitude, longitude].
	 */
	coordinates?: Coordinate;
	/**
	 * Search surface sent as `searchSource`. Defaults to `HOME_SEARCH`.
	 */
	searchSource?: string;
	/**
	 * Country header (`countryId`). Defaults to `IN`.
	 */
	countryId?: string;
}

export interface V2PlaceHit {
	placeId: string;
	description: string;
	latitude: number;
	longitude: number;
	/**
	 * Provider that issued `placeId` (needed for place details).
	 */
	searchPartner: string;
}

export interface V2SearchPlacesResponse {
	places: V2PlaceHit[];
}

/**
 * Resolve a place id (`GET scheduler_v4/v5/place/details`).
 */
export interface V2PlaceDetailsParams extends RequestOptions {
	/**
	 * Place id from {@link V2PlaceHit.placeId} / `searchPlaces`.
	 */
	placeId: string;
	/**
	 * Provider that issued the place id (e.g. `heremaps`).
	 */
	searchPartner: string;
}

export interface V2PlaceDetails {
	address: string;
	latitude: number;
	longitude: number;
}

/**
 * Resolve coordinates to Chalo city ids (`GET scheduler_v4/geocode/reverse`).
 * This is city coverage lookup, not street-level reverse geocoding.
 */
export interface V2ReverseGeocodeParams extends RequestOptions {
	/**
	 * Point as [latitude, longitude].
	 */
	coordinates: Coordinate;
}

export interface V2ReverseGeocodeCity {
	cityId: string;
	displayName: string;
}

export interface V2ReverseGeocodeResponse {
	cities: V2ReverseGeocodeCity[];
}

/**
 * Route-name autocomplete (`scheduler_v4/v4/{city}/autocomplete/route`).
 * Unlike {@link V2SearchParams}, this does not need coordinates.
 */
export interface V2SearchRoutesParams extends RequestOptions {
	/**
	 * Route number or name fragment (sent as `str`).
	 */
	query: string;
	/**
	 * Weekday used for the active catalogue. Defaults to today in local time.
	 */
	day?: V2Weekday;
}

export interface V2RouteMatch {
	routeId: string;
	routeName: string;
	agencyName: string;
	firstStopName: string;
	lastStopName: string;
	directionStopName: string;
	serviceTypes: string[];
	ticketEnabled: boolean;
	passEnabled: boolean;
	freeRide: boolean;
	transportType: string;
	stationType: string;
	direction?: string;
	totalStops?: number;
	totalStages?: number;
}

export interface V2SearchRoutesResponse {
	routes: V2RouteMatch[];
}

/**
 * Direct routes between two stops (`scheduler_v4/v5/{city}/routesbetweenstops`).
 */
export interface V2RoutesBetweenStopsParams extends RequestOptions {
	fromStopId: string;
	toStopId: string;
	/**
	 * When true, the API is asked for mobile-ticketable routes.
	 * Defaults to true to match the app.
	 */
	ticketEnabled?: boolean;
}

export interface V2RouteBetweenStops {
	routeId: string;
	routeName: string;
	serviceTypes: string[];
	serviceCategory: string;
	specialFeatures: string[];
	fromStop: V2Stop;
	toStop: V2Stop;
	firstStop: V2Stop;
	lastStop: V2Stop;
}

export interface V2RoutesBetweenStopsResponse {
	routes: V2RouteBetweenStops[];
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
	/**
	 * Encoded route polyline as returned by the API (empty when absent).
	 */
	polyline: string;
}

/**
 * Bulk route details (`POST scheduler_v4/v5/{city}/routedetails`).
 * Sends cached versions so the server can return only updated routes.
 */
export interface V2RouteDetailsBulkParams extends RequestOptions {
	/**
	 * Route ids to fetch. Each is sent with version `0` unless overridden in `versions`.
	 */
	routeIds: string[];
	/**
	 * Optional cached version per route id.
	 */
	versions?: Record<string, number>;
	/**
	 * Whether this is a background sync. Defaults to false.
	 */
	backgroundSync?: boolean;
}

export interface V2BulkRouteDetails {
	routeId: string;
	routeName: string;
	agencyName: string;
	direction?: string;
	status: string;
	version: number;
	ticketEnabled: boolean;
	passEnabled: boolean;
	freeRide: boolean;
	airportRoute: boolean;
	premiumBusRoute: boolean;
	specialFeatures: string[];
	stationType: string;
	stops: V2Stop[];
	timetable: V2TimetableEntry[];
	/**
	 * Encoded route polyline as returned by the API.
	 */
	polyline: string;
}

export interface V2RouteDetailsBulkResponse {
	/**
	 * Catalogue version from the bulk response.
	 */
	catalogueVersion: number;
	routes: V2BulkRouteDetails[];
}

/**
 * Stops near a coordinate (`GET scheduler_v4/v4/{city}/nearby/stops`).
 */
export interface V2NearbyStopsParams extends RequestOptions {
	/**
	 * Search center as [latitude, longitude].
	 */
	coordinates: Coordinate;
	/**
	 * Transit mode filter. Defaults to `"bus"`.
	 */
	transitMode?:
		| "bus"
		| "railway"
		| "metro"
		| "monorail"
		| "ferry"
		| "cab"
		| "transit";
}

export interface V2NearbyStopHit {
	stop: V2Stop;
	stationType: string;
	/**
	 * Distance from the search center, in metres.
	 */
	distanceMeters: number;
}

export interface V2NearbyStopsResponse {
	stops: V2NearbyStopHit[];
}

/**
 * Full city stop catalogue (`GET scheduler_v4/v4/{city}/stops/id`).
 * The trailing `id` path segment is literal.
 */
export interface V2ListStopsParams extends RequestOptions {
	/**
	 * Transit mode filter. Defaults to `"bus"`.
	 */
	transitMode?:
		| "bus"
		| "railway"
		| "metro"
		| "monorail"
		| "ferry"
		| "cab"
		| "transit";
}

export interface V2CityStop {
	stopId: string;
	name: string;
	latitude: number;
	longitude: number;
	shortId?: number;
	stationType: string;
	transportType: string;
	city?: string;
	stateCode?: string;
	/**
	 * Localized stop names keyed by locale code (e.g. `kn`).
	 */
	localizedNames?: Record<string, string>;
}

export interface V2ListStopsResponse {
	stops: V2CityStop[];
}

/**
 * Stop details for a route (`POST scheduler_v4/v4/{city}/stopDetails`).
 * Distinct from {@link V2StopDetailsParams}, which is the stop timetable API.
 */
export interface V2RouteStopDetailsParams extends RequestOptions {
	routeId: string;
	stopIds: string[];
}

export interface V2RouteStopDetails {
	stopId: string;
	name: string;
	latitude: number;
	longitude: number;
	description?: string;
	imageUrls: string[];
}

export interface V2RouteStopDetailsResponse {
	stops: V2RouteStopDetails[];
}

export interface V2StopDetailsParams extends RequestOptions {
	stopId: string;
	/**
	 * Weekday. Defaults to today in local time.
	 */
	day?: V2Weekday;
	/**
	 * Time of day as seconds from local midnight. Defaults to the current local time.
	 */
	startTimeSeconds?: number;
}

export interface V2StopTimetableEntry {
	tripId: string;
	routeId: string;
	routeName: string;
	agencyName: string;
	destinationName: string;
	firstStopName?: string;
	/**
	 * Scheduled arrival at this stop as seconds from local midnight.
	 */
	arrivalTimeSeconds: number;
	frequencyTrip: boolean;
	extrapolated: boolean;
	serviceTypes: string[];
}

export interface V2StopDetails {
	timetable: V2StopTimetableEntry[];
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

/**
 * Live GPS for one registration number
 * (`GET vasudha/location/{city}/{agency}/bus/{busNo}`).
 */
export interface V2BusLocationParams extends RequestOptions {
	/**
	 * Fleet / registration number (e.g. `KA57F1838`).
	 */
	busNumber: string;
	/**
	 * Agency path segment. Defaults to `bmtc`.
	 */
	agency?: string;
}

export interface V2BusLocation {
	busNumber: string;
	agencyName: string;
	latitude: number;
	longitude: number;
	bearing?: number;
	/**
	 * Speed from the feed, when present.
	 */
	speed?: number;
	nextStopId?: string;
	halted: boolean;
	updatedAt?: number;
	mode?: string;
	cityId?: string;
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

/**
 * Nearby stop summary (`GET scheduler_v4/v4/{city}/summary` + live ETAs).
 * Distinct from {@link V2NearbyStopsParams}, which only lists stops.
 */
export interface V2NearbySummaryParams extends RequestOptions {
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
	/**
	 * Search radius in metres. When omitted, the API applies its own default.
	 * Captured Chalo requests commonly use `2000`.
	 */
	radiusMeters?: number;
	/**
	 * Max stop “cards” to return. When omitted, the API applies its own default.
	 * Captured Chalo requests commonly use `5`.
	 */
	cardCount?: number;
}

export interface V2NearbyVehicle {
	id: string;
	number: string;
	etaSeconds?: number;
	distanceMeters?: number;
	halted: boolean;
}

export interface V2NearbySummaryService {
	routeId: string;
	routeName: string;
	tripId: string;
	agencyName: string;
	destinationName: string;
	/**
	 * Scheduled arrival at the stop as seconds from local midnight.
	 */
	arrivalTimeSeconds?: number;
	vehicles: V2NearbyVehicle[];
}

export interface V2NearbySummaryStop {
	stop: V2Stop;
	/**
	 * Distance from the search center, in kilometers, as returned by the API.
	 */
	distanceKilometers?: number;
	agencyName: string;
	services: V2NearbySummaryService[];
}

export interface V2NearbySummary {
	stops: V2NearbySummaryStop[];
}

export interface V2OccupancyItem {
	number: string;
	status: number;
	level: V2OccupancyLevel;
}

export interface V2Occupancy {
	vehicles: V2OccupancyItem[];
}
