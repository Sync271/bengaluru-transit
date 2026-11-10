# Bengaluru Transit SDK

A type-safe TypeScript SDK for Bengaluru public transit APIs with Zod validation and GeoJSON support.

`BengaluruTransitClient` wraps the original transit API. `BengaluruTransitClientV2` wraps the current app API. The two clients use different hosts, headers, and route ids, and a value from one cannot be passed to the other.

> **⚠️ Disclaimer**: This is an **unofficial** SDK. It is not affiliated with, endorsed by, or connected to any official transit authority. This project is developed independently to provide better API design and consumption patterns for transit data that deserves better tooling.

## Intent

The underlying transit API contains valuable real-time and schedule data, but the API design and consumption patterns could be significantly improved. This SDK aims to:

- **Improve API Design**: Provide a clean, type-safe interface that makes the data more accessible
- **Better Consumption**: Normalize responses, validate inputs, and provide consistent data structures
- **Reduce Waste**: Make valuable transit data easier to use in applications, reducing the barrier to building transit-focused tools

This project is built with the intent of making public transit data more accessible to developers and ultimately improving the transit experience for commuters.

## Features

- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Validation**: Runtime validation using Zod schemas
- 🗺️ **GeoJSON**: Standard GeoJSON format for spatial data on `BengaluruTransitClient` (routes, stops, locations)
- 🚌 **Current app API**: `BengaluruTransitClientV2` covers search, trip planning, live vehicles, nearby buses, and occupancy
- 🚀 **Modern**: Built with modern TypeScript and ES modules
- 📦 **Lightweight**: Minimal dependencies
- 🔄 **Request Cancellation**: Optional AbortSignal support for canceling in-flight requests

## Installation

```bash
npm install bengaluru-transit
```

The package is native ESM (`"type": "module"`).

## Browser / CORS

`BengaluruTransitClientV2` can be called directly from a browser. Leave it on the default base URL, and do not enable credentialed requests. The server allows any origin only when cookies are not sent.

> **CORS**: `BengaluruTransitClient` talks to an API that does not allow cross-origin requests from browsers. Direct calls from frontend apps (React, Vue, etc.) will be blocked by CORS.
>
> For web applications using the original client, use your own backend as a proxy and pass its URL to the client:

```typescript
// Point the client at your proxy instead of the official API
const client = new BengaluruTransitClient({
  baseURL: "https://your-app.com/api/transit",  // Your proxy URL
  language: "en"
});

// All requests go to your proxy, which forwards to the BMTC API
const stops = await client.stops.findNearbyStops({
  coordinates: [13.09784, 77.59167],
  radius: 1
});
```

Your proxy should forward `POST` requests to `https://bmtcmobileapi.karnataka.gov.in/WebAPI/{endpoint}` with the same path, headers, and body. The SDK works in Node.js without a proxy.

## Quick Start

```typescript
import { BengaluruTransitClient } from "bengaluru-transit";

const client = new BengaluruTransitClient({ language: "en" });

// Example: Search for nearby bus stops
const stops = await client.stops.findNearbyStops({
  coordinates: [13.09784, 77.59167],
  radius: 1
});
console.log(stops.items.length, "stops found");
```

## BengaluruTransitClientV2

```typescript
import { BengaluruTransitClientV2 } from "bengaluru-transit";

const v2 = new BengaluruTransitClientV2();
```

Coordinates are `[latitude, longitude]`. Times of day are seconds from local midnight (`19:48` is `19 * 3600 + 48 * 60`). `day` is a lowercase weekday (`"tuesday"`). When `day` or `startTimeSeconds` is omitted, the client uses the current local time. Every method accepts an optional `signal` from `AbortController`.

Route ids from this client are not the ids used by `BengaluruTransitClient`.

### 1. Buses around you

```typescript
const nearby = await v2.getNearbyBuses({
  coordinates: [12.97793, 77.6283],
});

const stop = nearby.stops[0];
console.log(`${stop.stop.name} — ${stop.distanceKilometers} km`);

stop.buses.forEach(bus => {
  const live = bus.vehicles[0];
  console.log(
    `${bus.routeName} to ${bus.destinationName}`,
    live ? `in ${live.etaSeconds}s (${live.number})` : "no live bus"
  );
});
```

Each stop includes the buses scheduled to call there. `arrivalTimeSeconds` is that scheduled arrival. `vehicles` is filled only when a bus on that route is being tracked, and `etaSeconds` on a vehicle is the live estimate. `distanceKilometers` is the distance from the coordinates you passed.

### 2. Search

Search returns routes, stops, and places. `filter` limits the query to `"routes"` or `"stops"`. Omit it to receive stops and places together. `day` for search is `DD-MM-YYYY`, not a weekday.

```typescript
const found = await v2.search({
  query: "Majestic",
  coordinates: [12.9716, 77.5946],
});

found.stops.forEach(stop => {
  console.log(stop.name, stop.stopId, stop.stationType);
});

found.places.forEach(place => {
  console.log(place.description);
});

const routes = await v2.search({
  query: "500D",
  coordinates: [12.9716, 77.5946],
  filter: "routes",
});

const route = routes.routes[0];
console.log(route.routeName, route.routeId, route.firstStopName, "→", route.lastStopName);
```

### 3. Plan a trip

```typescript
const trip = await v2.planTrip({
  fromCoordinates: [12.97849, 77.63848],
  toCoordinates: [12.97793, 77.57389],
  startTimeSeconds: 19 * 3600 + 48 * 60,
  day: "tuesday",
});

const best = trip.itineraries[0];
console.log(`₹${best.totalFare}`, `${best.durationSeconds}s`);

best.legs.forEach(leg => {
  if (leg.mode === "BUS" || leg.mode === "METRO") {
    console.log(`${leg.mode} ${leg.routeName}: ${leg.fromStopName} → ${leg.toStopName}`);
  } else {
    console.log(`${leg.mode} ${leg.distanceMeters ?? 0} m`);
  }
});
```

`itineraries` are the main options. `nearbyItineraries` holds extra options the API marks as nearby. A leg's `mode` is `BUS`, `METRO`, `WALK`, or `AUTO`. `totalFare` is in rupees. `durationSeconds` is the whole trip. `startTimeSeconds` and `endTimeSeconds` on a leg are seconds from midnight.

### 4. Route details

```typescript
const details = await v2.getRouteDetails({
  routeId: route.routeId,
  day: "tuesday",
});

console.log(details.routeName, details.firstStop?.name, "→", details.lastStop?.name);
console.log(details.stops.length, "stops");

details.timetable.forEach(entry => {
  console.log("departs", entry.startTimeSeconds);
});
```

`stops` is the full stop sequence. `trips` are the scheduled trips for that day. `live` is whether the route is marked live. `ticketEnabled` is whether mobile ticketing is offered for it.

### 5. Live vehicles

`stopIds` is required. Pass the stop you care about, usually from `getRouteDetails` or `getNearbyBuses`.

```typescript
const live = await v2.getLiveVehicles({
  routeId: details.routeId,
  stopIds: [details.stops[0].stopId, details.lastStop!.stopId],
});

live.vehicles.forEach(vehicle => {
  console.log(vehicle.number, vehicle.latitude, vehicle.longitude, vehicle.bearing);
});

live.arrivals.forEach(arrival => {
  console.log(arrival.vehicleNumber, "at", arrival.stopId, "in", arrival.etaSeconds, "s");
});
```

`vehicles` are current positions. `arrivals` are those vehicles measured against each stop id you passed. `distanceMeters` is the remaining distance, and `updatedAt` is epoch milliseconds.

### 6. Arrivals for known stop and route pairs

Use this when you already know the pairs and do not need the full route.

```typescript
const arrivals = await v2.getStopArrivals({
  pairs: [{ stopId: "ArYFEPLj", routeId: details.routeId }],
});

arrivals.arrivals.forEach(arrival => {
  console.log(arrival.routeName, arrival.vehicleNumber, arrival.etaSeconds);
});
```

### 7. Occupancy

Pass the live vehicle's registration number, `updatedAt`, route id, and stop id.

```typescript
const occupancy = await v2.getOccupancy({
  vehicles: live.vehicles.flatMap(vehicle =>
    vehicle.updatedAt === undefined
      ? []
      : [{
          number: vehicle.number,
          updatedAt: vehicle.updatedAt,
          routeId: details.routeId,
          stopId: details.stops[0].stopId,
        }]
  ),
});

occupancy.vehicles.forEach(vehicle => {
  console.log(vehicle.number, vehicle.level);
});
```

`level` is derived from the numeric `status`:

| `status` | `level` |
| --- | --- |
| `-1` | `hidden` |
| `0`, `3` | `seats-available` |
| `1`, `4` | `standing-available` |
| `2`, `5` | `overcrowded` |
| anything else | `unknown` |

The API does not return a passenger count. `hidden` and `unknown` are not shown as an icon in the app.

## Common Flows

These examples use the `BengaluruTransitClient` from Quick Start.

### 1. Plan a Trip

Plan a trip from your location to a destination:

```typescript
// Plan trip from coordinates to a station
const trip = await client.routes.planTrip({
  fromCoordinates: [13.09784, 77.59167],
  toStopId: "20922", // Kempegowda Bus Station
});

// Find the fastest route with no transfers
const directRoutes = trip.routes.filter(r => r.transferCount === 0);
const fastest = directRoutes.sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds)[0];

console.log(`Fastest route: ${fastest.totalDuration} (${fastest.totalDurationSeconds}s)`);
console.log(`Fare: ₹${fastest.totalFare}`);
console.log(`Distance: ${fastest.totalDistance} km`);

// Show route details
fastest.legs.forEach(leg => {
  if (leg.routeNo.startsWith('walk')) {
    console.log(`Walk: ${leg.fromStationName} → ${leg.toStationName}`);
  } else {
    console.log(`Bus ${leg.routeNo}: ${leg.fromStationName} → ${leg.toStationName}`);
  }
});
```

### 2. Find Nearby Bus Stops

Find bus stops near your location:

```typescript
// Find stops within 1km
const nearby = await client.stops.findNearbyStops({
  coordinates: [13.09784, 77.59167], // [latitude, longitude]
  radius: 1 // radius in km
});

console.log(`Found ${nearby.items.length} stops nearby`);

// Each stop has location and distance information
nearby.items.forEach(stop => {
  console.log(`${stop.stationName} - Distance: ${stop.distance} km`);
  console.log(`Location: [${stop.latitude}, ${stop.longitude}]`);
});
```

### 3. Search for Places

Search for locations by name:

```typescript
const places = await client.locations.searchPlaces({ query: "Kempegowda Bus Station" });

places.items.forEach(place => {
  console.log(`${place.title} - [${place.latitude}, ${place.longitude}]`);
});
```

### 4. Track a Vehicle

Find and track a bus by registration number:

```typescript
// Search for vehicle
const vehicles = await client.vehicles.searchVehicles({ query: "KA57F2403" });

if (vehicles.items.length > 0) {
  const vehicle = vehicles.items[0];
  
  // Get live trip details
  const trip = await client.vehicles.getVehicleTrip({ vehicleId: vehicle.vehicleId });
  
  // Access route information from route stops
  const firstStop = trip.routeStops.features[0];
  console.log(`Route: ${firstStop.properties.routeNo}`);
  
  // Access live vehicle location
  const location = trip.vehicleLocation.features[0];
  const [lng, lat] = location.geometry.coordinates;
  console.log(`Current location: [${lat}, ${lng}]`);
  console.log(`Next stop: ${firstStop.properties.nextStop}`);
  console.log(`ETA: ${firstStop.properties.eta}`);
}
```

### 5. Visualize Trip Path on Map

Get trip stops and path as GeoJSON for map visualization:

```typescript
// 1. Plan the trip
const tripPlan = await client.routes.planTrip({
  fromStopId: "22357",
  toStopId: "21447"
});

// 2. Get all stops along the trip (GeoJSON Points)
const tripLegs = tripPlan.routes[0].legs
  .filter(leg => !leg.routeNo.startsWith('walk'))
  .map(leg => ({
    tripId: leg.tripId,
    fromStopId: leg.fromStopId,
    toStopId: leg.toStopId
  }));

const stops = await client.routes.getTripStops({ trips: tripLegs });
// Returns: FeatureCollection with Point features
// Use stops.features in your map library (Leaflet, Mapbox, etc.)

// 3. Get route path segments (GeoJSON LineStrings)
const path = await client.routes.getTripPath({ viaPoints: stops });
// Returns: FeatureCollection with LineString features
// Use path.features to draw the route path on your map

// Example with Leaflet:
// stops.features.forEach(stop => {
//   L.marker(stop.geometry.coordinates.reverse()).addTo(map);
// });
// path.features.forEach(segment => {
//   L.polyline(segment.geometry.coordinates).addTo(map);
// });
```

### 6. Search Routes

Search for routes by name or number:

```typescript
// Search routes
const routes = await client.routes.searchRoutes({ query: "285-M" });

routes.items.forEach(route => {
  console.log(`${route.routeNo} - ${route.routeName}`);
  console.log(`From: ${route.fromStop}`);
  console.log(`To: ${route.toStop}`);
});
```

### 7. Get Route Details

Get live vehicles and stops for a specific route:

```typescript
// Search for route
const routes = await client.routes.searchRoutes({ query: "500-CA" });
const routeId = routes.items[0].parentRouteId;

// Get route details (live vehicles + stops)
const details = await client.routes.searchByRouteDetails({ parentRouteId: routeId });

console.log(`Live vehicles (up): ${details.up.liveVehicles.features.length}`);
console.log(`Stops (up): ${details.up.stops.features.length}`);
console.log(`Live vehicles (down): ${details.down.liveVehicles.features.length}`);
console.log(`Stops (down): ${details.down.stops.features.length}`);

// Live vehicles are GeoJSON Points
details.up.liveVehicles.features.forEach(vehicle => {
  const [lng, lat] = vehicle.geometry.coordinates;
  console.log(`Vehicle ${vehicle.properties.vehicleNumber} at [${lat}, ${lng}]`);
});
```

## API Reference

### Routes API

- `planTrip({ fromStopId|fromCoordinates, toStopId|toCoordinates, serviceTypeId?, fromDateTime?, filterBy? })` - Complete trip planning with transfers
- `getTripStops({ trips })` - Get all stops along trip legs (GeoJSON Points)
- `getTripPath({ viaPoints })` - Get route path segments (GeoJSON LineStrings)
- `searchRoutes({ query })` - Search routes by name/number
- `getAllRoutes()` - Get complete list of all routes
- `getRoutePoints({ routeId })` - Get route path as GeoJSON
- `getTimetableByRoute({ routeId, startTime?, endTime?, fromStopId?, toStopId? })` - Get timetable for a route. When `startTime` is provided, the API returns the full day's schedule from midnight; otherwise trips from the current moment onward.
- `searchByRouteDetails({ parentRouteId, serviceTypeId? })` - Get live vehicles and stops for a route
- `getFares({ routeNo, subrouteId, routeDirection, sourceCode, destinationCode })` - Get fare information
- `getRoutesBetweenStops({ fromStopId, toStopId })` - Find routes between two stops
- `getRoutesThroughStations({ fromStopId, toStopId, routeId?, date? })` - Routes passing through both stops
- `getStationTrips({ stationId, tripType })` - Get trips at a station: `tripType: "running"` for buses arriving now, `"scheduled"` for upcoming trips

### Stops API

- `findNearbyStops({ coordinates?, radius, stationId?, stationType?, bmtcCategory? })` - Find stops within radius. Use `stationId` to get stations near a specific stop. Coordinates default to Bangalore center when omitted.
- `findNearbyStations({ coordinates })` - Find nearby stations with facilities (GeoJSON)
- `searchBusStops({ stationName, stationType? })` - Search stops by name

### Vehicles API

- `searchVehicles({ query })` - Search vehicles by registration number
- `getVehicleTrip({ vehicleId })` - Get live vehicle location and trip details

### Locations API

- `searchPlaces({ query })` - Search locations/places by name (GeoJSON)

### Info API

- `getHelpline()` - Get transit helpline contact information
- `getServiceTypes()` - Get available service types (AC, Non-AC, etc.)
- `getAbout()` - Get general transit information
- `getEmergencyMessages()` - Get emergency alerts and messages
- `getFareScrollMessages()` - Get fare-related announcements

## More Examples

### Find Routes Between Two Stops

```typescript
// Find all routes connecting two stops
const routes = await client.routes.getRoutesBetweenStops({
  fromStopId: "22357",
  toStopId: "21447"
});

routes.items.forEach(route => {
  console.log(`Route ${route.routeNo}: ${route.fromDisplayName} → ${route.toDisplayName}`);
});
```

### Get Routes Through Stops

```typescript
// Find routes that pass through both stops (with schedule info)
const routes = await client.routes.getRoutesThroughStations({
  fromStopId: "30475",
  toStopId: "35376",
  date: new Date() // Optional: defaults to current date
});

routes.items.forEach(route => {
  console.log(`Route ${route.routeNo} starts at ${route.startTime}`);
  console.log(`Travel time: ${route.travelTime}, Distance: ${route.distance} km`);
});
```

### Get Fare Information

```typescript
// First, get routes between stops
const routes = await client.routes.getRoutesBetweenStops({
  fromStopId: "22357",
  toStopId: "21447"
});

// Then get fare for a specific route
const route = routes.items[0];
const fare = await client.routes.getFares({
  routeNo: route.routeNo,
  subrouteId: route.subrouteId,
  routeDirection: route.routeDirection,
  sourceCode: route.sourceCode,
  destinationCode: route.destinationCode
});

fare.items.forEach(item => {
  console.log(`Service: ${item.serviceType}, Fare: ₹${item.fare}`);
});
```

### Get Timetable for a Route

```typescript
// Get full day's timetable (pass startTime at midnight to receive all trips for that day)
const timetable = await client.routes.getTimetableByRoute({
  routeId: "11797",
  startTime: new Date("2026-01-20T00:00:00"),
  fromStopId: "22357",
  toStopId: "21447",
});

timetable.items.forEach(item => {
  console.log(`${item.fromStopName} → ${item.toStopName}`);
  item.tripDetails.forEach(trip => {
    console.log(`  ${trip.startTime} - ${trip.endTime}`);
  });
});
```

When `startTime` is provided, the SDK sets `current_date` to midnight of that day so the BMTC API returns the full day's schedule. Without `startTime`, it uses the current time and returns only trips from "now" onward.

### Search and Track Vehicle

```typescript
// Complete workflow: search → track
const vehicles = await client.vehicles.searchVehicles({ query: "KA57" });

if (vehicles.items.length > 0) {
  const vehicle = vehicles.items[0];
  const trip = await client.vehicles.getVehicleTrip({ vehicleId: vehicle.vehicleId });
  
  console.log(`Vehicle ${vehicle.vehicleRegNo} is on route ${trip.routeStops.features[0].properties.routeNo}`);
  console.log(`Current location:`, trip.vehicleLocation.features[0].geometry.coordinates);
}
```

### Get Service Types and Filter Trip

```typescript
// Get service types and use to filter trip planning
const serviceTypes = await client.info.getServiceTypes();
const acService = serviceTypes.items.find(s => s.serviceTypeName.includes("AC"));

if (acService) {
  const trip = await client.routes.planTrip({
    fromCoordinates: [13.09784, 77.59167],
    toStopId: "20922",
    serviceTypeId: acService.serviceTypeId
  });
  
  console.log(`Found ${trip.routes.length} AC bus routes`);
}
```

### Check Emergency Messages

```typescript
// Get current emergency messages and alerts
const messages = await client.info.getEmergencyMessages();
const activeMessages = messages.items.filter(m => m.isDisplay);

if (activeMessages.length > 0) {
  console.log("Active alerts:");
  activeMessages.forEach(msg => {
    console.log(`${msg.displayKey}: ${msg.messageEn}`);
  });
}
```

For complete API documentation and agentic workflows, see [AGENTIC_CAPABILITIES.md](./AGENTIC_CAPABILITIES.md)

## Agent Integration

This wrapper is designed to work seamlessly with AI agents and function calling frameworks. All methods are fully typed, validated, and include comprehensive JSDoc documentation.

### Key Features for Agents

✅ **Type-Safe Parameters** - All inputs are validated with Zod schemas  
✅ **Structured Responses** - Consistent, normalized data formats  
✅ **Proper Error Types** - `TransitValidationError` for validation errors, `HTTPError` (from ky) for network/API errors  
✅ **GeoJSON Support** - Standard format for spatial data (compatible with mapping libraries)  
✅ **String IDs** - All IDs are strings (agent-friendly, no type confusion)  
✅ **Date Objects** - Consistent Date object handling (no string parsing needed)  
✅ **JSDoc Documentation** - Complete `@param`, `@returns`, `@throws`, and `@example` tags  
✅ **Request Cancellation** - Pass `signal` from AbortController to cancel requests  

### Request Cancellation

All API methods accept an optional `signal` (from `AbortController`) for request cancellation. Useful when components unmount, search queries change, or the user navigates away.

```typescript
const controller = new AbortController();

// Pass signal to methods with params (as part of the params object)
const trip = await client.routes.planTrip({
  fromStopId: "22357",
  toStopId: "21447",
  signal: controller.signal,
});

// Pass options object to methods without params
const helpline = await client.info.getHelpline({ signal: controller.signal });

// Cancel the request
controller.abort(); // Throws DOMException with name "AbortError"
```

**React example** – cancel when component unmounts:

```typescript
useEffect(() => {
  const controller = new AbortController();
  client.stops.findNearbyStops({
    coordinates: [lat, lng],
    radius: 1,
    signal: controller.signal,
  }).then(setStops).catch(console.error);
  return () => controller.abort(); // Cleanup on unmount
}, [lat, lng]);
```

### Error Handling

```typescript
import { BengaluruTransitClient, TransitError, TransitValidationError } from "bengaluru-transit";
import type { HTTPError } from "ky";

const client = new BengaluruTransitClient({ language: "en" });

try {
  const trip = await client.routes.planTrip({ 
    fromStopId: "22357", 
    toStopId: "21447" 
  });
} catch (error) {
  if (error instanceof TransitValidationError) {
    // Validation error with detailed field information
    console.error("Validation failed:", error.message);
    console.error("Details:", error.details);
  } else if (error instanceof TransitError) {
    // Other transit errors
    console.error("Transit error:", error.message);
    console.error("Code:", error.code);
  } else if ((error as HTTPError).response) {
    // HTTP error from network/API
    const httpError = error as HTTPError;
    console.error("HTTP error:", httpError.message);
    console.error("Status:", httpError.response.status);
  }
}
```

### Function Calling Example

See [examples/function-calling.ts](./examples/function-calling.ts) for a complete example of how to use the wrapper with AI agents that support structured function calling (OpenAI, Anthropic, etc.).

For detailed agent workflows and capabilities, see [AGENTIC_CAPABILITIES.md](./AGENTIC_CAPABILITIES.md)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run unit tests (with mocks)
npm run test:unit

# Run all tests
npm test

# Watch tests
npm run test:watch

# Run integration tests against real transit API
npm run test:integration

# Run specific endpoint integration test
npm run test:integration:helpline
npm run test:integration:service
npm run test:integration:about
npm run test:integration:emergency
npm run test:integration:vehicle

# Or use TEST_ENDPOINT environment variable
TEST_ENDPOINT=helpline npm run test:integration
```

### Testing

This project includes comprehensive testing with both unit tests (mocked) and integration tests (real API).

#### Unit Tests

Unit tests use mocked HTTP responses and don't require network access. They're fast and can be run frequently during development.

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

#### Integration Tests

Integration tests make actual HTTP requests to the real transit API. They verify that the SDK works correctly with the actual API endpoints.

**⚠️ Important Notes:**

- Integration tests require network access
- Tests are rate-limited with a 2-second delay between requests to prevent IP blocking
- Tests run sequentially to avoid overwhelming the API
- Tests are skipped by default unless explicitly enabled

**Running Integration Tests:**

```bash
# Run all integration tests
npm run test:integration

# Run specific endpoint tests (recommended for faster testing)
npm run test:integration:helpline
npm run test:integration:service
npm run test:integration:about
npm run test:integration:emergency
npm run test:integration:vehicle

# Or use environment variable for custom filtering
TEST_ENDPOINT=helpline npm run test:integration
```

**Environment Variables:**

- `RUN_REAL_API_TESTS`: Set to `true` or `1` to enable integration tests (automatically set by `test:integration` scripts)
- `TEST_ENDPOINT`: Filter tests by endpoint name (e.g., `helpline`, `vehicle`, `service`, `about`, `emergency`)

**Test Output:**

Integration tests print formatted JSON responses to the console, making it easy to inspect the actual API responses and verify the normalization is working correctly.

**Rate Limiting:**

The integration tests include a 2-second delay between each test to prevent rate limiting. Tests are configured to run sequentially (single fork) to ensure proper rate limiting behavior.

## Acknowledgments

Thanks to [open-bmtc](https://github.com/Vonter/open-bmtc) for helping understand the BMTC API structure.

## License

MIT
