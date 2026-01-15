import { validate } from "../utils/validation";
import {
	rawListVehiclesResponseSchema,
	listVehiclesParamsSchema,
	rawVehicleTripDetailsResponseSchema,
	vehicleTripDetailsParamsSchema,
} from "../schemas/vehicles";
import {
	createStopFeature,
	createLocationFeature,
	createFeatureCollection,
} from "../utils/geojson";
import type { BaseClient } from "../client/base-client";
import type {
	ListVehiclesResponse,
	VehicleDataItem,
	RawListVehiclesResponse,
	ListVehiclesParams,
	VehicleTripDetailsResponse,
	RawVehicleTripDetailsResponse,
	VehicleTripDetailsParams,
} from "../types/vehicles";

/**
 * Transform raw list vehicles API response to clean, normalized format
 */
function transformListVehiclesResponse(
	raw: RawListVehiclesResponse
): ListVehiclesResponse {
	return {
		items: raw.data.map(
			(item): VehicleDataItem => ({
				vehicleId: item.vehicleid,
				vehicleRegNo: item.vehicleregno,
				responseCode: item.responsecode,
			})
		),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Transform raw vehicle trip details API response to clean, normalized format
 */
function transformVehicleTripDetailsResponse(
	raw: RawVehicleTripDetailsResponse
): VehicleTripDetailsResponse {
	// Create GeoJSON features for route stops (stations along the route)
	const routeStopsFeatures = raw.RouteDetails.map((item) =>
		createStopFeature(
			[item.longitude, item.latitude], // GeoJSON: [lng, lat]
			{
				stopId: item.stationid.toString(),
				stopName: item.stationname,
				stationId: item.stationid,
				tripId: item.tripid,
				routeNo: item.routeno,
				routeName: item.routename,
				busNo: item.busno,
				tripStatus: item.tripstatus,
				tripStatusId: item.tripstatusid,
				sourceStation: item.sourcestation,
				destinationStation: item.destinationstation,
				serviceType: item.servicetype,
				serviceTypeId: item.servicetypeid,
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
				routeId: item.routeid,
				vehicleId: item.vehicleid,
				responseCode: item.responsecode,
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
				busId: item.vehicleid.toString(),
				routeId: item.routeno,
				vehicleId: item.vehicleid,
				vehicleNumber: item.vehiclenumber,
				routeNo: item.routeno,
				serviceType: item.servicetype,
				serviceTypeId: item.servicetypeid,
				heading: item.heading,
				location: item.location,
				lastRefreshedOn: item.lastrefreshon,
				nextStop: item.nextstop,
				previousStop: item.previousstop,
				tripStatus: item.trip_status,
				responseCode: item.responsecode,
				lastReceivedDateTimeFlag: item.lastreceiveddatetimeflag,
			}
		)
	);

	return {
		routeStops: createFeatureCollection(routeStopsFeatures),
		vehicleLocation: createFeatureCollection(vehicleLocationFeatures),
		message: raw.Message,
		success: raw.Issuccess,
		rowCount: raw.RowCount,
	};
}

/**
 * Vehicles API methods
 */
export class VehiclesAPI {
	constructor(private client: BaseClient) {}

	/**
	 * List vehicles by registration number (partial match)
	 * @param params - Search parameters including vehicle registration number
	 * @returns List of matching vehicles in normalized format
	 */
	async listVehicles(
		params: ListVehiclesParams
	): Promise<ListVehiclesResponse> {
		// Validate input parameters
		const validatedParams = validate(
			listVehiclesParamsSchema,
			{ vehicleregno: params.vehicleRegNo },
			"Invalid list vehicles parameters"
		);

		const response = await this.client.getClient().post("ListVehicles", {
			json: validatedParams,
		});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawListVehiclesResponseSchema,
			data,
			"Invalid list vehicles response"
		);

		// Transform to clean, normalized format
		return transformListVehiclesResponse(rawResponse);
	}

	/**
	 * Get vehicle trip details including route details and live location
	 * @param params - Parameters including vehicle ID
	 * @returns Vehicle trip details with route information and live location in normalized format
	 */
	async getVehicleTripDetails(
		params: VehicleTripDetailsParams
	): Promise<VehicleTripDetailsResponse> {
		// Validate input parameters
		const validatedParams = validate(
			vehicleTripDetailsParamsSchema,
			{ vehicleId: params.vehicleId },
			"Invalid vehicle trip details parameters"
		);

		const response = await this.client
			.getClient()
			.post("VehicleTripDetails_v2", {
				json: validatedParams,
			});

		const data = await response.json<unknown>();

		// Validate raw response with Zod schema
		const rawResponse = validate(
			rawVehicleTripDetailsResponseSchema,
			data,
			"Invalid vehicle trip details response"
		);

		// Transform to clean, normalized format
		return transformVehicleTripDetailsResponse(rawResponse);
	}
}
