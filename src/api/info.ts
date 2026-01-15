import { validate } from "../utils/validation";
import {
	rawHelplineResponseSchema,
	rawServiceTypesResponseSchema,
	rawAboutDataResponseSchema,
} from "../schemas/info";
import type { BaseClient } from "../client/base-client";
import type {
	HelplineResponse,
	HelplineDataItem,
	RawHelplineResponse,
	ServiceTypesResponse,
	ServiceTypeDataItem,
	AboutDataResponse,
} from "../types/info";
import type { z } from "zod";

type RawServiceTypesResponse = z.infer<typeof rawServiceTypesResponseSchema>;
type RawAboutDataResponse = z.infer<typeof rawAboutDataResponseSchema>;

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
 * Transform raw service types API response to clean, normalized format
 */
function transformServiceTypesResponse(
	raw: RawServiceTypesResponse
): ServiceTypesResponse {
	return {
		items: raw.data.map(
			(item): ServiceTypeDataItem => ({
				serviceType: item.servicetype,
				serviceTypeId: item.servicetypeid,
				responseCode: item.responsecode,
			})
		),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Transform raw about data API response to clean, normalized format
 */
function transformAboutDataResponse(
	raw: RawAboutDataResponse
): AboutDataResponse {
	// About data typically has only one item
	const item = raw.data[0];
	return {
		item: {
			termsAndConditionsUrl: item.termsandconditionsurl,
			aboutBmtcUrl: item.aboutbmtcurl,
			aboutDeveloperUrl: item.aboutdeveloperurl,
			airportLatitude: item.airportlattitude,
			airportLongitude: item.airportlongitude,
			airportStationId: item.airportstationid,
			airportStationName: item.airportstationname,
			responseCode: item.responsecode,
		},
		message: raw.Message,
		success: raw.Issuccess,
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

	/**
	 * Get all service types (e.g., AC, Non AC/Ordinary)
	 * @returns List of available service types in normalized format
	 */
	async getAllServiceTypes(): Promise<ServiceTypesResponse> {
		const response = await this.client.getClient().post("GetAllServiceTypes", {
			json: {},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawServiceTypesResponseSchema,
			data,
			"Invalid service types response"
		);

		// Transform to clean, normalized format
		return transformServiceTypesResponse(rawResponse);
	}

	/**
	 * Get about data including URLs and airport information
	 * @returns About data with terms, URLs, and airport coordinates in normalized format
	 */
	async getAboutData(): Promise<AboutDataResponse> {
		const response = await this.client.getClient().post("GetAboutData", {
			json: {},
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawAboutDataResponseSchema,
			data,
			"Invalid about data response"
		);

		// Transform to clean, normalized format
		return transformAboutDataResponse(rawResponse);
	}
}
