import { z } from "zod";

/**
 * Zod schemas for vehicle-related endpoints
 */

/**
 * Schema for raw vehicle data item from BMTC API
 */
export const rawVehicleDataItemSchema = z.object({
	vehicleid: z.number(),
	vehicleregno: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw search vehicles API response from BMTC API
 */
export const rawSearchVehiclesResponseSchema = z.object({
	data: z.array(rawVehicleDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for search vehicles request parameters
 */
export const searchVehiclesParamsSchema = z.object({
	vehicleregno: z.string().min(1, "Vehicle registration number is required"),
});

/**
 * Schema for raw route detail item from VehicleTripDetails API
 */
export const rawRouteDetailItemSchema = z.object({
	rowid: z.number(),
	tripid: z.number(),
	routeno: z.string().nullable(),
	routename: z.string().nullable(),
	busno: z.string().nullable(),
	tripstatus: z.string().nullable(),
	tripstatusid: z.string().nullable(),
	sourcestation: z.string().nullable(),
	destinationstation: z.string().nullable(),
	servicetype: z.string().nullable(),
	webservicetype: z.string().nullable(),
	servicetypeid: z.number(),
	lastupdatedat: z.string(),
	stationname: z.string().nullable(),
	stationid: z.number(),
	actual_arrivaltime: z.string().nullable(),
	etastatus: z.string().nullable(),
	etastatusmapview: z.string().nullable(),
	latitude: z.number(),
	longitude: z.number(),
	currentstop: z.string().nullable(),
	laststop: z.string().nullable(),
	weblaststop: z.string().nullable(),
	nextstop: z.string().nullable(),
	currlatitude: z.number(),
	currlongitude: z.number(),
	sch_arrivaltime: z.string().nullable(),
	sch_departuretime: z.string().nullable(),
	eta: z.string().nullable(),
	actual_arrivaltime1: z.string().nullable(),
	actual_departudetime: z.string().nullable(),
	tripstarttime: z.string().nullable(),
	tripendtime: z.string().nullable(),
	routeid: z.number(),
	vehicleid: z.number(),
	responsecode: z.number(),
	lastreceiveddatetimeflag: z.number(),
	srno: z.number(),
	tripposition: z.number(),
	stopstatus: z.number(),
	stopstatus_distance: z.number(),
	lastetaupdated: z.string().nullable(),
	minstopstatus_distance: z.number(),
});

/**
 * Schema for raw live location item from VehicleTripDetails API
 */
export const rawLiveLocationItemSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
	location: z.string().nullable(),
	lastrefreshon: z.string(),
	nextstop: z.string().nullable(),
	previousstop: z.string().nullable(),
	vehicleid: z.number(),
	vehiclenumber: z.string(),
	routeno: z.string().nullable(),
	servicetypeid: z.number(),
	servicetype: z.string().nullable(),
	heading: z.number(),
	responsecode: z.number(),
	trip_status: z.number(),
	lastreceiveddatetimeflag: z.number(),
});

/**
 * Schema for raw vehicle trip API response from BMTC API
 */
export const rawVehicleTripResponseSchema = z.object({
	RouteDetails: z.array(rawRouteDetailItemSchema),
	LiveLocation: z.array(rawLiveLocationItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for vehicle trip request parameters
 */
export const vehicleTripParamsSchema = z.object({
	vehicleId: z.number().int().positive("Vehicle ID must be a positive integer"),
});
