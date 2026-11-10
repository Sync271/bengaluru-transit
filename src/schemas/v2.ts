import { z } from "zod";

export const v2WeekdaySchema = z.enum([
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
]);

export const v2CoordinateSchema = z.tuple([
	z.number().gte(-90).lte(90),
	z.number().gte(-180).lte(180),
]);

export const v2SearchParamsSchema = z.object({
	query: z.string().trim().min(1),
	coordinates: v2CoordinateSchema,
	day: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
	filter: z.enum(["stops", "routes"]).optional(),
});

const v2SearchHitSchema = z
	.object({
		result_type: z.string(),
		route_id: z.string().optional(),
		route_name: z.string().optional(),
		agency_name: z.string().optional(),
		first_stop_name: z.string().optional(),
		last_stop_name: z.string().optional(),
		direction_stop_name: z.string().optional(),
		spf: z.array(z.string()).optional(),
		mTicketEnabled: z.boolean().optional(),
		stop_id: z.string().optional(),
		stop_name: z.string().optional(),
		stop_lat: z.number().optional(),
		stop_lon: z.number().optional(),
		station_type: z.string().optional(),
		place_id: z.string().optional(),
		description: z.string().optional(),
	})
	.passthrough();

export const v2SearchResponseSchema = z.object({
	data: z.object({
		routes: z.array(v2SearchHitSchema).optional().default([]),
		stopsAndPlaces: z.array(v2SearchHitSchema).optional().default([]),
	}),
});

const v2LegSchema = z
	.object({
		mode: z.string(),
		route_id: z.string().optional(),
		route_name: z.string().optional(),
		agency_name: z.string().optional(),
		first_stop_id: z.string().optional(),
		last_stop_id: z.string().optional(),
		start_time: z.number().optional(),
		end_time: z.number().optional(),
		travel_time: z.number().optional(),
		distance: z.number().optional(),
		first_stop: z
			.object({
				stop_name: z.string().optional(),
			})
			.passthrough()
			.optional(),
		last_stop: z
			.object({
				stop_name: z.string().optional(),
			})
			.passthrough()
			.optional(),
		start_place_name: z.string().optional(),
		end_place_name: z.string().optional(),
	})
	.passthrough();

const v2ItinerarySchema = z
	.object({
		total_fare: z.number().optional(),
		time_taken: z.number().optional(),
		distance: z.number().optional(),
		legs: z.array(v2LegSchema).optional().default([]),
	})
	.passthrough();

export const v2TripPlanParamsSchema = z.object({
	fromCoordinates: v2CoordinateSchema,
	toCoordinates: v2CoordinateSchema,
	startTimeSeconds: z.number().int().nonnegative(),
	day: v2WeekdaySchema,
	mode: z.string().min(1).default("TRANSIT"),
	stationType: z.string().min(1).default("bus"),
	includeAc: z.boolean().default(true),
	includeNonAc: z.boolean().default(true),
	maxWalkDistanceMeters: z.number().int().positive().default(1000),
	maxTaxiDistanceMeters: z.number().int().positive().default(3000),
	itineraryCount: z.number().int().positive().default(25),
});

export const v2TripPlanResponseSchema = z.object({
	payload: z.object({
		itineraries: z.array(v2ItinerarySchema).optional().default([]),
		nearbyItineraries: z.array(v2ItinerarySchema).optional().default([]),
	}),
});

const v2StopSchema = z
	.object({
		stop_id: z.string(),
		stop_name: z.string(),
		stop_lat: z.number(),
		stop_lon: z.number(),
		short_id: z.number().optional(),
	})
	.passthrough();

const v2ScheduledTripSchema = z
	.object({
		trip_id: z.string(),
		start_time: z.number(),
		end_time: z.number().optional(),
		trip_duration: z.number().optional(),
		agency_name: z.string().optional(),
		type: z.string().optional(),
		isFrequencyTrip: z.boolean().optional(),
		extrapolated: z.boolean().optional(),
	})
	.passthrough();

const v2TimetableSchema = z
	.object({
		start_time: z.number(),
		isFrequency: z.boolean().optional(),
		extrapolated: z.boolean().optional(),
	})
	.passthrough();

export const v2RouteDetailsParamsSchema = z.object({
	routeId: z.string().trim().min(1),
	day: v2WeekdaySchema,
});

export const v2RouteDetailsResponseSchema = z.object({
	route: z
		.object({
			route_id: z.string(),
			route_name: z.string(),
			agency_name: z.string(),
			direction: z.string().optional(),
			isLive: z.string().optional(),
			mTicketEnabled: z.boolean().optional(),
			first_stop: v2StopSchema.optional(),
			last_stop: v2StopSchema.optional(),
			stopSequenceWithDetails: z.array(v2StopSchema).optional().default([]),
		})
		.passthrough(),
	trips: z.array(v2ScheduledTripSchema).optional().default([]),
	timings: z.array(v2TimetableSchema).optional().default([]),
	timeTable: z.array(v2TimetableSchema).optional().default([]),
});

export const v2LiveVehiclesParamsSchema = z.object({
	routeId: z.string().trim().min(1),
	stopIds: z.array(z.string().trim().min(1)).min(1),
});

export const v2EncodedVehicleSchema = z
	.object({
		vNo: z.string(),
		eta: z.number().optional(),
		dist: z.number().optional(),
		_latitude: z.number().optional(),
		_longitude: z.number().optional(),
		bearing: z.number().optional(),
		_isHalted: z.boolean().optional(),
		isHalted: z.boolean().optional(),
		lSId: z.string().optional(),
		dest: z.string().optional(),
		rN: z.string().optional(),
		tS: z.number().optional(),
		ag: z.string().optional(),
	})
	.passthrough();

export const v2LiveVehiclesResponseSchema = z.object({
	routeLiveInfo: z.record(z.string()).optional().default({}),
	stopsEta: z.record(z.record(z.string())).optional().default({}),
});

export const v2StopArrivalsParamsSchema = z.object({
	pairs: z
		.array(
			z.object({
				stopId: z.string().trim().min(1),
				routeId: z.string().trim().min(1),
			})
		)
		.min(1),
});

export const v2StopArrivalsResponseSchema = z.object({
	stopRouteEtas: z.record(z.record(z.string())).optional().default({}),
});

const v2SummaryTripSchema = z
	.object({
		trip: z
			.object({
				trip_id: z.string(),
				route_id: z.string(),
				route_name: z.string(),
				agency_name: z.string().optional(),
				last_stop: z
					.object({
						stop_name: z.string().optional(),
					})
					.passthrough()
					.optional(),
			})
			.passthrough(),
		arrival_time: z.number().optional(),
	})
	.passthrough();

export const v2NearbyBusesParamsSchema = z.object({
	coordinates: v2CoordinateSchema,
	day: v2WeekdaySchema,
	startTimeSeconds: z.number().int().nonnegative(),
});

export const v2NearbyBusesResponseSchema = z.object({
	payload: z.array(
		z
			.object({
				stop_id: z.string(),
				distance: z.number().optional(),
				agency_name: z.string().optional(),
				stop: v2StopSchema,
				summary: z.array(v2SummaryTripSchema).optional().default([]),
			})
			.passthrough()
	),
});

export const v2OccupancyParamsSchema = z.object({
	vehicles: z
		.array(
			z.object({
				number: z.string().trim().min(1),
				updatedAt: z.number(),
				routeId: z.string().trim().min(1),
				stopId: z.string().trim().min(1),
			})
		)
		.min(1),
});

export const v2OccupancyResponseSchema = z.object({
	vehicle: z
		.array(
			z.object({
				number: z.string(),
				status: z.number(),
			})
		)
		.optional()
		.default([]),
	vehicleCount: z.number().optional(),
});
