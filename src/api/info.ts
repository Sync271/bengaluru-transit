import { validate } from "../utils/validation";
import {
	rawHelplineResponseSchema,
	rawServiceTypesResponseSchema,
	rawAboutDataResponseSchema,
	rawEmergencyMessagesResponseSchema,
	rawFareScrollMessagesResponseSchema,
} from "../schemas/info";
import type { BaseClient } from "../client/base-client";
import type {
	HelplineResponse,
	HelplineDataItem,
	RawHelplineResponse,
	ServiceTypesResponse,
	ServiceTypeDataItem,
	AboutDataResponse,
	EmergencyMessagesResponse,
	EmergencyMessageDataItem,
	FareScrollMessagesResponse,
	RawFareScrollMessagesResponse,
	FareScrollMessageDataItem,
} from "../types/info";
import type { z } from "zod";

type RawServiceTypesResponse = z.infer<typeof rawServiceTypesResponseSchema>;
type RawAboutDataResponse = z.infer<typeof rawAboutDataResponseSchema>;
type RawEmergencyMessagesResponse = z.infer<
	typeof rawEmergencyMessagesResponseSchema
>;

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
				serviceTypeId: item.servicetypeid.toString(),
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
			airportStationId: item.airportstationid.toString(),
			airportStationName: item.airportstationname,
			responseCode: item.responsecode,
		},
		message: raw.Message,
		success: raw.Issuccess,
	};
}

/**
 * Transform raw emergency messages API response to clean, normalized format
 */
function transformEmergencyMessagesResponse(
	raw: RawEmergencyMessagesResponse
): EmergencyMessagesResponse {
	return {
		items: raw.data.map(
			(item): EmergencyMessageDataItem => ({
				id: item.id.toString(),
				messageEnglish: item.message_english,
				messageKannada: item.message_kannada,
				isDisplay: item.isdisplay === 1,
				displayKey: item.display_key,
			})
		),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Transform raw fare scroll messages API response to clean, normalized format
 */
function transformFareScrollMessagesResponse(
	raw: RawFareScrollMessagesResponse
): FareScrollMessagesResponse {
	return {
		items: raw.data.map(
			(item): FareScrollMessageDataItem => ({
				id: item.id.toString(),
				messageEnglish: item.message_english,
				messageKannada: item.message_kannada,
				isDisplay: item.isdisplay === 1,
				displayKey: item.display_key,
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
	 * Get BMTC helpline information
	 * @returns Helpline information including contact numbers in normalized format
	 */
	async getHelpline(): Promise<HelplineResponse> {
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
	 * Get service types (e.g., AC, Non AC/Ordinary)
	 * @returns List of available service types in normalized format
	 */
	async getServiceTypes(): Promise<ServiceTypesResponse> {
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
	 * Get about information including URLs and airport information
	 * @returns About data with terms, URLs, and airport coordinates in normalized format
	 */
	async getAbout(): Promise<AboutDataResponse> {
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

	/**
	 * Get emergency messages (English and Kannada)
	 * @returns List of emergency messages with display settings in normalized format
	 */
	async getEmergencyMessages(): Promise<EmergencyMessagesResponse> {
		const response = await this.client
			.getClient()
			.post("GetEmergencyMessage_v1", {
				json: {},
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawEmergencyMessagesResponseSchema,
			data,
			"Invalid emergency messages response"
		);

		// Transform to clean, normalized format
		return transformEmergencyMessagesResponse(rawResponse);
	}

	/**
	 * Get fare scroll messages (English and Kannada)
	 * @returns List of fare scroll messages with display settings in normalized format
	 */
	async getFareScrollMessages(): Promise<FareScrollMessagesResponse> {
		const response = await this.client
			.getClient()
			.post("GetFareScrollMessage", {
				json: {},
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawFareScrollMessagesResponseSchema,
			data,
			"Invalid fare scroll messages response"
		);

		// Transform to clean, normalized format
		return transformFareScrollMessagesResponse(rawResponse);
	}
}
