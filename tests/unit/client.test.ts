import { describe, it, expect, beforeEach } from "vitest";
import { BengaluruTransitClient } from "../../src/client/transit-client";

describe("BengaluruTransitClient", () => {
	let client: BengaluruTransitClient;

	beforeEach(() => {
		client = new BengaluruTransitClient();
	});

	it("should create a client instance", () => {
		expect(client).toBeInstanceOf(BengaluruTransitClient);
	});

	it("should have default base URL", () => {
		expect(client.getBaseURL()).toBe(
			"https://bmtcmobileapi.karnataka.gov.in/WebAPI"
		);
	});

	it("should allow custom base URL", () => {
		const customClient = new BengaluruTransitClient({
			baseURL: "https://custom-api.example.com",
		});
		expect(customClient.getBaseURL()).toBe("https://custom-api.example.com");
	});

	it("should return ky client instance", () => {
		const kyClient = client.getClient();
		expect(kyClient).toBeDefined();
	});

	it("should allow custom language configuration", () => {
		const kannadaClient = new BengaluruTransitClient({
			language: "kn",
		});
		expect(kannadaClient).toBeDefined();
	});

	it("should allow custom device configuration", () => {
		const customClient = new BengaluruTransitClient({
			deviceType: "mobile",
			deviceId: "device123",
			authToken: "custom-token",
		});
		expect(customClient).toBeDefined();
	});
});
