# BMTC API Endpoints Implementation Status

This file tracks the progress of implementing wrappers for BMTC API endpoints.

## Completed Endpoints ✅

- [x] `/GetHelplineData` - Get BMTC helpline information
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

## In Progress 🚧

_None currently_

## Pending Endpoints 📋

- [ ] `/NearbyStations_v2` - Find nearby bus stations
- [ ] `/AroundBusStops_v2` - Find bus stops around a location
- [ ] `/GetTimetableByStation_v4` - Get timetable by station
- [ ] `/AroundBusStops_v2_Webportal` - Find bus stops (web portal version)
- [ ] `/GetFareRoutes` - Get fare information for routes
- [ ] `/GetMobileFareData_v2` - Get mobile fare data
- [ ] `/FindNearByBusStop_v2` - Find nearby bus stops
- [ ] `/TripPlannerMSMD` - Trip planner

## Total Progress

- **Completed:** 13 / 20 (65%)
- **Remaining:** 7 endpoints

---

_Last updated: After implementing GetFareScrollMessage endpoint_
