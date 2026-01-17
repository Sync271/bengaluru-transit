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
} from "../schemas/routes";
import {
	createRouteFeature,
	createFeatureCollection,
	createLocationFeature,
} from "../utils/geojson";
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
} from "../types/routes";
import type {
	RouteFeature,
	LocationFeature,
} from "../types/geojson";
import type { RouteDetailStationProperties } from "../types/routes";

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

	// Create a single LineString feature for the route path
	const routeFeature: RouteFeature = createRouteFeature(coordinates, {
		routeId: routeId,
	});

	return {
		routePath: createFeatureCollection([routeFeature]),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
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
		routeParentId: item.routeparentid.toString(),
	}));

	return {
		items,
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Transform raw all routes API response to clean, normalized format
 */
function transformAllRoutesResponse(
	raw: RawAllRoutesResponse
): AllRoutesResponse {
	const items: RouteListItem[] = raw.data.map((item) => ({
		routeId: item.routeid.toString(),
		routeNo: item.routeno,
		routeName: item.routename,
		fromStationId: item.fromstationid.toString(),
		fromStation: item.fromstation,
		toStationId: item.tostationid.toString(),
		toStation: item.tostation,
	}));

	return {
		items,
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Transform raw timetable API response to clean, normalized format
 */
function transformTimetableResponse(
	raw: RawTimetableResponse
): TimetableResponse {
	const items: TimetableItem[] = raw.data.map((item) => ({
		fromStationName: item.fromstationname,
		toStationName: item.tostationname,
		fromStationId: item.fromstationid,
		toStationId: item.tostationid,
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
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
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
			routeId: station.routeid.toString(),
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
		message: raw.message,
		success: raw.issuccess,
		rowCount: raw.rowCount,
	};
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
			fromStationId?: string;
			toStationId?: string;
			starttime: string;
			endtime: string;
		} = {
			current_date: currentDate,
			routeid: parseInt(params.routeId, 10),
			starttime: startTime,
			endtime: endTime,
		};

		// Add station IDs if provided (type-safe: both are required together)
		if ("fromStationId" in params && "toStationId" in params) {
			requestPayload.fromStationId = params.fromStationId;
			requestPayload.toStationId = params.toStationId;
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
	 * Search route details by route ID
	 * @param params - Parameters including route ID and optional service type ID
	 * @returns Route details with live vehicle information for both directions (up and down)
	 */
	async searchByRouteDetails(
		params: RouteDetailsParams
	): Promise<RouteDetailsResponse> {
		// Build request payload - API expects numbers for IDs, convert from strings
		const requestPayload: {
			routeid: number;
			servicetypeid?: number;
		} = {
			routeid: parseInt(params.routeId, 10),
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
}
