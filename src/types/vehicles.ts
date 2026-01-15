/**
 * Types for vehicle-related API endpoints
 */

import type { z } from "zod";
import type { rawListVehiclesResponseSchema } from "../schemas/vehicles";

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
