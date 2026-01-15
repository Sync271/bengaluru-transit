import { z } from "zod";

/**
 * Zod schemas for info/general endpoints
 */

/**
 * Schema for raw helpline data item from BMTC API
 */
export const rawHelplineDataItemSchema = z.object({
	labelname: z.string(),
	busstopname: z.string().nullable(),
	helplinenumber: z.string(),
	responsecode: z.number(),
});

/**
 * Schema for raw helpline API response from BMTC API
 */
export const rawHelplineResponseSchema = z.object({
	data: z.array(rawHelplineDataItemSchema),
	Message: z.string(),
	Issuccess: z.boolean(),
	exception: z.unknown().nullish(),
	RowCount: z.number(),
	responsecode: z.number(),
});
