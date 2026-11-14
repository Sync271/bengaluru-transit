import ky, { type KyInstance } from "ky";
import { validate } from "../utils/validation.js";
import { TransitValidationError } from "../utils/errors.js";
import {
	v2EncodedVehicleSchema,
	v2LiveVehiclesParamsSchema,
	v2LiveVehiclesResponseSchema,
	v2BusLocationParamsSchema,
	v2BusLocationResponseSchema,
	v2NearbySummaryParamsSchema,
	v2NearbySummaryResponseSchema,
	v2NearbyStopsParamsSchema,
	v2NearbyStopsResponseSchema,
	v2ListStopsParamsSchema,
	v2ListStopsResponseSchema,
	v2RouteStopDetailsParamsSchema,
	v2RouteStopDetailsResponseSchema,
	v2OccupancyParamsSchema,
	v2OccupancyResponseSchema,
	v2ListCitiesResponseSchema,
	v2CityMetadataResponseSchema,
	v2ServerTimeResponseSchema,
	v2RemoteConfigParamsSchema,
	v2RemoteConfigResponseSchema,
	v2ValidateFareParamsSchema,
	v2ValidateFareResponseSchema,
	v2RouteDetailsParamsSchema,
	v2RouteDetailsResponseSchema,
	v2RouteDetailsBulkParamsSchema,
	v2RouteDetailsBulkResponseSchema,
	v2SearchParamsSchema,
	v2SearchResponseSchema,
	v2SearchPlacesParamsSchema,
	v2SearchPlacesResponseSchema,
	v2PlaceDetailsParamsSchema,
	v2PlaceDetailsResponseSchema,
	v2ReverseGeocodeParamsSchema,
	v2ReverseGeocodeResponseSchema,
	v2SearchRoutesParamsSchema,
	v2SearchRoutesResponseSchema,
	v2RoutesBetweenStopsParamsSchema,
	v2RoutesBetweenStopsResponseSchema,
	v2StopArrivalsParamsSchema,
	v2StopArrivalsResponseSchema,
	v2StopDetailsParamsSchema,
	v2StopDetailsResponseSchema,
	v2TripPlanParamsSchema,
	v2TripPlanResponseSchema,
} from "../schemas/v2.js";
import type { RequestOptions } from "../types/api.js";
import type {
	BengaluruTransitClientV2Config,
	V2Itinerary,
	V2LiveVehicles,
	V2LiveVehiclesParams,
	V2BusLocationParams,
	V2BusLocation,
	V2NearbySummary,
	V2NearbySummaryParams,
	V2NearbySummaryService,
	V2ListStopsParams,
	V2ListStopsResponse,
	V2RouteStopDetailsParams,
	V2RouteStopDetailsResponse,
	V2NearbyStopsParams,
	V2NearbyStopsResponse,
	V2NearbyVehicle,
	V2Occupancy,
	V2OccupancyLevel,
	V2OccupancyParams,
	V2ListCitiesResponse,
	V2CityMetadata,
	V2ServerTime,
	V2RemoteConfigParams,
	V2RemoteConfig,
	V2ValidateFareParams,
	V2ValidateFareResult,
	V2BulkRouteDetails,
	V2RouteDetails,
	V2RouteDetailsBulkParams,
	V2RouteDetailsBulkResponse,
	V2RouteDetailsParams,
	V2SearchParams,
	V2SearchResponse,
	V2SearchPlacesParams,
	V2SearchPlacesResponse,
	V2PlaceDetailsParams,
	V2PlaceDetails,
	V2ReverseGeocodeParams,
	V2ReverseGeocodeResponse,
	V2SearchRoutesParams,
	V2SearchRoutesResponse,
	V2RoutesBetweenStopsParams,
	V2RoutesBetweenStopsResponse,
	V2Stop,
	V2StopArrival,
	V2StopArrivals,
	V2StopArrivalsParams,
	V2StopDetails,
	V2StopDetailsParams,
	V2TripLeg,
	V2TripPlanParams,
	V2TripPlanResponse,
	V2VehiclePosition,
	V2Weekday,
} from "../types/v2.js";

const DEFAULT_V2_BASE_URL = "https://chalo.com/app/api";
const DEFAULT_CITY = "bengaluru";

type EncodedVehicle = {
	vNo: string;
	eta?: number;
	dist?: number;
	_latitude?: number;
	_longitude?: number;
	bearing?: number;
	_isHalted?: boolean;
	isHalted?: boolean;
	lSId?: string;
	dest?: string;
	rN?: string;
	tS?: number;
};

/**
 * Map a vehicle status number to the icon the transit app shows.
 */
export function occupancyLevel(status: number): V2OccupancyLevel {
	if (status === -1) return "hidden";
	if (status === 0 || status === 3) return "seats-available";
	if (status === 1 || status === 4) return "standing-available";
	if (status === 2 || status === 5) return "overcrowded";
	return "unknown";
}

const WEEKDAYS: V2Weekday[] = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

function formatSearchDay(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${day}-${month}-${date.getFullYear()}`;
}

function secondsFromMidnight(date: Date): number {
	return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

function parseEncodedVehicle(raw: string, label: string): EncodedVehicle {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		throw new TransitValidationError(
			`Invalid ${label}`,
			[{ path: label, message: "Vehicle payload is not JSON" }],
			error instanceof Error ? error : undefined
		);
	}

	return validate(v2EncodedVehicleSchema, parsed, `Invalid ${label}`);
}

function toStop(stop: {
	stop_id: string;
	stop_name: string;
	stop_lat: number;
	stop_lon: number;
	short_id?: number;
}): V2Stop {
	return {
		stopId: stop.stop_id,
		name: stop.stop_name,
		latitude: stop.stop_lat,
		longitude: stop.stop_lon,
		...(stop.short_id !== undefined ? { shortId: stop.short_id } : {}),
	};
}

function legTravelTimeSeconds(leg: {
	start_time?: number;
	end_time?: number;
	travel_time?: number;
}): number | undefined {
	if (
		leg.travel_time === 0 &&
		leg.start_time !== undefined &&
		leg.end_time !== undefined &&
		leg.end_time >= leg.start_time
	) {
		return leg.end_time - leg.start_time;
	}

	return leg.travel_time;
}

function toLeg(leg: {
	mode: string;
	route_id?: string;
	route_name?: string;
	agency_name?: string;
	first_stop_id?: string;
	last_stop_id?: string;
	start_time?: number;
	end_time?: number;
	travel_time?: number;
	distance?: number;
	first_stop?: { stop_name?: string };
	last_stop?: { stop_name?: string };
	start_place_name?: string;
	end_place_name?: string;
}): V2TripLeg {
	const travelTimeSeconds = legTravelTimeSeconds(leg);
	return {
		mode: leg.mode,
		...(leg.route_id ? { routeId: leg.route_id } : {}),
		...(leg.route_name ? { routeName: leg.route_name } : {}),
		...(leg.agency_name ? { agencyName: leg.agency_name } : {}),
		...(leg.first_stop_id ? { fromStopId: leg.first_stop_id } : {}),
		...(leg.last_stop_id ? { toStopId: leg.last_stop_id } : {}),
		...(leg.first_stop?.stop_name || leg.start_place_name
			? { fromStopName: leg.first_stop?.stop_name ?? leg.start_place_name }
			: {}),
		...(leg.last_stop?.stop_name || leg.end_place_name
			? { toStopName: leg.last_stop?.stop_name ?? leg.end_place_name }
			: {}),
		...(leg.start_time !== undefined
			? { startTimeSeconds: leg.start_time }
			: {}),
		...(leg.end_time !== undefined ? { endTimeSeconds: leg.end_time } : {}),
		...(travelTimeSeconds !== undefined ? { travelTimeSeconds } : {}),
		...(leg.distance !== undefined ? { distanceMeters: leg.distance } : {}),
	};
}

function toItinerary(itinerary: {
	total_fare?: number;
	time_taken?: number;
	travel_time?: number;
	distance?: number;
	legs?: Parameters<typeof toLeg>[0][];
}): V2Itinerary {
	// v4 uses time_taken; v5 uses travel_time at the itinerary level.
	const durationSeconds = itinerary.time_taken ?? itinerary.travel_time;
	return {
		...(itinerary.total_fare !== undefined
			? { totalFare: itinerary.total_fare }
			: {}),
		...(durationSeconds !== undefined ? { durationSeconds } : {}),
		...(itinerary.distance !== undefined
			? { distanceMeters: itinerary.distance }
			: {}),
		legs: (itinerary.legs ?? []).map(toLeg),
	};
}

function toPosition(id: string, vehicle: EncodedVehicle): V2VehiclePosition {
	return {
		id,
		number: vehicle.vNo,
		...(vehicle._latitude !== undefined ? { latitude: vehicle._latitude } : {}),
		...(vehicle._longitude !== undefined
			? { longitude: vehicle._longitude }
			: {}),
		...(vehicle.bearing !== undefined ? { bearing: vehicle.bearing } : {}),
		halted: vehicle._isHalted ?? vehicle.isHalted ?? false,
		...(vehicle.lSId ? { lastStopId: vehicle.lSId } : {}),
		...(vehicle.tS !== undefined ? { updatedAt: vehicle.tS } : {}),
	};
}

function toArrival(
	stopId: string,
	vehicleId: string,
	vehicle: EncodedVehicle,
	routeId?: string
): V2StopArrival {
	return {
		stopId,
		vehicleId,
		vehicleNumber: vehicle.vNo,
		...(routeId ? { routeId } : {}),
		...(vehicle.rN ? { routeName: vehicle.rN } : {}),
		...(vehicle.eta !== undefined ? { etaSeconds: vehicle.eta } : {}),
		...(vehicle.dist !== undefined ? { distanceMeters: vehicle.dist } : {}),
		...(vehicle.dest ? { destination: vehicle.dest } : {}),
		halted: vehicle.isHalted ?? vehicle._isHalted ?? false,
		...(vehicle.tS !== undefined ? { updatedAt: vehicle.tS } : {}),
	};
}

/**
 * Client for the current Bengaluru transit app API.
 *
 * Route ids and headers are not interchangeable with BengaluruTransitClient.
 */
export class BengaluruTransitClientV2 {
	private readonly client: KyInstance;
	private readonly baseURL: string;
	private readonly city: string;

	constructor(config: BengaluruTransitClientV2Config = {}) {
		this.baseURL = config.baseURL || DEFAULT_V2_BASE_URL;
		this.city = (config.city || DEFAULT_CITY).toLowerCase();

		this.client = ky.create({
			prefixUrl: this.baseURL,
			timeout: config.timeout,
			retry: {
				limit: 2,
				methods: ["get"],
				statusCodes: [408, 413, 429, 500, 502, 503, 504],
			},
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				source: "1",
				...config.headers,
			},
			hooks: {
				beforeError: [
					async (error) => {
						let errorMessage = error.message || "Request failed";
						try {
							const errorBody = (await error.response?.json()) as
								| { message?: string; errorMessage?: string }
								| undefined;
							if (errorBody?.errorMessage) {
								errorMessage = errorBody.errorMessage;
							} else if (errorBody?.message) {
								errorMessage = errorBody.message;
							}
						} catch {
							// Ignore JSON parse errors.
						}
						error.message = errorMessage;
						return error;
					},
				],
			},
		});
	}

	/**
	 * Get the underlying ky client instance.
	 */
	getClient(): KyInstance {
		return this.client;
	}

	/**
	 * Get the base URL.
	 */
	getBaseURL(): string {
		return this.baseURL;
	}

	/**
	 * Get the city path segment.
	 */
	getCity(): string {
		return this.city;
	}

	/**
	 * Search for routes, stops, and places.
	 */
	async search(params: V2SearchParams): Promise<V2SearchResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2SearchParamsSchema,
			{
				...rest,
				day: rest.day ?? formatSearchDay(new Date()),
			},
			"Invalid search parameters"
		);

		const searchParams = new URLSearchParams({
			day: validated.day,
			station_type: "transit",
			location: JSON.stringify({
				lat: validated.coordinates[0],
				lon: validated.coordinates[1],
			}),
			str: validated.query,
		});
		if (validated.filter) {
			searchParams.set("serachFilter", validated.filter);
		}

		const response = await this.client.get(
			`scheduler_v4/v5/${this.city}/search`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2SearchResponseSchema,
			await response.json<unknown>(),
			"Invalid search response"
		);

		const hits = [...raw.data.routes, ...raw.data.stopsAndPlaces];
		const routes: V2SearchResponse["routes"] = [];
		const stops: V2SearchResponse["stops"] = [];
		const places: V2SearchResponse["places"] = [];

		for (const hit of hits) {
			if (hit.result_type === "ROUTE" && hit.route_id && hit.route_name) {
				routes.push({
					routeId: hit.route_id,
					routeName: hit.route_name,
					agencyName: hit.agency_name ?? "",
					firstStopName: hit.first_stop_name ?? "",
					lastStopName: hit.last_stop_name ?? "",
					directionStopName: hit.direction_stop_name ?? "",
					serviceTypes: hit.spf ?? [],
					ticketEnabled: hit.mTicketEnabled ?? false,
				});
			} else if (
				hit.result_type === "STOP" &&
				hit.stop_id &&
				hit.stop_name &&
				hit.stop_lat !== undefined &&
				hit.stop_lon !== undefined
			) {
				stops.push({
					stopId: hit.stop_id,
					name: hit.stop_name,
					latitude: hit.stop_lat,
					longitude: hit.stop_lon,
					stationType: hit.station_type ?? "",
				});
			} else if (hit.result_type === "PLACE" && hit.place_id && hit.description) {
				places.push({
					placeId: hit.place_id,
					description: hit.description,
				});
			}
		}

		return { routes, stops, places };
	}

	/**
	 * Autocomplete places with coordinates (`GET scheduler_v4/v5/search/place`).
	 * Distinct from {@link search}, which can return place descriptions without lat/lon.
	 * Use `searchPartner` + `placeId` with place details when you need a follow-up lookup.
	 */
	async searchPlaces(
		params: V2SearchPlacesParams
	): Promise<V2SearchPlacesResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2SearchPlacesParamsSchema,
			rest,
			"Invalid place search parameters"
		);

		const searchParams = new URLSearchParams({
			searchSource: validated.searchSource,
			str: validated.query,
			meta: this.placeClientMeta(),
		});
		if (validated.coordinates) {
			searchParams.set(
				"location",
				JSON.stringify({
					lat: validated.coordinates[0],
					lon: validated.coordinates[1],
				})
			);
		}

		const response = await this.client.get("scheduler_v4/v5/search/place", {
			searchParams,
			headers: { countryId: validated.countryId },
			signal,
		});
		const raw = validate(
			v2SearchPlacesResponseSchema,
			await response.json<unknown>(),
			"Invalid place search response"
		);

		const places = raw.data.stopsAndPlaces.flatMap((hit) => {
			if (
				hit.result_type !== "PLACE" ||
				!hit.place_id ||
				!hit.description ||
				!hit.searchPartner ||
				hit.location?.lat === undefined ||
				hit.location?.lng === undefined
			) {
				return [];
			}
			return [
				{
					placeId: hit.place_id,
					description: hit.description,
					latitude: hit.location.lat,
					longitude: hit.location.lng,
					searchPartner: hit.searchPartner,
				},
			];
		});

		return { places };
	}

	/**
	 * Resolve a place id to address and coordinates
	 * (`GET scheduler_v4/v5/place/details`).
	 * Pass `placeId` and `searchPartner` from {@link searchPlaces}.
	 */
	async getPlaceDetails(
		params: V2PlaceDetailsParams
	): Promise<V2PlaceDetails> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2PlaceDetailsParamsSchema,
			rest,
			"Invalid place details parameters"
		);

		const searchParams = new URLSearchParams({
			placeid: validated.placeId,
			searchPartner: validated.searchPartner,
			meta: this.placeClientMeta(),
		});
		const response = await this.client.get("scheduler_v4/v5/place/details", {
			searchParams,
			signal,
		});
		const raw = validate(
			v2PlaceDetailsResponseSchema,
			await response.json<unknown>(),
			"Invalid place details response"
		);

		return {
			address: raw.result.formatted_address,
			latitude: raw.result.geometry.location.lat,
			longitude: raw.result.geometry.location.lng,
		};
	}

	/**
	 * Resolve coordinates to Chalo city ids (`GET scheduler_v4/geocode/reverse`).
	 * Returns which Chalo cities cover the point — not a street address.
	 */
	async reverseGeocode(
		params: V2ReverseGeocodeParams
	): Promise<V2ReverseGeocodeResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2ReverseGeocodeParamsSchema,
			rest,
			"Invalid reverse geocode parameters"
		);

		const searchParams = new URLSearchParams({
			lat: String(validated.coordinates[0]),
			lon: String(validated.coordinates[1]),
		});
		const response = await this.client.get("scheduler_v4/geocode/reverse", {
			searchParams,
			signal,
		});
		const raw = validate(
			v2ReverseGeocodeResponseSchema,
			await response.json<unknown>(),
			"Invalid reverse geocode response"
		);

		return {
			cities: raw.cities.map((city) => ({
				cityId: city.cityId,
				displayName: city.cityDisplayName,
			})),
		};
	}

	/**
	 * Autocomplete routes by number or name.
	 * Calls `scheduler_v4/v4/{city}/autocomplete/route` with `str`.
	 * A query is required so the client does not download the full catalogue.
	 */
	async searchRoutes(
		params: V2SearchRoutesParams
	): Promise<V2SearchRoutesResponse> {
		const { signal, ...rest } = params;
		const now = new Date();
		const validated = validate(
			v2SearchRoutesParamsSchema,
			{
				...rest,
				day: rest.day ?? WEEKDAYS[now.getDay()],
			},
			"Invalid route search parameters"
		);

		const searchParams = new URLSearchParams({
			day: validated.day,
			str: validated.query,
		});
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/autocomplete/route`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2SearchRoutesResponseSchema,
			await response.json<unknown>(),
			"Invalid route search response"
		);

		return {
			routes: raw.map((route) => ({
				routeId: route.route_id,
				routeName: route.route_name,
				agencyName: route.agency_name ?? "",
				firstStopName: route.first_stop_name ?? "",
				lastStopName: route.last_stop_name ?? "",
				directionStopName: route.direction_stop_name ?? "",
				serviceTypes: route.spf ?? [],
				ticketEnabled: route.mTicketEnabled ?? false,
				passEnabled: route.routePassEnabled ?? false,
				freeRide: route.isFreeRide ?? false,
				transportType: route.transport_type ?? "",
				stationType: route.station_type ?? "",
				...(route.direction ? { direction: route.direction } : {}),
				...(route.total_stops !== undefined
					? { totalStops: route.total_stops }
					: {}),
				...(route.total_stages !== undefined
					? { totalStages: route.total_stages }
					: {}),
			})),
		};
	}

	/**
	 * List direct routes that serve both stops.
	 */
	async getRoutesBetweenStops(
		params: V2RoutesBetweenStopsParams
	): Promise<V2RoutesBetweenStopsResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2RoutesBetweenStopsParamsSchema,
			rest,
			"Invalid routes-between-stops parameters"
		);

		const searchParams = new URLSearchParams({
			fromStopId: validated.fromStopId,
			toStopId: validated.toStopId,
			mTicketEnabled: String(validated.ticketEnabled),
		});
		const response = await this.client.get(
			`scheduler_v4/v5/${this.city}/routesbetweenstops`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2RoutesBetweenStopsResponseSchema,
			await response.json<unknown>(),
			"Invalid routes-between-stops response"
		);

		const toStop = (stop: {
			id: string;
			name: string;
			lat: number;
			lon: number;
		}): V2Stop => ({
			stopId: stop.id,
			name: stop.name,
			latitude: stop.lat,
			longitude: stop.lon,
		});

		return {
			routes: raw.map((route) => ({
				routeId: route.routeId,
				routeName: route.routeName,
				serviceTypes: route.spf ?? [],
				serviceCategory: route.serviceCategory ?? "",
				specialFeatures: route.specialFeatures ?? route.specialFeature ?? [],
				fromStop: toStop(route.fromStop),
				toStop: toStop(route.toStop),
				firstStop: toStop(route.firstStop),
				lastStop: toStop(route.lastStop),
			})),
		};
	}

	/**
	 * Plan a trip between two coordinates (`scheduler_v4/v5/{city}/tripplanner`).
	 */
	async planTrip(params: V2TripPlanParams): Promise<V2TripPlanResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2TripPlanParamsSchema,
			rest,
			"Invalid trip plan parameters"
		);

		const searchParams = new URLSearchParams({
			from_lat: String(validated.fromCoordinates[0]),
			from_lon: String(validated.fromCoordinates[1]),
			to_lat: String(validated.toCoordinates[0]),
			to_lon: String(validated.toCoordinates[1]),
			start_time: String(validated.startTimeSeconds),
			day: validated.day,
			mode: validated.mode,
			station_type: validated.stationType,
			ac: String(validated.includeAc),
			nonac: String(validated.includeNonAc),
			max_walk_distance: String(validated.maxWalkDistanceMeters),
			max_taxi_distance: String(validated.maxTaxiDistanceMeters),
			num_itineraries: String(validated.itineraryCount),
		});

		const response = await this.client.get(
			`scheduler_v4/v5/${this.city}/tripplanner`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2TripPlanResponseSchema,
			await response.json<unknown>(),
			"Invalid trip plan response"
		);

		return {
			itineraries: raw.payload.itineraries.map(toItinerary),
			nearbyItineraries: raw.payload.nearbyItineraries.map(toItinerary),
		};
	}

	/**
	 * Get the stop sequence, trips, timetable, and encoded polyline for a route
	 * (`GET scheduler_v4/v4/{city}/routedetails`).
	 * Prefer this over {@link getRouteDetailsLive}; on Chalo for Bengaluru both
	 * paths currently return the same payload (including polyline).
	 */
	async getRouteDetails(
		params: V2RouteDetailsParams
	): Promise<V2RouteDetails> {
		return this.fetchRouteDetails(
			`scheduler_v4/v4/${this.city}/routedetails`,
			params
		);
	}

	/**
	 * Same shape as {@link getRouteDetails}, via `routedetailslive`.
	 * Kept for callers that specifically need that path.
	 */
	async getRouteDetailsLive(
		params: V2RouteDetailsParams
	): Promise<V2RouteDetails> {
		return this.fetchRouteDetails(
			`scheduler_v4/v4/${this.city}/routedetailslive`,
			params
		);
	}

	private placeClientMeta(): string {
		return JSON.stringify({
			city: this.city,
			osVersion: 35,
			language: "en",
			androidModel: "generic-client",
			androidVersionCode: 1340,
		});
	}

	private async fetchRouteDetails(
		path: string,
		params: V2RouteDetailsParams
	): Promise<V2RouteDetails> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2RouteDetailsParamsSchema,
			rest,
			"Invalid route details parameters"
		);

		const searchParams = new URLSearchParams({
			route_id: validated.routeId,
			day: validated.day,
		});
		const response = await this.client.get(path, { searchParams, signal });
		const raw = validate(
			v2RouteDetailsResponseSchema,
			await response.json<unknown>(),
			"Invalid route details response"
		);

		const timetableSource =
			raw.timeTable.length > 0 ? raw.timeTable : raw.timings;

		return {
			routeId: raw.route.route_id,
			routeName: raw.route.route_name,
			agencyName: raw.route.agency_name,
			...(raw.route.direction ? { direction: raw.route.direction } : {}),
			live: raw.route.isLive === "true",
			ticketEnabled: raw.route.mTicketEnabled ?? false,
			...(raw.route.first_stop ? { firstStop: toStop(raw.route.first_stop) } : {}),
			...(raw.route.last_stop ? { lastStop: toStop(raw.route.last_stop) } : {}),
			stops: raw.route.stopSequenceWithDetails.map(toStop),
			trips: raw.trips.map((trip) => ({
				tripId: trip.trip_id,
				startTimeSeconds: trip.start_time,
				...(trip.end_time !== undefined
					? { endTimeSeconds: trip.end_time }
					: {}),
				...(trip.trip_duration !== undefined
					? { durationSeconds: trip.trip_duration }
					: {}),
				...(trip.agency_name ? { agencyName: trip.agency_name } : {}),
				...(typeof trip.type === "string" && trip.type
					? { serviceType: trip.type }
					: {}),
				frequencyTrip: trip.isFrequencyTrip ?? false,
				extrapolated: trip.extrapolated ?? false,
			})),
			timetable: timetableSource.map((entry) => ({
				startTimeSeconds: entry.start_time,
				frequency: entry.isFrequency ?? false,
				extrapolated: entry.extrapolated ?? false,
			})),
			polyline: raw.route.polyline ?? "",
		};
	}

	/**
	 * Fetch route details for one or more route ids in bulk.
	 * Includes stop sequence, timetable, and encoded polyline.
	 * Pass `versions` to skip routes the client already has at that version.
	 */
	async getRouteDetailsBulk(
		params: V2RouteDetailsBulkParams
	): Promise<V2RouteDetailsBulkResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2RouteDetailsBulkParamsSchema,
			rest,
			"Invalid bulk route details parameters"
		);

		const routeIdsToVersionMap: Record<string, number> = {};
		for (const routeId of validated.routeIds) {
			routeIdsToVersionMap[routeId] = validated.versions?.[routeId] ?? 0;
		}

		const searchParams = new URLSearchParams({
			isBackgroundSync: String(validated.backgroundSync),
		});
		const response = await this.client.post(
			`scheduler_v4/v5/${this.city}/routedetails`,
			{
				searchParams,
				json: { routeIdsToVersionMap },
				signal,
			}
		);
		const raw = validate(
			v2RouteDetailsBulkResponseSchema,
			await response.json<unknown>(),
			"Invalid bulk route details response"
		);

		const routes: V2BulkRouteDetails[] = raw.routes.map((route) => {
			const staticData = route.staticData ?? {};
			const liveData = route.liveData ?? {};
			return {
				routeId: route.routeId,
				routeName: staticData.route_name ?? "",
				agencyName: staticData.agency_name ?? "",
				...(staticData.direction ? { direction: staticData.direction } : {}),
				status: route.status ?? "",
				version: route.version ?? 0,
				ticketEnabled: liveData.mTicketEnabled ?? false,
				passEnabled: liveData.routePassEnabled ?? false,
				freeRide: liveData.isFreeRide ?? false,
				airportRoute: liveData.isAirportRoute ?? false,
				premiumBusRoute: liveData.isPremiumBusRoute ?? false,
				specialFeatures: staticData.specialFeatures ?? [],
				stationType: staticData.stationType ?? "",
				stops: (staticData.stopSequenceWithDetails ?? []).map(toStop),
				timetable: (staticData.timeTable ?? []).map((entry) => ({
					startTimeSeconds: entry.start_time,
					frequency: entry.isFrequency ?? false,
					extrapolated: entry.extrapolated ?? false,
				})),
				polyline: staticData.polyline ?? "",
			};
		});

		return {
			catalogueVersion: raw.version ?? 0,
			routes,
		};
	}

	/**
	 * Find stops near a coordinate.
	 * Distance is returned in metres.
	 */
	async getNearbyStops(
		params: V2NearbyStopsParams
	): Promise<V2NearbyStopsResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2NearbyStopsParamsSchema,
			rest,
			"Invalid nearby stops parameters"
		);

		const searchParams = new URLSearchParams({
			lat: String(validated.coordinates[0]),
			lon: String(validated.coordinates[1]),
			transitMode: validated.transitMode,
		});
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/nearby/stops`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2NearbyStopsResponseSchema,
			await response.json<unknown>(),
			"Invalid nearby stops response"
		);

		return {
			stops: raw.map((stop) => ({
				stop: toStop(stop),
				stationType: stop.station_type ?? "",
				distanceMeters: stop.distance,
			})),
		};
	}

	/**
	 * List all stops in the city for a transit mode.
	 * Bus mode returns the full catalogue (thousands of stops).
	 */
	async listStops(params: V2ListStopsParams = {}): Promise<V2ListStopsResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2ListStopsParamsSchema,
			rest,
			"Invalid list stops parameters"
		);

		const searchParams = new URLSearchParams({
			mode: validated.transitMode,
		});
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/stops/id`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2ListStopsResponseSchema,
			await response.json<unknown>(),
			"Invalid list stops response"
		);

		return {
			stops: raw.map((stop) => {
				const localizedNames = stop.localeMap
					? Object.fromEntries(
							Object.entries(stop.localeMap)
								.map(([locale, value]) => [locale, value.stop_name])
								.filter(
									(entry): entry is [string, string] =>
										typeof entry[1] === "string" && entry[1].length > 0
								)
						)
					: undefined;

				return {
					stopId: stop.stop_id,
					name: stop.stop_name,
					latitude: stop.stop_lat,
					longitude: stop.stop_lon,
					...(stop.short_id !== undefined ? { shortId: stop.short_id } : {}),
					stationType: stop.station_type ?? "",
					transportType: stop.transport_type ?? "",
					...(stop.city ? { city: stop.city } : {}),
					...(stop.stateCode ? { stateCode: stop.stateCode } : {}),
					...(localizedNames && Object.keys(localizedNames).length > 0
						? { localizedNames }
						: {}),
				};
			}),
		};
	}

	/**
	 * Get names, coordinates, and image URLs for stops on a route.
	 * Distinct from {@link getStopDetails}, which returns a stop timetable.
	 */
	async getRouteStopDetails(
		params: V2RouteStopDetailsParams
	): Promise<V2RouteStopDetailsResponse> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2RouteStopDetailsParamsSchema,
			rest,
			"Invalid route stop details parameters"
		);

		const response = await this.client.post(
			`scheduler_v4/v4/${this.city}/stopDetails`,
			{
				json: {
					routeId: validated.routeId,
					stopIds: validated.stopIds,
				},
				signal,
			}
		);
		const raw = validate(
			v2RouteStopDetailsResponseSchema,
			await response.json<unknown>(),
			"Invalid route stop details response"
		);

		return {
			stops: raw.map((stop) => ({
				stopId: stop.stopId,
				name: stop.stopName ?? "",
				latitude: stop.location.lat,
				longitude: stop.location.lon,
				...(stop.description ? { description: stop.description } : {}),
				imageUrls: stop.imageUrlList ?? [],
			})),
		};
	}

	/**
	 * Get the scheduled timetable for a stop from a given time of day.
	 */
	async getStopDetails(
		params: V2StopDetailsParams
	): Promise<V2StopDetails> {
		const { signal, ...rest } = params;
		const now = new Date();
		const validated = validate(
			v2StopDetailsParamsSchema,
			{
				...rest,
				day: rest.day ?? WEEKDAYS[now.getDay()],
				startTimeSeconds: rest.startTimeSeconds ?? secondsFromMidnight(now),
			},
			"Invalid stop details parameters"
		);

		const searchParams = new URLSearchParams({
			stop_id: validated.stopId,
			time: String(validated.startTimeSeconds),
			day: validated.day,
		});
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/stopdetails`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2StopDetailsResponseSchema,
			await response.json<unknown>(),
			"Invalid stop details response"
		);

		return {
			timetable: raw.map((entry) => ({
				tripId: entry.trip.trip_id,
				routeId: entry.trip.route_id,
				routeName: entry.trip.route_name,
				agencyName: entry.trip.agency_name ?? "",
				destinationName:
					entry.trip.last_stop?.stop_name ??
					entry.trip.direction_stop?.stop_name ??
					"",
				...(entry.trip.first_stop?.stop_name
					? { firstStopName: entry.trip.first_stop.stop_name }
					: {}),
				arrivalTimeSeconds: entry.arrival_time,
				frequencyTrip: entry.trip.isFrequencyTrip ?? false,
				extrapolated: entry.trip.extrapolated ?? false,
				serviceTypes: entry.trip.spf ?? [],
			})),
		};
	}

	/**
	 * Get live vehicle positions and stop arrival times for a route.
	 */
	async getLiveVehicles(
		params: V2LiveVehiclesParams
	): Promise<V2LiveVehicles> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2LiveVehiclesParamsSchema,
			rest,
			"Invalid live vehicle parameters"
		);

		const searchParams = new URLSearchParams({
			stopIds: validated.stopIds.join(","),
		});
		const response = await this.client.get(
			`vasudha/track/route-live-info/${this.city}/${validated.routeId}`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2LiveVehiclesResponseSchema,
			await response.json<unknown>(),
			"Invalid live vehicle response"
		);

		const vehicles = Object.entries(raw.routeLiveInfo).map(([id, encoded]) =>
			toPosition(id, parseEncodedVehicle(encoded, `routeLiveInfo.${id}`))
		);
		const arrivals: V2StopArrival[] = [];
		for (const [stopId, vehiclesById] of Object.entries(raw.stopsEta)) {
			for (const [vehicleId, encoded] of Object.entries(vehiclesById)) {
				arrivals.push(
					toArrival(
						stopId,
						vehicleId,
						parseEncodedVehicle(encoded, `stopsEta.${stopId}.${vehicleId}`),
						validated.routeId
					)
				);
			}
		}

		return { vehicles, arrivals };
	}

	/**
	 * Live GPS for one registration number
	 * (`GET vasudha/location/{city}/{agency}/bus/{busNo}`).
	 * Returns `null` when the API has no position for that bus (empty body).
	 */
	async getBusLocation(
		params: V2BusLocationParams
	): Promise<V2BusLocation | null> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2BusLocationParamsSchema,
			rest,
			"Invalid bus location parameters"
		);

		const response = await this.client.get(
			`vasudha/location/${this.city}/${validated.agency}/bus/${encodeURIComponent(validated.busNumber)}`,
			{ signal }
		);
		const text = await response.text();
		if (!text.trim()) {
			return null;
		}

		let json: unknown;
		try {
			json = JSON.parse(text) as unknown;
		} catch {
			throw new TransitValidationError("Invalid bus location response");
		}

		const raw = validate(
			v2BusLocationResponseSchema,
			json,
			"Invalid bus location response"
		);

		const haltState = raw.hS?.hS;
		return {
			busNumber: validated.busNumber,
			agencyName: raw.ag ?? validated.agency,
			latitude: raw.lP.lt,
			longitude: raw.lP.ln,
			...(raw.bearing !== undefined ? { bearing: raw.bearing } : {}),
			...(raw.sp !== undefined ? { speed: raw.sp } : {}),
			...(raw.nS ? { nextStopId: raw.nS } : {}),
			halted: haltState !== undefined && haltState !== "NO_HALT",
			...(raw.lP.tS !== undefined ? { updatedAt: raw.lP.tS } : {}),
			...(raw.md ? { mode: raw.md } : {}),
			...(raw.ct ? { cityId: raw.ct } : {}),
		};
	}

	/**
	 * Get arrival times for stop and route pairs.
	 * Each pair is sent as `stopId:routeId`.
	 */
	async getStopArrivals(
		params: V2StopArrivalsParams
	): Promise<V2StopArrivals> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2StopArrivalsParamsSchema,
			rest,
			"Invalid stop arrival parameters"
		);

		const response = await this.client.post(
			`vasudha/cities/${this.city}/stop-route-eta`,
			{
				json: {
					stopIdRouteIdList: validated.pairs.map(
						(pair) => `${pair.stopId}:${pair.routeId}`
					),
				},
				signal,
			}
		);
		const raw = validate(
			v2StopArrivalsResponseSchema,
			await response.json<unknown>(),
			"Invalid stop arrival response"
		);

		const arrivals: V2StopArrivals["arrivals"] = [];
		for (const [stopRouteKey, vehiclesById] of Object.entries(
			raw.stopRouteEtas
		)) {
			const stopId = stopRouteKey.split(":")[0] ?? stopRouteKey;
			const routeId = stopRouteKey.split(":")[1];
			for (const [vehicleId, encoded] of Object.entries(vehiclesById)) {
				arrivals.push({
					stopRouteKey,
					...toArrival(
						stopId,
						vehicleId,
						parseEncodedVehicle(
							encoded,
							`stopRouteEtas.${stopRouteKey}.${vehicleId}`
						),
						routeId
					),
				});
			}
		}

		return { arrivals };
	}

	/**
	 * Summarize nearby stops and the services scheduled there, with live vehicles when the API has them.
	 * Distinct from {@link getNearbyStops}, which only returns stop locations.
	 */
	async getNearbySummary(
		params: V2NearbySummaryParams
	): Promise<V2NearbySummary> {
		const { signal, ...rest } = params;
		const now = new Date();
		const validated = validate(
			v2NearbySummaryParamsSchema,
			{
				...rest,
				day: rest.day ?? WEEKDAYS[now.getDay()],
				startTimeSeconds: rest.startTimeSeconds ?? secondsFromMidnight(now),
			},
			"Invalid nearby summary parameters"
		);

		const searchParams = new URLSearchParams({
			lat: String(validated.coordinates[0]),
			lon: String(validated.coordinates[1]),
			time: String(validated.startTimeSeconds),
			day: validated.day,
		});
		if (validated.radiusMeters !== undefined) {
			searchParams.set("radius", String(validated.radiusMeters));
		}
		if (validated.cardCount !== undefined) {
			searchParams.set("cards", String(validated.cardCount));
		}
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/summary`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2NearbySummaryResponseSchema,
			await response.json<unknown>(),
			"Invalid nearby summary response"
		);

		const pairs = raw.payload.flatMap((stop) =>
			stop.summary.map((item) => `${stop.stop_id}:${item.trip.route_id}`)
		);
		const liveByPair = new Map<string, V2NearbyVehicle[]>();
		if (pairs.length > 0) {
			const etaResponse = await this.client.post(
				`vasudha/cities/${this.city}/stop-route-eta`,
				{ json: { stopIdRouteIdList: pairs }, signal }
			);
			const eta = validate(
				v2StopArrivalsResponseSchema,
				await etaResponse.json<unknown>(),
				"Invalid nearby summary response"
			);
			for (const [pair, vehiclesById] of Object.entries(eta.stopRouteEtas)) {
				const vehicles: V2NearbyVehicle[] = [];
				for (const [id, encoded] of Object.entries(vehiclesById)) {
					const vehicle = parseEncodedVehicle(encoded, `stopRouteEtas.${pair}.${id}`);
					vehicles.push({
						id,
						number: vehicle.vNo,
						...(vehicle.eta !== undefined ? { etaSeconds: vehicle.eta } : {}),
						...(vehicle.dist !== undefined
							? { distanceMeters: vehicle.dist }
							: {}),
						halted: vehicle.isHalted ?? vehicle._isHalted ?? false,
					});
				}
				liveByPair.set(pair, vehicles);
			}
		}

		return {
			stops: raw.payload.map((stop) => ({
				stop: toStop(stop.stop),
				...(stop.distance !== undefined
					? { distanceKilometers: stop.distance }
					: {}),
				agencyName: stop.agency_name ?? "",
				services: stop.summary.map((item): V2NearbySummaryService => ({
					routeId: item.trip.route_id,
					routeName: item.trip.route_name,
					tripId: item.trip.trip_id,
					agencyName: item.trip.agency_name ?? stop.agency_name ?? "",
					destinationName: item.trip.last_stop?.stop_name ?? "",
					...(item.arrival_time !== undefined
						? { arrivalTimeSeconds: item.arrival_time }
						: {}),
					vehicles:
						liveByPair.get(`${stop.stop_id}:${item.trip.route_id}`) ?? [],
				})),
			})),
		};
	}

	/**
	 * List cities supported by the Chalo scheduler (`GET scheduler_v4/cityList`).
	 * Boundary polygons are omitted; use `cityId` (lowercased) as the client city.
	 */
	async listCities(options: RequestOptions = {}): Promise<V2ListCitiesResponse> {
		const response = await this.client.get("scheduler_v4/cityList", {
			signal: options.signal,
		});
		const raw = validate(
			v2ListCitiesResponseSchema,
			await response.json<unknown>(),
			"Invalid city list response"
		);

		return {
			cities: raw.data.map((city) => ({
				cityId: city.cityId.toLowerCase(),
				displayName: city.cityDisplayName,
				beta: city.beta_mode ?? false,
				comingSoon: city.isComingSoon ?? false,
				disabled: city.isDisabled ?? false,
			})),
		};
	}

	/**
	 * Thin city metadata for the configured city
	 * (`GET scheduler_v4/v1/{city}/metadataprops`).
	 * Includes centre, timezone, currency, and mode/agency flags — not polygons
	 * or product catalogues.
	 */
	async getCityMetadata(
		options: RequestOptions = {}
	): Promise<V2CityMetadata> {
		const response = await this.client.get(
			`scheduler_v4/v1/${this.city}/metadataprops`,
			{ signal: options.signal }
		);
		const raw = validate(
			v2CityMetadataResponseSchema,
			await response.json<unknown>(),
			"Invalid city metadata response"
		);
		const city = raw.data[0]!;
		const centre = city.cityCentre;

		return {
			cityId: city.city.toLowerCase(),
			displayName: city.city_display_name,
			timezone: city.tz ?? "",
			countryId: city.countryId ?? "",
			stateCode: city.defaultStateCode ?? "",
			beta: city.beta_mode ?? false,
			operational: city.isOperational ?? false,
			latitude: centre?.lat ?? 0,
			longitude: centre?.lon ?? 0,
			currency: city.currency ?? "",
			currencySymbol: city.currencySymbol ?? "",
			modes: city.modes_map.map((mode) => ({
				mode: mode.mode,
				agencies: mode.agencies.map((agency) => ({
					name: agency.agencyName,
					ticketBooking: agency.ticketBooking ?? false,
					liveDataAvailable: agency.liveDataAvailable ?? false,
					serviceCategories: Object.keys(agency.serviceCategories ?? {}),
				})),
			})),
		};
	}

	/**
	 * Chalo server clock (`GET configuration/chalo-props/v1`).
	 */
	async getServerTime(options: RequestOptions = {}): Promise<V2ServerTime> {
		const response = await this.client.get("configuration/chalo-props/v1", {
			signal: options.signal,
		});
		const raw = validate(
			v2ServerTimeResponseSchema,
			await response.json<unknown>(),
			"Invalid server time response"
		);

		return { timestamp: raw.chaloTime.timeStamp };
	}

	/**
	 * Remote config / feature-flag blob (`GET configuration/rc/v2`).
	 * Returns string values only. Pass `keys` to avoid keeping the full catalogue.
	 */
	async getRemoteConfig(
		params: V2RemoteConfigParams = {}
	): Promise<V2RemoteConfig> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2RemoteConfigParamsSchema,
			rest,
			"Invalid remote config parameters"
		);

		const response = await this.client.get("configuration/rc/v2", { signal });
		const raw = validate(
			v2RemoteConfigResponseSchema,
			await response.json<unknown>(),
			"Invalid remote config response"
		);

		const values: Record<string, string> = {};
		const wanted = validated.keys ? new Set(validated.keys) : null;
		for (const [key, entry] of Object.entries(raw.response.data)) {
			if (wanted && !wanted.has(key)) {
				continue;
			}
			values[key] = entry.v;
		}

		return {
			version: raw.response.metadata.versionNumber ?? "",
			updatedAt: raw.response.metadata.updateTime ?? "",
			values,
		};
	}

	/**
	 * Validate a mobile-ticket fare quote
	 * (`POST mticketing/v2/mobile-ticket/validate-fare`).
	 * `fareRupees` is converted to paise for the API. Returns whether the quote
	 * is still accepted for the given route and stop pair.
	 */
	async validateFare(
		params: V2ValidateFareParams
	): Promise<V2ValidateFareResult> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2ValidateFareParamsSchema,
			rest,
			"Invalid fare validation parameters"
		);

		const farePaise = Math.round(validated.fareRupees * 100);
		const response = await this.client.post(
			"mticketing/v2/mobile-ticket/validate-fare",
			{
				json: {
					city: this.city,
					finalFare: farePaise,
					passengerDetails: [{ id: "adult", count: validated.adultCount }],
					tripDetail: {
						routeId: validated.routeId,
						startStopId: validated.fromStopId,
						endStopId: validated.toStopId,
					},
				},
				signal,
			}
		);
		const raw = validate(
			v2ValidateFareResponseSchema,
			await response.json<unknown>(),
			"Invalid fare validation response"
		);

		return {
			valid: raw.isValid,
			fareRupees: raw.finalFareCalculated ?? validated.fareRupees,
			farePaise: raw.finalFare ?? farePaise,
			passengerCount: raw.totalPassengers ?? validated.adultCount,
		};
	}

	/**
	 * Get occupancy for live vehicles.
	 * `updatedAt` is the `tS` value from the live vehicle payload.
	 */
	async getOccupancy(params: V2OccupancyParams): Promise<V2Occupancy> {
		const { signal, ...rest } = params;
		const validated = validate(
			v2OccupancyParamsSchema,
			rest,
			"Invalid occupancy parameters"
		);

		const response = await this.client.post("seat/availability", {
			json: {
				cityId: this.city,
				mode: 2,
				maxDelay: 15,
				occupancyFactor: 50,
				vehicle: validated.vehicles.map((vehicle) => ({
					number: vehicle.number,
					timeStamp: vehicle.updatedAt,
					routeId: vehicle.routeId,
					stopId: vehicle.stopId,
				})),
			},
			signal,
		});
		const raw = validate(
			v2OccupancyResponseSchema,
			await response.json<unknown>(),
			"Invalid occupancy response"
		);

		return {
			vehicles: raw.vehicle.map((vehicle) => ({
				number: vehicle.number,
				status: vehicle.status,
				level: occupancyLevel(vehicle.status),
			})),
		};
	}
}
