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
