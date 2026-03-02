/**
 * Constants for transit API defaults and configuration
 */

/**
 * Default device type for API requests
 */
export const DEFAULT_DEVICE_TYPE = "WEB";

/**
 * Default authentication token (when not provided)
 */
export const DEFAULT_AUTH_TOKEN = "N/A";

/**
 * Default base URL for transit API
 */
export const DEFAULT_BASE_URL =
	"https://bmtcmobileapi.karnataka.gov.in/WebAPI";

/**
 * Default coordinates for Bangalore city center
 * Used when coordinates are not provided to findNearbyStops
 */
export const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];
