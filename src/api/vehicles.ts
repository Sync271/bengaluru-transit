import { validate, parseId, stringifyId } from "../utils/validation";
import {
	rawSearchVehiclesResponseSchema,
	searchVehiclesParamsSchema,
	rawVehicleTripResponseSchema,
	vehicleTripParamsSchema,
} from "../schemas/vehicles";
import {
	createStopFeature,
	createLocationFeature,
	createFeatureCollection,
} from "../utils/geojson";
import type { BaseClient } from "../client/base-client";
import type {
	SearchVehiclesResponse,
	VehicleDataItem,
	RawSearchVehiclesResponse,
	SearchVehiclesParams,
	VehicleTripResponse,
	RawVehicleTripResponse,
	VehicleTripParams,
} from "../types/vehicles";

/**
 * Transform raw search vehicles API response to clean, normalized format
 */
function transformSearchVehiclesResponse(
	raw: RawSearchVehiclesResponse
): SearchVehiclesResponse {
	return {
		items: raw.data.map(
			(item): VehicleDataItem => ({
				vehicleId: stringifyId(item.vehicleid),
				vehicleRegNo: item.vehicleregno,
			})
		),
	};
}

/**
 * Transform raw vehicle trip API response to clean, normalized format
 */
function transformVehicleTripResponse(
	raw: RawVehicleTripResponse
): VehicleTripResponse {
	// Create GeoJSON features for route stops (stations along the route)
	const routeStopsFeatures = raw.RouteDetails.map((item) =>
		createStopFeature(
			[item.longitude, item.latitude], // GeoJSON: [lng, lat]
			{
				stopId: stringifyId(item.stationid),
				stopName: item.stationname,
				tripId: stringifyId(item.tripid),
				routeNo: item.routeno,
				routeName: item.routename,
				busNo: item.busno,
				tripStatus: item.tripstatus,
				tripStatusId: item.tripstatusid,
				sourceStation: item.sourcestation,
				destinationStation: item.destinationstation,
				serviceType: item.servicetype,
				serviceTypeId: stringifyId(item.servicetypeid),
				lastUpdatedAt: item.lastupdatedat,
				actualArrivalTime: item.actual_arrivaltime,
				etaStatus: item.etastatus,
				etaStatusMapView: item.etastatusmapview,
				currentStop: item.currentstop,
				lastStop: item.laststop,
				webLastStop: item.weblaststop,
				nextStop: item.nextstop,
				currentLatitude: item.currlatitude,
				currentLongitude: item.currlongitude,
				scheduledArrivalTime: item.sch_arrivaltime,
				scheduledDepartureTime: item.sch_departuretime,
				eta: item.eta,
				actualArrivalTime1: item.actual_arrivaltime1,
				actualDepartureTime: item.actual_departudetime,
				tripStartTime: item.tripstarttime,
				tripEndTime: item.tripendtime,
				routeId: stringifyId(item.routeid),
				vehicleId: stringifyId(item.vehicleid),
				lastReceivedDateTimeFlag: item.lastreceiveddatetimeflag,
				serialNo: item.srno,
				tripPosition: item.tripposition,
				stopStatus: item.stopstatus,
				stopStatusDistance: item.stopstatus_distance,
				lastEtaUpdated: item.lastetaupdated,
				minStopStatusDistance: item.minstopstatus_distance,
			}
		)
	);

	// Create GeoJSON features for vehicle live location
	const vehicleLocationFeatures = raw.LiveLocation.map((item) =>
		createLocationFeature(
			[item.longitude, item.latitude], // GeoJSON: [lng, lat]
			{
				vehicleId: stringifyId(item.vehicleid),
				vehicleNumber: item.vehiclenumber,
				routeNo: item.routeno,
				serviceType: item.servicetype,
				serviceTypeId: stringifyId(item.servicetypeid),
				heading: item.heading,
				location: item.location,
				lastRefreshedOn: item.lastrefreshon,
				nextStop: item.nextstop,
				previousStop: item.previousstop,
				tripStatus: item.trip_status,
				lastReceivedDateTimeFlag: item.lastreceiveddatetimeflag,
			}
		)
	);

	return {
		routeStops: createFeatureCollection(routeStopsFeatures),
		vehicleLocation: createFeatureCollection(vehicleLocationFeatures),
	};
}

/**
 * Vehicles API methods
 */
export class VehiclesAPI {
	constructor(private client: BaseClient) {}

	/**
	 * Search vehicles by query (partial match)
	 * @param params - Search parameters including search query
	 * @param params.query - Vehicle registration number (partial match supported)
	 * @returns List of matching vehicles in normalized format
	 * @throws {TransitValidationError} If query is invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 * @example
	 * ```typescript
	 * const vehicles = await client.vehicles.searchVehicles({ query: "KA57F2403" });
	 * if (vehicles.items.length > 0) {
	 *   const vehicle = vehicles.items[0];
	 *   const trip = await client.vehicles.getVehicleTrip({ vehicleId: vehicle.vehicleId });
	 * }
	 * ```
	 */
	async searchVehicles(
		params: SearchVehiclesParams
	): Promise<SearchVehiclesResponse> {
		// Validate input parameters
		const validatedParams = validate(
			searchVehiclesParamsSchema,
			{ vehicleregno: params.query },
			"Invalid search vehicles parameters"
		);

		const response = await this.client.getClient().post("ListVehicles", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawSearchVehiclesResponseSchema,
			data,
			"Invalid search vehicles response"
		);

		// Transform to clean, normalized format
		return transformSearchVehiclesResponse(rawResponse);
	}

	/**
	 * Get vehicle trip information including route stops and live location
	 * @param params - Parameters including vehicle ID
	 * @param params.vehicleId - Vehicle ID (always string for consistency)
	 * @returns Vehicle trip with route information and live location in normalized GeoJSON format
	 * @example
	 * ```typescript
	 * const trip = await client.vehicles.getVehicleTrip({ vehicleId: "12345" });
	 * 
	 * // Access route stops
	 * trip.routeStops.features.forEach(stop => {
	 *   console.log(`${stop.properties.stopName} - ${stop.properties.eta}`);
	 * });
	 * 
	 * // Access live vehicle location
	 * const location = trip.vehicleLocation.features[0];
	 * console.log(`Vehicle at: [${location.geometry.coordinates}]`);
	 * ```
	 * @throws {TransitValidationError} If vehicleId is invalid or validation fails
	 * @throws {HTTPError} If the API request fails (network error, 4xx, 5xx)
	 */
	async getVehicleTrip(
		params: VehicleTripParams
	): Promise<VehicleTripResponse> {
		// Validate input parameters - API expects number, convert from string
		const validatedParams = validate(
			vehicleTripParamsSchema,
			{ vehicleId: parseId(params.vehicleId) },
			"Invalid vehicle trip parameters"
		);

		const response = await this.client
			.getClient()
			.post("VehicleTripDetails_v2", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawVehicleTripResponseSchema,
			data,
			"Invalid vehicle trip response"
		);

		// Transform to clean, normalized format
		return transformVehicleTripResponse(rawResponse);
	}
}
