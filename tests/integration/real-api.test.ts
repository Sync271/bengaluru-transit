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
		it(
			"should fetch helpline data from real API",
			async () => {
				const result = await client.info.getHelplineData();

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

		it(
			"should fetch service types from real API",
			async () => {
				const result = await client.info.getAllServiceTypes();

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
	});

	describe("Client Configuration", () => {
		it(
			"should work with Kannada language",
			async () => {
				const kannadaClient = new BMTCClient({
					language: "kn",
				});

				const result = await kannadaClient.info.getHelplineData();

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
