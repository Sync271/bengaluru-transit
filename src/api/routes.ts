import { validate } from "../utils/validation";
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
		parentRouteId: item.routeparentid.toString(),
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
		subrouteId: item.routeid.toString(),
		routeNo: item.routeno,
		routeName: item.routename,
		fromStopId: item.fromstationid.toString(),
		fromStop: item.fromstation,
		toStopId: item.tostationid.toString(),
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
		routeId: item.routeid.toString(),
		id: item.id,
		fromStopId: item.fromstationid.toString(),
		toStopId: item.tostationid.toString(),
		fromStopOffset: item.f,
		toStopOffset: item.t,
		routeNo: item.routeno,
		routeName: item.routename,
		fromStopName: item.fromstationname,
		toStopName: item.tostationname,
		travelTime: item.traveltime,
		distance: item.distance,
		approximateTime: item.apptime,
		approximateTimeSeconds: parseInt(item.apptimesecs, 10),
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
		vehicleId: raw.vehicleid.toString(),
		vehicleNumber: raw.vehiclenumber,
		serviceTypeId: raw.servicetypeid.toString(),
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
		lastLocationId: raw.lastlocationid.toString(),
		currentLocationId: raw.currentlocationid.toString(),
		nextLocationId: raw.nextlocationid.toString(),
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
			stopId: station.stationid.toString(),
			stopName: station.stationname,
			subrouteId: station.routeid.toString(), // This is the subroute ID for the specific direction
			from: station.from,
			to: station.to,
			routeNo: station.routeno,
			distanceOnStation: station.distance_on_station,
			responseCode: station.responsecode,
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
					stationId: station.stationid.toString(), // Link vehicle to station
				},
			};
		})
	);

	// Convert mapData vehicles (live vehicles) to GeoJSON Point features
	const liveVehicleFeatures: LocationFeature[] = raw.mapData.map((vehicle) =>
		createLocationFeature(
			[vehicle.centerlong, vehicle.centerlat], // GeoJSON: [lng, lat]
			{
				vehicleId: vehicle.vehicleid.toString(),
				vehicleNumber: vehicle.vehiclenumber,
				serviceTypeId: vehicle.servicetypeid.toString(),
				serviceType: vehicle.servicetype,
				eta: vehicle.eta,
				scheduledArrivalTime: vehicle.sch_arrivaltime,
				scheduledDepartureTime: vehicle.sch_departuretime,
				actualArrivalTime: vehicle.actual_arrivaltime,
				actualDepartureTime: vehicle.actual_departuretime,
				scheduledTripStartTime: vehicle.sch_tripstarttime,
				scheduledTripEndTime: vehicle.sch_tripendtime,
				lastLocationId: vehicle.lastlocationid.toString(),
				currentLocationId: vehicle.currentlocationid.toString(),
				nextLocationId: vehicle.nextlocationid.toString(),
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
		id: raw.id.toString(),
		fromStopId: raw.fromstationid.toString(),
		sourceCode: raw.source_code,
		fromDisplayName: raw.from_displayname,
		toStopId: raw.tostationid.toString(),
		destinationCode: raw.destination_code,
		toDisplayName: raw.to_displayname,
		fromDistance: raw.fromdistance,
		toDistance: raw.todistance,
		subrouteId: raw.routeid.toString(),
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
		tripId: raw.tripId.toString(),
		subrouteId: raw.routeId.toString(),
		routeNo: raw.routeNo,
		stationId: raw.stationId.toString(),
		stationName: raw.stationName,
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
				stationId: item.stationId,
				stationName: item.stationName,
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
		tripId: raw.tripId.toString(),
		subrouteId: raw.routeid.toString(),
		routeNo: raw.routeno,
		scheduleNo: raw.schNo,
		vehicleId: raw.vehicleId.toString(),
		busNo: raw.busNo,
		distance: raw.distance,
		duration: raw.duration,
		durationSeconds,
		fromStopId: raw.fromStationId.toString(),
		fromStopName: raw.fromStationName,
		toStopId: raw.toStationId.toString(),
		toStopName: raw.toStationName,
		etaFromStop: raw.etaFromStation,
		etaToStop: raw.etaToStation,
		serviceTypeId: raw.serviceTypeId.toString(),
		fromLatitude: raw.fromLatitude,
		fromLongitude: raw.fromLongitude,
		toLatitude: raw.toLatitude,
		toLongitude: raw.toLongitude,
		routeParentId: raw.routeParentId.toString(),
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
	 * @returns Route path as GeoJSON LineString FeatureCollection
	 */
	async getRoutePoints(
		params: RoutePointsParams
	): Promise<RoutePointsResponse> {
		// Validate input parameters - API expects number, convert from string
		const validatedParams = validate(
			routePointsParamsSchema,
			{ routeid: parseInt(params.routeId, 10) },
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
	 * @returns List of matching routes in normalized format
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
	 * Convert Date to "YYYY-MM-DD HH:mm" format string
	 */
	private formatDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	/**
	 * Get timetable by route ID
	 * @param params - Parameters including route ID and optional filters
	 * @returns Timetable data in normalized format
	 */
	async getTimetableByRoute(
		params: TimetableByRouteParams
	): Promise<TimetableResponse> {
		// Generate current date in ISO 8601 format
		const currentDate = new Date().toISOString();

		// Determine start time - use current time if not provided
		const startTimeDate = params.startTime ?? new Date();
		const startTime = this.formatDateTime(startTimeDate);

		// Determine end time - use 23:59 of startTime date if not provided
		let endTime: string;
		if (params.endTime) {
			endTime = this.formatDateTime(params.endTime);
		} else {
			// Extract date from startTime (format: "YYYY-MM-DD HH:mm")
			const startTimeDateStr = startTime.split(" ")[0];
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
			routeid: parseInt(params.routeId, 10),
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
	 * @returns Route details with live vehicle information for both directions (up and down)
	 * @remarks
	 * The parentRouteId should be obtained from searchRoutes().parentRouteId.
	 * The response contains subroute IDs in up.stops and down.stops (subrouteId property).
	 */
	async searchByRouteDetails(
		params: RouteDetailsParams
	): Promise<RouteDetailsResponse> {
		// Build request payload - API expects numbers for IDs, convert from strings
		const requestPayload: {
			routeid: number;
			servicetypeid?: number;
		} = {
			routeid: parseInt(params.parentRouteId, 10),
		};

		// Add service type ID if provided
		if (params.serviceTypeId) {
			requestPayload.servicetypeid = parseInt(params.serviceTypeId, 10);
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
	 * @returns List of routes connecting the two stops in normalized format
	 * @remarks
	 * The routeId in the response is likely a subroute ID (specific to direction/variant).
	 * It can be used with searchByRouteDetails() endpoint.
	 * Note: This differs from parentRouteId returned by searchRoutes().
	 */
	async getRoutesBetweenStops(
		params: RoutesBetweenStopsParams
	): Promise<RoutesBetweenStopsResponse> {
		// Validate input parameters - API expects numbers, convert from strings
		const validatedParams = validate(
			routesBetweenStopsParamsSchema,
			{
				fromStationId: parseInt(params.fromStopId, 10), // API uses "station" in field names
				toStationId: parseInt(params.toStopId, 10), // API uses "station" in field names
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
	 * @returns Fares with service types and their fare amounts
	 * @remarks
	 * The parameters should come from a RouteBetweenStationsItem returned by getRoutesBetweenStations().
	 * This endpoint requires the subroute ID (not parent route ID) along with route direction,
	 * source and destination codes to determine the exact fare for that route variant.
	 */
	async getFares(params: FareDataParams): Promise<FareDataResponse> {
		// Validate input parameters - API expects numbers for routeid, convert from string
		// Normalize routeDirection to lowercase for validation, then convert to uppercase for API
		const validatedParams = validate(
			fareDataParamsSchema,
			{
				routeno: params.routeNo,
				routeid: parseInt(params.subrouteId, 10),
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
	 * - fromDateTime: Future datetime in format "YYYY-MM-DD HH:mm" (e.g., "2026-01-18 18:00")
	 * - filterBy: "minimum-transfers" or "shortest-time"
	 * 
	 * All routes are returned in a single `routes` array. Filter by `transferCount === 0` to identify direct routes.
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
			apiPayload.fromStationId = parseInt(params.fromStopId, 10);
		} else if ("fromCoordinates" in params && params.fromCoordinates) {
			const [lat, lng] = params.fromCoordinates;
			apiPayload.fromLatitude = lat;
			apiPayload.fromLongitude = lng;
		}

		// Set "to" type (either stop ID or coordinates)
		if ("toStopId" in params && params.toStopId) {
			apiPayload.toStationId = parseInt(params.toStopId, 10);
		} else if ("toCoordinates" in params && params.toCoordinates) {
			const [lat, lng] = params.toCoordinates;
			apiPayload.toLatitude = lat;
			apiPayload.toLongitude = lng;
		}

		// Add optional parameters
		if (params.serviceTypeId !== undefined) {
			apiPayload.serviceTypeId = parseInt(params.serviceTypeId, 10);
		}
		if (params.fromDateTime !== undefined) {
			apiPayload.fromDateTime = params.fromDateTime;
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
	 * @returns All stops along the trip legs with station details, scheduled times, and coordinates
	 * @remarks
	 * This endpoint is typically used after planning a trip to get detailed
	 * station-by-station information for each leg of the journey.
	 * Each item in the request should have tripId, fromStationId, and toStationId
	 * (typically from TripPlannerPathLeg).
	 * 
	 * Note: This returns stops/stations, not a geographic path (for route paths, use getRoutePoints).
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
				tripId: typeof item.tripId === "string" ? parseInt(item.tripId, 10) : item.tripId,
				fromStationId: // API uses "station" in field names
					typeof item.fromStopId === "string"
						? parseInt(item.fromStopId, 10)
						: item.fromStopId,
				toStationId: // API uses "station" in field names
					typeof item.toStopId === "string"
						? parseInt(item.toStopId, 10)
						: item.toStopId,
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
			DeviceType: "WEB",
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
	 * @returns Routes that go through both stations with schedule information
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
		const dateStr = date.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

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
			fromStationId: parseInt(params.fromStopId, 10),
			toStationId: parseInt(params.toStopId, 10),
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
