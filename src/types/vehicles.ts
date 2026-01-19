/**
 * Types for vehicle-related API endpoints
 */

import type { z } from "zod";
import type {
	rawSearchVehiclesResponseSchema,
	rawVehicleTripResponseSchema,
} from "../schemas/vehicles";
import type {
	StopFeatureCollection,
	LocationFeatureCollection,
} from "./geojson";

/**
 * Raw vehicle data item from BMTC API
 */
export interface RawVehicleDataItem {
	vehicleid: number;
	vehicleregno: string;
	responsecode: number;
}

/**
 * Raw search vehicles API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawSearchVehiclesResponse = z.infer<
	typeof rawSearchVehiclesResponseSchema
>;

/**
 * Clean, normalized vehicle data item
 */
export interface VehicleDataItem {
	vehicleId: string;
	vehicleRegNo: string;
	responseCode: number;
}

/**
 * Clean, normalized search vehicles response
 */
export interface SearchVehiclesResponse {
	items: VehicleDataItem[];
}

/**
 * Parameters for searching vehicles
 */
export interface SearchVehiclesParams {
	/**
	 * Search query for vehicles (partial match supported)
	 * e.g., "KA57f183" will match "KA57F1831", "KA57F1832", etc.
	 */
	query: string;
}

/**
 * Raw route detail item from VehicleTripDetails API
 */
export interface RawRouteDetailItem {
	rowid: number;
	tripid: number;
	routeno: string;
	routename: string;
	busno: string;
	tripstatus: string;
	tripstatusid: string;
	sourcestation: string;
	destinationstation: string;
	servicetype: string;
	webservicetype: string;
	servicetypeid: number;
	lastupdatedat: string;
	stationname: string;
	stationid: number;
	actual_arrivaltime: string | null;
	etastatus: string;
	etastatusmapview: string;
	latitude: number;
	longitude: number;
	currentstop: string;
	laststop: string;
	weblaststop: string;
	nextstop: string;
	currlatitude: number;
	currlongitude: number;
	sch_arrivaltime: string;
	sch_departuretime: string;
	eta: string;
	actual_arrivaltime1: string | null;
	actual_departudetime: string | null;
	tripstarttime: string;
	tripendtime: string;
	routeid: number;
	vehicleid: number;
	responsecode: number;
	lastreceiveddatetimeflag: number;
	srno: number;
	tripposition: number;
	stopstatus: number;
	stopstatus_distance: number;
	lastetaupdated: string | null;
	minstopstatus_distance: number;
}

/**
 * Raw live location item from VehicleTripDetails API
 */
export interface RawLiveLocationItem {
	latitude: number;
	longitude: number;
	location: string;
	lastrefreshon: string;
	nextstop: string;
	previousstop: string;
	vehicleid: number;
	vehiclenumber: string;
	routeno: string;
	servicetypeid: number;
	servicetype: string;
	heading: number;
	responsecode: number;
	trip_status: number;
	lastreceiveddatetimeflag: number;
}

/**
 * Raw vehicle trip API response from BMTC API
 * Uses Zod inferred type to match schema exactly
 */
export type RawVehicleTripResponse = z.infer<
	typeof rawVehicleTripResponseSchema
>;

/**
 * Clean, normalized vehicle trip response
 */
export interface VehicleTripResponse {
	/**
	 * Route stops as GeoJSON FeatureCollection (Point features for each station)
	 */
	routeStops: StopFeatureCollection;
	/**
	 * Vehicle live location as GeoJSON FeatureCollection (Point feature for current vehicle position)
	 */
	vehicleLocation: LocationFeatureCollection;
}

/**
 * Parameters for getting vehicle trip information
 */
export interface VehicleTripParams {
	/**
	 * Vehicle ID (obtained from searchVehicles, always string for consistency)
	 */
	vehicleId: string;
}
