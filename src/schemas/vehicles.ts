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
 * Schema for raw list vehicles API response from BMTC API
 */
export const rawListVehiclesResponseSchema = z.object({
	data: z.array(rawVehicleDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for list vehicles request parameters
 */
export const listVehiclesParamsSchema = z.object({
	vehicleregno: z.string().min(1, "Vehicle registration number is required"),
});

/**
 * Schema for raw route detail item from VehicleTripDetails API
 */
export const rawRouteDetailItemSchema = z.object({
	rowid: z.number(),
	tripid: z.number(),
	routeno: z.string(),
	routename: z.string(),
	busno: z.string(),
	tripstatus: z.string(),
	tripstatusid: z.string(),
	sourcestation: z.string(),
	destinationstation: z.string(),
	servicetype: z.string(),
	webservicetype: z.string(),
	servicetypeid: z.number(),
	lastupdatedat: z.string(),
	stationname: z.string(),
	stationid: z.number(),
	actual_arrivaltime: z.string().nullable(),
	etastatus: z.string(),
	etastatusmapview: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	currentstop: z.string(),
	laststop: z.string(),
	weblaststop: z.string(),
	nextstop: z.string(),
	currlatitude: z.number(),
	currlongitude: z.number(),
	sch_arrivaltime: z.string(),
	sch_departuretime: z.string(),
	eta: z.string(),
	actual_arrivaltime1: z.string().nullable(),
	actual_departudetime: z.string().nullable(),
	tripstarttime: z.string(),
	tripendtime: z.string(),
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
	location: z.string(),
	lastrefreshon: z.string(),
	nextstop: z.string(),
	previousstop: z.string(),
	vehicleid: z.number(),
	vehiclenumber: z.string(),
	routeno: z.string(),
	servicetypeid: z.number(),
	servicetype: z.string(),
	heading: z.number(),
	responsecode: z.number(),
	trip_status: z.number(),
	lastreceiveddatetimeflag: z.number(),
});

/**
 * Schema for raw vehicle trip details API response from BMTC API
 */
export const rawVehicleTripDetailsResponseSchema = z.object({
	RouteDetails: z.array(rawRouteDetailItemSchema),
	LiveLocation: z.array(rawLiveLocationItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for vehicle trip details request parameters
 */
export const vehicleTripDetailsParamsSchema = z.object({
	vehicleId: z.number().int().positive("Vehicle ID must be a positive integer"),
});
