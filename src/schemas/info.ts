import { z } from "zod";

/**
 * Zod schemas for info/general endpoints
 */

/**
 * Schema for raw helpline data item from transit API
 */
export const rawHelplineDataItemSchema = z.object({
	labelname: z.string(),
	busstopname: z.string().nullable(),
	helplinenumber: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw helpline API response from transit API
 */
export const rawHelplineResponseSchema = z.object({
	data: z.array(rawHelplineDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw service type data item from BMTC API
 */
export const rawServiceTypeDataItemSchema = z.object({
	servicetype: z.string(),
	servicetypeid: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw service types API response from BMTC API
 */
export const rawServiceTypesResponseSchema = z.object({
	data: z.array(rawServiceTypeDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw about data item from BMTC API
 */
export const rawAboutDataItemSchema = z.object({
	termsandconditionsurl: z.string().url(),
	aboutbmtcurl: z.string().url(),
	aboutdeveloperurl: z.string().url(),
	airportlattitude: z.number(),
	airportlongitude: z.number(),
	airportstationid: z.number(),
	airportstationname: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw about data API response from BMTC API
 */
export const rawAboutDataResponseSchema = z.object({
	data: z.array(rawAboutDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw emergency message data item from BMTC API
 */
export const rawEmergencyMessageDataItemSchema = z.object({
	id: z.number(),
	message_english: z.string(),
	message_kannada: z.string(),
	isdisplay: z.number(),
	display_key: z.string(),
});

/**
 * Schema for raw emergency messages API response from BMTC API
 */
export const rawEmergencyMessagesResponseSchema = z.object({
	data: z.array(rawEmergencyMessageDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});

/**
 * Schema for raw fare scroll message data item from BMTC API
 */
export const rawFareScrollMessageDataItemSchema = z.object({
	id: z.number(),
	message_english: z.string(),
	message_kannada: z.string(),
	isdisplay: z.number(),
	display_key: z.string(),
});

/**
 * Schema for raw fare scroll messages API response from BMTC API
 */
export const rawFareScrollMessagesResponseSchema = z.object({
	data: z.array(rawFareScrollMessageDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});
