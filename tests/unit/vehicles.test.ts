import { describe, it, expect, beforeEach, vi } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";
import type { KyInstance } from "ky";

describe("VehiclesAPI", () => {
	let client: BMTCClient;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BMTCClient();
		// Mock the ky client's post method
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	describe("searchVehicles", () => {
		it("should search vehicles by registration number successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						vehicleid: 13270,
						vehicleregno: "KA57F1831",
						responsecode: 200,
					},
					{
						vehicleid: 13271,
						vehicleregno: "KA57F1832",
						responsecode: 200,
					},
					{
						vehicleid: 13273,
						vehicleregno: "KA57F1833",
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 3,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.vehicles.searchVehicles({
				query: "KA57f183",
			});

			expect(result.items).toHaveLength(3);
			expect(result.items[0].vehicleId).toBe("13270");
			expect(result.items[0].vehicleRegNo).toBe("KA57F1831");
			expect(result.items[1].vehicleRegNo).toBe("KA57F1832");
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

			const result = await client.vehicles.searchVehicles({
				query: "INVALID",
			});

			expect(result.items).toHaveLength(0);
		});

		it("should validate input parameters and throw on empty query", async () => {
			await expect(
				client.vehicles.searchVehicles({ query: "" })
			).rejects.toThrow("Invalid search vehicles parameters");
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
				client.vehicles.searchVehicles({ query: "KA57f183" })
			).rejects.toThrow("Invalid search vehicles response");
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
				client.vehicles.searchVehicles({ query: "KA57f183" })
			).rejects.toThrow();
		});
	});

	describe("getVehicleTrip", () => {
		it("should get vehicle trip successfully", async () => {
			const mockRawResponse = {
				RouteDetails: [
					{
						rowid: 1,
						tripid: 79897818,
						routeno: "KIA-8E",
						routename: "ELCW-KIA",
						busno: "KA57F1837",
						tripstatus: "Running",
						tripstatusid: "1",
						sourcestation: "Electronic City Wipro Main Gate",
						destinationstation: "Kempegowda International Airport",
						servicetype: "AC",
						webservicetype: "AC",
						servicetypeid: 73,
						lastupdatedat: "16-01-2026 03:12:34",
						stationname: "Electronic City Wipro Main Gate",
						stationid: 20772,
						actual_arrivaltime: null,
						etastatus: "Skipped",
						etastatusmapview: "N/A",
						latitude: 12.83594,
						longitude: 77.65742,
						currentstop: "",
						laststop: "SI Apartment HSR Layout (Towards Hebbala)",
						weblaststop: "SI Apartment HSR Layout",
						nextstop: "Depot-25 Gate (Towards Hebbala)",
						currlatitude: 12.916225,
						currlongitude: 77.636513,
						sch_arrivaltime: "02:40",
						sch_departuretime: "02:40",
						eta: "",
						actual_arrivaltime1: null,
						actual_departudetime: null,
						tripstarttime: "02:40",
						tripendtime: "05:05",
						routeid: 4420,
						vehicleid: 21537,
						responsecode: 200,
						lastreceiveddatetimeflag: 1,
						srno: 1876639805,
						tripposition: 1,
						stopstatus: 2,
						stopstatus_distance: 999.0,
						lastetaupdated: null,
						minstopstatus_distance: 0.74,
					},
				],
				LiveLocation: [
					{
						latitude: 12.916225,
						longitude: 77.636513,
						location: "Marathahalli Sarjapur Outer Ring Road",
						lastrefreshon: "16-01-2026 03:12:34",
						nextstop: "Depot-25 Gate (Towards Hebbala)",
						previousstop: "Central Silk Board (Towards SI Apartment)",
						vehicleid: 21537,
						vehiclenumber: "KA57F1837",
						routeno: "KIA-8E",
						servicetypeid: 73,
						servicetype: "AC",
						heading: 96.0,
						responsecode: 200,
						trip_status: 1,
						lastreceiveddatetimeflag: 1,
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

			const result = await client.vehicles.getVehicleTrip({
				vehicleId: "21537",
			});


			// Verify route stops GeoJSON
			expect(result.routeStops).toBeDefined();
			expect(result.routeStops.type).toBe("FeatureCollection");
			expect(result.routeStops.features).toHaveLength(1);
			expect(result.routeStops.features[0].geometry.type).toBe("Point");
			expect(result.routeStops.features[0].geometry.coordinates).toEqual([
				77.65742, 12.83594,
			]);
			expect(result.routeStops.features[0].properties.stopId).toBe("20772");
			expect(result.routeStops.features[0].properties.stopName).toBe(
				"Electronic City Wipro Main Gate"
			);
			expect(result.routeStops.features[0].properties.tripId).toBe("79897818");
			expect(result.routeStops.features[0].properties.routeNo).toBe("KIA-8E");
			expect(result.routeStops.features[0].properties.vehicleId).toBe("21537");

			// Verify vehicle location GeoJSON
			expect(result.vehicleLocation).toBeDefined();
			expect(result.vehicleLocation.type).toBe("FeatureCollection");
			expect(result.vehicleLocation.features).toHaveLength(1);
			expect(result.vehicleLocation.features[0].geometry.type).toBe("Point");
			expect(result.vehicleLocation.features[0].geometry.coordinates).toEqual([
				77.636513, 12.916225,
			]);
			expect(result.vehicleLocation.features[0].properties.busId).toBe("21537");
			expect(result.vehicleLocation.features[0].properties.vehicleId).toBe(
				"21537"
			);
			expect(result.vehicleLocation.features[0].properties.routeNo).toBe(
				"KIA-8E"
			);
		});

		it("should handle empty route details", async () => {
			const mockRawResponse = {
				RouteDetails: [],
				LiveLocation: [],
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

			const result = await client.vehicles.getVehicleTrip({
				vehicleId: "99999",
			});

			expect(result.routeStops.features.length).toBe(0);
			// Verify empty GeoJSON collections
			expect(result.routeStops.type).toBe("FeatureCollection");
			expect(result.routeStops.features).toHaveLength(0);
			expect(result.vehicleLocation.type).toBe("FeatureCollection");
			expect(result.vehicleLocation.features).toHaveLength(0);
		});

		it("should validate input parameters and throw on invalid vehicleId", async () => {
			await expect(
				client.vehicles.getVehicleTrip({ vehicleId: "0" })
			).rejects.toThrow("Invalid vehicle trip parameters");

			await expect(
				client.vehicles.getVehicleTrip({ vehicleId: "-1" })
			).rejects.toThrow("Invalid vehicle trip parameters");
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				RouteDetails: "invalid",
				Message: "Success",
			};

			// Mock the response with invalid data
			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.vehicles.getVehicleTrip({ vehicleId: 21537 })
			).rejects.toThrow("Invalid vehicle trip response");
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
				client.vehicles.getVehicleTrip({ vehicleId: 21537 })
			).rejects.toThrow();
		});
	});
});
