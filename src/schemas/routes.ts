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
 * Schema for routes between stations request parameters
 */
export const routesBetweenStationsParamsSchema = z.object({
	fromStationId: z.number().int().positive(),
	toStationId: z.number().int().positive(),
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
