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
