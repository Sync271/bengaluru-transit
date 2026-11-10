import ky, { type KyInstance } from "ky";
import { validate } from "../utils/validation";
import { TransitValidationError } from "../utils/errors";
import {
	v2EncodedVehicleSchema,
	v2LiveVehiclesParamsSchema,
	v2LiveVehiclesResponseSchema,
	v2NearbyBusesParamsSchema,
	v2NearbyBusesResponseSchema,
	v2OccupancyParamsSchema,
	v2OccupancyResponseSchema,
	v2RouteDetailsParamsSchema,
	v2RouteDetailsResponseSchema,
	v2SearchParamsSchema,
	v2SearchResponseSchema,
	v2StopArrivalsParamsSchema,
	v2StopArrivalsResponseSchema,
	v2TripPlanParamsSchema,
	v2TripPlanResponseSchema,
} from "../schemas/v2";
import type {
	BengaluruTransitClientV2Config,
	V2Itinerary,
	V2LiveVehicles,
	V2LiveVehiclesParams,
	V2NearbyBuses,
	V2NearbyBusesParams,
	V2NearbyVehicle,
	V2Occupancy,
	V2OccupancyLevel,
	V2OccupancyParams,
	V2RouteDetails,
	V2RouteDetailsParams,
	V2SearchParams,
	V2SearchResponse,
	V2Stop,
	V2StopArrival,
	V2StopArrivals,
	V2StopArrivalsParams,
	V2TripLeg,
	V2TripPlanParams,
	V2TripPlanResponse,
	V2VehiclePosition,
	V2Weekday,
} from "../types/v2";

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
		...(leg.travel_time !== undefined
			? { travelTimeSeconds: leg.travel_time }
			: {}),
		...(leg.distance !== undefined ? { distanceMeters: leg.distance } : {}),
	};
}

function toItinerary(itinerary: {
	total_fare?: number;
	time_taken?: number;
	distance?: number;
	legs?: Parameters<typeof toLeg>[0][];
}): V2Itinerary {
	return {
		...(itinerary.total_fare !== undefined
			? { totalFare: itinerary.total_fare }
			: {}),
		...(itinerary.time_taken !== undefined
			? { durationSeconds: itinerary.time_taken }
			: {}),
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
	 * Plan a trip between two coordinates.
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
			`scheduler_v4/v4/${this.city}/tripplanner`,
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
	 * Get the stop sequence, trips, and timetable for a route.
	 */
	async getRouteDetails(
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
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/routedetailslive`,
			{ searchParams, signal }
		);
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
				...(trip.type ? { serviceType: trip.type } : {}),
				frequencyTrip: trip.isFrequencyTrip ?? false,
				extrapolated: trip.extrapolated ?? false,
			})),
			timetable: timetableSource.map((entry) => ({
				startTimeSeconds: entry.start_time,
				frequency: entry.isFrequency ?? false,
				extrapolated: entry.extrapolated ?? false,
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
	 * List nearby stops and the buses scheduled there, with live vehicles when the API has them.
	 */
	async getNearbyBuses(params: V2NearbyBusesParams): Promise<V2NearbyBuses> {
		const { signal, ...rest } = params;
		const now = new Date();
		const validated = validate(
			v2NearbyBusesParamsSchema,
			{
				...rest,
				day: rest.day ?? WEEKDAYS[now.getDay()],
				startTimeSeconds: rest.startTimeSeconds ?? secondsFromMidnight(now),
			},
			"Invalid nearby buses parameters"
		);

		const searchParams = new URLSearchParams({
			lat: String(validated.coordinates[0]),
			lon: String(validated.coordinates[1]),
			time: String(validated.startTimeSeconds),
			day: validated.day,
		});
		const response = await this.client.get(
			`scheduler_v4/v4/${this.city}/summary`,
			{ searchParams, signal }
		);
		const raw = validate(
			v2NearbyBusesResponseSchema,
			await response.json<unknown>(),
			"Invalid nearby buses response"
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
				"Invalid nearby buses response"
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
				buses: stop.summary.map((item) => ({
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
