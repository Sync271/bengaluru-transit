/**
 * Types for vehicle-related API endpoints
 */

import type { z } from "zod";
import type {
	rawListVehiclesResponseSchema,
	rawVehicleTripDetailsResponseSchema,
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
 * Raw list vehicles API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawListVehiclesResponse = z.infer<
	typeof rawListVehiclesResponseSchema
>;

/**
 * Clean, normalized vehicle data item
 */
export interface VehicleDataItem {
	vehicleId: number;
	vehicleRegNo: string;
	responseCode: number;
}

/**
 * Clean, normalized list vehicles response
 */
export interface ListVehiclesResponse {
	items: VehicleDataItem[];
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for listing vehicles
 */
export interface ListVehiclesParams {
	/**
	 * Vehicle registration number (partial match supported)
	 * e.g., "KA57f183" will match "KA57F1831", "KA57F1832", etc.
	 */
	vehicleRegNo: string;
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
 * Raw vehicle trip details API response from BMTC API
 * Uses Zod inferred type to match schema exactly
 */
export type RawVehicleTripDetailsResponse = z.infer<
	typeof rawVehicleTripDetailsResponseSchema
>;

/**
 * Clean, normalized vehicle trip details response
 */
export interface VehicleTripDetailsResponse {
	/**
	 * Route stops as GeoJSON FeatureCollection (Point features for each station)
	 */
	routeStops: StopFeatureCollection;
	/**
	 * Vehicle live location as GeoJSON FeatureCollection (Point feature for current vehicle position)
	 */
	vehicleLocation: LocationFeatureCollection;
	message: string;
	success: boolean;
	rowCount: number;
}

/**
 * Parameters for getting vehicle trip details
 */
export interface VehicleTripDetailsParams {
	/**
	 * Vehicle ID (obtained from listVehicles)
	 */
	vehicleId: number;
}
