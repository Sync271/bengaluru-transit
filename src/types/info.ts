/**
 * Types for general/info API endpoints
 */

import type { z } from "zod";
import type {
	rawHelplineResponseSchema,
	rawFareScrollMessagesResponseSchema,
} from "../schemas/info";

/**
 * Raw helpline data item from BMTC API
 */
export interface RawHelplineDataItem {
	labelname: string;
	busstopname: string | null;
	helplinenumber: string;
	responsecode: number;
}

/**
 * Raw helpline API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawHelplineResponse = z.infer<typeof rawHelplineResponseSchema>;

/**
 * Clean, normalized helpline data item
 */
export interface HelplineDataItem {
	labelName: string;
	busStopName: string | null;
	helplineNumber: string;
}

/**
 * Clean, normalized helpline response
 */
export interface HelplineResponse {
	items: HelplineDataItem[];
}

/**
 * Raw service type data item from BMTC API
 */
export interface RawServiceTypeDataItem {
	servicetype: string;
	servicetypeid: number;
	responsecode: number;
}

/**
 * Clean, normalized service type data item
 */
export interface ServiceTypeDataItem {
	serviceType: string;
	serviceTypeId: string;
}

/**
 * Clean, normalized service types response
 */
export interface ServiceTypesResponse {
	items: ServiceTypeDataItem[];
}

/**
 * Raw about data item from BMTC API
 */
export interface RawAboutDataItem {
	termsandconditionsurl: string;
	aboutbmtcurl: string;
	aboutdeveloperurl: string;
	airportlattitude: number;
	airportlongitude: number;
	airportstationid: number;
	airportstationname: string;
	responsecode: number;
}

/**
 * Clean, normalized about data item
 */
export interface AboutDataItem {
	termsAndConditionsUrl: string;
	aboutBmtcUrl: string;
	aboutDeveloperUrl: string;
	airportLatitude: number;
	airportLongitude: number;
	airportStationId: string;
	airportStationName: string;
}

/**
 * Clean, normalized about data response
 */
export interface AboutDataResponse {
	item: AboutDataItem;
}

/**
 * Raw emergency message data item from BMTC API
 */
export interface RawEmergencyMessageDataItem {
	id: number;
	message_english: string;
	message_kannada: string;
	isdisplay: number;
	display_key: string;
}

/**
 * Clean, normalized emergency message data item
 */
export interface EmergencyMessageDataItem {
	id: string;
	messageEnglish: string;
	messageKannada: string;
	isDisplay: boolean;
	displayKey: string;
}

/**
 * Clean, normalized emergency messages response
 */
export interface EmergencyMessagesResponse {
	items: EmergencyMessageDataItem[];
}

/**
 * Raw fare scroll messages API response from BMTC API (for validation)
 * Uses Zod inferred type to match schema exactly
 */
export type RawFareScrollMessagesResponse = z.infer<
	typeof rawFareScrollMessagesResponseSchema
>;

/**
 * Clean, normalized fare scroll message data item
 */
export interface FareScrollMessageDataItem {
	id: string;
	messageEnglish: string;
	messageKannada: string;
	isDisplay: boolean;
	displayKey: string;
}

/**
 * Clean, normalized fare scroll messages response
 */
export interface FareScrollMessagesResponse {
	items: FareScrollMessageDataItem[];
}
