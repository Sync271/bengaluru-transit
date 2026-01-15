import { validate } from "../utils/validation";
import { rawListVehiclesResponseSchema, listVehiclesParamsSchema } from "../schemas/vehicles";
import type { BaseClient } from "../client/base-client";
import type {
	ListVehiclesResponse,
	VehicleDataItem,
	RawListVehiclesResponse,
	ListVehiclesParams,
} from "../types/vehicles";

/**
 * Transform raw list vehicles API response to clean, normalized format
 */
function transformListVehiclesResponse(
	raw: RawListVehiclesResponse
): ListVehiclesResponse {
	return {
		items: raw.data.map(
			(item): VehicleDataItem => ({
				vehicleId: item.vehicleid,
				vehicleRegNo: item.vehicleregno,
				responseCode: item.responsecode,
			})
		),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Vehicles API methods
 */
export class VehiclesAPI {
	constructor(private client: BaseClient) {}

	/**
	 * List vehicles by registration number (partial match)
	 * @param params - Search parameters including vehicle registration number
	 * @returns List of matching vehicles in normalized format
	 */
	async listVehicles(params: ListVehiclesParams): Promise<ListVehiclesResponse> {
		// Validate input parameters
		const validatedParams = validate(
			listVehiclesParamsSchema,
			{ vehicleregno: params.vehicleRegNo },
			"Invalid list vehicles parameters"
		);

		const response = await this.client.getClient().post("ListVehicles", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawListVehiclesResponseSchema,
			data,
			"Invalid list vehicles response"
		);

		// Transform to clean, normalized format
		return transformListVehiclesResponse(rawResponse);
	}
}
