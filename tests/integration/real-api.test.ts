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
				expect(result.success).toBe(true);
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
				expect(result.success).toBe(true);
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
				expect(result.success).toBe(true);
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
				expect(result.success).toBe(true);
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
					vehicleRegNo: "KA57f183",
				});

				expect(result).toBeDefined();
				expect(result.success).toBe(true);
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
					vehicleId: 21537,
				});

				expect(result).toBeDefined();
				expect(result.success).toBe(true);
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

	describe("Routes API - Real Endpoints", () => {
		it.skipIf(!shouldRunTest("route"))(
			"should get route points from real API",
			async () => {
				// Use a known routeId from the example (11797)
				const result = await client.routes.getRoutePoints({
					routeId: 11797,
				});

				expect(result).toBeDefined();
				expect(result.success).toBe(true);
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
				expect(result.success).toBe(true);

				// Print formatted response
				console.log("\n🌐 Kannada Language Response:");
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				console.log(JSON.stringify(result, null, 2));
				console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
			},
			{ timeout: 30000 }
		);
	});
});
