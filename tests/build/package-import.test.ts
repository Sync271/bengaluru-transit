/**
 * Tests that verify the built package can be imported correctly
 * These tests import from dist/ to ensure the compiled output works
 * This is run before publishing to verify the build is correct
 */

import { describe, it, expect } from "vitest";

// Import from dist/ to test the actual built output
// This verifies the compiled JavaScript works correctly
import { BengaluruTransitClient } from "../../dist/index.js";
import type { BaseClientConfig } from "../../dist/index.js";

describe("Package Import Tests (Built Package)", () => {
	it("should import BengaluruTransitClient from package", () => {
		expect(BengaluruTransitClient).toBeDefined();
		expect(typeof BengaluruTransitClient).toBe("function");
	});

	it("should create client instance from imported package", () => {
		const client = new BengaluruTransitClient();
		expect(client).toBeInstanceOf(BengaluruTransitClient);
	});

	it("should have all API modules available", () => {
		const client = new BengaluruTransitClient();
		expect(client.info).toBeDefined();
		expect(client.vehicles).toBeDefined();
		expect(client.routes).toBeDefined();
		expect(client.stops).toBeDefined();
		expect(client.locations).toBeDefined();
	});

	it("should accept configuration options", () => {
		const config: BaseClientConfig = {
			language: "kn",
			timeout: 10000,
		};
		const client = new BengaluruTransitClient(config);
		expect(client.getLanguage()).toBe("kn");
	});

	it("should export types correctly", () => {
		// This test verifies TypeScript types are exported correctly
		// If this compiles, the type definitions are working
		const client = new BengaluruTransitClient();
		const baseURL: string = client.getBaseURL();
		const language: "en" | "kn" = client.getLanguage();
		
		expect(typeof baseURL).toBe("string");
		expect(["en", "kn"]).toContain(language);
	});
});
