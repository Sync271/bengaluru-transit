import { validate } from "../utils/validation";
import {
	rawAroundBusStopsResponseSchema,
	aroundBusStopsParamsSchema,
	rawNearbyBusStopsResponseSchema,
	nearbyBusStopsParamsSchema,
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
} from "../types/stops";
import { stationFlagToNumber } from "../types/stops";
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
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
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
		responseCode: item.responsecode,
		routeTypeId: item.routetypeid,
		stationName: item.routename,
		route: item.route,
	}));

	return {
		items,
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Stops/Stations API methods
 */
export class StopsAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Find nearby bus stations with facilities around a location
	 * @param params - Parameters including latitude and longitude
	 * @returns List of nearby stations with facilities as GeoJSON Point features
	 */
	async findNearbyStations(
		params: AroundBusStopsParams
	): Promise<AroundBusStopsResponse> {
		// Validate input parameters
		const validatedParams = validate(
			aroundBusStopsParamsSchema,
			{
				latitude: params.latitude,
				longitude: params.longitude,
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
	 * @param params - Parameters including station name query and optional station flag
	 * @returns List of bus stops matching the query
	 * @remarks
	 * The stationFlag parameter determines the type of stops to search (defaults to "bmtc"):
	 * - "bmtc": BMTC Bus Stops (default)
	 * - "chartered": Chartered Stops
	 * - "metro": Metro Stops
	 * - "ksrtc": KSRTC bus stops
	 */
	async searchBusStops(
		params: NearbyBusStopsParams
	): Promise<NearbyBusStopsResponse> {
		// Convert human-readable stationFlag to API numeric value (default to "bmtc")
		const stationFlagValue = params.stationFlag || "bmtc";
		const stationFlagNumber = stationFlagToNumber(stationFlagValue);

		// Validate input parameters
		const validatedParams = validate(
			nearbyBusStopsParamsSchema,
			{
				stationname: params.stationName,
				stationflag: stationFlagNumber,
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
}
