import { BaseClient, type BaseClientConfig } from "./base-client";
import { InfoAPI } from "../api/info";
import { VehiclesAPI } from "../api/vehicles";
import { RoutesAPI } from "../api/routes";
import { StopsAPI } from "../api/stops";
import { LocationsAPI } from "../api/locations";

/**
 * Main Bengaluru Transit API client
 * 
 * Provides a type-safe, validated interface to Bengaluru public transit APIs.
 * All responses are normalized and validated using Zod schemas.
 * 
 * **Note**: This is an unofficial SDK. It is not affiliated with, endorsed by, or connected to any official transit authority.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const client = new BengaluruTransitClient({ language: "en" });
 * 
 * // Plan a trip
 * const trip = await client.routes.planTrip({
 *   fromCoordinates: [13.09784, 77.59167],
 *   toStopId: "20922"
 * });
 * 
 * // Find nearby stops
 * const stops = await client.stops.findNearbyStops({
 *   coordinates: [13.09784, 77.59167],
 *   radius: 1
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // With custom configuration
 * const client = new BengaluruTransitClient({
 *   language: "kn", // Kannada
 *   timeout: 10000, // 10 second timeout
 *   baseURL: "https://custom-api.example.com" // Custom base URL
 * });
 * ```
 */
export class BengaluruTransitClient extends BaseClient {
	/**
	 * Info API - General transit information, helpline, service types, emergency messages
	 */
	public readonly info: InfoAPI;

	/**
	 * Vehicles API - Search vehicles and track live bus locations
	 */
	public readonly vehicles: VehiclesAPI;

	/**
	 * Routes API - Trip planning, route search, timetables, fares, route details
	 */
	public readonly routes: RoutesAPI;

	/**
	 * Stops API - Find nearby stops/stations, search stops, get facilities
	 */
	public readonly stops: StopsAPI;

	/**
	 * Locations API - Search for places/locations by name
	 */
	public readonly locations: LocationsAPI;

	/**
	 * Create a new Bengaluru Transit API client
	 * 
	 * @param config - Client configuration options
	 * @param config.language - Language preference: 'en' for English, 'kn' for Kannada (default: 'en')
	 * @param config.baseURL - Base URL for transit API (default: official API URL)
	 * @param config.timeout - Request timeout in milliseconds
	 * @param config.retry - Retry configuration for failed requests
	 * @param config.headers - Additional headers to include in requests
	 * @param config.deviceType - Device type identifier (default: 'WEB')
	 * @param config.authToken - Authentication token (default: 'N/A')
	 * @param config.deviceId - Device identifier
	 * 
	 * @example
	 * ```typescript
	 * // Default configuration
	 * const client = new BengaluruTransitClient();
	 * 
	 * // With language preference
	 * const client = new BengaluruTransitClient({ language: "kn" });
	 * 
	 * // With custom timeout
	 * const client = new BengaluruTransitClient({ timeout: 15000 });
	 * ```
	 */
	constructor(config: BaseClientConfig = {}) {
		super(config);
		this.info = new InfoAPI(this);
		this.vehicles = new VehiclesAPI(this);
		this.routes = new RoutesAPI(this);
		this.stops = new StopsAPI(this);
		this.locations = new LocationsAPI(this);
	}
}
