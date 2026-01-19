import { validate } from "../utils/validation";
import {
	rawSearchPlacesResponseSchema,
	searchPlacesParamsSchema,
} from "../schemas/locations";
import type { BaseClient } from "../client/base-client";
import type {
	SearchPlacesResponse,
	RawSearchPlacesResponse,
	SearchPlacesParams,
	PlaceItem,
} from "../types/locations";

/**
 * Transform raw search places API response to clean, normalized format
 */
function transformSearchPlacesResponse(
	raw: RawSearchPlacesResponse
): SearchPlacesResponse {
	const items: PlaceItem[] = raw.data.map((item) => ({
		title: item.title,
		address: item.placename,
		latitude: item.lat,
		longitude: item.lng,
	}));

	return {
		items,
	};
}

/**
 * Locations API methods
 */
export class LocationsAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Search for places by name
	 * @param params - Parameters including search query
	 * @returns List of matching places in normalized format
	 */
	async searchPlaces(
		params: SearchPlacesParams
	): Promise<SearchPlacesResponse> {
		// Validate input parameters - API expects "placename", map from "query"
		const validatedParams = validate(
			searchPlacesParamsSchema,
			{
				placename: params.query,
			},
			"Invalid search places parameters"
		);

		const response = await this.client
			.getClient()
			.post("GetSearchPlaceData", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawSearchPlacesResponseSchema,
			data,
			"Invalid search places response"
		);

		// Transform to clean, normalized format
		return transformSearchPlacesResponse(rawResponse);
	}
}