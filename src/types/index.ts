/**
 * Type exports for Bengaluru Transit SDK
 * 
 * This file exports only clean, user-facing types.
 * Raw types (prefixed with "Raw") are available in their individual files
 * for advanced use cases but are not re-exported here to keep the public API clean.
 */

// Base types
export type { TransitApiError, RequestOptions } from "./api.js";

// Coordinate types
export * from "./coordinates.js";

// GeoJSON types
export * from "./geojson.js";

// Clean types from each module (raw types excluded)
// Routes
export type {
	RouteDirection,
	RoutePointsResponse,
	RoutePointsParams,
	RouteSearchItem,
	RouteSearchResponse,
	RouteSearchParams,
	RouteListItem,
	AllRoutesResponse,
	TripDetailItem,
	TimetableItem,
	TimetableResponse,
	TimetableByRouteParamsWithStops,
	TimetableByRouteParamsWithoutStops,
	TimetableByRouteParams,
	RouteDetailVehicleProperties,
	RouteDetailVehicleItem,
	RouteDetailStationProperties,
	RouteDetailStationFeature,
	RouteDetailDirectionData,
	RouteDetailsResponse,
	RouteDetailsParams,
	RouteBetweenStopsItem,
	RoutesBetweenStopsResponse,
	RoutesBetweenStopsParams,
	FareDataItem,
	FareDataResponse,
	FareDataParams,
	TripPlannerFilter,
	TripPlannerParams,
	TripPlannerPathLeg,
	TripPlannerRoute,
	TripPlannerResponse,
	PathDetailRequestItem,
	PathDetailsParams,
	PathDetailItem,
	PathDetailsResponse,
	WaypointsParams,
	TripPathResponse,
	TimetableByStationItem,
	TimetableByStationResponse,
	TimetableByStationParams,
	StationTripType,
	StationTripItem,
	StationTripsResponse,
	StationTripsParams,
} from "./routes.js";

// Vehicles
export type {
	VehicleDataItem,
	SearchVehiclesResponse,
	SearchVehiclesParams,
	VehicleTripResponse,
	VehicleTripParams,
} from "./vehicles.js";

// Stops
export type {
	FacilityTypeGroup,
	NearbyStation,
	AroundBusStopsResponse,
	AroundBusStopsParams,
	StationType,
	NearbyBusStopItem,
	NearbyBusStopsResponse,
	NearbyBusStopsParams,
	TransitCategory,
	NearbyStationItem,
	NearbyStationsResponse,
	NearbyStationsParams,
} from "./stops.js";

// Info
export type {
	HelplineDataItem,
	HelplineResponse,
	ServiceTypeDataItem,
	ServiceTypesResponse,
	AboutDataItem,
	AboutDataResponse,
	EmergencyMessageDataItem,
	EmergencyMessagesResponse,
	FareScrollMessageDataItem,
	FareScrollMessagesResponse,
} from "./info.js";

// Locations
export type {
	PlaceItem,
	SearchPlacesResponse,
	SearchPlacesParams,
} from "./locations.js";

export type {
	V2Weekday,
	V2OccupancyLevel,
	BengaluruTransitClientV2Config,
	V2SearchParams,
	V2RouteSummary,
	V2StopSummary,
	V2PlaceSummary,
	V2SearchResponse,
	V2TripPlanParams,
	V2TripLeg,
	V2Itinerary,
	V2TripPlanResponse,
	V2RouteDetailsParams,
	V2Stop,
	V2Trip,
	V2TimetableEntry,
	V2RouteDetails,
	V2LiveVehiclesParams,
	V2VehiclePosition,
	V2StopArrival,
	V2LiveVehicles,
	V2StopRoutePair,
	V2StopArrivalsParams,
	V2StopArrivals,
	V2NearbyBusesParams,
	V2NearbyVehicle,
	V2NearbyBus,
	V2NearbyStop,
	V2NearbyBuses,
	V2OccupancyVehicle,
	V2OccupancyParams,
	V2OccupancyItem,
	V2Occupancy,
} from "./v2.js";
