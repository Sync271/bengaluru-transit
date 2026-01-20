import { z } from "zod";

/**
 * Zod schemas for route-related endpoints
 */

/**
 * Schema for route direction parameter (normalized input/output)
 * Converts to lowercase and validates enum
 */
export const routeDirectionSchema = z
	.string()
	.transform((val) => val.toLowerCase())
	.pipe(z.enum(["up", "down"], { message: "Route direction must be 'up' or 'down'" }));

/**
 * Schema for raw route between stations item from GetFareRoutes API
 */
export const rawRouteBetweenStationsItemSchema = z.object({
	id: z.number(),
	fromstationid: z.number(),
	source_code: z.string(),
	from_displayname: z.string(),
	tostationid: z.number(),
	destination_code: z.string(),
	to_displayname: z.string(),
	fromdistance: z.number(),
	todistance: z.number(),
	routeid: z.number(),
	routeno: z.string(),
	routename: z.string(),
	route_direction: z.string(), // Raw API returns string, we normalize in transformation
	fromstationname: z.string(),
	tostationname: z.string(),
});

/**
 * Schema for raw routes between stations API response from BMTC API
 */
export const rawRoutesBetweenStationsResponseSchema = z.object({
	data: z.array(rawRouteBetweenStationsItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.string().nullable(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for routes between stops request parameters
 */
export const routesBetweenStopsParamsSchema = z.object({
	fromStationId: z.number().int().positive(), // API uses "station" in field names
	toStationId: z.number().int().positive(), // API uses "station" in field names
});

/**
 * Schema for raw route point data item from BMTC API
 */
export const rawRoutePointItemSchema = z.object({
	latitude: z.string(),
	longitude: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw route points API response from BMTC API
 */
export const rawRoutePointsResponseSchema = z.object({
	data: z.array(rawRoutePointItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for route points request parameters
 */
export const routePointsParamsSchema = z.object({
	routeid: z.number().int().positive("Route ID must be a positive integer"),
});

/**
 * Schema for raw route search result item from BMTC API
 */
export const rawRouteSearchItemSchema = z.object({
	union_rowno: z.number(),
	row: z.number(),
	routeno: z.string(),
	responsecode: z.number(),
	routeparentid: z.number(),
});

/**
 * Schema for raw route search API response from BMTC API
 */
export const rawRouteSearchResponseSchema = z.object({
	data: z.array(rawRouteSearchItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for route search request parameters
 */
export const routeSearchParamsSchema = z.object({
	routetext: z.string().min(1, "Route text is required"),
});

/**
 * Schema for raw route list item from GetAllRouteList API
 */
export const rawRouteListItemSchema = z.object({
	routeid: z.number(),
	routeno: z.string(),
	routename: z.string(),
	fromstationid: z.number(),
	fromstation: z.string(),
	tostationid: z.number(),
	tostation: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw all routes API response from BMTC API
 */
export const rawAllRoutesResponseSchema = z.object({
	data: z.array(rawRouteListItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw trip detail item from timetable API
 */
export const rawTripDetailItemSchema = z.object({
	starttime: z.string(), // Format: "HH:mm"
	endtime: z.string(), // Format: "HH:mm"
});

/**
 * Schema for raw timetable data item from BMTC API
 */
export const rawTimetableItemSchema = z.object({
	fromstationname: z.string(),
	tostationname: z.string(),
	fromstationid: z.string(), // API returns as string
	tostationid: z.string(), // API returns as string
	apptime: z.string(), // Format: "HH:mm:ss"
	distance: z.string(), // API returns as string
	platformname: z.string(),
	platformnumber: z.string(),
	baynumber: z.string(),
	tripdetails: z.array(rawTripDetailItemSchema),
});

/**
 * Schema for raw timetable API response from BMTC API
 */
export const rawTimetableResponseSchema = z.object({
	data: z.array(rawTimetableItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for timetable request parameters (internal - for API call)
 */
export const timetableRequestSchema = z.object({
	current_date: z.string(), // ISO 8601 format
	routeid: z.number().int().positive("Route ID must be a positive integer"),
	fromStationId: z.string().optional(),
	toStationId: z.string().optional(),
	starttime: z.string(), // Format: "YYYY-MM-DD HH:mm"
	endtime: z.string(), // Format: "YYYY-MM-DD HH:mm"
});

/**
 * Schema for raw vehicle detail item from SearchByRouteDetails_v4 API
 */
export const rawRouteDetailVehicleItemSchema = z.object({
	vehicleid: z.number(),
	vehiclenumber: z.string(),
	servicetypeid: z.number(),
	servicetype: z.string(),
	centerlat: z.number(),
	centerlong: z.number(),
	eta: z.string(),
	sch_arrivaltime: z.string(),
	sch_departuretime: z.string(),
	actual_arrivaltime: z.string(),
	actual_departuretime: z.string(),
	sch_tripstarttime: z.string(),
	sch_tripendtime: z.string(),
	lastlocationid: z.number(),
	currentlocationid: z.number(),
	nextlocationid: z.number(),
	currentstop: z.string().nullable(),
	nextstop: z.string().nullable(),
	laststop: z.string().nullable(),
	stopCoveredStatus: z.number(),
	heading: z.number(),
	lastrefreshon: z.string(),
	lastreceiveddatetimeflag: z.number(),
	tripposition: z.number(),
});

/**
 * Schema for raw station data item from SearchByRouteDetails_v4 API
 */
export const rawRouteDetailStationItemSchema = z.object({
	routeid: z.number(),
	stationid: z.number(),
	stationname: z.string(),
	from: z.string(),
	to: z.string(),
	routeno: z.string(),
	distance_on_station: z.number(),
	centerlat: z.number(),
	centerlong: z.number(),
	responsecode: z.number(),
	isnotify: z.number(),
	vehicleDetails: z.array(rawRouteDetailVehicleItemSchema),
});

/**
 * Schema for raw direction data (up or down) from SearchByRouteDetails_v4 API
 */
export const rawRouteDetailDirectionDataSchema = z.object({
	data: z.array(rawRouteDetailStationItemSchema),
	mapData: z.array(rawRouteDetailVehicleItemSchema),
});

/**
 * Schema for raw SearchByRouteDetails_v4 API response from BMTC API
 */
export const rawRouteDetailsResponseSchema = z.object({
	up: rawRouteDetailDirectionDataSchema,
	down: rawRouteDetailDirectionDataSchema,
	message: z.string(),
	issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	rowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for route details request parameters
 */
export const routeDetailsParamsSchema = z.object({
	routeid: z.number().int().positive("Parent route ID must be a positive integer"),
	servicetypeid: z.number().int().positive().optional(),
});

/**
 * Schema for raw fare data item from GetMobileFareData_v2 API
 */
export const rawFareDataItemSchema = z.object({
	servicetype: z.string(),
	fare: z.string(),
});

/**
 * Schema for raw fare data response from GetMobileFareData_v2 API
 */
export const rawFareDataResponseSchema = z.object({
	data: z.array(rawFareDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.string().nullable(),
	RowCount: z.number().int().nonnegative(),
	responsecode: z.number().int(),
});

/**
 * Schema for fare data request parameters
 */
export const fareDataParamsSchema = z.object({
	routeno: z.string().min(1, "Route number is required"),
	routeid: z.number().int().positive("Subroute ID must be a positive integer"),
	route_direction: routeDirectionSchema, // Normalize to lowercase "up" | "down" for input
	source_code: z.string().min(1, "Source code is required"),
	destination_code: z.string().min(1, "Destination code is required"),
});

/**
 * Schema for validating duration strings
 * Format: "HH:mm:ss" (e.g., "01:30:45", "00:05:00")
 */
const durationStringSchema = z
	.string()
	.regex(/^\d{2}:\d{2}:\d{2}$/, {
		message: 'Duration must be in format "HH:mm:ss" (e.g., "01:30:45")',
	})
	.refine(
		(durationStr) => {
			const parts = durationStr.split(":").map(Number);
			const [hours, minutes, seconds] = parts;
			// Validate ranges: hours 0-23 (or more for longer durations), minutes 0-59, seconds 0-59
			return minutes < 60 && seconds < 60 && hours >= 0;
		},
		{
			message: "Duration must have valid time components (minutes and seconds < 60)",
		}
	);

/**
 * Schema for raw trip planner path leg from TripPlannerMSMD API
 */
export const rawTripPlannerPathLegSchema = z.object({
	pathSrno: z.number(),
	transferSrNo: z.number(),
	tripId: z.number(),
	routeid: z.number(),
	routeno: z.string(),
	schNo: z.string().nullable(),
	vehicleId: z.number(),
	busNo: z.string().nullable(),
	distance: z.number(),
	duration: durationStringSchema,
	fromStationId: z.number(),
	fromStationName: z.string(),
	toStationId: z.number(),
	toStationName: z.string(),
	etaFromStation: z.string().nullable(),
	etaToStation: z.string().nullable(),
	serviceTypeId: z.number(),
	fromLatitude: z.number(),
	fromLongitude: z.number(),
	toLatitude: z.number(),
	toLongitude: z.number(),
	routeParentId: z.number(),
	totalDuration: durationStringSchema,
	waitingDuration: durationStringSchema.nullable(),
	platformnumber: z.string(),
	baynumber: z.number(),
	devicestatusnameflag: z.string(),
	devicestatusflag: z.number(),
	srno: z.number(),
	approx_fare: z.number(),
	fromstagenumber: z.number(),
	tostagenumber: z.number(),
	minsrno: z.number(),
	maxsrno: z.number(),
	tollfees: z.number(),
	totalStages: z.number().nullable(),
});

/**
 * Schema for raw trip planner response data structure
 */
export const rawTripPlannerDataSchema = z.object({
	directRoutes: z.array(z.array(rawTripPlannerPathLegSchema)),
	transferRoutes: z.array(z.array(rawTripPlannerPathLegSchema)),
});

/**
 * Schema for raw trip planner response from TripPlannerMSMD API
 */
export const rawTripPlannerResponseSchema = z.object({
	data: rawTripPlannerDataSchema,
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.string().nullable(),
	RowCount: z.number().int().nonnegative(),
	responsecode: z.number().int(),
});

/**
 * Schema for validating future datetime strings
 * Format: "YYYY-MM-DD HH:mm"
 */
const futureDateTimeSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
		message: "DateTime must be in format 'YYYY-MM-DD HH:mm'",
	})
	.refine(
		(dateTimeStr) => {
			const dateTime = new Date(dateTimeStr.replace(" ", "T"));
			const now = new Date();
			return dateTime > now;
		},
		{
			message: "DateTime must be in the future",
		}
	)
	.optional();

/**
 * Schema for trip planner request parameters (API format)
 * Note: This validates the final API payload, not the discriminated union input
 */
export const tripPlannerParamsSchema = z
	.object({
		fromStationId: z.number().int().nonnegative().optional(),
		fromLatitude: z.number().min(-90).max(90).optional(),
		fromLongitude: z.number().min(-180).max(180).optional(),
		toStationId: z.number().int().nonnegative().optional(),
		toLatitude: z.number().min(-90).max(90).optional(),
		toLongitude: z.number().min(-180).max(180).optional(),
		serviceTypeId: z.number().int().positive().optional(),
		fromDateTime: futureDateTimeSchema,
		filterBy: z.union([z.literal(1), z.literal(2)]).optional(),
	})
	.refine(
		(data) => {
			// Must have exactly one "from" type
			const hasFromStation = data.fromStationId !== undefined;
			const hasFromLocation =
				data.fromLatitude !== undefined && data.fromLongitude !== undefined;
			if (hasFromStation === hasFromLocation) {
				return false;
			}

			// Must have exactly one "to" type
			const hasToStation = data.toStationId !== undefined;
			const hasToLocation =
				data.toLatitude !== undefined && data.toLongitude !== undefined;
			if (hasToStation === hasToLocation) {
				return false;
			}

			return true;
		},
		{
			message:
				"Must provide exactly one of: (fromStationId) or (fromLatitude, fromLongitude), and exactly one of: (toStationId) or (toLatitude, toLongitude)",
		}
	);

/**
 * Schema for path detail request item
 */
export const pathDetailRequestItemSchema = z.object({
	tripId: z.number().int().positive("Trip ID must be a positive integer"),
	fromStopId: z.number().int().positive("From stop ID must be a positive integer"),
	toStopId: z.number().int().positive("To stop ID must be a positive integer"),
});

/**
 * Schema for path details request parameters (user-facing, uses 'trips')
 */
export const pathDetailsParamsSchema = z.object({
	trips: z
		.array(pathDetailRequestItemSchema)
		.min(1, "At least one trip leg is required"),
});

/**
 * Schema for path detail API request item (internal - for API call, uses station IDs to match API)
 */
export const pathDetailApiRequestItemSchema = z.object({
	tripId: z.number().int().positive("Trip ID must be a positive integer"),
	fromStationId: z.number().int().positive("From station ID must be a positive integer"), // API uses "station"
	toStationId: z.number().int().positive("To station ID must be a positive integer"), // API uses "station"
});

/**
 * Schema for path details API request parameters (API format, uses 'data')
 */
export const pathDetailsApiParamsSchema = z.object({
	data: z
		.array(pathDetailApiRequestItemSchema)
		.min(1, "At least one path detail item is required"),
});

/**
 * Schema for raw path detail item from GetPathDetails API
 */
export const rawPathDetailItemSchema = z.object({
	tripId: z.number(),
	routeId: z.number(),
	routeNo: z.string(),
	stationId: z.number(),
	stationName: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	eta: z.string(),
	sch_arrivaltime: z.string(),
	sch_departuretime: z.string(),
	actual_arrivaltime: z.string(),
	actual_departuretime: z.string(),
	distance: z.number(),
	duration: z.string().nullable(),
	isTransfer: z.boolean(),
});

/**
 * Schema for raw path details response from GetPathDetails API
 */
export const rawPathDetailsResponseSchema = z.object({
	data: z.array(rawPathDetailItemSchema),
	message: z.string(),
	issuccess: z.boolean(),
	exception: z.string().nullable(),
	rowCount: z.number().int().nonnegative(),
	responsecode: z.number().int(),
});

/**
 * Coordinate tuple schema [latitude, longitude]
 */
const coordinateTupleSchema = z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]);

/**
 * Schema for waypoints request parameters
 */
export const waypointsParamsSchema = z.object({
	viaPoints: z
		.array(coordinateTupleSchema)
		.min(2, "At least 2 points required (origin and destination)"),
});

/**
 * Schema for raw waypoints response (array of encoded strings)
 */
export const rawWaypointsResponseSchema = z.array(z.string());

/**
 * Schema for raw timetable by station item from GetTimetableByStation_v4 API
 */
export const rawTimetableByStationItemSchema = z.object({
	routeid: z.number(),
	id: z.number(),
	fromstationid: z.number(),
	tostationid: z.number(),
	f: z.number(),
	t: z.number(),
	routeno: z.string(),
	routename: z.string(),
	fromstationname: z.string(),
	tostationname: z.string(),
	traveltime: z.string(),
	distance: z.number(),
	apptime: z.string(),
	apptimesecs: z.string(),
	starttime: z.string(),
	platformname: z.string().nullable(),
	platformnumber: z.string().nullable(),
	baynumber: z.string().nullable(),
});

/**
 * Schema for raw timetable by station API response from BMTC API
 */
export const rawTimetableByStationResponseSchema = z.object({
	data: z.array(rawTimetableByStationItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.string().nullable(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for timetable by station request parameters (internal - for API call)
 */
export const timetableByStationRequestSchema = z.object({
	fromStationId: z.number().int().positive(),
	toStationId: z.number().int().positive(),
	p_startdate: z.string(),
	p_enddate: z.string(),
	p_isshortesttime: z.number().optional(),
	p_routeid: z.string().optional(),
	p_date: z.string(),
});
