import { describe, it, expect, beforeEach, vi } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";
import type { KyInstance } from "ky";

describe("RoutesAPI", () => {
	let client: BMTCClient;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BMTCClient();
		// Mock the ky client's post method
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	describe("getRoutePoints", () => {
		it("should get route points successfully with GeoJSON LineString", async () => {
			const mockRawResponse = {
				data: [
					{
						latitude: "13.198769",
						longitude: "77.70868",
						responsecode: 200,
					},
					{
						latitude: "13.19876",
						longitude: "77.70877",
						responsecode: 200,
					},
					{
						latitude: "13.19874",
						longitude: "77.70902",
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

			const result = await client.routes.getRoutePoints({
				routeId: "11797",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.rowCount).toBe(3);

			// Verify route path GeoJSON
			expect(result.routePath).toBeDefined();
			expect(result.routePath.type).toBe("FeatureCollection");
			expect(result.routePath.features).toHaveLength(1);
			expect(result.routePath.features[0].geometry.type).toBe("LineString");
			expect(result.routePath.features[0].geometry.coordinates).toHaveLength(3);
			expect(result.routePath.features[0].geometry.coordinates[0]).toEqual([
				77.70868, 13.198769,
			]);
			expect(result.routePath.features[0].geometry.coordinates[1]).toEqual([
				77.70877, 13.19876,
			]);
			expect(result.routePath.features[0].properties.routeId).toBe("11797");
		});

		it("should handle empty route points", async () => {
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

			const result = await client.routes.getRoutePoints({
				routeId: 99999,
			});

			expect(result.success).toBe(true);
			expect(result.rowCount).toBe(0);
			// Verify empty GeoJSON collection
			expect(result.routePath.type).toBe("FeatureCollection");
			expect(result.routePath.features).toHaveLength(1); // Still one feature, but with empty coordinates
			expect(result.routePath.features[0].geometry.coordinates).toHaveLength(0);
		});

		it("should validate input parameters and throw on invalid routeId", async () => {
			await expect(
				client.routes.getRoutePoints({ routeId: "0" })
			).rejects.toThrow("Invalid route points parameters");

			await expect(
				client.routes.getRoutePoints({ routeId: "-1" })
			).rejects.toThrow("Invalid route points parameters");
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
				client.routes.getRoutePoints({ routeId: 11797 })
			).rejects.toThrow("Invalid route points response");
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
				client.routes.getRoutePoints({ routeId: 11797 })
			).rejects.toThrow();
		});
	});

	describe("searchRoutes", () => {
		it("should search routes successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						union_rowno: 2,
						row: 1,
						routeno: "80-A",
						responsecode: 200,
						routeparentid: 3598,
					},
					{
						union_rowno: 2,
						row: 3,
						routeno: "80-A D31G-KBS",
						responsecode: 200,
						routeparentid: 4224,
					},
					{
						union_rowno: 2,
						row: 5,
						routeno: "80-A KBS-NLO-D31G",
						responsecode: 200,
						routeparentid: 7563,
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

			const result = await client.routes.searchRoutes({
				query: "80-a",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(3);
			expect(result.rowCount).toBe(3);

			// Verify first item
			expect(result.items[0].unionRowNo).toBe(2);
			expect(result.items[0].row).toBe(1);
			expect(result.items[0].routeNo).toBe("80-A");
			expect(result.items[0].routeParentId).toBe("3598");

			// Verify second item
			expect(result.items[1].routeNo).toBe("80-A D31G-KBS");
			expect(result.items[1].routeParentId).toBe("4224");

			// Verify third item
			expect(result.items[2].routeNo).toBe("80-A KBS-NLO-D31G");
			expect(result.items[2].routeParentId).toBe("7563");
		});

		it("should handle empty search results", async () => {
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

			const result = await client.routes.searchRoutes({
				query: "nonexistent",
			});

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(0);
			expect(result.rowCount).toBe(0);
		});

		it("should validate input parameters and throw on empty query", async () => {
			await expect(client.routes.searchRoutes({ query: "" })).rejects.toThrow(
				"Invalid route search parameters"
			);
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
				client.routes.searchRoutes({ query: "80-a" })
			).rejects.toThrow("Invalid route search response");
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
				client.routes.searchRoutes({ query: "80-a" })
			).rejects.toThrow();
		});
	});

	describe("getAllRoutes", () => {
		it("should get all routes successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						routeid: 1657,
						routeno: "89-C UP",
						routename: "KBS-CVN",
						fromstationid: 20921,
						fromstation: "Kempegowda Bus Station",
						tostationid: 32209,
						tostation: "Cauvery Nagara",
						responsecode: 200,
					},
					{
						routeid: 1658,
						routeno: "89-C DOWN",
						routename: "CVN-KBS",
						fromstationid: 24379,
						fromstation: "Cauvery Nagara",
						tostationid: 20922,
						tostation: "Kempegowda Bus Station",
						responsecode: 200,
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

			const result = await client.routes.getAllRoutes();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(2);
			expect(result.rowCount).toBe(2);

			// Verify first item
			expect(result.items[0].routeId).toBe("1657");
			expect(result.items[0].routeNo).toBe("89-C UP");
			expect(result.items[0].routeName).toBe("KBS-CVN");
			expect(result.items[0].fromStationId).toBe("20921");
			expect(result.items[0].fromStation).toBe("Kempegowda Bus Station");
			expect(result.items[0].toStationId).toBe("32209");
			expect(result.items[0].toStation).toBe("Cauvery Nagara");

			// Verify second item
			expect(result.items[1].routeId).toBe("1658");
			expect(result.items[1].routeNo).toBe("89-C DOWN");
			expect(result.items[1].routeName).toBe("CVN-KBS");
			expect(result.items[1].fromStationId).toBe("24379");
			expect(result.items[1].fromStation).toBe("Cauvery Nagara");
			expect(result.items[1].toStationId).toBe("20922");
			expect(result.items[1].toStation).toBe("Kempegowda Bus Station");
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

			const result = await client.routes.getAllRoutes();

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(0);
			expect(result.rowCount).toBe(0);
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

			await expect(client.routes.getAllRoutes()).rejects.toThrow(
				"Invalid all routes response"
			);
		});

		it("should handle API errors", async () => {
			// Mock an error response
			const error = new Error("Internal Server Error");
			(error as any).response = {
				status: 500,
				json: async () => ({ message: "Internal Server Error" }),
			};
			mockPost.mockRejectedValue(error);

			await expect(client.routes.getAllRoutes()).rejects.toThrow();
		});
	});

	describe("getTimetableByRoute", () => {
		it("should get timetable successfully with all parameters", async () => {
			const mockRawResponse = {
				data: [
					{
						fromstationname: "Banashankari Bus Station",
						tostationname: "ITPL",
						fromstationid: "20623",
						tostationid: "20866",
						apptime: "01:35:00",
						distance: "27.00",
						platformname: "9",
						platformnumber: "9",
						baynumber: "3",
						tripdetails: [
							{
								starttime: "10:00",
								endtime: "11:35",
							},
							{
								starttime: "10:05",
								endtime: "11:50",
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

			const startTime = new Date("2025-10-07T10:00:00");
			const endTime = new Date("2025-10-07T23:59:00");

			const result = await client.routes.getTimetableByRoute({
				routeId: "2981",
				fromStationId: "20623",
				toStationId: "20866",
				startTime,
				endTime,
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(1);
			expect(result.rowCount).toBe(1);

			// Verify first item
			const item = result.items[0];
			expect(item.fromStationName).toBe("Banashankari Bus Station");
			expect(item.toStationName).toBe("ITPL");
			expect(item.fromStationId).toBe("20623");
			expect(item.toStationId).toBe("20866");
			expect(item.approximateTime).toBe("01:35:00");
			expect(item.distance).toBe(27.0);
			expect(item.platformName).toBe("9");
			expect(item.platformNumber).toBe("9");
			expect(item.bayNumber).toBe("3");
			expect(item.tripDetails).toHaveLength(2);
			expect(item.tripDetails[0].startTime).toBe("10:00");
			expect(item.tripDetails[0].endTime).toBe("11:35");
			expect(item.tripDetails[1].startTime).toBe("10:05");
			expect(item.tripDetails[1].endTime).toBe("11:50");

			// Verify request was made with correct parameters
			expect(mockPost).toHaveBeenCalledWith(
				"GetTimetableByRouteid_v3",
				expect.objectContaining({
					json: expect.objectContaining({
						routeid: 2981,
						fromStationId: "20623",
						toStationId: "20866",
						starttime: "2025-10-07 10:00",
						endtime: "2025-10-07 23:59",
					}),
				})
			);
		});

		it("should get timetable successfully with only routeId (auto-generate defaults)", async () => {
			const mockRawResponse = {
				data: [
					{
						fromstationname: "Banashankari Bus Station",
						tostationname: "ITPL",
						fromstationid: "20623",
						tostationid: "20866",
						apptime: "01:35:00",
						distance: "27.00",
						platformname: "9",
						platformnumber: "9",
						baynumber: "3",
						tripdetails: [],
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

			const result = await client.routes.getTimetableByRoute({
				routeId: "2981",
			});

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(1);

			// Verify request was made with auto-generated defaults
			expect(mockPost).toHaveBeenCalledWith(
				"GetTimetableByRouteid_v3",
				expect.objectContaining({
					json: expect.objectContaining({
						routeid: 2981,
						current_date: expect.any(String),
						starttime: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
						endtime: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 23:59$/),
					}),
				})
			);

			// Verify fromStationId and toStationId are not in the request
			const callArgs = mockPost.mock.calls[0];
			const requestJson = (callArgs[1] as any).json;
			expect(requestJson.fromStationId).toBeUndefined();
			expect(requestJson.toStationId).toBeUndefined();
		});

		it("should get timetable with auto-generated endTime based on startTime", async () => {
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

			const startTime = new Date("2025-10-07T10:00:00");

			await client.routes.getTimetableByRoute({
				routeId: "2981",
				startTime,
			});

			// Verify endTime is set to 23:59 of the startTime date
			expect(mockPost).toHaveBeenCalledWith(
				"GetTimetableByRouteid_v3",
				expect.objectContaining({
					json: expect.objectContaining({
						starttime: "2025-10-07 10:00",
						endtime: "2025-10-07 23:59",
					}),
				})
			);
		});

		it("should validate input parameters and throw on invalid routeId", async () => {
			// This will be caught by Zod validation
			await expect(
				client.routes.getTimetableByRoute({
					routeId: "0", // Invalid: must be positive
				} as any)
			).rejects.toThrow();
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

			const result = await client.routes.getTimetableByRoute({
				routeId: "2981",
			});

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(0);
			expect(result.rowCount).toBe(0);
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
				client.routes.getTimetableByRoute({ routeId: 2981 })
			).rejects.toThrow("Invalid timetable response");
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
				client.routes.getTimetableByRoute({ routeId: 2981 })
			).rejects.toThrow();
		});
	});
});
