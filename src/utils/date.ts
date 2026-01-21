/**
 * Date formatting utility functions
 * Centralized date formatting for consistent API payload formatting
 */

/**
 * Format Date to "YYYY-MM-DD HH:mm" format string
 * Used for API datetime parameters (e.g., fromDateTime, starttime, endtime)
 * @param date - Date object to format
 * @returns Formatted string in "YYYY-MM-DD HH:mm" format
 * @example
 * formatDateTime(new Date('2024-01-20T14:30:00Z'))
 * // Returns: "2024-01-20 14:30"
 */
export function formatDateTime(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Format Date to "YYYY-MM-DD" format string
 * Used for API date parameters (e.g., p_date)
 * @param date - Date object to format
 * @returns Formatted string in "YYYY-MM-DD" format
 * @example
 * formatDate(new Date('2024-01-20T14:30:00Z'))
 * // Returns: "2024-01-20"
 */
export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Format Date to ISO 8601 format string
 * Used for API date parameters that require ISO format (e.g., current_date)
 * @param date - Date object to format
 * @returns ISO 8601 formatted string
 * @example
 * formatISODate(new Date('2024-01-20T14:30:00Z'))
 * // Returns: "2024-01-20T14:30:00.000Z"
 */
export function formatISODate(date: Date): string {
	return date.toISOString();
}
