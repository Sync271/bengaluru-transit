import { describe, it, expect, beforeEach, vi } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";
import type { KyInstance } from "ky";

describe("StopsAPI", () => {
	let client: BMTCClient;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BMTCClient();
		// Mock the ky client's post method
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	describe("findNearbyStations", () => {
		it("should find nearby stations with facilities as GeoJSON", async () => {
			const mockRawResponse = {
				data: [
					{
						stationname: "Yelahanka Satellite Town",
						distance: "2.0",
						Arounds: [
							{
								type: "Booking Counter",
								typeid: "190",
								icon: "https://bmtcmobileapi.karnataka.gov.in/StaticFiles/Booking%20counter.png",
								list: [
									{
										name: "Yelahanka Satellite Town - KSRTC Booking Counter",
										latitude: "13.09559",
										longitude: "77.57929",
										distance: "2.0",
									},
								],
							},
							{
								type: "ATM",
								typeid: "155",
								icon: "https://bmtcmobileapi.karnataka.gov.in/StaticFiles/ATM.png",
								list: [
									{
										name: "Yelahanka Satellite Town - Axis Bank ATM",
										latitude: "13.09560",
										longitude: "77.57930",
										distance: "2.1",
									},
								],
							},
						],
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.stops.findNearbyStations({
				latitude: 13.079389141522491,
				longitude: 77.58817675200433,
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.stations).toHaveLength(1);
			expect(result.stations[0].stationName).toBe(
				"Yelahanka Satellite Town"
			);
			expect(result.stations[0].distance).toBe(2.0);
			expect(result.stations[0].facilityTypes).toHaveLength(2);

			// Verify first facility type (Booking Counter)
			const bookingCounter = result.stations[0].facilityTypes[0];
			expect(bookingCounter.type).toBe("Booking Counter");
			expect(bookingCounter.typeId).toBe("190");
			expect(bookingCounter.facilities.type).toBe("FeatureCollection");
			expect(bookingCounter.facilities.features).toHaveLength(1);
			expect(bookingCounter.facilities.features[0].geometry.type).toBe(
				"Point"
			);
			expect(
				bookingCounter.facilities.features[0].geometry.coordinates
			).toEqual([77.57929, 13.09559]);
			expect(
				bookingCounter.facilities.features[0].properties.facilityName
			).toBe("Yelahanka Satellite Town - KSRTC Booking Counter");
			expect(
				bookingCounter.facilities.features[0].properties.facilityType
			).toBe("Booking Counter");
			expect(
				bookingCounter.facilities.features[0].properties.distance
			).toBe(2.0);
			expect(
				bookingCounter.facilities.features[0].properties.stationName
			).toBe("Yelahanka Satellite Town");

			// Verify second facility type (ATM)
			const atm = result.stations[0].facilityTypes[1];
			expect(atm.type).toBe("ATM");
			expect(atm.facilities.features).toHaveLength(1);
			expect(atm.facilities.features[0].properties.facilityName).toBe(
				"Yelahanka Satellite Town - Axis Bank ATM"
			);
		});

		it("should handle empty results", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.stops.findNearbyStations({
				latitude: 0,
				longitude: 0,
			});

			expect(result.success).toBe(true);
			expect(result.stations).toHaveLength(0);
			expect(result.rowCount).toBe(0);
		});

		it("should handle stations with multiple facilities of same type", async () => {
			const mockRawResponse = {
				data: [
					{
						stationname: "Test Station",
						distance: "1.5",
						Arounds: [
							{
								type: "ATM",
								typeid: "155",
								icon: "https://example.com/atm.png",
								list: [
									{
										name: "ATM 1",
										latitude: "13.0",
										longitude: "77.0",
										distance: "1.5",
									},
									{
										name: "ATM 2",
										latitude: "13.1",
										longitude: "77.1",
										distance: "1.6",
									},
								],
							},
						],
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.stops.findNearbyStations({
				latitude: 13.0,
				longitude: 77.0,
			});

			expect(result.stations[0].facilityTypes[0].facilities.features).toHaveLength(
				2
			);
		});

		it("should validate input parameters and throw on invalid coordinates", async () => {
			await expect(
				client.stops.findNearbyStations({
					latitude: 91, // Invalid latitude
					longitude: 77.0,
				})
			).rejects.toThrow("Invalid around bus stops parameters");

			await expect(
				client.stops.findNearbyStations({
					latitude: 13.0,
					longitude: 181, // Invalid longitude
				})
			).rejects.toThrow("Invalid around bus stops parameters");
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: "invalid",
				Message: "Success",
			};

			// Mock the response with invalid data
			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.stops.findNearbyStations({
					latitude: 13.079389141522491,
					longitude: 77.58817675200433,
				})
			).rejects.toThrow("Invalid around bus stops response");
		});

		it("should handle API errors", async () => {
			// Mock an error response
			const error = new Error("Internal Server Error");
			(error as any).response = {
				status: 500,
				json: async () => ({ message: "Internal Server Error" }),
			};
			mockPost.mockRejectedValue(error);

			await expect(
				client.stops.findNearbyStations({
					latitude: 13.079389141522491,
					longitude: 77.58817675200433,
				})
			).rejects.toThrow();
		});
	});
});
