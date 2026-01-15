/**
 * Types for general/info API endpoints
 */

import type { z } from "zod";
import type { rawHelplineResponseSchema } from "../schemas/info";

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
	responseCode: number;
}

/**
 * Clean, normalized helpline response
 */
export interface HelplineResponse {
	items: HelplineDataItem[];
	message: string;
	success: boolean;
	rowCount: number;
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
	serviceTypeId: number;
	responseCode: number;
}

/**
 * Clean, normalized service types response
 */
export interface ServiceTypesResponse {
	items: ServiceTypeDataItem[];
	message: string;
	success: boolean;
	rowCount: number;
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
	airportStationId: number;
	airportStationName: string;
	responseCode: number;
}

/**
 * Clean, normalized about data response
 */
export interface AboutDataResponse {
	item: AboutDataItem;
	message: string;
	success: boolean;
}
