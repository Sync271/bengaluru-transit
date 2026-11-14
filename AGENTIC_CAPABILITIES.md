# Bengaluru Transit SDK - Agentic Capabilities

This document outlines the agentic workflows and possibilities enabled by the Bengaluru Transit SDK.

> **Note**: This is an unofficial SDK. See the main README for disclaimer and intent.

## Current Capabilities

### Info API
- `getHelpline()` - Contact information
- `getServiceTypes()` - Available service types (AC, Non-AC, etc.)
- `getAbout()` - General transit information
- `getEmergencyMessages()` - Emergency alerts
- `getFareScrollMessages()` - Fare-related announcements

### Vehicles API
- `searchVehicles({ query })` - Find vehicles by registration number
- `getVehicleTrip({ vehicleId })` - Live tracking + route details

### Routes API
- `getRoutePoints({ routeId })` - Route path as GeoJSON
- `searchRoutes({ query })` - Search routes by text
- `getAllRoutes()` - Complete route list
- `getTimetableByRoute({ routeId, startTime?, endTime?, fromStopId?, toStopId? })` - Schedule for a route
- `searchByRouteDetails({ parentRouteId, serviceTypeId? })` - Live vehicles + stops on route
- `getRoutesBetweenStops({ fromStopId, toStopId })` - Routes connecting two stops
- `getRoutesThroughStations({ fromStopId, toStopId, routeId?, date? })` - Routes passing through both stops with schedule info
- `getFares({ routeNo, subrouteId, routeDirection, sourceCode, destinationCode })` - Fare information for specific route
- `planTrip({ fromStopId|fromCoordinates, toStopId|toCoordinates, serviceTypeId?, fromDateTime?, filterBy? })` - Complete trip planning with transfers and walking segments
- `getTripStops({ trips })` - Get all stops along trip legs as GeoJSON FeatureCollection (Point features)
- `getTripPath({ viaPoints })` - Get route path segments as GeoJSON FeatureCollection (LineString features)

### Stops API
- `findNearbyStations({ coordinates })` - Nearby stations with facilities (GeoJSON)
- `searchBusStops({ stationName, stationType? })` - Search stops by name
- `findNearbyStops({ coordinates, radius, stationType?, bmtcCategory? })` - Stops within radius

### Locations API
- `searchPlaces({ query })` - Search locations/places by name

The methods above belong to `BengaluruTransitClient`. Route ids from that client do not work with `BengaluruTransitClientV2`, and the reverse is also true.

### BengaluruTransitClientV2

Calls the current app API (`chalo.com/app/api`). Safe to use from a browser without a proxy. Coordinates are `[latitude, longitude]`. `day` is a lowercase weekday except for `search`, which uses `DD-MM-YYYY`. Do not mix stop/route ids with `BengaluruTransitClient`.

**Search / places**
- `search({ query, coordinates, day?, filter? })` — routes, stops, places (`filter`: `"routes"` | `"stops"`)
- `searchPlaces({ query, coordinates? })` — geocoded place suggestions (`placeId` + `searchPartner`)
- `getPlaceDetails({ placeId, searchPartner })` — resolved lat/lon + address (**needs** ids from `searchPlaces`)
- `reverseGeocode({ coordinates })` — Chalo city coverage for a point (not a street address)

**Routes / trips**
- `searchRoutes({ query })` — route autocomplete (`str` required; omit → huge catalogue)
- `getRoutesBetweenStops({ fromStopId, toStopId, ticketEnabled? })`
- `planTrip({ fromCoordinates, toCoordinates, startTimeSeconds?, day? })` — multi-modal itineraries
- `planBusWiseTrip({ fromStopId, toStopId, startTimeMillis? })` — bus-only; **stop ids required** (coords fail)
- `getRouteDetails({ routeId, day? })` / `getRouteDetailsLive` / `getRouteDetailsBulk({ routeIds })` — stops, timetable, polyline
- `getRouteStopDetails({ routeId, stopIds })` — per-stop extras on a route

**Stops**
- `getNearbyStops({ coordinates, transitMode? })` — stop locations only
- `getNearbySummary({ coordinates, day?, startTimeSeconds?, radiusMeters?, cardCount? })` — stops + scheduled services + live ETAs when tracked
- `listStops({ transitMode? })` — full city catalogue
- `getStopDetails({ stopId, day?, startTimeSeconds? })` — timetable from a stop

**Live**
- `getLiveVehicles({ routeId, stopIds })` — positions + arrivals (**`stopIds` required**)
- `getStopArrivals({ pairs })` — ETAs for known `{ stopId, routeId }` pairs
- `getBusLocation({ busNumber, agency? })` — one registration; `null` if untracked
- `getOccupancy({ vehicles })` — crowding; needs `number`, `updatedAt`, `routeId`, `stopId` from a live call

**Fares / config**
- `validateFare({ routeId, fromStopId, toStopId, fareRupees })` — quote check (rupees in → paise out to API)
- `listCities()` / `getCityMetadata()` / `getServerTime()` / `getRemoteConfig({ keys? })`

## Ordered call chains (V2)

These methods **cannot** be useful alone — an earlier call must supply ids, coordinates, or live fields. Prefer this section when wiring agents/tools.

### Place name → coordinates → trip

1. `searchPlaces({ query })` → `placeId`, `searchPartner`, often lat/lon
2. If lat/lon missing or you need address: `getPlaceDetails({ placeId, searchPartner })` (**both** from step 1)
3. `planTrip({ fromCoordinates, toCoordinates, … })` with the resolved points  
   - Or resolve both ends to stops (`getNearbyStops` / `search`) then `planBusWiseTrip({ fromStopId, toStopId })`

### Nearby board → live bus → occupancy

1. `getNearbySummary({ coordinates, radiusMeters?, cardCount? })` → stops, `routeId`s, optional `vehicles[]`
2. For map positions: `getLiveVehicles({ routeId, stopIds })` using a stop from step 1 (**`stopIds` required**)
3. `getOccupancy({ vehicles })` with each vehicle’s `number`, `updatedAt`, `routeId`, and a nearby `stopId`  
   - Skip occupancy when `updatedAt` is missing

### Route search → timetable / map → live

1. `search` / `searchRoutes({ query })` → `routeId`
2. `getRouteDetails({ routeId, day? })` → stop sequence, timetable, `polyline`
3. `getLiveVehicles({ routeId, stopIds: [first, last, …] })` using stop ids from step 2
4. Optional: `getOccupancy` as above; `getBusLocation({ busNumber })` to follow one plate

### Stop pair → bus-only plan → fare check

1. Resolve stops: `search({ filter: "stops" })` or `getNearbyStops` / `getNearbySummary`
2. `planBusWiseTrip({ fromStopId, toStopId })` (not coordinates)
3. Optional: `validateFare({ routeId, fromStopId, toStopId, fareRupees })` using a BUS leg’s `routeId` and the same stop pair  
   - Or `getRoutesBetweenStops` then validate a chosen route

### Trip plan → enrich a chosen leg

1. `planTrip` (or `planBusWiseTrip`) → itineraries / legs (`routeId`, stop names/ids when present)
2. For a BUS/METRO leg: `getRouteDetails({ routeId })` → polyline + full stop list
3. Live ETA on that leg: `getStopArrivals({ pairs: [{ stopId, routeId }] })` or `getLiveVehicles`
4. Optional crowding: `getOccupancy` after a live call that provides `updatedAt`

### City bootstrap

1. `listCities()` → pick `cityId` (lowercased) for `new BengaluruTransitClientV2({ city })`
2. Optional: `reverseGeocode({ coordinates })` to discover which Chalo city covers a GPS point
3. Optional: `getCityMetadata()` / `getServerTime()` / `getRemoteConfig({ keys })` for thin config

### What not to chain

- Do **not** pass v1 Karnataka WebAPI ids into v2 methods (or the reverse).
- Do **not** call `planBusWiseTrip` with only coordinates — use `planTrip` for lat/lon.
- Do **not** call `getPlaceDetails` without `searchPartner` from `searchPlaces`.
- Do **not** call `getLiveVehicles` without at least one `stopId`.
- Do **not** call `getOccupancy` without a prior live vehicle that has `updatedAt`.

## Agentic Workflows

> Flows below marked **(v1)** use `BengaluruTransitClient`. Prefer the **Ordered call chains (V2)** section for browser-safe / current-app agents.

### 1. **Complete Trip Planning** ✨ (HIGH VALUE)
**Goal**: Plan a trip from any location to any destination with routes, fares, transfers, and walking segments

**Flow A - Using Trip Planner** (Recommended):
1. `planTrip({ fromCoordinates, toStopId })` → Get complete trip plans
   - Or: `planTrip({ fromStopId, toCoordinates })` → Stop to location
   - Or: `planTrip({ fromStopId, toStopId })` → Stop to stop
   - Or: `planTrip({ fromCoordinates, toCoordinates })` → Location to location
2. Response includes:
   - Multiple route options with transfers
   - Walking segments to/from stations
   - Total duration, fare, distance for each route
   - Transfer count and walking indicators
   - Each leg with bus details (route number, ETA, vehicle info)
3. Filter/sort by: `transferCount === 0` (direct routes), `totalDurationSeconds`, `totalFare`
4. **Enhanced Visualization**:
   - `getTripStops({ trips: [leg1, leg2, ...] })` → Get all stops as GeoJSON Points
   - `getTripPath({ viaPoints: tripStops })` → Get route path as GeoJSON LineStrings
   - Directly usable in map libraries (Leaflet, Mapbox, Google Maps)

**Flow B - Manual Multi-Step** (Legacy approach):
1. `searchPlaces({ query: "Koramangala" })` → Get coordinates
2. `searchPlaces({ query: "Airport" })` → Get coordinates  
3. `findNearbyStops({ coordinates, radius })` near origin → Find nearest stops
4. `findNearbyStops({ coordinates, radius })` near destination → Find nearest stops
5. `getRoutesBetweenStops({ fromStopId, toStopId })` → Get all route options
6. For each route:
   - `getFares({ routeNo, subrouteId, routeDirection, sourceCode, destinationCode })` → Get fare information
   - `getTimetableByRoute({ routeId, fromStopId?, toStopId? })` → Get schedule
7. Return: Multiple route options with fares, schedules, and station info

**Use Case**: "I want to go from Koramangala to Airport" or "Plan a trip from my location (13.0793, 77.5881) to Station ID 20922"

---

### 2. **Live Vehicle Tracking** 🚌
**Goal**: Track a specific vehicle or see all vehicles on a route

**Flow A - By Vehicle Number**:
1. `searchVehicles({ query: "KA57F2403" })` → Find vehicle ID
2. `getVehicleTrip({ vehicleId })` → Get live location + route

**Flow B - By Route**:
1. `searchRoutes({ query: "KIA-10" })` → Get route ID
2. `searchByRouteDetails({ parentRouteId })` → See all live vehicles on route (up/down directions)

**Use Case**: "Where is bus KA57F2403?" or "Show me all buses on route KIA-10"

---

### 3. **Multi-Route Comparison** 📊
**Goal**: Compare multiple routes between two points (fares, time, service types)

**Flow**:
1. `getRoutesBetweenStops({ fromStopId, toStopId })` → Get all routes
2. For each route:
   - `getFares({ routeNo, subrouteId, routeDirection, sourceCode, destinationCode })` → Get fare for each service type
   - `getTimetableByRoute({ routeId, fromStopId?, toStopId? })` → Get schedule
   - `searchByRouteDetails({ parentRouteId })` → Get live status
3. Compare: Price, duration, service quality (AC vs Non-AC), live vehicle availability

**Use Case**: "Compare all routes from Banashankari to ITPL"

---

### 4. **Facility Discovery** 🏪
**Goal**: Find stations with specific facilities near a location

**Flow**:
1. `findNearbyStations({ coordinates: [lat, lon] })` → Get stations with facilities
2. Filter by facility type (ATM, Toilet, Parking, etc.)
3. Return: Stations with desired facilities + distances

**Use Case**: "Find stations with ATM near CBI"

---

### 5. **Route Exploration** 🗺️
**Goal**: Explore a route - see path, stops, live vehicles, schedule

**Flow**:
1. `searchRoutes({ query: "500-CA" })` → Get route info
2. `getRoutePoints({ routeId })` → Get route path (GeoJSON LineString)
3. `searchByRouteDetails({ parentRouteId })` → Get stops + live vehicles (GeoJSON Points)
4. `getTimetableByRoute({ routeId, fromStopId?, toStopId? })` → Get schedule
5. Combine: Visual route with stops, live vehicles, and schedule

**Use Case**: "Show me route 500-CA on a map with stops and buses"

---

### 9. **Trip Path Visualization** 🗺️ (NEW)
**Goal**: Visualize complete trip path with all stops and route segments on a map

**Flow**:
1. `planTrip({ ... })` → Get trip plan with legs
2. Extract trip legs: `route.legs.map(leg => ({ tripId, fromStopId, toStopId }))`
3. `getTripStops({ trips: legs })` → Get all stops as GeoJSON FeatureCollection (Point features)
   - Returns stops with properties: stopId, stopName, routeNo, scheduledArrivalTime, isTransfer, etc.
4. `getTripPath({ viaPoints: tripStops })` → Get route path segments as GeoJSON FeatureCollection (LineString features)
   - Accepts either array of `[lat, lng]` tuples or GeoJSON FeatureCollection
   - Returns LineString features (one per API response segment) with empty properties
5. Combine on map: Stops (Points) + Path (LineStrings) = Complete visual trip

**Use Case**: "Show me the complete path from NES Office to 3rd Block Jayanagara on a map"

---

### 6. **Smart Stop Finding** 📍
**Goal**: Find nearest bus stops to a destination with route options

**Flow**:
1. `searchPlaces({ query: "ITPL" })` → Get coordinates
2. `findNearbyStops({ coordinates: [lat, lon], radius: 1 })` → Find stops within 1km
3. For each nearby stop:
   - `getRoutesBetweenStops({ fromStopId, toStopId })` to common destinations
4. Return: Nearest stops with available routes

**Use Case**: "What stops are near ITPL and where do they go?"

---

### 7. **Real-time Route Status** ⏰
**Goal**: Get live status of a route - vehicles, ETAs, next stops

**Flow**:
1. `searchRoutes({ query: "KIA-10" })` → Get route ID
2. `searchByRouteDetails({ parentRouteId })` → Get:
   - Live vehicle locations (GeoJSON Points)
   - Station stops (GeoJSON Points)
   - ETAs for each vehicle
   - Current/next stops for each vehicle
3. Return: Real-time status dashboard

**Use Case**: "Show me the current status of KIA-10 route"

---

### 8. **Service Type Filtering** 🎯
**Goal**: Find routes with specific service types (AC only, etc.)

**Flow**:
1. `getServiceTypes()` → Get all service types
2. `searchRoutes({ query })` → Get routes
3. `searchByRouteDetails({ parentRouteId, serviceTypeId })` → Filter by service type
4. Return: Routes matching service preference

**Use Case**: "Find AC buses from Banashankari to Airport"

---

### 10. **Routes Through Stops Discovery** 🔍 (NEW)
**Goal**: Find all routes that pass through both stops with departure times and travel information

**Flow**:
1. `getRoutesThroughStations({ fromStopId, toStopId, routeId?, date? })` → Get routes passing through both stops
   - Optional: Filter by specific `routeId`
   - Optional: Specify `date` for future schedules
2. Response includes:
   - Route details (routeNo, routeName)
   - Start time (departure from fromStop)
   - Travel time and approximate time
   - Distance offsets (fromStopOffset, toStopOffset, distance between)
   - Platform/bay information
3. Sort/filter by:
   - `startTime` for next available bus
   - `travelTime` for fastest option
   - `routeNo` for specific route preference

**Use Case**: "What routes go from Hebbala to Kempegowda Bus Station?" or "When is the next 500-CA bus from Banashankari to ITPL?"

**Difference from `getRoutesBetweenStops`**:
- `getRoutesBetweenStops`: Returns all possible routes between two stops (no time info)
- `getRoutesThroughStations`: Returns routes with one startTime per route (schedule-aware)

---

### 11. **Next Bus Departure Finder** ⏰ (NEW)
**Goal**: Find the next available bus from a specific stop

**Flow A - Using Routes Through Stops**:
1. `getRoutesThroughStations({ fromStopId, toStopId, routeId?, date? })` → Get routes with start times
2. Filter routes where `startTime >= currentTime`
3. Sort by `startTime` ascending
4. Return: Next available bus with route details and departure time

**Flow B - Using Timetable**:
1. `searchRoutes({ query: "route-number" })` → Get route ID
2. `getTimetableByRoute({ routeId, fromStopId?, toStopId?, startTime?, endTime? })` → Get schedule
3. Filter tripDetails where `startTime >= currentTime`
4. Sort by startTime
5. Return: Next trip with detailed schedule

**Use Case**: "When is the next bus from my stop?" or "Next 335-E bus from here?"

---

### 12. **Price-Aware Route Selection** 💰 (NEW)
**Goal**: Compare routes not just by time, but also by fare across different service types

**Flow**:
1. `getRoutesBetweenStops({ fromStopId, toStopId })` → Get all route options
2. For each route:
   - `getFares({ routeNo, subrouteId, routeDirection, sourceCode, destinationCode })` → Get fares for all service types
3. Compare across routes:
   - Minimum fare (Non-AC)
   - Maximum fare (Premium services)
   - Average fare
   - Service type availability
4. Filter by budget or service preference
5. Sort by price + time combination (value optimization)

**Use Case**: "Find cheapest route from Banashankari to ITPL" or "Compare AC vs Non-AC prices for all routes"

---

### 13. **Schedule-Based Trip Planning** 📅 (NEW)
**Goal**: Plan trips based on specific departure times or arrival deadlines

**Flow**:
1. `planTrip({ fromStopId, toStopId, fromDateTime })` → Get routes with specific departure time
   - `fromDateTime`: Date object (must be in the future, converted to "YYYY-MM-DD HH:mm" format internally)
2. Filter routes by:
   - `fromDateTime` constraint (only routes starting after this time)
   - `totalDuration` (arrival deadline)
3. For selected route:
   - `getTimetableByRoute({ routeId, fromStopId, toStopId })` → Get detailed schedule
   - `getTripStops({ trips: legs })` → Get all intermediate stops
4. Return: Complete trip plan with exact departure/arrival times

**Use Case**: "I need to reach Airport by 6 PM" or "Plan trip starting after 9 AM"

---

### 14. **Multi-Stop Journey Planning** 🛣️ (NEW)
**Goal**: Plan complex journeys with multiple intermediate stops

**Flow**:
1. Break journey into segments: [A → B, B → C, C → D]
2. For each segment:
   - `getRoutesThroughStations({ fromStopId, toStopId })` → Find connecting routes
   - Identify transfer points (stops that appear in multiple segments)
3. Combine segments:
   - Find routes that minimize transfers
   - Calculate total travel time and fare
   - Identify transfer wait times
4. Alternative: Use `planTrip()` for origin → destination, then manually add intermediate stops using `getRoutesThroughStations({ fromStopId, toStopId })`

**Use Case**: "Plan route from Home → Office → Gym → Home" or "Multi-stop shopping trip"

---

### 15. **Emergency & Service Alerts** 🚨 (NEW)
**Goal**: Keep users informed about service disruptions, updates, and emergency information

**Flow**:
1. `getEmergencyMessages()` → Get current emergency alerts
   - Filter by `isDisplay: true` for active alerts
   - Filter by `displayKey` for context-specific messages
2. `getFareScrollMessages()` → Get fare-related announcements
3. Display alerts:
   - On app startup
   - Before trip planning
   - Context-aware based on user action (e.g., "Journey_Planner" key for trip planning screens)

**Use Case**: "Check for any service alerts" or "Show me current transit announcements"

---

## Missing Endpoints (Would Enable More Workflows)

### `/GetTimetableByStation_v4` ✅ (Completed as `getRoutesThroughStations`)
**Now Enables**:
- "When is the next bus from this stop?"
- Stop-based schedule lookup with routes passing through both stops
- Route discovery between stops with departure times
- Next bus departure finding

### `/TripPlannerMSMD` ✅ (Completed)
**Now Enables**:
- Complete trip planning with transfers
- Optimal route suggestions
- Multi-modal routing (walking + bus)
- Location-to-location, Stop-to-Stop, or mixed origin/destination

### `/GetPathDetails` ✅ (Completed)
**Now Enables**:
- Get all stops along trip legs with detailed information
- GeoJSON FeatureCollection of stop points
- Station details, scheduled times, transfer indicators

### `/getWaypoints_v1` ✅ (Completed)
**Now Enables**:
- Get route path segments between stops
- GeoJSON FeatureCollection of LineString features
- Direct integration with map libraries

---

## High-Value Agentic Flows (Priority)

**V2 (ordered chains above)**
1. **Place → trip** — `searchPlaces` → `getPlaceDetails?` → `planTrip` / `planBusWiseTrip`
2. **Board here** — `getNearbySummary` → `getLiveVehicles` → `getOccupancy`
3. **Route explore** — `searchRoutes` → `getRouteDetails` → `getLiveVehicles`
4. **Fare check** — stop pair → `planBusWiseTrip` / `getRoutesBetweenStops` → `validateFare`

**V1 (Karnataka WebAPI)**
1. **Complete Trip Planning** — end-to-end from place names
2. **Trip Path Visualization** — `planTrip` → `getTripStops` → `getTripPath`
3. **Live Tracking** — `searchVehicles` → `getVehicleTrip`
4. **Next Bus Departure** — `getRoutesThroughStations` / timetable
5. **Price-Aware Route Selection** — `getRoutesBetweenStops` → `getFares`
6. **Multi-Route Comparison** / **Route Exploration** / **Routes Through Stops**

---

## Implementation Recommendations

### Helper Functions (Optional)
Convenience wrappers that encode the ordered chains above:

```typescript
// V2: place names → itineraries
async function planFromPlaceNames(v2, fromQuery: string, toQuery: string) {
  // searchPlaces(from) → searchPlaces(to) → getPlaceDetails? → planTrip
}

// V2: nearby board + crowding
async function nearbyWithOccupancy(v2, coordinates: [number, number]) {
  // getNearbySummary → getLiveVehicles? → getOccupancy
}

// V1
async function getRouteStatus(routeNo: string) {
  // searchRoutes → searchByRouteDetails
}
async function findAndTrackVehicle(vehicleNo: string) {
  // searchVehicles → getVehicleTrip
}
```

### Agent Framework Integration
The wrapper is already well-structured for agent frameworks:
- ✅ Type-safe parameters
- ✅ Consistent error handling
- ✅ GeoJSON for spatial queries
- ✅ Normalized responses
- ✅ All IDs as strings (agent-friendly)

**Recommended Agent Frameworks**:
- LangChain (with tool calling)
- AutoGen (multi-agent workflows)
- CrewAI (task-based agents)

---

## Example Agent Queries

**V2**
- "How do I get from Koramangala to Majestic?" → `searchPlaces` (both ends) → `planTrip`
- "Bus-only options between these two stops?" → resolve stop ids → `planBusWiseTrip`
- "What can I catch near me, and how crowded is it?" → `getNearbySummary` → `getOccupancy` (via live `updatedAt`)
- "Show route 500D on a map with live buses" → `searchRoutes` → `getRouteDetails` → `getLiveVehicles`
- "Is ₹50 still valid on this route between these stops?" → `validateFare`
- "Where is KA57F1838?" → `getBusLocation({ busNumber })`
- "Which Chalo city am I in?" → `reverseGeocode` → optional `getCityMetadata`

**V1**
- "How do I get from Koramangala to Airport?" → `planTrip()`
- "Find the cheapest route from Banashankari to ITPL" → `planTrip()` then sort by `totalFare`
- "Where is bus KA57F2403 right now?" → `searchVehicles` → `getVehicleTrip`
- "What facilities are near MG Road?" → `findNearbyStations`
- "When is the next bus from Hebbal?" → `getRoutesThroughStations` / `getTimetableByRoute`
- "Visualize my trip" → `planTrip` → `getTripStops` → `getTripPath`
- "Check for service alerts" → `getEmergencyMessages` + `getFareScrollMessages`

---

## Trip Planner Examples

### Location to Station
```typescript
const result = await client.routes.planTrip({
  fromCoordinates: [13.0793, 77.5881],
  toStopId: "20922",
  filterBy: "shortest-time" // or "minimum-transfers"
});

// Access routes (merged direct + transfer routes)
for (const route of result.routes) {
  console.log(`Duration: ${route.totalDuration} (${route.totalDurationSeconds}s)`);
  console.log(`Fare: ₹${route.totalFare}`);
  console.log(`Distance: ${route.totalDistance} km`);
  console.log(`Transfers: ${route.transferCount}`);
  console.log(`Walking: ${route.hasWalking ? 'Yes' : 'No'}`);
  
  // Access individual legs
  for (const leg of route.legs) {
    if (leg.routeNo.startsWith('walk')) {
      console.log(`  Walk: ${leg.fromStopName} → ${leg.toStopName}`);
    } else {
      console.log(`  Bus ${leg.routeNo}: ${leg.fromStopName} → ${leg.toStopName}`);
      console.log(`    ETA: ${leg.etaFromStop} - ${leg.etaToStop}`);
    }
  }
}
```

### Stop to Location
```typescript
const result = await client.routes.planTrip({
  fromStopId: "35376",
  toCoordinates: [12.9716, 77.5946],
  serviceTypeId: "72", // Optional: filter by service type
  fromDateTime: new Date("2026-01-18T18:00:00") // Optional: future departure time (Date object)
});
```

### Stop to Stop
```typescript
const result = await client.routes.planTrip({
  fromStopId: "35376",
  toStopId: "20922"
});

// Find direct routes (no transfers)
const directRoutes = result.routes.filter(r => r.transferCount === 0);
```

### Location to Location
```typescript
const result = await client.routes.planTrip({
  fromCoordinates: [13.0793, 77.5881],
  toCoordinates: [12.9716, 77.5946],
  filterBy: "minimum-transfers"
});
```

### Trip Path Visualization
```typescript
// 1. Plan the trip
const tripPlan = await client.routes.planTrip({
  fromStopId: "22357",
  toStopId: "21447"
});

// 2. Select a route (e.g., first route)
const selectedRoute = tripPlan.routes[0];

// 3. Extract trip legs (excluding walking segments)
const tripLegs = selectedRoute.legs
  .filter(leg => !leg.routeNo.startsWith('walk'))
  .map(leg => ({
    tripId: leg.tripId,
    fromStopId: leg.fromStopId,
    toStopId: leg.toStopId
  }));

// 4. Get all stops along the trip as GeoJSON Points
const stops = await client.routes.getTripStops({
  trips: tripLegs
});
// Returns: FeatureCollection with Point features
// Each point has properties: stopId, stopName, routeNo, scheduledArrivalTime, isTransfer, etc.

// 5. Get route path segments as GeoJSON LineStrings
const path = await client.routes.getTripPath({
  viaPoints: stops // Can also pass array of [lat, lng] tuples
});
// Returns: FeatureCollection with LineString features (empty properties)
// Each LineString segment corresponds to one encoded string from the API

// 6. Use in map library (e.g., Leaflet)
// map.addLayer(stops); // Add stops as markers
// map.addLayer(path);  // Add path as polylines
```

### Routes Through Stops Discovery
```typescript
// Find all routes passing through both stops
const result = await client.routes.getRoutesThroughStations({
  fromStopId: "30475",
  toStopId: "35376",
  routeId: "2292", // Optional: filter by specific route
  date: new Date("2026-01-20") // Optional: default is today
});

// Sort by start time to find next bus
const sortedByTime = result.items.sort((a, b) => {
  const timeA = a.startTime.split(':').map(Number);
  const timeB = b.startTime.split(':').map(Number);
  return (timeA[0] * 3600 + timeA[1] * 60 + timeA[2]) - 
         (timeB[0] * 3600 + timeB[1] * 60 + timeB[2]);
});

// Find next available bus (after current time)
const now = new Date();
const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
const nextBus = sortedByTime.find(item => item.startTime >= currentTime);

console.log(`Next bus: Route ${nextBus.routeNo} at ${nextBus.startTime}`);
console.log(`Travel time: ${nextBus.travelTime}`);
console.log(`Distance: ${nextBus.distance} km`);
```

### Price-Aware Route Selection
```typescript
// Get all routes between stops
const routes = await client.routes.getRoutesBetweenStops({
  fromStopId: "20623",
  toStopId: "20866"
});

// Get fares for each route
const routesWithFares = await Promise.all(
  routes.items.map(async (route) => {
    const fares = await client.routes.getFares({
      routeNo: route.routeNo,
      subrouteId: route.subrouteId,
      routeDirection: route.routeDirection,
      sourceCode: route.sourceCode,
      destinationCode: route.destinationCode
    });
    
    return {
      ...route,
      fares: fares.items,
      minFare: Math.min(...fares.items.map(f => parseFloat(f.fare))),
      maxFare: Math.max(...fares.items.map(f => parseFloat(f.fare))),
      hasAC: fares.items.some(f => f.serviceType.toLowerCase().includes('ac'))
    };
  })
);

// Sort by minimum fare
const cheapestRoutes = routesWithFares.sort((a, b) => a.minFare - b.minFare);
console.log(`Cheapest route: ${cheapestRoutes[0].routeNo} - ₹${cheapestRoutes[0].minFare}`);
```
