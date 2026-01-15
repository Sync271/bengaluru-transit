import { validate } from "../utils/validation";
import {
	rawRoutePointsResponseSchema,
	routePointsParamsSchema,
	rawRouteSearchResponseSchema,
	routeSearchParamsSchema,
} from "../schemas/routes";
import { createRouteFeature, createFeatureCollection } from "../utils/geojson";
import type { BaseClient } from "../client/base-client";
import type {
	RoutePointsResponse,
	RawRoutePointsResponse,
	RoutePointsParams,
	RouteSearchResponse,
	RawRouteSearchResponse,
	RouteSearchParams,
	RouteSearchItem,
} from "../types/routes";
import type { RouteFeature } from "../types/geojson";

/**
 * Transform raw route points API response to clean, normalized format
 */
function transformRoutePointsResponse(
	raw: RawRoutePointsResponse,
	routeId: number
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
		routeId: routeId.toString(),
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
		routeParentId: item.routeparentid,
	}));

	return {
		items,
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
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
		// Validate input parameters
		const validatedParams = validate(
			routePointsParamsSchema,
			{ routeid: params.routeId },
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
	async searchRoutes(
		params: RouteSearchParams
	): Promise<RouteSearchResponse> {
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
}
