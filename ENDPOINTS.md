# Transit API Endpoints Implementation Status

This file tracks the progress of implementing wrappers for Bengaluru transit API endpoints.

## Completed Endpoints ✅

- [x] `/GetHelplineData` - Get transit helpline information
- [x] `/GetAllServiceTypes` - Get all service types (AC, Non AC, etc.)
- [x] `/GetAboutData` - Get about data including URLs and airport information
- [x] `/GetEmergencyMessage_v1` - Get emergency messages (English and Kannada)
- [x] `/ListVehicles` - List vehicles by registration number (partial match)
- [x] `/VehicleTripDetails_v2` - Get vehicle trip details including route details and live location
- [x] `/RoutePoints` - Get route points (path) as GeoJSON LineString
- [x] `/AroundBusStops_v2` - Find nearby bus stations with facilities as GeoJSON Points
- [x] `/SearchRoute_v2` - Search for routes by route text (partial match)
- [x] `/GetAllRouteList` - Get all routes list
- [x] `/GetTimetableByRouteid_v3` - Get timetable by route ID
- [x] `/GetSearchPlaceData` - Search place data by name
- [x] `/GetFareScrollMessage` - Get fare scroll messages (English and Kannada)
- [x] `/SearchByRouteDetails_v4` - Search route details with live vehicle information
- [x] `/GetFareRoutes` - Get routes between two stations
- [x] `/GetMobileFareData_v2` - Get mobile fare data for routes between stations
- [x] `/FindNearByBusStop_v2` - Search bus stops by station name
- [x] `/NearbyStations_v2` - Find nearby stations by location within a radius
- [x] `/TripPlannerMSMD` - Trip planner with multiple route options (direct and transfer routes)
- [x] `/GetPathDetails` - Get detailed station-by-station path information for trip legs
- [x] `/GetTimetableByStation_v4` - Get timetable by station (routes between two stations)
- [x] `/getMobileTripsData` - Get trips at a station (running or scheduled)

## In Progress 🚧

None currently.

## Pending Endpoints 📋

- [ ] `/getWaypoints_v1` - Get waypoints

**Note:** `/getWaypoints_v1` is already implemented as `getTripPath` method.

## Total Progress

- **Completed:** 22 / 22 (100%)
- **Remaining:** 0 endpoints

**Note:** `/AroundBusStops_v2_Webportal` is the same as `/AroundBusStops_v2` (already completed), so it's been removed from pending.

---

Last updated: After implementing getMobileTripsData endpoint

---

## V2 Public (Chalo / `BengaluruTransitClientV2`)

Base URL: `https://chalo.com/app/api`

### Search & geocoding

- [x] `GET scheduler_v4/v5/{city}/search` — `search`
- [x] `GET scheduler_v4/v4/{city}/autocomplete/route` — `searchRoutes`
- [x] `GET scheduler_v4/v5/search/place` — `searchPlaces`
- [x] `GET scheduler_v4/v5/place/details` — `getPlaceDetails`
- [x] `GET scheduler_v4/geocode/reverse` — `reverseGeocode`

### Routes, stops, trips

- [x] `GET scheduler_v4/v5/{city}/tripplanner` — `planTrip`
- [x] `GET scheduler_v4/v5/{city}/routesbetweenstops` — `getRoutesBetweenStops`
- [x] `GET scheduler_v4/v4/{city}/routedetails` — `getRouteDetails` (polyline)
- [x] `GET scheduler_v4/v4/{city}/routedetailslive` — `getRouteDetailsLive`
- [x] `POST scheduler_v4/v5/{city}/routedetails` — `getRouteDetailsBulk`
- [x] `GET scheduler_v4/v4/{city}/nearby/stops` — `getNearbyStops`
- [x] `GET scheduler_v4/v4/{city}/stops/id` — `listStops`
- [x] `POST scheduler_v4/v4/{city}/stopDetails` — `getRouteStopDetails`
- [x] `GET scheduler_v4/v4/{city}/stopdetails` — `getStopDetails`
- [x] `GET scheduler_v4/v4/{city}/summary` — `getNearbySummary`

### Live

- [x] `GET vasudha/track/route-live-info/{city}/{routeId}` — `getLiveVehicles`
- [x] `POST vasudha/cities/{city}/stop-route-eta` — `getStopArrivals`
- [x] `GET vasudha/location/{city}/{agency}/bus/{busNo}` — `getBusLocation`
- [x] `POST seat/availability` — `getOccupancy`
- [ ] `POST nearbybus/v2/city/{city}` — **skip** (empty `buses` for Bengaluru)
- [ ] Socket live config / helper — **skip for now**

### Fares & config

- [x] `POST mticketing/v2/mobile-ticket/validate-fare` — `validateFare`
- [x] `GET scheduler_v4/cityList` — `listCities`
- [x] `GET scheduler_v4/v1/{city}/metadataprops` — `getCityMetadata`
- [x] `GET configuration/chalo-props/v1` — `getServerTime`
- [x] `GET configuration/rc/v2` — `getRemoteConfig`
- [ ] ONDC / TUB fare surfaces — **skip for Bengaluru**
