/**
 * Type exports for Bengaluru Transit SDK
 * 
 * This file exports only clean, user-facing types.
 * Raw types (prefixed with "Raw") are available in their individual files
 * for advanced use cases but are not re-exported here to keep the public API clean.
 */

// Base types
export type { TransitApiError } from "./api";

// Coordinate types
export * from "./coordinates";

// GeoJSON types
export * from "./geojson";

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
} from "./routes";

// Vehicles
export type {
	VehicleDataItem,
	SearchVehiclesResponse,
	SearchVehiclesParams,
	VehicleTripResponse,
	VehicleTripParams,
} from "./vehicles";

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
} from "./stops";

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
} from "./info";

// Locations
export type {
	PlaceItem,
	SearchPlacesResponse,
	SearchPlacesParams,
} from "./locations";
