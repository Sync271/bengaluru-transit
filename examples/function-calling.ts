/**
 * Function Calling Example for AI Agents
 * 
 * This example shows how to use Bengaluru Transit SDK with AI agents that support
 * structured function calling (OpenAI, Anthropic, etc.).
 * 
 * The wrapper is designed to be agent-friendly:
 * - All methods are fully typed
 * - All parameters are validated
 * - All errors are properly typed
 * - All responses are structured and consistent
 */

import { BengaluruTransitClient, TransitError, TransitValidationError } from "bengaluru-transit";
import type { HTTPError } from "ky";

// Initialize transit client
const client = new BengaluruTransitClient({ language: "en" });

/**
 * Example: Plan a trip with error handling
 */
async function planTripExample() {
	try {
		const trip = await client.routes.planTrip({
			fromCoordinates: [13.09784, 77.59167],
			toStopId: "20922",
		});

		console.log(`Found ${trip.routes.length} route options`);
	} catch (error) {
		if (error instanceof TransitValidationError) {
			console.error("Validation error:", error.message);
			console.error("Details:", error.details);
		} else if (error instanceof TransitError) {
			console.error("Transit error:", error.message);
			console.error("Code:", error.code);
		} else if ((error as HTTPError).response) {
			// HTTPError from ky
			const httpError = error as HTTPError;
			console.error("HTTP error:", httpError.message);
			console.error("Status:", httpError.response.status);
		} else {
			console.error("Unknown error:", error);
		}
	}
}

/**
 * Example: Function definitions for AI agents (OpenAI Function Calling format)
 */
export const transitFunctionDefinitions = [
	{
		name: "plan_trip",
		description:
			"Plan a bus trip from one location to another. Supports coordinates [latitude, longitude] or stop IDs.",
		parameters: {
			type: "object",
			properties: {
				fromCoordinates: {
					type: "array",
					items: { type: "number" },
					minItems: 2,
					maxItems: 2,
					description: "Origin coordinates [latitude, longitude]",
				},
				fromStopId: {
					type: "string",
					description: "Origin stop ID (alternative to fromCoordinates)",
				},
				toCoordinates: {
					type: "array",
					items: { type: "number" },
					minItems: 2,
					maxItems: 2,
					description: "Destination coordinates [latitude, longitude]",
				},
				toStopId: {
					type: "string",
					description: "Destination stop ID (alternative to toCoordinates)",
				},
				filterBy: {
					type: "string",
					enum: ["minimum-transfers", "shortest-time"],
					description: "Filter option: minimize transfers or shortest time",
				},
			},
			required: [],
		},
	},
	{
		name: "find_nearby_stops",
		description: "Find bus stops near a location within a specified radius.",
		parameters: {
			type: "object",
			properties: {
				coordinates: {
					type: "array",
					items: { type: "number" },
					minItems: 2,
					maxItems: 2,
					description: "Location coordinates [latitude, longitude]",
				},
				radius: {
					type: "number",
					description: "Search radius in kilometers",
				},
			},
			required: ["coordinates", "radius"],
		},
	},
	{
		name: "search_places",
		description: "Search for places/locations by name (e.g., bus stations, landmarks).",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Place name to search for",
				},
			},
			required: ["query"],
		},
	},
];

/**
 * Example: Function implementations
 * These functions are called when the AI agent requests function execution
 */
export const transitFunctionImplementations: Record<
	string,
	(args: any) => Promise<any>
> = {
	plan_trip: async (args: {
		fromCoordinates?: [number, number];
		fromStopId?: string;
		toCoordinates?: [number, number];
		toStopId?: string;
		filterBy?: "minimum-transfers" | "shortest-time";
	}) => {
		const params: any = {};
		if (args.fromCoordinates) params.fromCoordinates = args.fromCoordinates;
		if (args.fromStopId) params.fromStopId = args.fromStopId;
		if (args.toCoordinates) params.toCoordinates = args.toCoordinates;
		if (args.toStopId) params.toStopId = args.toStopId;
		if (args.filterBy) params.filterBy = args.filterBy;

		const result = await client.routes.planTrip(params);
		return {
			routes: result.routes.map((r) => ({
				duration: r.totalDuration,
				fare: r.totalFare,
				distance: r.totalDistance,
				transfers: r.transferCount,
			})),
		};
	},

	find_nearby_stops: async (args: {
		coordinates: [number, number];
		radius: number;
	}) => {
		const result = await client.stops.findNearbyStops({
			coordinates: args.coordinates,
			radius: args.radius,
		});
		return {
			stops: result.items.map((s) => ({
				name: s.stationName,
				distance: s.distance,
				coordinates: [s.latitude, s.longitude],
			})),
		};
	},

	search_places: async (args: { query: string }) => {
		const result = await client.locations.searchPlaces({ query: args.query });
		return {
			places: result.items.map((p) => ({
				name: p.title,
				address: p.address,
				coordinates: [p.latitude, p.longitude],
			})),
		};
	},
};
