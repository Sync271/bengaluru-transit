import { validate } from "../utils/validation";
import {
	rawAroundBusStopsResponseSchema,
	aroundBusStopsParamsSchema,
	rawNearbyBusStopsResponseSchema,
	nearbyBusStopsParamsSchema,
	rawNearbyStationsResponseSchema,
	nearbyStationsParamsSchema,
} from "../schemas/stops";
import {
	createFacilityFeature,
	createFeatureCollection,
} from "../utils/geojson";
import type { BaseClient } from "../client/base-client";
import type {
	AroundBusStopsResponse,
	RawAroundBusStopsResponse,
	AroundBusStopsParams,
	NearbyStation,
	FacilityTypeGroup,
	NearbyBusStopsResponse,
	RawNearbyBusStopsResponse,
	NearbyBusStopsParams,
	NearbyBusStopItem,
	NearbyStationsResponse,
	RawNearbyStationsResponse,
	NearbyStationsParams,
	NearbyStationItem,
} from "../types/stops";
import { stationTypeToNumber, bmtcCategoryToNumber } from "../types/stops";
import type { FacilityFeature } from "../types/geojson";

/**
 * Transform raw around bus stops API response to clean, normalized format
 */
function transformAroundBusStopsResponse(
	raw: RawAroundBusStopsResponse
): AroundBusStopsResponse {
	const stations: NearbyStation[] = raw.data.map((stationItem) => {
		const facilityTypes: FacilityTypeGroup[] = stationItem.Arounds.map(
			(facilityTypeGroup) => {
				// Convert each facility to GeoJSON Point feature
				const facilityFeatures: FacilityFeature[] = facilityTypeGroup.list.map(
					(facility) =>
						createFacilityFeature(
							[parseFloat(facility.longitude), parseFloat(facility.latitude)], // GeoJSON: [lng, lat]
							{
								facilityName: facility.name,
								facilityType: facilityTypeGroup.type,
								facilityTypeId: facilityTypeGroup.typeid,
								icon: facilityTypeGroup.icon,
								distance: parseFloat(facility.distance),
								stationName: stationItem.stationname,
							}
						)
				);

				return {
					type: facilityTypeGroup.type,
					typeId: facilityTypeGroup.typeid,
					icon: facilityTypeGroup.icon,
					facilities: createFeatureCollection(facilityFeatures),
				};
			}
		);

		return {
			stationName: stationItem.stationname,
			distance: parseFloat(stationItem.distance),
			facilityTypes,
		};
	});

	return {
		stations,
	};
}

/**
 * Transform raw nearby bus stops API response to clean, normalized format
 */
function transformNearbyBusStopsResponse(
	raw: RawNearbyBusStopsResponse
): NearbyBusStopsResponse {
	const items: NearbyBusStopItem[] = raw.data.map((item) => ({
		serialNumber: item.srno,
		routeNo: item.routeno,
		stationId: item.routeid.toString(),
		latitude: item.center_lat,
		longitude: item.center_lon,
		routeTypeId: item.routetypeid,
		stationName: item.routename,
		route: item.route,
	}));

	return {
		items,
	};
}

/**
 * Transform raw nearby stations API response to clean, normalized format
 */
function transformNearbyStationsResponse(
	raw: RawNearbyStationsResponse
): NearbyStationsResponse {
	const items: NearbyStationItem[] = raw.data.map((item) => ({
		rowNumber: item.rowno,
		stationId: item.geofenceid.toString(),
		stationName: item.geofencename,
		latitude: item.center_lat,
		longitude: item.center_lon,
		towards: item.towards,
		distance: item.distance,
		travelTimeMinutes: item.totalminute,
		radius: item.radiuskm,
	}));

	return {
		items,
	};
}

/**
 * Stops/Stations API methods
 */
export class StopsAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Find nearby bus stations with facilities around a location
	 * @param params - Parameters including coordinates [latitude, longitude]
	 * @returns List of nearby stations with facilities as GeoJSON Point features
	 */
	async findNearbyStations(
		params: AroundBusStopsParams
	): Promise<AroundBusStopsResponse> {
		// Validate input parameters
		const [latitude, longitude] = params.coordinates;
		const validatedParams = validate(
			aroundBusStopsParamsSchema,
			{
				latitude,
				longitude,
			},
			"Invalid around bus stops parameters"
		);

		const response = await this.client.getClient().post("AroundBusStops_v2", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawAroundBusStopsResponseSchema,
			data,
			"Invalid around bus stops response"
		);

		// Transform to clean, normalized format
		return transformAroundBusStopsResponse(rawResponse);
	}

	/**
	 * Search bus stops by station name
	 * @param params - Parameters including station name query and optional station type
	 * @returns List of bus stops matching the query
	 * @remarks
	 * The stationType parameter determines the type of stops to search (defaults to "bmtc"):
	 * - "bmtc": BMTC Bus Stops (default)
	 * - "chartered": Chartered Stops
	 * - "metro": Metro Stops
	 * - "ksrtc": KSRTC bus stops
	 */
	async searchBusStops(
		params: NearbyBusStopsParams
	): Promise<NearbyBusStopsResponse> {
		// Convert human-readable stationType to API numeric value (default to "bmtc")
		const stationTypeValue = params.stationType || "bmtc";
		const stationTypeNumber = stationTypeToNumber(stationTypeValue);

		// Validate input parameters
		const validatedParams = validate(
			nearbyBusStopsParamsSchema,
			{
				stationname: params.stationName,
				stationflag: stationTypeNumber,
			},
			"Invalid nearby bus stops parameters"
		);

		const response = await this.client.getClient().post("FindNearByBusStop_v2", {
			json: {
				stationname: validatedParams.stationname,
				stationflag: validatedParams.stationflag,
			},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawNearbyBusStopsResponseSchema,
			data,
			"Invalid nearby bus stops response"
		);

		// Transform to clean, normalized format
		return transformNearbyBusStopsResponse(rawResponse);
	}

	/**
	 * Find nearby stops by location within a radius
	 * @param params - Parameters including coordinates [latitude, longitude], radius, and optional filters
	 * @returns List of nearby stops with distance and travel time information
	 * @remarks
	 * This endpoint returns up to 10 results. Pagination is not supported.
	 * The bmtcCategory parameter filters specific subsets of BMTC stops:
	 * - "airport": Airport bus stops only
	 * - "all": All BMTC stops
	 * Note: bmtcCategory can only be used when stationType is "bmtc"
	 */
	async findNearbyStops(
		params: NearbyStationsParams
	): Promise<NearbyStationsResponse> {
		// Convert human-readable stationType to API numeric value (default to "bmtc")
		let stationTypeNumber: number | undefined;
		if (params.stationType) {
			stationTypeNumber = stationTypeToNumber(params.stationType);
		}

		// Convert human-readable bmtcCategory to API numeric value if provided
		// TypeScript ensures this is only possible when stationType is "bmtc"
		let bmtcCategoryNumber: number | undefined;
		if ("bmtcCategory" in params && params.bmtcCategory) {
			bmtcCategoryNumber = bmtcCategoryToNumber(params.bmtcCategory);
		}

		// Build request payload
		const [latitude, longitude] = params.coordinates;
		const requestPayload: {
			latitude: number;
			longitude: number;
			radiuskm: number;
			stationflag?: number;
			flexiflag?: number;
		} = {
			latitude,
			longitude,
			radiuskm: params.radius,
		};

		// Add optional parameters if provided
		if (stationTypeNumber !== undefined) {
			requestPayload.stationflag = stationTypeNumber;
		}
		if (bmtcCategoryNumber !== undefined) {
			requestPayload.flexiflag = bmtcCategoryNumber;
		}

		// Validate input parameters
		const validatedParams = validate(
			nearbyStationsParamsSchema,
			requestPayload,
			"Invalid nearby stations parameters"
		);

		const response = await this.client.getClient().post("NearbyStations_v2", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawNearbyStationsResponseSchema,
			data,
			"Invalid nearby stations response"
		);

		// Transform to clean, normalized format
		return transformNearbyStationsResponse(rawResponse);
	}
}
