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

	describe("searchBusStops", () => {
		it("should find nearby bus stops successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						srno: 7,
						routeno: "",
						routeid: 37944,
						center_lat: 0,
						center_lon: 0,
						responsecode: 200,
						routetypeid: "2",
						routename: "Hebbala",
						route: "",
					},
					{
						srno: 1,
						routeno: "",
						routeid: 20695,
						center_lat: 0,
						center_lon: 0,
						responsecode: 200,
						routetypeid: "2",
						routename: "Hebbala Canara Bank",
						route: "",
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 2,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.stops.searchBusStops({
				stationName: "hebbal",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.rowCount).toBe(2);
			expect(result.items).toHaveLength(2);

			// Verify first item
			expect(result.items[0].serialNumber).toBe(7);
			expect(result.items[0].stationId).toBe("37944");
			expect(result.items[0].stationName).toBe("Hebbala");
			expect(result.items[0].routeTypeId).toBe("2");
			expect(result.items[0].latitude).toBe(0);
			expect(result.items[0].longitude).toBe(0);

			// Verify second item
			expect(result.items[1].serialNumber).toBe(1);
			expect(result.items[1].stationId).toBe("20695");
			expect(result.items[1].stationName).toBe("Hebbala Canara Bank");
		});

		it("should use default stationType of 'bmtc' when not provided", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await client.stops.searchBusStops({
				stationName: "hebbal",
			});

			// Verify the request includes default stationflag of 1
			expect(mockPost).toHaveBeenCalledWith(
				"FindNearByBusStop_v2",
				expect.objectContaining({
					json: expect.objectContaining({
						stationname: "hebbal",
						stationflag: 1,
					}),
				})
			);
		});

		it("should use provided stationType and convert to API numeric value", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			// Test with "metro" - should convert to 163
			await client.stops.searchBusStops({
				stationName: "hebbal",
				stationType: "metro", // Metro Stops
			});

			// Verify the request includes the converted stationflag
			expect(mockPost).toHaveBeenCalledWith(
				"FindNearByBusStop_v2",
				expect.objectContaining({
					json: expect.objectContaining({
						stationname: "hebbal",
						stationflag: 163, // Converted from "metro"
					}),
				})
			);
		});

		it("should convert all station flag types correctly", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			// Test each station flag type
			const testCases: Array<{ flag: "bmtc" | "chartered" | "metro" | "ksrtc"; expected: number }> = [
				{ flag: "bmtc", expected: 1 },
				{ flag: "chartered", expected: 2 },
				{ flag: "metro", expected: 163 },
				{ flag: "ksrtc", expected: 164 },
			];

			for (const { flag, expected } of testCases) {
				mockPost.mockClear();
				await client.stops.searchBusStops({
					stationName: "hebbal",
					stationType: flag,
				});

				expect(mockPost).toHaveBeenCalledWith(
					"FindNearByBusStop_v2",
					expect.objectContaining({
						json: expect.objectContaining({
							stationflag: expected,
						}),
					})
				);
			}
		});

		it("should normalize IDs to strings in response", async () => {
			const mockRawResponse = {
				data: [
					{
						srno: 1,
						routeno: "",
						routeid: 20695,
						center_lat: 12.9536,
						center_lon: 77.54378,
						responsecode: 200,
						routetypeid: "2",
						routename: "Hebbala Canara Bank",
						route: "",
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.stops.searchBusStops({
				stationName: "hebbal",
			});

			expect(typeof result.items[0].stationId).toBe("string");
			expect(result.items[0].stationId).toBe("20695");
		});

		it("should validate input parameters and throw on invalid data", async () => {
			await expect(
				client.stops.searchBusStops({
					stationName: "", // Invalid: must not be empty
				})
			).rejects.toThrow("Invalid nearby bus stops parameters");
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: [
					{
						// Missing required fields
						srno: 1,
					},
				],
				Message: "Success",
				Issuccess: true,
			};

			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.stops.searchBusStops({
					stationName: "hebbal",
				})
			).rejects.toThrow("Invalid nearby bus stops response");
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
				client.stops.searchBusStops({
					stationName: "hebbal",
				})
			).rejects.toThrow();
		});
	});

	describe("findNearbyStops", () => {
		it("should find nearby stations by location successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						rowno: 1,
						geofenceid: 30473,
						geofencename: "Test Station A",
						center_lat: 13.07861,
						center_lon: 77.58333,
						towards: "Last Stop",
						distance: 0.0,
						totalminute: 0.0,
						responsecode: 200,
						radiuskm: 1,
					},
					{
						rowno: 2,
						geofenceid: 30474,
						geofencename: "Test Station B",
						center_lat: 13.07852,
						center_lon: 77.58322,
						towards: "N E S",
						distance: 0.02,
						totalminute: 0.0,
						responsecode: 200,
						radiuskm: 1,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 2,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			});

			const result = await client.stops.findNearbyStops({
				latitude: 13.07861,
				longitude: 77.58333,
				radius: 10,
			});

			expect(result).toBeDefined();
			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(2);
			expect(result.items[0].stationId).toBe("30473");
			expect(result.items[0].stationName).toBe("Test Station A");
			expect(result.items[0].distance).toBe(0.0);
			expect(result.items[0].travelTimeMinutes).toBe(0.0);
			expect(result.items[0].towards).toBe("Last Stop");
			expect(result.items[0].rowNumber).toBe(1);
			expect(mockPost).toHaveBeenCalledWith("NearbyStations_v2", {
				json: {
					latitude: 13.07861,
					longitude: 77.58333,
					radiuskm: 10,
				},
			});
		});

		it("should include bmtcCategory when provided with stationType 'bmtc'", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			});

			await client.stops.findNearbyStops({
				latitude: 13.07861,
				longitude: 77.58333,
				radius: 5,
				stationType: "bmtc",
				bmtcCategory: "airport",
			});

			expect(mockPost).toHaveBeenCalledWith("NearbyStations_v2", {
				json: {
					latitude: 13.07861,
					longitude: 77.58333,
					radiuskm: 5,
					stationflag: 1, // bmtc = 1
					flexiflag: 1, // airport = 1
				},
			});
		});

		it("should include stationType when provided", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			});

			await client.stops.findNearbyStops({
				latitude: 13.07861,
				longitude: 77.58333,
				radius: 10,
				stationType: "metro",
			});

			expect(mockPost).toHaveBeenCalledWith("NearbyStations_v2", {
				json: {
					latitude: 13.07861,
					longitude: 77.58333,
					radiuskm: 10,
					stationflag: 163, // metro = 163
				},
			});
		});

		it("should convert bmtcCategory 'all' to API value 3", async () => {
			const mockRawResponse = {
				data: [],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			});

			await client.stops.findNearbyStops({
				latitude: 13.07861,
				longitude: 77.58333,
				radius: 10,
				stationType: "bmtc",
				bmtcCategory: "all",
			});

			expect(mockPost).toHaveBeenCalledWith("NearbyStations_v2", {
				json: {
					latitude: 13.07861,
					longitude: 77.58333,
					radiuskm: 10,
					stationflag: 1, // bmtc = 1
					flexiflag: 3, // all = 3
				},
			});
		});

		it("should normalize station IDs to strings", async () => {
			const mockRawResponse = {
				data: [
					{
						rowno: 1,
						geofenceid: 30473,
						geofencename: "Test Station",
						center_lat: 13.07861,
						center_lon: 77.58333,
						towards: "Last Stop",
						distance: 0.0,
						totalminute: 0.0,
						responsecode: 200,
						radiuskm: 1,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			});

			const result = await client.stops.findNearbyStops({
				latitude: 13.07861,
				longitude: 77.58333,
				radius: 10,
			});

			expect(typeof result.items[0].stationId).toBe("string");
			expect(result.items[0].stationId).toBe("30473");
		});

		it("should validate input parameters and throw on invalid coordinates", async () => {
			await expect(
				client.stops.findNearbyStops({
					latitude: 100, // Invalid (> 90)
					longitude: 77.58333,
					radius: 10,
				})
			).rejects.toThrow();

			await expect(
				client.stops.findNearbyStops({
					latitude: 13.07861,
					longitude: 200, // Invalid (> 180)
					radius: 10,
				})
			).rejects.toThrow();

			await expect(
				client.stops.findNearbyStops({
					latitude: 13.07861,
					longitude: 77.58333,
					radius: -1, // Invalid (negative)
				})
			).rejects.toThrow();
		});

		it("should validate response schema and throw on invalid data", async () => {
			mockPost.mockResolvedValue({
				json: async () => ({
					data: [{ invalid: "data" }], // Invalid structure
					Message: "Success",
					Issuccess: true,
				}),
			});

			await expect(
				client.stops.findNearbyStops({
					latitude: 13.07861,
					longitude: 77.58333,
					radius: 10,
				})
			).rejects.toThrow();
		});

		it("should handle API errors", async () => {
			mockPost.mockRejectedValue(new Error("Network error"));

			await expect(
				client.stops.findNearbyStops({
					latitude: 13.07861,
					longitude: 77.58333,
					radius: 10,
				})
			).rejects.toThrow("Network error");
		});
	});
});
