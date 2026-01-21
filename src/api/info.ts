import { z } from "zod";
import { validate, stringifyId } from "../utils/validation";
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
type RawServiceTypesResponse = z.infer<typeof rawServiceTypesResponseSchema>;
type RawAboutDataResponse = z.infer<typeof rawAboutDataResponseSchema>;
type RawEmergencyMessagesResponse = z.infer<
	typeof rawEmergencyMessagesResponseSchema
>;

/**
 * Transform raw transit API response to clean, normalized format
 */
function transformHelplineResponse(raw: RawHelplineResponse): HelplineResponse {
	return {
		items: raw.data.map(
			(item): HelplineDataItem => ({
				labelName: item.labelname,
				busStopName: item.busstopname,
				helplineNumber: item.helplinenumber,
			})
		),
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
				serviceTypeId: stringifyId(item.servicetypeid),
			})
		),
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
			airportStationId: stringifyId(item.airportstationid),
			airportStationName: item.airportstationname,
		},
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
				id: stringifyId(item.id),
				messageEnglish: item.message_english,
				messageKannada: item.message_kannada,
				isDisplay: item.isdisplay === 1,
				displayKey: item.display_key,
			})
		),
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
				id: stringifyId(item.id),
				messageEnglish: item.message_english,
				messageKannada: item.message_kannada,
				isDisplay: item.isdisplay === 1,
				displayKey: item.display_key,
			})
		),
	};
}

/**
 * Info/General API methods
 */
export class InfoAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Get transit helpline information
	 * @returns Helpline information including contact numbers in normalized format
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const helpline = await client.info.getHelpline();
	 * helpline.items.forEach(item => {
	 *   console.log(`${item.title}: ${item.contactNumber}`);
	 * });
	 * ```
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
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const serviceTypes = await client.info.getServiceTypes();
	 * const acService = serviceTypes.items.find(s => s.serviceTypeName.includes("AC"));
	 * // Use acService.serviceTypeId in planTrip({ serviceTypeId })
	 * ```
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
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const about = await client.info.getAbout();
	 * console.log(`Airport coordinates: [${about.airportLatitude}, ${about.airportLongitude}]`);
	 * console.log(`Terms URL: ${about.termsUrl}`);
	 * ```
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
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const messages = await client.info.getEmergencyMessages();
	 * const activeMessages = messages.items.filter(m => m.isDisplay);
	 * 
	 * activeMessages.forEach(msg => {
	 *   console.log(`${msg.displayKey}: ${msg.messageEn}`);
	 * });
	 * ```
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
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const messages = await client.info.getFareScrollMessages();
	 * messages.items.forEach(msg => {
	 *   if (msg.isDisplay) {
	 *     console.log(`Fare update: ${msg.messageEn}`);
	 *   }
	 * });
	 * ```
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
