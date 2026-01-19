/**
 * Integration tests against the real BMTC API
 *
 * These tests make actual HTTP requests to the BMTC API.
 * Use with caution - they require network access and may be rate-limited.
 *
 * To run these tests:
 *   npm run test:integration
 *
 * Or set environment variable:
 *   RUN_REAL_API_TESTS=true npm test
 */

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";

// Only run these tests if explicitly enabled
// Set RUN_REAL_API_TESTS=true environment variable to run
const RUN_REAL_API_TESTS =
	process.env.RUN_REAL_API_TESTS === "true" ||
	process.env.RUN_REAL_API_TESTS === "1";

// Filter tests by endpoint name (optional)
// Set TEST_ENDPOINT=helpline to run only helpline tests, etc.
const TEST_ENDPOINT = process.env.TEST_ENDPOINT?.toLowerCase();

// Helper to check if a test should run based on filter
function shouldRunTest(endpointName: string): boolean {
	if (!TEST_ENDPOINT) return true;
	return endpointName.toLowerCase().includes(TEST_ENDPOINT);
}

// Delay between tests to prevent rate limiting (in milliseconds)
const RATE_LIMIT_DELAY = 2000; // 2 second delay between requests

/**
 * Helper function to add delay between API calls
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe.skipIf(!RUN_REAL_API_TESTS)("BMTC Real API Integration Tests", () => {
	let client: BMTCClient;

	beforeAll(() => {
		client = new BMTCClient({
			language: "en",
		});
	});

	// Add delay after each test to prevent rate limiting
	afterEach(async () => {
		await delay(RATE_LIMIT_DELAY);
	});

	describe("Info API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("helpline"))(
			"should fetch helpline data from real API",
			async () => {
				const result = await client.info.getHelpline();

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);
				expect(result.items[0]).toHaveProperty("helplineNumber");
				expect(result.items[0]).toHaveProperty("labelName");

				// Print formatted response
				console.log("\n📞 Helpline Data Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		); // 30 second timeout for real API calls

		it.skipIf(!shouldRunTest("service"))(
			"should fetch service types from real API",
			async () => {
				const result = await client.info.getServiceTypes();

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);
				expect(result.items[0]).toHaveProperty("serviceType");
				expect(result.items[0]).toHaveProperty("serviceTypeId");

				// Print formatted response
				console.log("\n🚌 Service Types Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("about"))(
			"should fetch about data from real API",
			async () => {
				const result = await client.info.getAbout();

				expect(result).toBeDefined();
				expect(result.item).toBeDefined();
				expect(result.item).toHaveProperty("termsAndConditionsUrl");
				expect(result.item).toHaveProperty("aboutBmtcUrl");
				expect(result.item).toHaveProperty("airportLatitude");
				expect(result.item).toHaveProperty("airportLongitude");

				// Print formatted response
				console.log("\nℹ️ About Data Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("emergency"))(
			"should fetch emergency messages from real API",
			async () => {
				const result = await client.info.getEmergencyMessages();

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				if (result.items.length > 0) {
					expect(result.items[0]).toHaveProperty("messageEnglish");
					expect(result.items[0]).toHaveProperty("messageKannada");
					expect(result.items[0]).toHaveProperty("isDisplay");
					expect(result.items[0]).toHaveProperty("displayKey");
				}

				// Print formatted response
				console.log("\n🚨 Emergency Messages Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Vehicles API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("vehicle"))(
			"should list vehicles from real API",
			async () => {
				const result = await client.vehicles.searchVehicles({
					query: "KA57f183",
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				if (result.items.length > 0) {
					expect(result.items[0]).toHaveProperty("vehicleId");
					expect(result.items[0]).toHaveProperty("vehicleRegNo");
					expect(result.items[0]).toHaveProperty("responseCode");
				}

				// Print formatted response
				console.log("\n🚗 List Vehicles Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("vehicle"))(
			"should get vehicle trip details from real API",
			async () => {
				const result = await client.vehicles.getVehicleTrip({
					vehicleId: "21537",
				});

				expect(result).toBeDefined();
				expect(result.routeStops).toBeDefined();
				expect(result.routeStops.type).toBe("FeatureCollection");
				expect(result.vehicleLocation).toBeDefined();
				expect(result.vehicleLocation.type).toBe("FeatureCollection");
				if (result.routeStops.features.length > 0) {
					expect(result.routeStops.features[0].geometry.type).toBe("Point");
					expect(result.routeStops.features[0].properties).toHaveProperty(
						"tripId"
					);
					expect(result.routeStops.features[0].properties).toHaveProperty(
						"routeNo"
					);
					expect(result.routeStops.features[0].properties).toHaveProperty(
						"vehicleId"
					);
				}
				if (result.vehicleLocation.features.length > 0) {
					expect(result.vehicleLocation.features[0].geometry.type).toBe(
						"Point"
					);
					expect(result.vehicleLocation.features[0].properties).toHaveProperty(
						"vehicleId"
					);
					expect(
						result.vehicleLocation.features[0].geometry.coordinates
					).toHaveLength(2);
				}

				// Print formatted response
				console.log("\n🚌 Vehicle Trip Details Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Stops API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("stop"))(
			"should find nearby stations from real API",
			async () => {
				const result = await client.stops.findNearbyStations({
					coordinates: [13.079389141522491, 77.58817675200433],
				});

				expect(result).toBeDefined();
				expect(result.stations).toBeInstanceOf(Array);
				if (result.stations.length > 0) {
					expect(result.stations[0]).toHaveProperty("stationName");
					expect(result.stations[0]).toHaveProperty("distance");
					expect(result.stations[0]).toHaveProperty("facilityTypes");
					expect(result.stations[0].facilityTypes).toBeInstanceOf(Array);

					// Verify GeoJSON structure
					if (result.stations[0].facilityTypes.length > 0) {
						const facilityType = result.stations[0].facilityTypes[0];
						expect(facilityType.facilities.type).toBe("FeatureCollection");
						if (facilityType.facilities.features.length > 0) {
							expect(facilityType.facilities.features[0].geometry.type).toBe(
								"Point"
							);
							expect(
								facilityType.facilities.features[0].geometry.coordinates
							).toHaveLength(2);
							expect(
								facilityType.facilities.features[0].properties
							).toHaveProperty("facilityName");
							expect(
								facilityType.facilities.features[0].properties
							).toHaveProperty("facilityType");
						}
					}
				}

				// Print formatted response
				console.log("\n🚏 Nearby Stations Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Routes API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("route"))(
			"should get all routes from real API",
			async () => {
				const result = await client.routes.getAllRoutes();

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);
				if (result.items.length > 0) {
					expect(result.items[0]).toHaveProperty("subrouteId");
					expect(result.items[0]).toHaveProperty("routeNo");
					expect(result.items[0]).toHaveProperty("routeName");
					expect(result.items[0]).toHaveProperty("fromStationId");
					expect(result.items[0]).toHaveProperty("fromStation");
					expect(result.items[0]).toHaveProperty("toStationId");
					expect(result.items[0]).toHaveProperty("toStation");
					expect(typeof result.items[0].subrouteId).toBe("string");
				}

				// Print formatted response (first 5 items only to avoid huge output)
				console.log("\n🗺️ All Routes Response (first 5 items):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							items: result.items.slice(0, 5),
						},
						null,
						2
					)
				);
				console.log(`... and ${result.items.length - 5} more items`);
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("route"))(
			"should search routes from real API",
			async () => {
				const result = await client.routes.searchRoutes({
					query: "80-a",
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				if (result.items.length > 0) {
					expect(result.items[0]).toHaveProperty("routeNo");
					expect(result.items[0]).toHaveProperty("parentRouteId");
					expect(result.items[0]).toHaveProperty("unionRowNo");
					expect(result.items[0]).toHaveProperty("row");
					expect(typeof result.items[0].parentRouteId).toBe("string");
				}

				// Print formatted response
				console.log("\n🔍 Route Search Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("route"))(
			"should get route points from real API",
			async () => {
				// Use a known routeId from the example (11797)
				const result = await client.routes.getRoutePoints({
					routeId: "11797",
				});

				expect(result).toBeDefined();
				expect(result.routePath).toBeDefined();
				expect(result.routePath.type).toBe("FeatureCollection");
				expect(result.routePath.features).toHaveLength(1);
				expect(result.routePath.features[0].geometry.type).toBe("LineString");
				if (result.routePath.features[0].geometry.coordinates.length > 0) {
					expect(
						result.routePath.features[0].geometry.coordinates[0]
					).toHaveLength(2);
					expect(
						result.routePath.features[0].geometry.coordinates[0][0]
					).toBeGreaterThan(70); // Longitude for Bangalore
					expect(
						result.routePath.features[0].geometry.coordinates[0][1]
					).toBeGreaterThan(10); // Latitude for Bangalore
					expect(result.routePath.features[0].properties.routeId).toBe("11797");
				}

				// Print formatted response
				console.log("\n🛣️ Route Points Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("route"))(
			"should get timetable by route from real API",
			async () => {
				// Use routeId 2981 from the example
				const startTime = new Date("2025-01-15T10:00:00");
				const endTime = new Date("2025-01-15T23:59:00");

				const result = await client.routes.getTimetableByRoute({
					routeId: "2981",
					startTime,
					endTime,
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				if (result.items.length > 0) {
					const item = result.items[0];
					expect(item).toHaveProperty("fromStationName");
					expect(item).toHaveProperty("toStationName");
					expect(item).toHaveProperty("fromStationId");
					expect(item).toHaveProperty("toStationId");
					expect(item).toHaveProperty("approximateTime");
					expect(item).toHaveProperty("distance");
					expect(item).toHaveProperty("platformName");
					expect(item).toHaveProperty("platformNumber");
					expect(item).toHaveProperty("bayNumber");
					expect(item).toHaveProperty("tripDetails");
					expect(item.tripDetails).toBeInstanceOf(Array);
					expect(typeof item.fromStationId).toBe("string");
					expect(typeof item.toStationId).toBe("string");
					expect(typeof item.distance).toBe("number");
					if (item.tripDetails.length > 0) {
						expect(item.tripDetails[0]).toHaveProperty("startTime");
						expect(item.tripDetails[0]).toHaveProperty("endTime");
					}
				}

				// Print formatted response (first item only to avoid huge output)
				console.log("\n⏰ Timetable Response (first item):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							items: result.items.slice(0, 1).map((item) => ({
								...item,
								tripDetails: item.tripDetails.slice(0, 5), // First 5 trips only
							})),
						},
						null,
						2
					)
				);
				if (result.items.length > 0 && result.items[0].tripDetails.length > 5) {
					console.log(
						`... and ${
							result.items[0].tripDetails.length - 5
						} more trips in first item`
					);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("route"))(
			"should search route details from real API",
			async () => {
				// Use parentRouteId 2124 from the example
				const result = await client.routes.searchByRouteDetails({
					parentRouteId: "2124",
				});

				expect(result).toBeDefined();
				expect(result).toHaveProperty("up");
				expect(result).toHaveProperty("down");
				expect(result.up).toHaveProperty("stops");
				expect(result.up).toHaveProperty("stationVehicles");
				expect(result.up).toHaveProperty("liveVehicles");
				expect(result.down).toHaveProperty("stops");
				expect(result.down).toHaveProperty("stationVehicles");
				expect(result.down).toHaveProperty("liveVehicles");

				// Verify up direction structure - GeoJSON FeatureCollections
				expect(result.up.stops.type).toBe("FeatureCollection");
				expect(result.up.stops.features).toBeInstanceOf(Array);
				if (result.up.stops.features.length > 0) {
					const stationFeature = result.up.stops.features[0];
					expect(stationFeature.geometry.type).toBe("Point");
					expect(stationFeature.geometry.coordinates).toHaveLength(2);
					expect(stationFeature.properties).toHaveProperty("stopId");
					expect(stationFeature.properties).toHaveProperty("subrouteId");
					expect(stationFeature.properties).toHaveProperty("stopName");
					expect(stationFeature.properties).toHaveProperty("from");
					expect(stationFeature.properties).toHaveProperty("to");
					expect(stationFeature.properties).toHaveProperty("routeNo");
					expect(stationFeature.properties).toHaveProperty("distanceOnStation");
					expect(typeof stationFeature.properties.subrouteId).toBe("string");
					expect(typeof stationFeature.properties.stopId).toBe("string");
				}

				// Verify stationVehicles structure - GeoJSON FeatureCollection
				expect(result.up.stationVehicles.type).toBe("FeatureCollection");
				expect(result.up.stationVehicles.features).toBeInstanceOf(Array);
				if (result.up.stationVehicles.features.length > 0) {
					const vehicleFeature = result.up.stationVehicles.features[0];
					expect(vehicleFeature.geometry.type).toBe("Point");
					expect(vehicleFeature.geometry.coordinates).toHaveLength(2);
					expect(vehicleFeature.properties).toHaveProperty("vehicleId");
					expect(vehicleFeature.properties).toHaveProperty("vehicleNumber");
					expect(vehicleFeature.properties).toHaveProperty("serviceTypeId");
					expect(vehicleFeature.properties).toHaveProperty("serviceType");
					expect(vehicleFeature.properties).toHaveProperty("currentLocationId");
					expect(typeof vehicleFeature.properties.vehicleId).toBe("string");
					expect(typeof vehicleFeature.properties.serviceTypeId).toBe("string");
					expect(typeof vehicleFeature.properties.currentLocationId).toBe("string");
				}

				// Verify liveVehicles structure - GeoJSON FeatureCollection
				expect(result.up.liveVehicles.type).toBe("FeatureCollection");
				expect(result.up.liveVehicles.features).toBeInstanceOf(Array);
				if (result.up.liveVehicles.features.length > 0) {
					const vehicleFeature = result.up.liveVehicles.features[0];
					expect(vehicleFeature.geometry.type).toBe("Point");
					expect(vehicleFeature.geometry.coordinates).toHaveLength(2);
					expect(vehicleFeature.properties).toHaveProperty("vehicleId");
					expect(vehicleFeature.properties).toHaveProperty("vehicleNumber");
					expect(typeof vehicleFeature.properties.vehicleId).toBe("string");
				}

				// Print formatted response (first station from up direction only)
				console.log("\n🔍 Route Details Response (first station from up):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				const sampleResponse = {
					...result,
					up: {
						...result.up,
						stops: {
							...result.up.stops,
							features: result.up.stops.features.slice(0, 1),
						},
						stationVehicles: {
							...result.up.stationVehicles,
							features: result.up.stationVehicles.features.slice(0, 1),
						},
						liveVehicles: {
							...result.up.liveVehicles,
							features: result.up.liveVehicles.features.slice(0, 1),
						},
					},
					down: {
						...result.down,
						stops: {
							...result.down.stops,
							features: result.down.stops.features.slice(0, 1),
						},
						stationVehicles: {
							...result.down.stationVehicles,
							features: result.down.stationVehicles.features.slice(0, 1),
						},
						liveVehicles: {
							...result.down.liveVehicles,
							features: result.down.liveVehicles.features.slice(0, 1),
						},
					},
				};
				console.log(JSON.stringify(sampleResponse, null, 2));
				if (result.up.stops.features.length > 1) {
					console.log(`... and ${result.up.stops.features.length - 1} more stations in up direction`);
				}
				if (result.down.stops.features.length > 0) {
					console.log(`... and ${result.down.stops.features.length} stations in down direction`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("route") && !shouldRunTest("fare"))(
			"should get routes between stations and fare data from real API",
			async () => {
				await delay(RATE_LIMIT_DELAY);

				// First, get routes between stations
				const routesResult = await client.routes.getRoutesBetweenStations({
					fromStationId: "20623", // Banashankari Bus Station
					toStationId: "20866", // ITPL
				});

				expect(routesResult).toBeDefined();
				expect(routesResult.success).toBe(true);
				expect(routesResult.items.length).toBeGreaterThan(0);

				// Get the first route item for fare data
				const firstRoute = routesResult.items[0];

				// Now get fare data using the route details
				await delay(RATE_LIMIT_DELAY);

				const fareResult = await client.routes.getFares({
					routeNo: firstRoute.routeNo,
					subrouteId: firstRoute.subrouteId,
					routeDirection: firstRoute.routeDirection,
					sourceCode: firstRoute.sourceCode,
					destinationCode: firstRoute.destinationCode,
				});

				expect(fareResult).toBeDefined();
				expect(fareResult.success).toBe(true);
				expect(fareResult.items).toBeInstanceOf(Array);
				if (fareResult.items.length > 0) {
					const fareItem = fareResult.items[0];
					expect(fareItem).toHaveProperty("serviceType");
					expect(fareItem).toHaveProperty("fare");
					expect(typeof fareItem.serviceType).toBe("string");
					expect(typeof fareItem.fare).toBe("string");
				}

				// Verify routeDirection is normalized to lowercase
				expect(firstRoute.routeDirection).toMatch(/^(up|down)$/);

				// Print formatted response
				console.log("\n💰 Fare Data Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(fareResult, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Locations API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("place"))(
			"should search places from real API",
			async () => {
				const result = await client.locations.searchPlaces({
					query: "cbi",
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);
				if (result.items.length > 0) {
					const item = result.items[0];
					expect(item).toHaveProperty("title");
					expect(item).toHaveProperty("address");
					expect(item).toHaveProperty("latitude");
					expect(item).toHaveProperty("longitude");
					expect(typeof item.latitude).toBe("number");
					expect(typeof item.longitude).toBe("number");
					expect(item.latitude).toBeGreaterThan(10);
					expect(item.latitude).toBeLessThan(14);
					expect(item.longitude).toBeGreaterThan(75);
					expect(item.longitude).toBeLessThan(79);
				}

				// Print formatted response (first 5 items only to avoid huge output)
				console.log("\n📍 Search Places Response (first 5 items):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							items: result.items.slice(0, 5),
						},
						null,
						2
					)
				);
				if (result.items.length > 5) {
					console.log(`... and ${result.items.length - 5} more items`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Stops API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("stop"))(
			"should search bus stops from real API",
			async () => {
				await delay(RATE_LIMIT_DELAY);

				const result = await client.stops.searchBusStops({
					stationName: "hebbal",
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);
				if (result.items.length > 0) {
					const item = result.items[0];
					expect(item).toHaveProperty("stationId");
					expect(item).toHaveProperty("stationName");
					expect(item).toHaveProperty("latitude");
					expect(item).toHaveProperty("longitude");
					expect(item).toHaveProperty("serialNumber");
					expect(item).toHaveProperty("routeTypeId");
					expect(typeof item.stationId).toBe("string");
					expect(typeof item.stationName).toBe("string");
					expect(typeof item.latitude).toBe("number");
					expect(typeof item.longitude).toBe("number");
				}

				// Print formatted response (first 5 items only to avoid huge output)
				console.log("\n🚏 Search Bus Stops Response (first 5 items):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							items: result.items.slice(0, 5),
						},
						null,
						2
					)
				);
				if (result.items.length > 5) {
					console.log(`... and ${result.items.length - 5} more items`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("stop"))(
			"should search bus stops with different station types from real API",
			async () => {
				await delay(RATE_LIMIT_DELAY);

				// Test with metro type
				const metroResult = await client.stops.searchBusStops({
					stationName: "hebbal",
					stationType: "metro",
				});

				expect(metroResult).toBeDefined();
				expect(metroResult.success).toBe(true);
				expect(metroResult.items).toBeInstanceOf(Array);

				// Print formatted response
				console.log("\n🚇 Metro Stops Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(metroResult, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("stop"))(
			"should find nearby stations by location from real API",
			async () => {
				await delay(RATE_LIMIT_DELAY);

				const result = await client.stops.findNearbyStops({
					coordinates: [13.07861, 77.58333],
					radius: 10,
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);
				expect(result.items.length).toBeGreaterThan(0);

				if (result.items.length > 0) {
					const item = result.items[0];
					expect(item).toHaveProperty("stationId");
					expect(item).toHaveProperty("stationName");
					expect(item).toHaveProperty("latitude");
					expect(item).toHaveProperty("longitude");
					expect(item).toHaveProperty("distance");
					expect(item).toHaveProperty("travelTimeMinutes");
					expect(item).toHaveProperty("towards");
					expect(typeof item.stationId).toBe("string");
					expect(typeof item.distance).toBe("number");
					expect(typeof item.travelTimeMinutes).toBe("number");
				}

				// Print formatted response (first 5 items only)
				console.log("\n📍 Nearby Stations by Location Response (first 5 items):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							items: result.items.slice(0, 5),
						},
						null,
						2
					)
				);
				if (result.items.length > 5) {
					console.log(`... and ${result.items.length - 5} more items`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);

		it.skipIf(!shouldRunTest("stop"))(
			"should find nearby stations with bmtcCategory when stationType is bmtc from real API",
			async () => {
				await delay(RATE_LIMIT_DELAY);

				const result = await client.stops.findNearbyStops({
					coordinates: [13.07861, 77.58333],
					radius: 10,
					stationType: "bmtc",
					bmtcCategory: "airport",
				});

				expect(result).toBeDefined();
				expect(result.items).toBeInstanceOf(Array);

				// Print formatted response
				console.log("\n✈️  Airport BMTC Stops Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Trip Planner - Real Endpoint", () => {
		it.skipIf(!shouldRunTest("trip"))(
			"should plan trip from location to station from real API",
			async () => {
				// Create a client with longer timeout for TripPlannerMSMD (can be slow)
				const tripClient = new BMTCClient({
					language: "en",
					timeout: 60000, // 60 seconds for slow trip planner endpoint
				});

				// Test with location to station (matching the user's example request)
				const result = await tripClient.routes.planTrip({
					fromCoordinates: [13.079349339853941, 77.58814089936395],
					toStationId: "38888", // Kempegowda Bus Station
					serviceTypeId: "72", // AC service
				});

				expect(result).toBeDefined();
				expect(result.routes).toBeInstanceOf(Array);
				expect(result.routes.length).toBeGreaterThan(0);

				// Check first route structure
				const route = result.routes[0];
				expect(route).toHaveProperty("legs");
				expect(route).toHaveProperty("totalDuration");
				expect(route).toHaveProperty("totalDurationSeconds");
				expect(route).toHaveProperty("totalFare");
				expect(route).toHaveProperty("totalDistance");
				expect(route).toHaveProperty("transferCount");
				expect(route).toHaveProperty("hasWalking");

				// Verify computed totals are numbers
				expect(typeof route.totalDurationSeconds).toBe("number");
				expect(typeof route.totalFare).toBe("number");
				expect(typeof route.totalDistance).toBe("number");
				expect(typeof route.transferCount).toBe("number");
				expect(typeof route.hasWalking).toBe("boolean");

				// Verify legs structure
				expect(route.legs.length).toBeGreaterThan(0);
				const firstLeg = route.legs[0];
				expect(firstLeg).toHaveProperty("duration");
				expect(firstLeg).toHaveProperty("durationSeconds");
				expect(typeof firstLeg.durationSeconds).toBe("number");

				// Print formatted response (first route only)
				console.log("\n🚌 Trip Planner Response (first route):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(
					{
						...result,
						routes: result.routes.slice(0, 1).map(r => ({
							...r,
							legs: r.legs.map(l => ({
								routeNo: l.routeNo,
								duration: l.duration,
								durationSeconds: l.durationSeconds,
								approxFare: l.approxFare,
								distance: l.distance,
							})),
							totalDuration: r.totalDuration,
							totalDurationSeconds: r.totalDurationSeconds,
							totalFare: r.totalFare,
							totalDistance: r.totalDistance,
							transferCount: r.transferCount,
							hasWalking: r.hasWalking,
						})),
					},
					null,
					2
				));
				if (result.routes.length > 1) {
					console.log(`... and ${result.routes.length - 1} more routes`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 60000 }
		); // 60 second timeout for TripPlannerMSMD (can be slow)

		it.skipIf(!shouldRunTest("trip"))(
			"should get trip stops from real API",
			async () => {
				// Use example trip leg from user's request (tripId, fromStationId, toStationId)
				const result = await client.routes.getTripStops({
					trips: [
						{
							tripId: 80079217,
							fromStationId: 22357,
							toStationId: 20922,
						},
					],
				});

				// Verify GeoJSON FeatureCollection structure
				expect(result).toBeDefined();
				expect(result.type).toBe("FeatureCollection");
				expect(result.features).toBeInstanceOf(Array);
				expect(result.features.length).toBeGreaterThan(0);

				// Verify structure
				const firstFeature = result.features[0];
				expect(firstFeature.type).toBe("Feature");
				expect(firstFeature.geometry.type).toBe("Point");
				expect(firstFeature.properties).toHaveProperty("tripId");
				expect(firstFeature.properties).toHaveProperty("subrouteId");
				expect(firstFeature.properties).toHaveProperty("routeNo");
				expect(firstFeature.properties).toHaveProperty("stationId");
				expect(firstFeature.properties).toHaveProperty("stationName");
				expect(firstFeature.properties).toHaveProperty("scheduledArrivalTime");
				expect(firstFeature.properties).toHaveProperty("scheduledDepartureTime");
				expect(firstFeature.properties).toHaveProperty("isTransfer");

				// Verify types
				expect(typeof firstFeature.properties?.tripId).toBe("string");
				expect(typeof firstFeature.properties?.subrouteId).toBe("string");
				expect(typeof firstFeature.properties?.stationId).toBe("string");
				if (firstFeature.geometry.type === "Point") {
					expect(typeof firstFeature.geometry.coordinates[0]).toBe("number"); // lng
					expect(typeof firstFeature.geometry.coordinates[1]).toBe("number"); // lat
				}
				expect(typeof firstFeature.properties?.isTransfer).toBe("boolean");

				// Print formatted response (first 5 stops only)
				console.log("\n🚏 Trip Stops Response (first 5 features):");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(
					JSON.stringify(
						{
							...result,
							features: result.features.slice(0, 5),
						},
						null,
						2
					)
				);
				if (result.features.length > 5) {
					console.log(`... and ${result.features.length - 5} more stops`);
				}
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 60000 }
		); // 60 second timeout for chained API calls
	});

	describe("Client Configuration", () => {
		it.skipIf(!shouldRunTest("kannada"))(
			"should work with Kannada language",
			async () => {
				const kannadaClient = new BMTCClient({
					language: "kn",
				});

				const result = await kannadaClient.info.getHelpline();

				expect(result).toBeDefined();

				// Print formatted response
				console.log("\n🌐 Kannada Language Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});

	describe("Trip Path - Real Endpoint", () => {
		it.skipIf(!shouldRunTest("waypoint"))(
			"should get trip path from real API",
			async () => {
				// Test with via points extracted from example
				const viaPoints: Array<[number, number]> = [
					[13.09766, 77.59166],
					[13.09951, 77.58834],
					[13.09797, 77.58442],
					[13.09353, 77.58251],
					[13.0958, 77.57921],
					[13.09934, 77.57717],
					[13.09774, 77.56766],
					[13.09762, 77.563],
					[13.0923, 77.55954],
					[13.08945, 77.55629],
					[13.08605, 77.5556],
					[13.08381, 77.56027],
					[13.08182, 77.55979],
					[13.08005, 77.55933],
					[13.07654, 77.55829],
					[13.07443, 77.55743],
					[13.06849, 77.55995],
					[13.06492, 77.55971],
					[13.06001, 77.559],
					[13.05872, 77.55927],
					[13.05575, 77.55721],
					[13.05016, 77.55749],
					[13.0452, 77.55669],
					[13.04152, 77.55725],
					[13.03467, 77.55748],
					[13.02867, 77.56161],
					[13.02677, 77.56181],
					[13.02164, 77.56317],
					[13.0179, 77.56099],
					[13.01313, 77.56755],
					[13.00894, 77.56918],
					[13.00408, 77.56923],
					[13.00238, 77.5693],
					[12.99969, 77.56933],
					[12.99727, 77.56945],
					[12.99426, 77.57388],
					[12.9898, 77.57204],
					[12.97749, 77.57327],
					[12.97751, 77.57141],
					[12.97703, 77.5858],
					[12.97386, 77.58661],
					[12.96945, 77.58716],
					[12.9648, 77.58778],
					[12.96081, 77.58814],
					[12.95249, 77.58335],
					[12.94758, 77.58009],
					[12.94429, 77.5801],
					[12.94322, 77.58529],
					[12.93879, 77.58522],
					[12.93349, 77.58396],
				];

				const result = await client.routes.getTripPath({
					viaPoints,
				});

				// Verify GeoJSON FeatureCollection structure
				expect(result).toBeDefined();
				expect(result.type).toBe("FeatureCollection");
				expect(result.features).toBeInstanceOf(Array);
				expect(result.features.length).toBeGreaterThan(0);

				console.log(
					`\n📍 Trip Path Response (${result.features.length} segments):`
				);
				console.log(
					"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
				);

				// Verify features are LineString features with valid coordinates
				let totalPoints = 0;
				for (const feature of result.features) {
					expect(feature.type).toBe("Feature");
					expect(feature.geometry.type).toBe("LineString");
					if (feature.geometry.type === "LineString") {
						expect(feature.geometry.coordinates).toBeInstanceOf(Array);
						expect(feature.geometry.coordinates.length).toBeGreaterThan(0);
						totalPoints += feature.geometry.coordinates.length;

						// Validate coordinates are in valid ranges
						for (const [lng, lat] of feature.geometry.coordinates) {
							expect(lng).toBeGreaterThanOrEqual(-180);
							expect(lng).toBeLessThanOrEqual(180);
							expect(lat).toBeGreaterThanOrEqual(-90);
							expect(lat).toBeLessThanOrEqual(90);
						}
					}
				}

				console.log(`Decoded segments: ${result.features.length}`);
				console.log(`Total points: ${totalPoints}`);

				if (result.features.length > 0) {
					const firstFeature = result.features[0];
					const lastFeature = result.features[result.features.length - 1];
					if (firstFeature.geometry.type === "LineString" && lastFeature.geometry.type === "LineString") {
						const firstCoords = firstFeature.geometry.coordinates[0];
						const lastCoords = lastFeature.geometry.coordinates[lastFeature.geometry.coordinates.length - 1];
						console.log(
							`First coordinate: [${firstCoords[0]}, ${firstCoords[1]}]`
						);
						console.log(
							`Last coordinate: [${lastCoords[0]}, ${lastCoords[1]}]`
						);
					}
				}

				console.log(
					"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
				);
			},
			{ timeout: 60000 }
		);
	});
});
