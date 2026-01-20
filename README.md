# BMTC TypeScript Wrapper

A type-safe TypeScript wrapper for BMTC (Bangalore Metropolitan Transport Corporation) APIs with Zod validation and GeoJSON support.

## Features

- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Validation**: Runtime validation using Zod schemas
- 🗺️ **GeoJSON**: Standard GeoJSON format for all spatial data (routes, stops, locations)
- 🚀 **Modern**: Built with modern TypeScript and ES modules
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install bmtc-wrapper
```

## Quick Start

```typescript
import { BMTCClient } from "bmtc-wrapper";

const client = new BMTCClient({ language: "en" });

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

## API Endpoints

### Routes API
- `planTrip(params)` - Complete trip planning with transfers
- `getTripStops(params)` - Get all stops along trip legs (GeoJSON Points)
- `getTripPath(params)` - Get route path segments (GeoJSON LineStrings)
- `searchRoutes(query)` - Search routes by name/number
- `getRoutePoints(routeId)` - Get route path as GeoJSON
- `getFares(params)` - Get fare information
- `getRoutesBetweenStops(fromStopId, toStopId)` - Find routes between two stops

### Stops API
- `findNearbyStops(lat, lon, radius)` - Find stops within radius (GeoJSON)
- `findNearbyStations(lat, lon)` - Find nearby stations with facilities (GeoJSON)
- `searchBusStops(stationName)` - Search stops by name

### Vehicles API
- `searchVehicles(query)` - Search vehicles by registration number
- `getVehicleTrip(vehicleId)` - Get live vehicle location and trip details

### Locations API
- `searchPlaces(query)` - Search locations/places by name (GeoJSON)

For complete API documentation, see [AGENTIC_CAPABILITIES.md](./AGENTIC_CAPABILITIES.md)

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

# Run integration tests against real BMTC API
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

Integration tests make actual HTTP requests to the real BMTC API. They verify that the wrapper works correctly with the actual API endpoints.

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
