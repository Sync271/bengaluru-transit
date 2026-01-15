import { validate } from "../utils/validation";
import {
	rawAroundBusStopsResponseSchema,
	aroundBusStopsParamsSchema,
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
} from "../types/stops";
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
}
