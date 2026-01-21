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

## In Progress 🚧

None currently.

## Pending Endpoints 📋

- [ ] `/getWaypoints_v1` - Get waypoints

**Note:** `/getWaypoints_v1` is already implemented as `getTripPath` method.

## Total Progress

- **Completed:** 21 / 22 (95%)
- **Remaining:** 1 endpoint (already implemented)

**Note:** `/AroundBusStops_v2_Webportal` is the same as `/AroundBusStops_v2` (already completed), so it's been removed from pending.

---

Last updated: After implementing GetFareRoutes endpoint
