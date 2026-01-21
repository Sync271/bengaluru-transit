import { validate, parseId, stringifyId } from "../utils/validation";
import { TransitError } from "../utils/errors";
import { formatDateTime, formatDate, formatISODate } from "../utils/date";
import { DEFAULT_DEVICE_TYPE } from "../constants/api";
import {
	rawRoutePointsResponseSchema,
	routePointsParamsSchema,
	rawRouteSearchResponseSchema,
	routeSearchParamsSchema,
	rawAllRoutesResponseSchema,
	rawTimetableResponseSchema,
	timetableRequestSchema,
	rawRouteDetailsResponseSchema,
	routeDetailsParamsSchema,
	rawRoutesBetweenStationsResponseSchema,
	routesBetweenStopsParamsSchema,
	rawFareDataResponseSchema,
	fareDataParamsSchema,
	rawTripPlannerResponseSchema,
	tripPlannerParamsSchema,
	rawPathDetailsResponseSchema,
	pathDetailsParamsSchema,
	pathDetailsApiParamsSchema,
	waypointsParamsSchema,
	rawWaypointsResponseSchema,
	rawTimetableByStationResponseSchema,
	timetableByStationRequestSchema,
} from "../schemas/routes";
import { WALK_ROUTE_PREFIX, WALK_PREFIX, EMPTY_SUBROUTE_ID } from "../constants/routes";
import {
	createRouteFeature,
	createFeatureCollection,
	createLocationFeature,
} from "../utils/geojson";
import { decode as hereDecode } from "@here/flexpolyline";
import type { BaseClient } from "../client/base-client";
import type {
	RoutePointsResponse,
	RawRoutePointsResponse,
	RoutePointsParams,
	RouteSearchResponse,
	RawRouteSearchResponse,
	RouteSearchParams,
	RouteSearchItem,
	AllRoutesResponse,
	RawAllRoutesResponse,
	RouteListItem,
	TimetableResponse,
	RawTimetableResponse,
	TimetableByRouteParams,
	TimetableItem,
	RouteDetailsResponse,
	RawRouteDetailsResponse,
	RouteDetailsParams,
	RouteDetailVehicleItem,
	RouteDetailDirectionData,
	RawRouteDetailVehicleItem,
	RawRouteDetailDirectionData,
	RoutesBetweenStopsResponse,
	RawRoutesBetweenStationsResponse,
	RoutesBetweenStopsParams,
	RouteBetweenStopsItem,
	RawRouteBetweenStationsItem,
	FareDataResponse,
	RawFareDataResponse,
	FareDataParams,
	FareDataItem,
	TripPlannerResponse,
	RawTripPlannerResponse,
	TripPlannerParams,
	TripPlannerPathLeg,
	RawTripPlannerPathLeg,
	TripPlannerRoute,
	PathDetailsParams,
	PathDetailsResponse,
	RawPathDetailsResponse,
	PathDetailItem,
	WaypointsParams,
	TripPathResponse,
	RawWaypointsResponse,
	TimetableByStationParams,
	TimetableByStationResponse,
	RawTimetableByStationResponse,
	TimetableByStationItem,
} from "../types/routes";
import { tripPlannerFilterToNumber } from "../types/routes";
import type {
	RouteFeature,
	LocationFeature,
} from "../types/geojson";
import type { RouteDetailStationProperties } from "../types/routes";
import type { Position } from "geojson";

/**
 * Transform raw route points API response to clean, normalized format
 */
function transformRoutePointsResponse(
	raw: RawRoutePointsResponse,
	routeId: string
): RoutePointsResponse {
	// Convert string coordinates to numbers and create LineString coordinates
	// GeoJSON format: [lng, lat]
	const coordinates = raw.data.map(
		(item) =>
			[parseFloat(item.longitude), parseFloat(item.latitude)] as [
				number,
				number
			]
	);

	// If no coordinates, return empty FeatureCollection
	if (coordinates.length === 0) {
		return {
			routePath: createFeatureCollection([]),
		};
	}

	// Create a single LineString feature for the route path
	const routeFeature: RouteFeature = createRouteFeature(coordinates, {
		routeId: routeId,
	});

	return {
		routePath: createFeatureCollection([routeFeature]),
	};
}

/**
 * Transform raw route search API response to clean, normalized format
 */
function transformRouteSearchResponse(
	raw: RawRouteSearchResponse
): RouteSearchResponse {
	const items: RouteSearchItem[] = raw.data.map((item) => ({
		unionRowNo: item.union_rowno,
		row: item.row,
		routeNo: item.routeno,
		parentRouteId: stringifyId(item.routeparentid),
	}));

	return {
		items,
	};
}

/**
 * Transform raw all routes API response to clean, normalized format
 */
function transformAllRoutesResponse(
	raw: RawAllRoutesResponse
): AllRoutesResponse {
	const items: RouteListItem[] = raw.data.map((item) => ({
		subrouteId: stringifyId(item.routeid),
		routeNo: item.routeno,
		routeName: item.routename,
		fromStopId: stringifyId(item.fromstationid),
		fromStop: item.fromstation,
		toStopId: stringifyId(item.tostationid),
		toStop: item.tostation,
	}));

	return {
		items,
	};
}

/**
 * Transform raw timetable API response to clean, normalized format
 */
function transformTimetableResponse(
	raw: RawTimetableResponse
): TimetableResponse {
	const items: TimetableItem[] = raw.data.map((item) => ({
		fromStopName: item.fromstationname,
		toStopName: item.tostationname,
		fromStopId: item.fromstationid,
		toStopId: item.tostationid,
		approximateTime: item.apptime,
		distance: parseFloat(item.distance),
		platformName: item.platformname,
		platformNumber: item.platformnumber,
		bayNumber: item.baynumber,
		tripDetails: item.tripdetails.map((trip) => ({
			startTime: trip.starttime,
			endTime: trip.endtime,
		})),
	}));

	return {
		items,
	};
}

/**
 * Transform raw timetable by station API response to clean, normalized format
 */
function transformTimetableByStationResponse(
	raw: RawTimetableByStationResponse
): TimetableByStationResponse {
	const items: TimetableByStationItem[] = raw.data.map((item) => ({
		routeId: stringifyId(item.routeid),
		id: item.id,
		fromStopId: stringifyId(item.fromstationid),
		toStopId: stringifyId(item.tostationid),
		fromStopOffset: item.f,
		toStopOffset: item.t,
		routeNo: item.routeno,
		routeName: item.routename,
		fromStopName: item.fromstationname,
		toStopName: item.tostationname,
		travelTime: item.traveltime,
		distance: item.distance,
		approximateTime: item.apptime,
		approximateTimeSeconds: parseId(item.apptimesecs),
		startTime: item.starttime,
		platformName: item.platformname,
		platformNumber: item.platformnumber,
		bayNumber: item.baynumber,
	}));

	return {
		items,
	};
}

/**
 * Transform raw vehicle detail item to clean, normalized format
 */
function transformVehicleDetailItem(
	raw: RawRouteDetailVehicleItem
): RouteDetailVehicleItem {
	return {
		vehicleId: stringifyId(raw.vehicleid),
		vehicleNumber: raw.vehiclenumber,
		serviceTypeId: stringifyId(raw.servicetypeid),
		serviceType: raw.servicetype,
		centerLat: raw.centerlat,
		centerLong: raw.centerlong,
		eta: raw.eta,
		scheduledArrivalTime: raw.sch_arrivaltime,
		scheduledDepartureTime: raw.sch_departuretime,
		actualArrivalTime: raw.actual_arrivaltime,
		actualDepartureTime: raw.actual_departuretime,
		scheduledTripStartTime: raw.sch_tripstarttime,
		scheduledTripEndTime: raw.sch_tripendtime,
		lastLocationId: stringifyId(raw.lastlocationid),
		currentLocationId: stringifyId(raw.currentlocationid),
		nextLocationId: stringifyId(raw.nextlocationid),
		currentStop: raw.currentstop,
		nextStop: raw.nextstop,
		lastStop: raw.laststop,
		stopCoveredStatus: raw.stopCoveredStatus,
		heading: raw.heading,
		lastRefreshOn: raw.lastrefreshon,
		lastReceivedDateTimeFlag: raw.lastreceiveddatetimeflag,
		tripPosition: raw.tripposition,
	};
}

/**
 * Transform raw direction data to clean, normalized format
 */
function transformDirectionData(
	raw: RawRouteDetailDirectionData
): RouteDetailDirectionData {
	// Convert stations to GeoJSON Point features (without vehicleDetails in properties)
	const stationFeatures = raw.data.map((station) => {
		const properties: RouteDetailStationProperties = {
			stopId: stringifyId(station.stationid),
			stopName: station.stationname,
			subrouteId: stringifyId(station.routeid), // This is the subroute ID for the specific direction
			from: station.from,
			to: station.to,
			routeNo: station.routeno,
			distanceOnStation: station.distance_on_station,
			isNotify: station.isnotify,
		};
		return {
			type: "Feature" as const,
			geometry: {
				type: "Point" as const,
				coordinates: [station.centerlong, station.centerlat] as [number, number],
			},
			properties,
		};
	});

	// Collect all vehicles from all stations into a single FeatureCollection
	const stationVehicleFeatures = raw.data.flatMap((station) =>
		station.vehicleDetails.map((vehicle) => {
			const { centerLat, centerLong, ...properties } = transformVehicleDetailItem(vehicle);
			return {
				type: "Feature" as const,
				geometry: {
					type: "Point" as const,
					coordinates: [centerLong, centerLat] as [number, number],
				},
				properties: {
					...properties,
					stationId: stringifyId(station.stationid), // Link vehicle to station
				},
			};
		})
	);

	// Convert mapData vehicles (live vehicles) to GeoJSON Point features
	const liveVehicleFeatures: LocationFeature[] = raw.mapData.map((vehicle) =>
		createLocationFeature(
			[vehicle.centerlong, vehicle.centerlat], // GeoJSON: [lng, lat]
			{
				vehicleId: stringifyId(vehicle.vehicleid),
				vehicleNumber: vehicle.vehiclenumber,
				serviceTypeId: stringifyId(vehicle.servicetypeid),
				serviceType: vehicle.servicetype,
				eta: vehicle.eta,
				scheduledArrivalTime: vehicle.sch_arrivaltime,
				scheduledDepartureTime: vehicle.sch_departuretime,
				actualArrivalTime: vehicle.actual_arrivaltime,
				actualDepartureTime: vehicle.actual_departuretime,
				scheduledTripStartTime: vehicle.sch_tripstarttime,
				scheduledTripEndTime: vehicle.sch_tripendtime,
				lastLocationId: stringifyId(vehicle.lastlocationid),
				currentLocationId: stringifyId(vehicle.currentlocationid),
				nextLocationId: stringifyId(vehicle.nextlocationid),
				currentStop: vehicle.currentstop,
				nextStop: vehicle.nextstop,
				lastStop: vehicle.laststop,
				stopCoveredStatus: vehicle.stopCoveredStatus,
				heading: vehicle.heading,
				lastRefreshOn: vehicle.lastrefreshon,
				lastReceivedDateTimeFlag: vehicle.lastreceiveddatetimeflag,
				tripPosition: vehicle.tripposition,
			}
		)
	);

	return {
		stops: createFeatureCollection(stationFeatures),
		stationVehicles: createFeatureCollection(stationVehicleFeatures),
		liveVehicles: createFeatureCollection(liveVehicleFeatures),
	};
}

/**
 * Transform raw route details API response to clean, normalized format
 */
function transformRouteDetailsResponse(
	raw: RawRouteDetailsResponse
): RouteDetailsResponse {
	return {
		up: transformDirectionData(raw.up),
		down: transformDirectionData(raw.down),
	};
}

/**
 * Transform raw route between stops item to clean, normalized format
 */
function transformRouteBetweenStopsItem(
	raw: RawRouteBetweenStationsItem
): RouteBetweenStopsItem {
	return {
		id: stringifyId(raw.id),
		fromStopId: stringifyId(raw.fromstationid),
		sourceCode: raw.source_code,
		fromDisplayName: raw.from_displayname,
		toStopId: stringifyId(raw.tostationid),
		destinationCode: raw.destination_code,
		toDisplayName: raw.to_displayname,
		fromDistance: raw.fromdistance,
		toDistance: raw.todistance,
		subrouteId: stringifyId(raw.routeid),
		routeNo: raw.routeno,
		routeName: raw.routename,
		routeDirection: raw.route_direction.toLowerCase() as "up" | "down",
		fromStopName: raw.fromstationname,
		toStopName: raw.tostationname,
	};
}

/**
 * Transform raw routes between stops API response to clean, normalized format
 */
function transformRoutesBetweenStopsResponse(
	raw: RawRoutesBetweenStationsResponse
): RoutesBetweenStopsResponse {
		return {
		items: raw.data.map(transformRouteBetweenStopsItem),
	};
}

/**
 * Transform raw fare data API response to clean, normalized format
 */
function transformFareDataResponse(
	raw: RawFareDataResponse
): FareDataResponse {
	const items: FareDataItem[] = raw.data.map((item) => ({
		serviceType: item.servicetype,
		fare: item.fare,
	}));

	return {
		items,
	};
}

/**
 * Transform raw path detail item to clean, normalized format
 */
function transformPathDetailItem(raw: RawPathDetailsResponse["data"][0]): PathDetailItem {
	return {
		tripId: stringifyId(raw.tripId),
		subrouteId: stringifyId(raw.routeId),
		routeNo: raw.routeNo,
		stopId: stringifyId(raw.stationId),
		stopName: raw.stationName,
		latitude: raw.latitude,
		longitude: raw.longitude,
		eta: raw.eta || null,
		scheduledArrivalTime: raw.sch_arrivaltime || null,
		scheduledDepartureTime: raw.sch_departuretime || null,
		actualArrivalTime: raw.actual_arrivaltime || null,
		actualDepartureTime: raw.actual_departuretime || null,
		distance: raw.distance,
		duration: raw.duration,
		isTransfer: raw.isTransfer,
	};
}

/**
 * Transform raw path details response to clean, normalized format
 */
function transformPathDetailsResponse(
	raw: RawPathDetailsResponse
): PathDetailsResponse {
	const items: PathDetailItem[] = raw.data.map(transformPathDetailItem);

	// Create GeoJSON FeatureCollection from stops (Point features)
	const stationFeatures = items.map((item) =>
		createLocationFeature(
			[item.longitude, item.latitude],
			{
				tripId: item.tripId,
				subrouteId: item.subrouteId,
				routeNo: item.routeNo,
				stopId: item.stopId,
				stopName: item.stopName,
				eta: item.eta,
				scheduledArrivalTime: item.scheduledArrivalTime,
				scheduledDepartureTime: item.scheduledDepartureTime,
				actualArrivalTime: item.actualArrivalTime,
				actualDepartureTime: item.actualDepartureTime,
				distance: item.distance,
				duration: item.duration,
				isTransfer: item.isTransfer,
			}
		)
	);

	return createFeatureCollection(stationFeatures);
}

/**
 * Transform raw trip planner path leg to clean, normalized format
 */
function transformTripPlannerPathLeg(
	raw: RawTripPlannerPathLeg
): TripPlannerPathLeg {
	const durationSeconds = parseDurationToSeconds(raw.duration);
	const totalDurationSeconds = parseDurationToSeconds(raw.totalDuration);

	return {
		pathSrNo: raw.pathSrno,
		transferSrNo: raw.transferSrNo,
		tripId: stringifyId(raw.tripId),
		subrouteId: stringifyId(raw.routeid),
		routeNo: raw.routeno,
		scheduleNo: raw.schNo,
		vehicleId: stringifyId(raw.vehicleId),
		busNo: raw.busNo,
		distance: raw.distance,
		duration: raw.duration,
		durationSeconds,
		fromStopId: stringifyId(raw.fromStationId),
		fromStopName: raw.fromStationName,
		toStopId: stringifyId(raw.toStationId),
		toStopName: raw.toStationName,
		etaFromStop: raw.etaFromStation,
		etaToStop: raw.etaToStation,
		serviceTypeId: stringifyId(raw.serviceTypeId),
		fromLatitude: raw.fromLatitude,
		fromLongitude: raw.fromLongitude,
		toLatitude: raw.toLatitude,
		toLongitude: raw.toLongitude,
		routeParentId: stringifyId(raw.routeParentId),
		totalDuration: raw.totalDuration,
		totalDurationSeconds,
		waitingDuration: raw.waitingDuration,
		platformNumber: raw.platformnumber,
		bayNumber: raw.baynumber,
		deviceStatusName: raw.devicestatusnameflag,
		deviceStatusFlag: raw.devicestatusflag,
		srNo: raw.srno,
		approxFare: raw.approx_fare,
		fromStageNumber: raw.fromstagenumber,
		toStageNumber: raw.tostagenumber,
		minSrNo: raw.minsrno,
		maxSrNo: raw.maxsrno,
		tollFees: raw.tollfees,
		totalStages: raw.totalStages,
	};
}

/**
 * Parse duration string "HH:mm:ss" or "HH:mm" to total seconds
 */
function parseDurationToSeconds(duration: string): number {
	const parts = duration.split(":").map(Number);
	if (parts.length === 3) {
		// HH:mm:ss format
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	} else if (parts.length === 2) {
		// HH:mm format
		return parts[0] * 3600 + parts[1] * 60;
	}
	return 0;
}

/**
 * Format seconds to "HH:mm:ss" duration string
 */
function formatSecondsToDuration(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Check if a route leg is a walking segment
 */
function isWalkingRoute(leg: TripPlannerPathLeg): boolean {
	return leg.routeNo === WALK_ROUTE_PREFIX || leg.routeNo.startsWith(WALK_PREFIX);
}

/**
 * Check if a route leg is a bus segment (not walking, has valid route ID)
 */
function isBusSegment(leg: TripPlannerPathLeg): boolean {
	return leg.subrouteId !== EMPTY_SUBROUTE_ID && !isWalkingRoute(leg);
}

/**
 * Calculate route totals from legs
 */
function calculateRouteTotals(legs: TripPlannerPathLeg[]): Omit<TripPlannerRoute, "legs"> {
	let totalFare = 0;
	let totalDistance = 0;
	let totalSeconds = 0;
	let hasWalking = false;
	let busSegmentCount = 0;

	for (const leg of legs) {
		totalFare += leg.approxFare;
		totalDistance += leg.distance;
		totalSeconds += parseDurationToSeconds(leg.duration);

		// Add waiting duration if present
		if (leg.waitingDuration) {
			totalSeconds += parseDurationToSeconds(leg.waitingDuration);
		}

		// Check for walking segments
		if (isWalkingRoute(leg)) {
			hasWalking = true;
		}

		// Count bus segments (non-walking, non-zero routeId)
		if (isBusSegment(leg)) {
			busSegmentCount++;
		}
	}

	// Transfer count = bus segments - 1 (0 for direct routes)
	const transferCount = Math.max(0, busSegmentCount - 1);

	return {
		totalDuration: formatSecondsToDuration(totalSeconds),
		totalDurationSeconds: totalSeconds,
		totalFare,
		totalDistance,
		transferCount,
		hasWalking,
	};
}

/**
 * Transform a single route (array of raw legs) to TripPlannerRoute
 */
function transformRoute(route: RawTripPlannerPathLeg[]): TripPlannerRoute {
	const legs = route.map(transformTripPlannerPathLeg);
	const totals = calculateRouteTotals(legs);
	return {
		legs,
		...totals,
	};
}

/**
 * Transform raw trip planner API response to clean, normalized format
 * Includes computed totals for each route
 * Merges directRoutes and transferRoutes into a single routes array
 */
function transformTripPlannerResponse(
	raw: RawTripPlannerResponse
): TripPlannerResponse {
	// Transform direct routes with computed totals
	const directRoutes: TripPlannerRoute[] = raw.data.directRoutes.map(transformRoute);

	// Transform transfer routes with computed totals
	const transferRoutes: TripPlannerRoute[] = raw.data.transferRoutes.map(transformRoute);

	// Merge both arrays into a single routes array (preserves all data)
	const routes = [...directRoutes, ...transferRoutes];

	return {
		routes,
	};
}

/**
 * Build centerPoints string from via points array
 * Format: "&via=lat1,lng1&via=lat2,lng2&..."
 */
function buildCenterPoints(viaPoints: Array<[number, number]>): string {
	if (viaPoints.length === 0) {
		return "";
	}
	return viaPoints.map(([lat, lng]) => `&via=${lat},${lng}`).join("");
}

/**
 * Internal path segment type for decoding
 */
interface PathSegment {
	coordinates: Array<[number, number]>;
	pointCount: number;
}

/**
 * Decode polyline strings to path segments
 * Each encoded string represents a path segment decoded using HERE Flexible Polyline format
 */

function decodeWaypointsToGeoJSON(encodedStrings: string[]): PathSegment[] {
	const segments: PathSegment[] = [];

	for (const encoded of encodedStrings) {
		try {
			// HERE decoder returns absolute coordinates in [lat, lng] format
			const decoded = hereDecode(encoded);
			const polyline = decoded.polyline as Array<[number, number]>;

			// Convert [lat, lng] to [lng, lat] format
			const coordinates: Position[] = polyline.map((point) => [point[1], point[0]]);

			// Validate coordinates
			const isValid = coordinates.every(
				(coord) =>
					coord[0] >= -180 &&
					coord[0] <= 180 &&
					coord[1] >= -90 &&
					coord[1] <= 90
			);

			if (isValid && coordinates.length > 0) {
				segments.push({
					coordinates: coordinates as Array<[number, number]>,
					pointCount: coordinates.length,
				});
			}
		} catch (error) {
			// Skip segments that fail to decode
		}
	}

	return segments;
}

/**
 * Transform raw waypoints response to GeoJSON FeatureCollection with LineString features
 * Each encoded string from the API corresponds to one LineString segment
 */
function transformWaypointsResponse(raw: RawWaypointsResponse): TripPathResponse {
	const segments = decodeWaypointsToGeoJSON(raw);

	// Create LineString features for each segment (one API response string = one LineString feature)
	// Properties are empty as they're not provided by the API
	const lineFeatures = segments.map((segment) => ({
		type: "Feature" as const,
		geometry: {
			type: "LineString" as const,
			coordinates: segment.coordinates,
		},
		properties: {},
	}));

	return createFeatureCollection(lineFeatures);
}

/**
 * Routes API methods
 */
export class RoutesAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Get route points (path) for a given route ID
	 * @param params - Parameters including route ID
	 * @param params.routeId - Route ID (always string for consistency)
	 * @returns Route path as GeoJSON LineString FeatureCollection
	 * @throws {TransitValidationError} If routeId is invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const routePath = await client.routes.getRoutePoints({
	 *   routeId: "11797"
	 * });
	 * // Use routePath.routePath.features[0].geometry.coordinates to draw on map
	 * ```
	 */
	async getRoutePoints(
		params: RoutePointsParams
	): Promise<RoutePointsResponse> {
		// Validate input parameters - API expects number, convert from string
		const validatedParams = validate(
			routePointsParamsSchema,
			{ routeid: parseId(params.routeId) },
			"Invalid route points parameters"
		);

		const response = await this.client.getClient().post("RoutePoints", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawRoutePointsResponseSchema,
			data,
			"Invalid route points response"
		);

		// Transform to clean, normalized format
		return transformRoutePointsResponse(rawResponse, params.routeId);
	}

	/**
	 * Search for routes by query text (partial match)
	 * @param params - Parameters including search query
	 * @param params.query - Search query for routes (partial match supported)
	 * @returns List of matching routes in normalized format
	 * @throws {TransitValidationError} If query is invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const routes = await client.routes.searchRoutes({ query: "285-M" });
	 * routes.items.forEach(route => {
	 *   console.log(`${route.routeNo} - ${route.parentRouteId}`);
	 * });
	 * ```
	 */
	async searchRoutes(params: RouteSearchParams): Promise<RouteSearchResponse> {
		// Validate input parameters
		const validatedParams = validate(
			routeSearchParamsSchema,
			{ routetext: params.query },
			"Invalid route search parameters"
		);

		const response = await this.client.getClient().post("SearchRoute_v2", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawRouteSearchResponseSchema,
			data,
			"Invalid route search response"
		);

		// Transform to clean, normalized format
		return transformRouteSearchResponse(rawResponse);
	}

	/**
	 * Get all routes list
	 * @returns List of all routes in normalized format
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const allRoutes = await client.routes.getAllRoutes();
	 * console.log(`Total routes: ${allRoutes.items.length}`);
	 * 
	 * // Find routes by name
	 * const matchingRoutes = allRoutes.items.filter(r => 
	 *   r.routeName.includes("KBS")
	 * );
	 * ```
	 */
	async getAllRoutes(): Promise<AllRoutesResponse> {
		const response = await this.client.getClient().post("GetAllRouteList", {
			json: {},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawAllRoutesResponseSchema,
			data,
			"Invalid all routes response"
		);

		// Transform to clean, normalized format
		return transformAllRoutesResponse(rawResponse);
	}


	/**
	 * Get timetable by route ID
	 * @param params - Parameters including route ID and optional filters
	 * @param params.routeId - Route ID (always string for consistency)
	 * @param params.startTime - Optional: Start time for timetable (Date object, defaults to current time)
	 * @param params.endTime - Optional: End time for timetable (Date object, defaults to 23:59 of startTime date)
	 * @param params.fromStopId - Optional: Filter by from stop ID (requires toStopId)
	 * @param params.toStopId - Optional: Filter by to stop ID (requires fromStopId)
	 * @returns Timetable data in normalized format
	 * @throws {TransitValidationError} If routeId is invalid, validation fails, or stop IDs are provided incorrectly
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * // Get timetable for entire route
	 * const timetable = await client.routes.getTimetableByRoute({
	 *   routeId: "11797"
	 * });
	 * 
	 * // Get timetable between specific stops
	 * const timetable = await client.routes.getTimetableByRoute({
	 *   routeId: "11797",
	 *   fromStopId: "22357",
	 *   toStopId: "21447",
	 *   startTime: new Date("2026-01-20T09:00:00")
	 * });
	 * ```
	 */
	async getTimetableByRoute(
		params: TimetableByRouteParams
	): Promise<TimetableResponse> {
		// Generate current date in ISO 8601 format
		const currentDate = formatISODate(new Date());

		// Determine start time - use current time if not provided
		const startTimeDate = params.startTime ?? new Date();
		const startTime = formatDateTime(startTimeDate);

		// Determine end time - use 23:59 of startTime date if not provided
		let endTime: string;
		if (params.endTime) {
			endTime = formatDateTime(params.endTime);
		} else {
			// Extract date from startTime (format: "YYYY-MM-DD HH:mm")
			const startTimeDateStr = formatDate(startTimeDate);
			endTime = `${startTimeDateStr} 23:59`;
		}

		// Build request payload - API expects numbers for IDs, convert from strings
		const requestPayload: {
			current_date: string;
			routeid: number;
			fromStationId?: string; // API uses "station" in field names
			toStationId?: string; // API uses "station" in field names
			starttime: string;
			endtime: string;
		} = {
			current_date: currentDate,
			routeid: parseId(params.routeId),
			starttime: startTime,
			endtime: endTime,
		};

		// Add stop IDs if provided (type-safe: both are required together)
		if ("fromStopId" in params && "toStopId" in params) {
			requestPayload.fromStationId = params.fromStopId;
			requestPayload.toStationId = params.toStopId;
		}

		// Validate request payload
		const validatedParams = validate(
			timetableRequestSchema,
			requestPayload,
			"Invalid timetable parameters"
		);

		const response = await this.client
			.getClient()
			.post("GetTimetableByRouteid_v3", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawTimetableResponseSchema,
			data,
			"Invalid timetable response"
		);

		// Transform to clean, normalized format
		return transformTimetableResponse(rawResponse);
	}

	/**
	 * Search route details by parent route ID
	 * @param params - Parameters including parent route ID and optional service type ID
	 * @param params.parentRouteId - Parent route ID (always string for consistency, obtained from searchRoutes)
	 * @param params.serviceTypeId - Optional: Filter by service type ID
	 * @returns Route details with live vehicle information for both directions (up and down)
	 * @throws {Error} If parentRouteId is invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @remarks
	 * The parentRouteId should be obtained from searchRoutes().parentRouteId.
	 * The response contains subroute IDs in up.stops and down.stops (subrouteId property).
	 * @example
	 * ```typescript
	 * // First search for route
	 * const routes = await client.routes.searchRoutes({ query: "500-CA" });
	 * const parentRouteId = routes.items[0].parentRouteId;
	 * 
	 * // Get route details with live vehicles
	 * const details = await client.routes.searchByRouteDetails({ parentRouteId });
	 * 
	 * // Access live vehicles for up direction
	 * details.up.vehicles.features.forEach(vehicle => {
	 *   console.log(`Vehicle ${vehicle.properties.vehicleRegNo} at ${vehicle.geometry.coordinates}`);
	 * });
	 * ```
	 */
	async searchByRouteDetails(
		params: RouteDetailsParams
	): Promise<RouteDetailsResponse> {
		// Build request payload - API expects numbers for IDs, convert from strings
		const requestPayload: {
			routeid: number;
			servicetypeid?: number;
		} = {
			routeid: parseId(params.parentRouteId),
		};

		// Add service type ID if provided
		if (params.serviceTypeId) {
			requestPayload.servicetypeid = parseId(params.serviceTypeId);
		}

		// Validate request payload
		const validatedParams = validate(
			routeDetailsParamsSchema,
			requestPayload,
			"Invalid route details parameters"
		);

		const response = await this.client
			.getClient()
			.post("SearchByRouteDetails_v4", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawRouteDetailsResponseSchema,
			data,
			"Invalid route details response"
		);

		// Transform to clean, normalized format
		return transformRouteDetailsResponse(rawResponse);
	}

	/**
	 * Get routes between two stops
	 * @param params - Parameters including from and to stop IDs
	 * @param params.fromStopId - From stop ID (always string for consistency)
	 * @param params.toStopId - To stop ID (always string for consistency)
	 * @returns List of routes connecting the two stops in normalized format
	 * @throws {TransitValidationError} If stop IDs are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @remarks
	 * The routeId in the response is likely a subroute ID (specific to direction/variant).
	 * It can be used with searchByRouteDetails() endpoint.
	 * Note: This differs from parentRouteId returned by searchRoutes().
	 * @example
	 * ```typescript
	 * const routes = await client.routes.getRoutesBetweenStops({
	 *   fromStopId: "22357",
	 *   toStopId: "21447"
	 * });
	 * 
	 * routes.items.forEach(route => {
	 *   console.log(`Route ${route.routeNo}: ${route.fromStop} → ${route.toStop}`);
	 * });
	 * ```
	 */
	async getRoutesBetweenStops(
		params: RoutesBetweenStopsParams
	): Promise<RoutesBetweenStopsResponse> {
		// Validate input parameters - API expects numbers, convert from strings
		const validatedParams = validate(
			routesBetweenStopsParamsSchema,
			{
				fromStationId: parseId(params.fromStopId), // API uses "station" in field names
				toStationId: parseId(params.toStopId), // API uses "station" in field names
			},
			"Invalid routes between stops parameters"
		);

		// Get language from client and map to API format
		const language = this.client.getLanguage();
		const lan = language === "en" ? "English" : "Kannada";

		const response = await this.client.getClient().post("GetFareRoutes", {
			json: {
				fromStationId: validatedParams.fromStationId,
				toStationId: validatedParams.toStationId,
				lan,
			},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawRoutesBetweenStationsResponseSchema,
			data,
			"Invalid routes between stops response"
		);

		// Transform to clean, normalized format
		return transformRoutesBetweenStopsResponse(rawResponse);
	}

	/**
	 * Get fares for a route between stops
	 * @param params - Parameters from getRoutesBetweenStops() response
	 * @param params.routeId - Subroute ID (always string for consistency, from RouteBetweenStopsItem)
	 * @param params.routeDirection - Route direction: "up" or "down"
	 * @param params.sourceCode - Source code (from RouteBetweenStopsItem)
	 * @param params.destinationCode - Destination code (from RouteBetweenStopsItem)
	 * @returns Fares with service types and their fare amounts
	 * @throws {Error} If parameters are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @remarks
	 * The parameters should come from a RouteBetweenStopsItem returned by getRoutesBetweenStops().
	 * This endpoint requires the subroute ID (not parent route ID) along with route direction,
	 * source and destination codes to determine the exact fare for that route variant.
	 * @example
	 * ```typescript
	 * // First get routes between stops
	 * const routes = await client.routes.getRoutesBetweenStops({
	 *   fromStopId: "22357",
	 *   toStopId: "21447"
	 * });
	 * 
	 * // Get fare for first route
	 * const route = routes.items[0];
	 * const fare = await client.routes.getFares({
	 *   routeId: route.subrouteId,
	 *   routeDirection: route.routeDirection,
	 *   sourceCode: route.sourceCode,
	 *   destinationCode: route.destinationCode
	 * });
	 * 
	 * fare.items.forEach(item => {
	 *   console.log(`Service: ${item.serviceType}, Fare: ₹${item.fare}`);
	 * });
	 * ```
	 */
	async getFares(params: FareDataParams): Promise<FareDataResponse> {
		// Validate input parameters - API expects numbers for routeid, convert from string
		// Normalize routeDirection to lowercase for validation, then convert to uppercase for API
		const validatedParams = validate(
			fareDataParamsSchema,
			{
				routeno: params.routeNo,
				routeid: parseId(params.subrouteId),
				route_direction: params.routeDirection, // Already lowercase "up" | "down"
				source_code: params.sourceCode,
				destination_code: params.destinationCode,
			},
			"Invalid fare data parameters"
		);

		// Convert lowercase "up" | "down" to uppercase "UP" | "DOWN" for API request
		const apiParams = {
			...validatedParams,
			route_direction: validatedParams.route_direction.toUpperCase(),
		};

		const response = await this.client.getClient().post("GetMobileFareData_v2", {
			json: apiParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawFareDataResponseSchema,
			data,
			"Invalid fare data response"
		);

		// Transform to clean, normalized format
		return transformFareDataResponse(rawResponse);
	}

	/**
	 * Plan a trip with multiple route options
	 * @param params - Trip planner parameters with 4 possible combinations:
	 *   - Stop to Stop: fromStopId, toStopId
	 *   - Stop to Location: fromStopId, toCoordinates
	 *   - Location to Stop: fromCoordinates, toStopId
	 *   - Location to Location: fromCoordinates, toCoordinates
	 * @returns Trip plans with all available routes (merged from directRoutes and transferRoutes)
	 * @remarks
	 * This endpoint supports 4 combinations of origin/destination:
	 * - Stop IDs (always string for consistency, will be converted to numbers for API)
	 * - Coordinates (latitude/longitude)
	 * Optional parameters:
	 * - serviceTypeId: Filter by service type (from getAllServiceTypes)
	 * - fromDateTime: Future datetime (Date object, converted to "YYYY-MM-DD HH:mm" format)
	 * - filterBy: "minimum-transfers" or "shortest-time"
	 * 
	 * All routes are returned in a single `routes` array. Filter by `transferCount === 0` to identify direct routes.
	 * @throws {TransitError} If fromDateTime is not in the future
	 * @throws {TransitValidationError} If parameters are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * // Location to Stop
	 * const trip = await client.routes.planTrip({
	 *   fromCoordinates: [13.09784, 77.59167],
	 *   toStopId: "20922"
	 * });
	 * 
	 * // Find fastest direct route
	 * const fastest = trip.routes
	 *   .filter(r => r.transferCount === 0)
	 *   .sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds)[0];
	 * ```
	 * @example
	 * ```typescript
	 * // Stop to Stop with filters
	 * const trip = await client.routes.planTrip({
	 *   fromStopId: "22357",
	 *   toStopId: "21447",
	 *   filterBy: "shortest-time",
	 *   fromDateTime: new Date("2026-01-20T09:00:00")
	 * });
	 * ```
	 */
	async planTrip(params: TripPlannerParams): Promise<TripPlannerResponse> {
		// Convert discriminated union params to API payload format
		const apiPayload: {
			fromStationId?: number; // API uses "station" in field names
			fromLatitude?: number;
			fromLongitude?: number;
			toStationId?: number; // API uses "station" in field names
			toLatitude?: number;
			toLongitude?: number;
			serviceTypeId?: number;
			fromDateTime?: string;
			filterBy?: 1 | 2;
		} = {};

		// Set "from" type (either stop ID or coordinates)
		if ("fromStopId" in params && params.fromStopId) {
			apiPayload.fromStationId = parseId(params.fromStopId);
		} else if ("fromCoordinates" in params && params.fromCoordinates) {
			const [lat, lng] = params.fromCoordinates;
			apiPayload.fromLatitude = lat;
			apiPayload.fromLongitude = lng;
		}

		// Set "to" type (either stop ID or coordinates)
		if ("toStopId" in params && params.toStopId) {
			apiPayload.toStationId = parseId(params.toStopId);
		} else if ("toCoordinates" in params && params.toCoordinates) {
			const [lat, lng] = params.toCoordinates;
			apiPayload.toLatitude = lat;
			apiPayload.toLongitude = lng;
		}

		// Add optional parameters
		if (params.serviceTypeId !== undefined) {
			apiPayload.serviceTypeId = parseId(params.serviceTypeId);
		}
		if (params.fromDateTime !== undefined) {
			// Validate that the date is in the future
			const now = new Date();
			if (params.fromDateTime <= now) {
				throw new TransitError("fromDateTime must be in the future", "VALIDATION_ERROR");
			}
			// Convert Date to "YYYY-MM-DD HH:mm" format
			apiPayload.fromDateTime = formatDateTime(params.fromDateTime);
		}
		if (params.filterBy !== undefined) {
			apiPayload.filterBy = tripPlannerFilterToNumber(params.filterBy);
		}

		// Validate API payload format
		const validatedParams = validate(
			tripPlannerParamsSchema,
			apiPayload,
			"Invalid trip planner parameters"
		);

		const response = await this.client.getClient().post("TripPlannerMSMD", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawTripPlannerResponseSchema,
			data,
			"Invalid trip planner response"
		);

		// Transform to clean, normalized format
		return transformTripPlannerResponse(rawResponse);
	}

	/**
	 * Get all stops/stations along trip legs
	 * @param params - Path details parameters with array of trip leg segments
	 * @param params.trips - Array of trip leg segments, each with tripId, fromStopId, and toStopId
	 * @returns All stops along the trip legs with station details, scheduled times, and coordinates as GeoJSON FeatureCollection
	 * @remarks
	 * This endpoint is typically used after planning a trip to get detailed
	 * station-by-station information for each leg of the journey.
	 * Each item in the request should have tripId, fromStopId, and toStopId
	 * (typically from TripPlannerPathLeg).
	 * 
	 * Note: This returns stops/stations, not a geographic path (for route paths, use getTripPath).
	 * @throws {TransitValidationError} If trip parameters are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * // After planning a trip, get all stops along the route
	 * const trip = await client.routes.planTrip({
	 *   fromStopId: "22357",
	 *   toStopId: "21447"
	 * });
	 * 
	 * // Extract trip legs (excluding walking segments)
	 * const tripLegs = trip.routes[0].legs
	 *   .filter(leg => !leg.routeNo.startsWith('walk'))
	 *   .map(leg => ({
	 *     tripId: leg.tripId,
	 *     fromStopId: leg.fromStopId,
	 *     toStopId: leg.toStopId
	 *   }));
	 * 
	 * // Get all stops as GeoJSON
	 * const stops = await client.routes.getTripStops({ trips: tripLegs });
	 * // Use stops.features to display on map
	 * ```
	 */
	async getTripStops(params: PathDetailsParams): Promise<PathDetailsResponse> {
		// Validate user-facing params first
		const validatedUserParams = validate(
			pathDetailsParamsSchema,
			params,
			"Invalid path details parameters"
		);

		// Convert string IDs to numbers and map 'trips' to 'data' for API
		const apiPayload = {
			data: validatedUserParams.trips.map((item) => ({
				tripId: parseId(item.tripId),
				fromStationId: parseId(item.fromStopId), // API uses "station" in field names
				toStationId: parseId(item.toStopId), // API uses "station" in field names
			})),
		};

		// Validate API payload format
		const validatedParams = validate(
			pathDetailsApiParamsSchema,
			apiPayload,
			"Invalid path details API parameters"
		);

		const response = await this.client.getClient().post("GetPathDetails", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawPathDetailsResponseSchema,
			data,
			"Invalid path details response"
		);

		// Transform to clean, normalized format
		return transformPathDetailsResponse(rawResponse);
	}

	/**
	 * Get trip path as GeoJSON FeatureCollection with LineString features
	 * @param params - Trip path parameters with via points (bus stops)
	 * @param params.viaPoints - Array of [latitude, longitude] coordinates or GeoJSON FeatureCollection from getTripStops()
	 * @returns GeoJSON FeatureCollection with LineString features representing the route path
	 * @remarks
	 * This endpoint returns encoded polyline strings representing path segments between origin, via points, and destination.
	 * The wrapper decodes these using HERE Flexible Polyline format into GeoJSON LineString features.
	 * Each segment becomes a LineString feature with [lng, lat] coordinates.
	 * 
	 * The first point in viaPoints is the origin, the last point is the destination.
	 * All intermediate points are treated as via points (bus stops along the route).
	 * 
	 * You can pass GeoJSON FeatureCollection from `getTripStops()` - coordinates will be extracted, properties ignored.
	 * @throws {TransitValidationError} If viaPoints are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * // Get stops first
	 * const stops = await client.routes.getTripStops({ trips: tripLegs });
	 * 
	 * // Get path using stops (coordinates extracted automatically)
	 * const path = await client.routes.getTripPath({ viaPoints: stops });
	 * // Use path.features to draw route lines on map
	 * ```
	 * @example
	 * ```typescript
	 * // Or use coordinates directly
	 * const path = await client.routes.getTripPath({
	 *   viaPoints: [
	 *     [13.09784, 77.59167], // Origin
	 *     [13.09884, 77.59267], // Via point
	 *     [13.09984, 77.59367]  // Destination
	 *   ]
	 * });
	 * ```
	 */
	async getTripPath(params: WaypointsParams): Promise<TripPathResponse> {
		let viaPoints: Array<[number, number]>;

		// Check if viaPoints is a FeatureCollection (GeoJSON)
		if ("type" in params.viaPoints && params.viaPoints.type === "FeatureCollection") {
			// Extract coordinates from GeoJSON FeatureCollection (ignore properties)
			viaPoints = params.viaPoints.features
				.filter((feature) => feature.geometry.type === "Point")
				.map((feature) => {
					// TypeScript knows this is Point geometry after filter
					const geometry = feature.geometry;
					if (geometry.type === "Point") {
						const [lng, lat] = geometry.coordinates;
						return [lat, lng] as [number, number]; // Convert [lng, lat] to [lat, lng]
					}
					return null;
				})
				.filter((point): point is [number, number] => point !== null);
		} else {
			// Validate input parameters for array of coordinates
			const validatedParams = validate(
				waypointsParamsSchema,
				params,
				"Invalid waypoints parameters"
			);
			viaPoints = validatedParams.viaPoints as Array<[number, number]>;
		}

		// Extract origin (first point) and destination (last point)
		const [originLat, originLng] = viaPoints[0];
		const [destLat, destLng] = viaPoints[viaPoints.length - 1];

		// Build centerPoints string from all via points (origin + intermediate + destination)
		const centerPoints = buildCenterPoints(viaPoints);

		// Prepare API payload
		const apiPayload = {
			FromLat: originLat,
			FromLong: originLng,
			ToLat: destLat,
			ToLong: destLng,
			centerPoints,
			AppName: "BMTC",
			DeviceType: DEFAULT_DEVICE_TYPE,
		};

		const response = await this.client.getClient().post("getWaypoints_v1", {
			json: apiPayload,
		});

		const data = await response.json<unknown>();

		// Validate raw response (array of strings)
		const rawResponse = validate(
			rawWaypointsResponseSchema,
			data,
			"Invalid waypoints response"
		);

		// Transform to clean, normalized format with decoded coordinates
		return transformWaypointsResponse(rawResponse);
	}

	/**
	 * Get routes that pass through both stations (in sequence)
	 * @param params - Parameters including from station ID, to station ID, and optional filters
	 * @param params.fromStopId - From stop ID (always string for consistency)
	 * @param params.toStopId - To stop ID (always string for consistency)
	 * @param params.routeId - Optional: Filter by specific route ID
	 * @param params.date - Optional: Date for timetable (Date object, defaults to current date)
	 * @returns Routes that go through both stations with schedule information
	 * @remarks
	 * This is NOT a full timetable - each route has one startTime, not multiple scheduled trips.
	 * Routes may start before fromStop and/or continue after toStop.
	 * @throws {TransitValidationError} If stop IDs are invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * // Find routes passing through both stops
	 * const routes = await client.routes.getRoutesThroughStations({
	 *   fromStopId: "30475",
	 *   toStopId: "35376"
	 * });
	 * 
	 * routes.items.forEach(route => {
	 *   console.log(`Route ${route.routeNo} starts at ${route.startTime}`);
	 *   console.log(`Travel time: ${route.travelTime}, Distance: ${route.distance} km`);
	 * });
	 * ```
	 * @example
	 * ```typescript
	 * // Filter by specific route
	 * const routes = await client.routes.getRoutesThroughStations({
	 *   fromStopId: "30475",
	 *   toStopId: "35376",
	 *   routeId: "2292",
	 *   date: new Date("2026-01-20")
	 * });
	 * ```
	 * @remarks
	 * This endpoint returns all routes that pass through both the fromStation and toStation in sequence.
	 * The routes may start before fromStation and/or continue after toStation - they just need to pass through both.
	 * Returns one startTime per route (not a full timetable with multiple trips).
	 * For a full timetable with multiple trips, use getTimetableByRoute() instead.
	 * The date, start time, and end time parameters are required by the API but don't affect the output.
	 * Use routeId to filter results to a specific route.
	 */
	async getRoutesThroughStations(
		params: TimetableByStationParams
	): Promise<TimetableByStationResponse> {
		// Use provided date or default to current date
		const date = params.date ?? new Date();
		const dateStr = formatDate(date);

		// Build request payload - API expects numbers for IDs, convert from strings
		const requestPayload: {
			fromStationId: number; // API uses "station" in field names
			toStationId: number; // API uses "station" in field names
			p_startdate: string;
			p_enddate: string;
			p_isshortesttime?: number;
			p_routeid: string;
			p_date: string;
		} = {
			fromStationId: parseId(params.fromStopId),
			toStationId: parseId(params.toStopId),
			p_startdate: `${dateStr} 00:00`,
			p_enddate: `${dateStr} 23:59`,
			p_routeid: params.routeId ?? "",
			p_date: dateStr,
		};

		// Validate request payload
		const validatedParams = validate(
			timetableByStationRequestSchema,
			requestPayload,
			"Invalid timetable by station parameters"
		);

		const response = await this.client
			.getClient()
			.post("GetTimetableByStation_v4", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawTimetableByStationResponseSchema,
			data,
			"Invalid timetable by station response"
		);

		// Transform to clean, normalized format
		return transformTimetableByStationResponse(rawResponse);
	}
}
