import { z } from "zod";

/**
 * Zod schemas for route-related endpoints
 */

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
