import { validate } from "../utils/validation";
import { rawHelplineResponseSchema } from "../schemas/info";
import type { BaseClient } from "../client/base-client";
import type {
	HelplineResponse,
	HelplineDataItem,
	RawHelplineResponse,
} from "../types/info";

/**
 * Transform raw BMTC API response to clean, normalized format
 */
function transformHelplineResponse(raw: RawHelplineResponse): HelplineResponse {
	return {
		items: raw.data.map(
			(item): HelplineDataItem => ({
				labelName: item.labelname,
				busStopName: item.busstopname,
				helplineNumber: item.helplinenumber,
				responseCode: item.responsecode,
			})
		),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Info/General API methods
 */
export class InfoAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Get BMTC helpline data
	 * @returns Helpline information including contact numbers in normalized format
	 */
	async getHelplineData(): Promise<HelplineResponse> {
		const response = await this.client.getClient().post("GetHelplineData", {
			json: {},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawHelplineResponseSchema,
			data,
			"Invalid helpline response"
		);

		// Transform to clean, normalized format
		return transformHelplineResponse(rawResponse);
	}
}
