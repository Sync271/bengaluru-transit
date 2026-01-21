# Bengaluru Transit SDK

A type-safe TypeScript SDK for Bengaluru public transit APIs with Zod validation and GeoJSON support.

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
- 🗺️ **GeoJSON**: Standard GeoJSON format for all spatial data (routes, stops, locations)
- 🚀 **Modern**: Built with modern TypeScript and ES modules
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install bengaluru-transit
```

## Quick Start

```typescript
import { BengaluruTransitClient } from "bengaluru-transit";

const client = new BengaluruTransitClient({ language: "en" });

// Example: Search for nearby bus stops
const stops = await client.stops.findNearbyStops({
  coordinates: [13.09784, 77.59167],
  radius: 1
});
console.log(stops.features.length, "stops found");
```

## Common Flows

### 1. Plan a Trip

Plan a trip from your location to a destination:

```typescript
// Plan trip from coordinates to a station
const trip = await client.routes.planTrip({
  fromCoordinates: [13.09784, 77.59167],
  toStopId: 20922, // Kempegowda Bus Station
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

console.log(`Found ${nearby.features.length} stops nearby`);

// Each stop is a GeoJSON Point feature
nearby.features.forEach(stop => {
  const [lng, lat] = stop.geometry.coordinates;
  console.log(`${stop.properties.stopName} - ${stop.properties.address}`);
});
```

### 3. Search for Places

Search for locations by name:

```typescript
const places = await client.locations.searchPlaces("Kempegowda Bus Station");

places.features.forEach(place => {
  const [lng, lat] = place.geometry.coordinates;
  console.log(`${place.properties.placeName} - [${lat}, ${lng}]`);
});
```

### 4. Track a Vehicle

Find and track a bus by registration number:

```typescript
// Search for vehicle
const vehicles = await client.vehicles.searchVehicles("KA57F2403");

if (vehicles.length > 0) {
  const vehicle = vehicles[0];
  
  // Get live trip details
  const trip = await client.vehicles.getVehicleTrip(vehicle.vehicleId);
  
  console.log(`Route: ${trip.routeNo}`);
  console.log(`Current location: [${trip.latitude}, ${trip.longitude}]`);
  console.log(`Next stop: ${trip.nextStopName}`);
  console.log(`ETA: ${trip.etaToNextStop}`);
}
```

### 5. Visualize Trip Path on Map

Get trip stops and path as GeoJSON for map visualization:

```typescript
// 1. Plan the trip
const tripPlan = await client.routes.planTrip({
  fromStopId: 22357,
  toStopId: 21447
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
const routes = await client.routes.searchRoutes("285-M");

routes.forEach(route => {
  console.log(`${route.routeNo} - ${route.routeName}`);
  console.log(`From: ${route.fromStationName}`);
  console.log(`To: ${route.toStationName}`);
});
```

### 7. Get Route Details

Get live vehicles and stops for a specific route:

```typescript
// Search for route
const routes = await client.routes.searchRoutes("500-CA");
const routeId = routes[0].parentRouteId;

// Get route details (live vehicles + stops)
const details = await client.routes.searchByRouteDetails(routeId);

console.log(`Live vehicles: ${details.vehicles.features.length}`);
console.log(`Stops: ${details.stops.features.length}`);

// Live vehicles are GeoJSON Points
details.vehicles.features.forEach(vehicle => {
  console.log(`Vehicle ${vehicle.properties.vehicleRegNo} at [${vehicle.geometry.coordinates}]`);
});
```

## API Reference

### Routes API
- `planTrip(params)` - Complete trip planning with transfers
- `getTripStops(params)` - Get all stops along trip legs (GeoJSON Points)
- `getTripPath(params)` - Get route path segments (GeoJSON LineStrings)
- `searchRoutes(query)` - Search routes by name/number
- `getRoutePoints(routeId)` - Get route path as GeoJSON
- `getFares(params)` - Get fare information
- `getRoutesBetweenStops(fromStopId, toStopId)` - Find routes between two stops
- `getRoutesThroughStations(fromStopId, toStopId, routeId?, date?)` - Routes passing through both stops

### Stops API
- `findNearbyStops(lat, lon, radius)` - Find stops within radius (GeoJSON)
- `findNearbyStations(lat, lon)` - Find nearby stations with facilities (GeoJSON)
- `searchBusStops(stationName)` - Search stops by name

### Vehicles API
- `searchVehicles(query)` - Search vehicles by registration number
- `getVehicleTrip(vehicleId)` - Get live vehicle location and trip details

### Locations API
- `searchPlaces(query)` - Search locations/places by name (GeoJSON)

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
  console.log(`Route ${route.routeNo}: ${route.fromStop} → ${route.toStop}`);
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
// Get fare for a specific route between stops
const fare = await client.routes.getFares({
  fromStopId: "22357",
  toStopId: "21447",
  routeId: "11797"
});

fare.items.forEach(item => {
  console.log(`Fare: ₹${item.fare}`);
});
```

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

## License

MIT
