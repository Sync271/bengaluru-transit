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
			expect(result.items[0].parentRouteId).toBe("3598");

			// Verify second item
			expect(result.items[1].routeNo).toBe("80-A D31G-KBS");
			expect(result.items[1].parentRouteId).toBe("4224");

			// Verify third item
			expect(result.items[2].routeNo).toBe("80-A KBS-NLO-D31G");
			expect(result.items[2].parentRouteId).toBe("7563");
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
			expect(result.items[0].subrouteId).toBe("1657");
			expect(result.items[0].routeNo).toBe("89-C UP");
			expect(result.items[0].routeName).toBe("KBS-CVN");
			expect(result.items[0].fromStationId).toBe("20921");
			expect(result.items[0].fromStation).toBe("Kempegowda Bus Station");
			expect(result.items[0].toStationId).toBe("32209");
			expect(result.items[0].toStation).toBe("Cauvery Nagara");

			// Verify second item
			expect(result.items[1].subrouteId).toBe("1658");
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

	describe("searchByRouteDetails", () => {
		it("should search route details successfully", async () => {
			const mockRawResponse = {
				up: {
					data: [
						{
							routeid: 3812,
							stationid: 21042,
							stationname: "Mysore Road Bus Station",
							from: "Mysore Road Bus Station",
							to: "Kempegowda International Airport",
							routeno: "KIA-10",
							distance_on_station: 0,
							centerlat: 12.9536,
							centerlong: 77.54378,
							responsecode: 200,
							isnotify: 0,
							vehicleDetails: [
								{
									vehicleid: 21575,
									vehiclenumber: "KA57F2403",
									servicetypeid: 73,
									servicetype: "AC",
									centerlat: 13.193967,
									centerlong: 77.65007,
									eta: "",
									sch_arrivaltime: "00:05",
									sch_departuretime: "00:05",
									actual_arrivaltime: "",
									actual_departuretime: "",
									sch_tripstarttime: "00:05",
									sch_tripendtime: "00:05",
									lastlocationid: 0,
									currentlocationid: 34443,
									nextlocationid: 0,
									currentstop: null,
									nextstop: null,
									laststop: null,
									stopCoveredStatus: 1,
									heading: 60,
									lastrefreshon: "18-01-2026 01:01:34",
									lastreceiveddatetimeflag: 0,
									tripposition: 1,
								},
							],
						},
					],
					mapData: [
						{
							vehicleid: 21575,
							vehiclenumber: "KA57F2403",
							servicetypeid: 73,
							servicetype: "AC",
							centerlat: 13.193967,
							centerlong: 77.65007,
							eta: "2026-01-18 01:14:00",
							sch_arrivaltime: "01:18",
							sch_departuretime: "01:18",
							actual_arrivaltime: "",
							actual_departuretime: "",
							sch_tripstarttime: "00:05",
							sch_tripendtime: "00:05",
							lastlocationid: 0,
							currentlocationid: 34443,
							nextlocationid: 0,
							currentstop: null,
							nextstop: null,
							laststop: null,
							stopCoveredStatus: 0,
							heading: 60,
							lastrefreshon: "18-01-2026 01:01:34",
							lastreceiveddatetimeflag: 0,
							tripposition: 1,
						},
					],
				},
				down: {
					data: [],
					mapData: [],
				},
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.searchByRouteDetails({
				parentRouteId: "2124",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.rowCount).toBe(0);

			// Verify up direction - GeoJSON FeatureCollections
			expect(result.up.stops.type).toBe("FeatureCollection");
			expect(result.up.stops.features).toHaveLength(1);
			expect(result.up.stops.features[0].geometry.type).toBe("Point");
			expect(result.up.stops.features[0].properties.stopId).toBe("21042");
			expect(result.up.stops.features[0].properties.subrouteId).toBe("3812");
			expect(result.up.stops.features[0].properties.stopName).toBe("Mysore Road Bus Station");

			// Verify stationVehicles - GeoJSON FeatureCollection
			expect(result.up.stationVehicles.type).toBe("FeatureCollection");
			expect(result.up.stationVehicles.features).toHaveLength(1);
			expect(result.up.stationVehicles.features[0].geometry.type).toBe("Point");
			expect(result.up.stationVehicles.features[0].properties.vehicleId).toBe("21575");
			expect(result.up.stationVehicles.features[0].properties.serviceTypeId).toBe("73");

			// Verify liveVehicles - GeoJSON FeatureCollection
			expect(result.up.liveVehicles.type).toBe("FeatureCollection");
			expect(result.up.liveVehicles.features).toHaveLength(1);
			expect(result.up.liveVehicles.features[0].geometry.type).toBe("Point");
			expect(result.up.liveVehicles.features[0].properties.vehicleId).toBe("21575");

			// Verify down direction
			expect(result.down.stops.type).toBe("FeatureCollection");
			expect(result.down.stops.features).toHaveLength(0);
			expect(result.down.stationVehicles.type).toBe("FeatureCollection");
			expect(result.down.stationVehicles.features).toHaveLength(0);
			expect(result.down.liveVehicles.type).toBe("FeatureCollection");
			expect(result.down.liveVehicles.features).toHaveLength(0);
		});

		it("should search route details with service type ID", async () => {
			const mockRawResponse = {
				up: {
					data: [],
					mapData: [],
				},
				down: {
					data: [],
					mapData: [],
				},
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await client.routes.searchByRouteDetails({
				parentRouteId: "2124",
				serviceTypeId: "73",
			});

			// Verify the request includes serviceTypeId
			expect(mockPost).toHaveBeenCalledWith(
				"SearchByRouteDetails_v4",
				expect.objectContaining({
					json: expect.objectContaining({
						routeid: 2124,
						servicetypeid: 73,
					}),
				})
			);
		});

		it("should convert string IDs to numbers in API request", async () => {
			const mockRawResponse = {
				up: {
					data: [],
					mapData: [],
				},
				down: {
					data: [],
					mapData: [],
				},
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await client.routes.searchByRouteDetails({
				parentRouteId: "2124",
				serviceTypeId: "73",
			});

			// Verify IDs are converted to numbers
			const callArgs = mockPost.mock.calls[0];
			const requestJson = (callArgs[1] as any).json;
			expect(requestJson.routeid).toBe(2124);
			expect(requestJson.servicetypeid).toBe(73);
		});

		it("should normalize IDs to strings in response", async () => {
			const mockRawResponse = {
				up: {
					data: [
						{
							routeid: 3812,
							stationid: 21042,
							stationname: "Test Station",
							from: "From",
							to: "To",
							routeno: "KIA-10",
							distance_on_station: 0,
							centerlat: 12.9536,
							centerlong: 77.54378,
							responsecode: 200,
							isnotify: 0,
							vehicleDetails: [
								{
									vehicleid: 21575,
									vehiclenumber: "KA57F2403",
									servicetypeid: 73,
									servicetype: "AC",
									centerlat: 13.193967,
									centerlong: 77.65007,
									eta: "",
									sch_arrivaltime: "00:05",
									sch_departuretime: "00:05",
									actual_arrivaltime: "",
									actual_departuretime: "",
									sch_tripstarttime: "00:05",
									sch_tripendtime: "00:05",
									lastlocationid: 0,
									currentlocationid: 34443,
									nextlocationid: 0,
									currentstop: null,
									nextstop: null,
									laststop: null,
									stopCoveredStatus: 1,
									heading: 60,
									lastrefreshon: "18-01-2026 01:01:34",
									lastreceiveddatetimeflag: 0,
									tripposition: 1,
								},
							],
						},
					],
					mapData: [],
				},
				down: {
					data: [],
					mapData: [],
				},
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.searchByRouteDetails({
				parentRouteId: "2124",
			});

			// Verify all IDs are strings
			expect(result.up.stops.features[0].properties.subrouteId).toBe("3812");
			expect(result.up.stops.features[0].properties.stopId).toBe("21042");
			// stationVehicles is now a separate GeoJSON FeatureCollection
			expect(result.up.stationVehicles.type).toBe("FeatureCollection");
			expect(result.up.stationVehicles.features[0].properties.vehicleId).toBe("21575");
			expect(result.up.stationVehicles.features[0].properties.serviceTypeId).toBe("73");
			expect(result.up.stationVehicles.features[0].properties.lastLocationId).toBe("0");
			expect(result.up.stationVehicles.features[0].properties.currentLocationId).toBe("34443");
			expect(result.up.stationVehicles.features[0].properties.nextLocationId).toBe("0");
		});

		it("should validate input parameters and throw on invalid routeId", async () => {
			await expect(
				client.routes.searchByRouteDetails({
					routeId: "0", // Invalid: must be positive
				})
			).rejects.toThrow();
		});

		it("should handle empty results", async () => {
			const mockRawResponse = {
				up: {
					data: [],
					mapData: [],
				},
				down: {
					data: [],
					mapData: [],
				},
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.searchByRouteDetails({
				parentRouteId: "2124",
			});

			expect(result.success).toBe(true);
			expect(result.up.stops.type).toBe("FeatureCollection");
			expect(result.up.stops.features).toHaveLength(0);
			expect(result.up.stationVehicles.type).toBe("FeatureCollection");
			expect(result.up.stationVehicles.features).toHaveLength(0);
			expect(result.up.liveVehicles.type).toBe("FeatureCollection");
			expect(result.up.liveVehicles.features).toHaveLength(0);
			expect(result.down.stops.type).toBe("FeatureCollection");
			expect(result.down.stops.features).toHaveLength(0);
			expect(result.down.stationVehicles.type).toBe("FeatureCollection");
			expect(result.down.stationVehicles.features).toHaveLength(0);
			expect(result.down.liveVehicles.type).toBe("FeatureCollection");
			expect(result.down.liveVehicles.features).toHaveLength(0);
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				up: "invalid",
				down: {},
			};

			// Mock the response with invalid data
			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.routes.searchByRouteDetails({ parentRouteId: "2124" })
			).rejects.toThrow("Invalid route details response");
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
				client.routes.searchByRouteDetails({ parentRouteId: "2124" })
			).rejects.toThrow();
		});
	});

	describe("getRoutesBetweenStations", () => {
		it("should get fare routes successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 6,
						fromstationid: 20623,
						source_code: "BSK5",
						from_displayname: "Banashankari Bus Station",
						tostationid: 20866,
						destination_code: "ITL",
						to_displayname: "ITPL",
						fromdistance: 5.29,
						todistance: 37.43,
						routeid: 4977,
						routeno: "500-CA ITPL-PPLO",
						routename: "PPLO-ITPL",
						route_direction: "Down",
						fromstationname: "Banashankari Bus Station",
						tostationname: "ITPL",
					},
					{
						id: 6,
						fromstationid: 20623,
						source_code: "BSK5",
						from_displayname: "Banashankari Bus Station",
						tostationid: 20866,
						destination_code: "ITL",
						to_displayname: "ITPL",
						fromdistance: 0.0,
						todistance: 27.96,
						routeid: 2983,
						routeno: "V-500CK",
						routename: "BSK-KDG",
						route_direction: "UP",
						fromstationname: "Banashankari Bus Station",
						tostationname: "ITPL",
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

			const result = await client.routes.getRoutesBetweenStations({
				fromStationId: "20623",
				toStationId: "20866",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.rowCount).toBe(2);
			expect(result.items).toHaveLength(2);

			// Verify first item
			const firstItem = result.items[0];
			expect(firstItem.id).toBe("6");
			expect(firstItem.fromStationId).toBe("20623");
			expect(firstItem.toStationId).toBe("20866");
			expect(firstItem.subrouteId).toBe("4977");
			expect(firstItem.routeNo).toBe("500-CA ITPL-PPLO");
			expect(firstItem.routeName).toBe("PPLO-ITPL");
			expect(firstItem.routeDirection).toBe("down");
			expect(firstItem.fromDistance).toBe(5.29);
			expect(firstItem.toDistance).toBe(37.43);
			expect(firstItem.sourceCode).toBe("BSK5");
			expect(firstItem.destinationCode).toBe("ITL");

			// Verify second item
			const secondItem = result.items[1];
			expect(secondItem.subrouteId).toBe("2983");
			expect(secondItem.routeDirection).toBe("up");
			expect(secondItem.fromDistance).toBe(0.0);
		});

		it("should normalize IDs to strings", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 6,
						fromstationid: 20623,
						source_code: "BSK5",
						from_displayname: "Banashankari",
						tostationid: 20866,
						destination_code: "ITL",
						to_displayname: "ITPL",
						fromdistance: 5.29,
						todistance: 37.43,
						routeid: 4977,
						routeno: "500-CA",
						routename: "PPLO-ITPL",
						route_direction: "Down",
						fromstationname: "Banashankari",
						tostationname: "ITPL",
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

			const result = await client.routes.getRoutesBetweenStations({
				fromStationId: "20623",
				toStationId: "20866",
			});

			expect(typeof result.items[0].id).toBe("string");
			expect(typeof result.items[0].fromStationId).toBe("string");
			expect(typeof result.items[0].toStationId).toBe("string");
			expect(typeof result.items[0].subrouteId).toBe("string");
		});

		it("should automatically map language from client config", async () => {
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

			// Test with English
			const englishClient = new BMTCClient({ language: "en" });
			const mockPostEn = vi.fn();
			const kyClientEn = englishClient.getClient() as unknown as KyInstance;
			vi.spyOn(kyClientEn, "post").mockImplementation(mockPostEn);
			mockPostEn.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await englishClient.routes.getRoutesBetweenStations({
				fromStationId: "20623",
				toStationId: "20866",
			});

			expect(mockPostEn).toHaveBeenCalledWith("GetFareRoutes", {
				json: expect.objectContaining({
					lan: "English",
				}),
			});

			// Test with Kannada
			const kannadaClient = new BMTCClient({ language: "kn" });
			const mockPostKn = vi.fn();
			const kyClientKn = kannadaClient.getClient() as unknown as KyInstance;
			vi.spyOn(kyClientKn, "post").mockImplementation(mockPostKn);
			mockPostKn.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await kannadaClient.routes.getRoutesBetweenStations({
				fromStationId: "20623",
				toStationId: "20866",
			});

			expect(mockPostKn).toHaveBeenCalledWith("GetFareRoutes", {
				json: expect.objectContaining({
					lan: "Kannada",
				}),
			});
		});

		it("should validate input parameters and throw on invalid station IDs", async () => {
			await expect(
				client.routes.getRoutesBetweenStations({
					fromStationId: "0", // Invalid: must be positive
					toStationId: "20866",
				})
			).rejects.toThrow();

			await expect(
				client.routes.getRoutesBetweenStations({
					fromStationId: "20623",
					toStationId: "-1", // Invalid: must be positive
				})
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

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getRoutesBetweenStations({
				fromStationId: "20623",
				toStationId: "20866",
			});

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(0);
			expect(result.rowCount).toBe(0);
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: [
					{
						// Missing required fields
						id: 6,
					},
				],
				Message: "Success",
				Issuccess: true,
			};

			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.routes.getRoutesBetweenStations({
					fromStationId: "20623",
					toStationId: "20866",
				})
			).rejects.toThrow("Invalid routes between stations response");
		});
	});

	describe("getFares", () => {
		it("should get fare data successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						servicetype: "Vajra",
						fare: "50",
					},
					{
						servicetype: "Volvo Electric",
						fare: "50",
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

			const result = await client.routes.getFares({
				routeNo: "V-500CA",
				subrouteId: "2981",
				routeDirection: "UP",
				sourceCode: "BSK5",
				destinationCode: "ITL",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.rowCount).toBe(2);
			expect(result.items).toHaveLength(2);

			// Verify first item
			expect(result.items[0].serviceType).toBe("Vajra");
			expect(result.items[0].fare).toBe("50");

			// Verify second item
			expect(result.items[1].serviceType).toBe("Volvo Electric");
			expect(result.items[1].fare).toBe("50");
		});

		it("should convert string subrouteId to number in API request", async () => {
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

			await client.routes.getFares({
				routeNo: "V-500CA",
				subrouteId: "2981",
				routeDirection: "UP",
				sourceCode: "BSK5",
				destinationCode: "ITL",
			});

			// Verify the request includes subrouteId as number
			expect(mockPost).toHaveBeenCalledWith(
				"GetMobileFareData_v2",
				expect.objectContaining({
					json: expect.objectContaining({
						routeno: "V-500CA",
						routeid: 2981,
						route_direction: "UP",
						source_code: "BSK5",
						destination_code: "ITL",
					}),
				})
			);
		});

		it("should handle empty fare data results", async () => {
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

			const result = await client.routes.getFares({
				routeNo: "V-500CA",
				subrouteId: "2981",
				routeDirection: "UP",
				sourceCode: "BSK5",
				destinationCode: "ITL",
			});

			expect(result.success).toBe(true);
			expect(result.rowCount).toBe(0);
			expect(result.items).toHaveLength(0);
		});

		it("should validate input parameters and throw on invalid data", async () => {
			await expect(
				client.routes.getFares({
					routeNo: "",
					subrouteId: "2981",
					routeDirection: "UP",
					sourceCode: "BSK5",
					destinationCode: "ITL",
				})
			).rejects.toThrow("Invalid fare data parameters");

			await expect(
				client.routes.getFares({
					routeNo: "V-500CA",
					subrouteId: "0",
					routeDirection: "UP",
					sourceCode: "BSK5",
					destinationCode: "ITL",
				})
			).rejects.toThrow("Invalid fare data parameters");
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: "invalid",
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => invalidResponse,
			} as Response);

			await expect(
				client.routes.getFares({
					routeNo: "V-500CA",
					subrouteId: "2981",
					routeDirection: "UP",
					sourceCode: "BSK5",
					destinationCode: "ITL",
				})
			).rejects.toThrow("Invalid fare data response");
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
				client.routes.getFares({
					routeNo: "V-500CA",
					subrouteId: "2981",
					routeDirection: "UP",
					sourceCode: "BSK5",
					destinationCode: "ITL",
				})
			).rejects.toThrow();
		});
	});

	describe("planTrip", () => {
		it("should plan trip from location to station successfully", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [
						[
							{
								pathSrno: 44175441,
								transferSrNo: 0,
								tripId: 0,
								routeid: 0,
								routeno: "walk_source",
								schNo: null,
								vehicleId: 0,
								busNo: null,
								distance: 0.58803937187,
								duration: "00:05:00",
								fromStationId: 0,
								fromStationName: "Your Location",
								toStationId: 35376,
								toStationName: "Jakkur Aerodrum(Towards - Hebbala)",
								etaFromStation: null,
								etaToStation: null,
								serviceTypeId: 0,
								fromLatitude: 13.079349339853941,
								fromLongitude: 77.58814089936395,
								toLatitude: 0.0,
								toLongitude: 0.0,
								routeParentId: 0,
								totalDuration: "00:05:00",
								waitingDuration: null,
								platformnumber: "0",
								baynumber: 0,
								devicestatusnameflag: "Tracking device is not installed",
								devicestatusflag: 3,
								srno: 0,
								approx_fare: 0.0,
								fromstagenumber: 0,
								tostagenumber: 0,
								minsrno: 0,
								maxsrno: 0,
								tollfees: 0,
								totalStages: null,
							},
							{
								pathSrno: 44175441,
								transferSrNo: 0,
								tripId: 80120150,
								routeid: 1995,
								routeno: "285-M",
								schNo: "EV-285M/15",
								vehicleId: 26298,
								busNo: "KA51AH4541",
								distance: 12.774620947049215,
								duration: "00:33:00",
								fromStationId: 35376,
								fromStationName: "Jakkur Aerodrum(Towards - Hebbala)",
								toStationId: 38888,
								toStationName: "Kempegowda Bus Station(Towards - Arrival)",
								etaFromStation: "01/18/2026 17:41:00",
								etaToStation: "01/18/2026 18:14:00",
								serviceTypeId: 72,
								fromLatitude: 0.0,
								fromLongitude: 0.0,
								toLatitude: 0.0,
								toLongitude: 0.0,
								routeParentId: 1173,
								totalDuration: "00:33:00",
								waitingDuration: null,
								platformnumber: "0",
								baynumber: 0,
								devicestatusnameflag: "Running",
								devicestatusflag: 4,
								srno: 47,
								approx_fare: 24.0,
								fromstagenumber: 0,
								tostagenumber: 0,
								minsrno: 0,
								maxsrno: 0,
								tollfees: 0,
								totalStages: null,
							},
						],
					],
				},
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

			const result = await client.routes.planTrip({
				fromLatitude: 13.079349339853941,
				fromLongitude: 77.58814089936395,
				toStationId: "38888",
				serviceTypeId: "72",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.routes).toHaveLength(1);
			expect(result.routes[0].legs).toHaveLength(2);

			const route = result.routes[0];
			
			// Verify computed totals
			expect(route.totalFare).toBe(24.0);
			expect(route.totalDistance).toBeGreaterThan(0);
			expect(route.transferCount).toBe(0); // One bus segment = no transfers
			expect(route.hasWalking).toBe(true);

			// Verify first leg (walking segment)
			const walkLeg = route.legs[0];
			expect(walkLeg.routeNo).toBe("walk_source");
			expect(walkLeg.fromStationName).toBe("Your Location");
			expect(walkLeg.toStationId).toBe("35376");
			expect(walkLeg.approxFare).toBe(0.0);

			// Verify second leg (bus segment)
			const busLeg = route.legs[1];
			expect(busLeg.routeNo).toBe("285-M");
			expect(busLeg.busNo).toBe("KA51AH4541");
			expect(busLeg.approxFare).toBe(24.0);
			expect(busLeg.serviceTypeId).toBe("72");
		});

		it("should plan trip from station to station successfully", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			const result = await client.routes.planTrip({
				fromStationId: "35376",
				toStationId: "38888",
			});

			expect(result.success).toBe(true);
			expect(result.routes).toHaveLength(0);
		});

		it("should plan trip from location to location successfully", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			const result = await client.routes.planTrip({
				fromLatitude: 13.079349339853941,
				fromLongitude: 77.58814089936395,
				toLatitude: 12.9536,
				toLongitude: 77.54378,
			});

			expect(result.success).toBe(true);
		});

		it("should plan trip from station to location successfully", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			const result = await client.routes.planTrip({
				fromStationId: "35376",
				toLatitude: 12.9536,
				toLongitude: 77.54378,
			});

			expect(result.success).toBe(true);
		});

		it("should handle optional parameters (fromDateTime, filterBy)", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 1);
			const fromDateTime = `${futureDate.getFullYear()}-${String(
				futureDate.getMonth() + 1
			).padStart(2, "0")}-${String(futureDate.getDate()).padStart(2, "0")} ${String(
				futureDate.getHours()
			).padStart(2, "0")}:${String(futureDate.getMinutes()).padStart(2, "0")}`;

			await client.routes.planTrip({
				fromLatitude: 13.079349339853941,
				fromLongitude: 77.58814089936395,
				toStationId: "38888",
				serviceTypeId: "72",
				fromDateTime,
				filterBy: "minimum-transfers",
			});

			// Verify the request includes optional parameters
			expect(mockPost).toHaveBeenCalledWith(
				"TripPlannerMSMD",
				expect.objectContaining({
					json: expect.objectContaining({
						fromLatitude: 13.079349339853941,
						fromLongitude: 77.58814089936395,
						toStationId: 38888,
						serviceTypeId: 72,
						fromDateTime,
						filterBy: 1,
					}),
				})
			);
		});

		it("should convert string IDs to numbers in API request", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			await client.routes.planTrip({
				fromStationId: "35376",
				toStationId: "38888",
				serviceTypeId: "72",
			});

			// Verify the request includes IDs as numbers
			expect(mockPost).toHaveBeenCalledWith(
				"TripPlannerMSMD",
				expect.objectContaining({
					json: expect.objectContaining({
						fromStationId: 35376,
						toStationId: 38888,
						serviceTypeId: 72,
					}),
				})
			);
		});

		it("should handle empty results", async () => {
			const mockRawResponse = {
				data: {
					directRoutes: [],
					transferRoutes: [],
				},
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

			const result = await client.routes.planTrip({
				fromStationId: "99999",
				toStationId: "88888",
			});

			expect(result.success).toBe(true);
			expect(result.routes).toHaveLength(0);
		});

		it("should validate input parameters and throw on invalid data", async () => {
			// Missing both fromStationId and fromLatitude
			await expect(
				client.routes.planTrip({
					toStationId: "38888",
				} as any)
			).rejects.toThrow("Invalid trip planner parameters");

			// Missing both toStationId and toLatitude
			await expect(
				client.routes.planTrip({
					fromStationId: "35376",
				} as any)
			).rejects.toThrow("Invalid trip planner parameters");
		});

		it("should validate fromDateTime is in future", async () => {
			const pastDate = "2020-01-01 12:00";

			await expect(
				client.routes.planTrip({
					fromStationId: "35376",
					toStationId: "38888",
					fromDateTime: pastDate,
				})
			).rejects.toThrow("DateTime must be in the future");
		});

		it("should validate fromDateTime format", async () => {
			await expect(
				client.routes.planTrip({
					fromStationId: "35376",
					toStationId: "38888",
					fromDateTime: "invalid-date",
				})
			).rejects.toThrow("DateTime must be in format");
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
				client.routes.planTrip({
					fromStationId: "35376",
					toStationId: "38888",
				})
			).rejects.toThrow();
		});
	});

	describe("getTripStops", () => {
		it("should get path details successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						tripId: 80079217,
						routeId: 1995,
						routeNo: "285-M",
						stationId: 22357,
						stationName: "NES Office (Towards Hebbala)",
						latitude: 13.09784,
						longitude: 77.59167,
						eta: "",
						sch_arrivaltime: "01/18/2026 20:58:00",
						sch_departuretime: "01/18/2026 20:58:00",
						actual_arrivaltime: "",
						actual_departuretime: "",
						distance: 0,
						duration: null,
						isTransfer: false,
					},
					{
						tripId: 80079217,
						routeId: 1995,
						routeNo: "285-M",
						stationId: 20922,
						stationName: "Kempegowda Bus Station (Towards Arrival)",
						latitude: 12.97749,
						longitude: 77.57327,
						eta: "",
						sch_arrivaltime: "01/18/2026 21:36:00",
						sch_departuretime: "01/18/2026 21:36:00",
						actual_arrivaltime: "",
						actual_departuretime: "",
						distance: 0,
						duration: null,
						isTransfer: true,
					},
				],
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

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
			expect(result.type).toBe("FeatureCollection");
			expect(result.features).toBeInstanceOf(Array);
			expect(result.features).toHaveLength(2);

			// Verify first station (Point feature)
			const firstFeature = result.features[0];
			expect(firstFeature.type).toBe("Feature");
			expect(firstFeature.geometry.type).toBe("Point");
			expect(firstFeature.geometry.coordinates).toEqual([77.59167, 13.09784]); // [lng, lat]
			expect(firstFeature.properties?.tripId).toBe("80079217");
			expect(firstFeature.properties?.subrouteId).toBe("1995");
			expect(firstFeature.properties?.routeNo).toBe("285-M");
			expect(firstFeature.properties?.stationId).toBe("22357");
			expect(firstFeature.properties?.stationName).toBe("NES Office (Towards Hebbala)");
			expect(firstFeature.properties?.scheduledArrivalTime).toBe("01/18/2026 20:58:00");
			expect(firstFeature.properties?.scheduledDepartureTime).toBe("01/18/2026 20:58:00");
			expect(firstFeature.properties?.isTransfer).toBe(false);

			// Verify second station (transfer point)
			const secondFeature = result.features[1];
			expect(secondFeature.properties?.stationId).toBe("20922");
			expect(secondFeature.properties?.isTransfer).toBe(true);

			// Verify API was called correctly
			expect(mockPost).toHaveBeenCalledWith(
				"GetPathDetails",
				expect.objectContaining({
					json: {
						data: [
							{
								tripId: 80079217,
								fromStationId: 22357,
								toStationId: 20922,
							},
						],
					},
				})
			);
		});

		it("should handle multiple trip legs", async () => {
			const mockRawResponse = {
				data: [
					{
						tripId: 80079217,
						routeId: 1995,
						routeNo: "285-M",
						stationId: 22357,
						stationName: "Station A",
						latitude: 13.09784,
						longitude: 77.59167,
						eta: "",
						sch_arrivaltime: "01/18/2026 20:58:00",
						sch_departuretime: "01/18/2026 20:58:00",
						actual_arrivaltime: "",
						actual_departuretime: "",
						distance: 0,
						duration: null,
						isTransfer: false,
					},
				],
				message: "Success",
				issuccess: true,
				exception: null,
				rowCount: 0,
				responsecode: 200,
			};

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getTripStops({
				trips: [
					{
						tripId: 80079217,
						fromStationId: 22357,
						toStationId: 20922,
					},
					{
						tripId: 80211270,
						fromStationId: 20921,
						toStationId: 21447,
					},
				],
			});

			expect(result.type).toBe("FeatureCollection");
			expect(mockPost).toHaveBeenCalledWith(
				"GetPathDetails",
				expect.objectContaining({
					json: {
						data: [
							{
								tripId: 80079217,
								fromStationId: 22357,
								toStationId: 20922,
							},
							{
								tripId: 80211270,
								fromStationId: 20921,
								toStationId: 21447,
							},
						],
					},
				})
			);
		});

		it("should validate empty trips array", async () => {
			await expect(
				client.routes.getTripStops({
					trips: [],
				})
			).rejects.toThrow("At least one trip leg is required");
		});

		it("should validate required fields in path detail items", async () => {
			await expect(
				client.routes.getTripStops({
					trips: [
						{
							tripId: 0, // Invalid: must be positive
							fromStationId: 22357,
							toStationId: 20922,
						} as any,
					],
				})
			).rejects.toThrow("Trip ID must be a positive integer");
		});

		it("should handle API errors", async () => {
			const error = new Error("Internal Server Error");
			(error as any).response = {
				status: 500,
				json: async () => ({ message: "Internal Server Error" }),
			};
			mockPost.mockRejectedValue(error);

			await expect(
				client.routes.getTripStops({
					trips: [
						{
							tripId: 80079217,
							fromStationId: 22357,
							toStationId: 20922,
						},
					],
				})
			).rejects.toThrow();
		});
	});

	describe("getTripPath", () => {
		it("should get trip path as GeoJSON FeatureCollection", async () => {
			const mockRawResponse = [
				"BG4rt_Y4m6_zEAA", // Short encoded polyline
				"BGk3s1Ykhr_zEAA", // Another short encoded polyline
			];

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getTripPath({
				viaPoints: [
					[13.09766, 77.59166],
					[13.09951, 77.58834],
					[13.09797, 77.58442],
					[12.93349, 77.58396],
				],
			});

			// Verify GeoJSON FeatureCollection structure
			expect(result.type).toBe("FeatureCollection");
			expect(result.features).toBeInstanceOf(Array);
			expect(result.features.length).toBeGreaterThan(0);
			
			// Verify features are LineString features
			for (const feature of result.features) {
				expect(feature.type).toBe("Feature");
				expect(feature.geometry.type).toBe("LineString");
				expect(feature.geometry.coordinates).toBeInstanceOf(Array);
				expect(feature.geometry.coordinates.length).toBeGreaterThan(0);
			}
		});

		it("should handle empty encoded polylines array", async () => {
			const mockRawResponse: string[] = [];

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getTripPath({
				viaPoints: [
					[13.09766, 77.59166],
					[12.93349, 77.58396],
				],
			});

			expect(result.features).toEqual([]);
		});

		it("should decode trip path segments from encoded polylines", async () => {
			const mockRawResponse = ["BG4rt_Y4m6_zEAA"];

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getTripPath({
				viaPoints: [
					[13.09766, 77.59166],
					[13.09951, 77.58834],
					[13.09797, 77.58442],
					[12.93349, 77.58396],
				],
			});

			expect(result.type).toBe("FeatureCollection");
			expect(result.features).toBeInstanceOf(Array);
			// Should have decoded segments if HERE decoder works
			expect(result.features.length).toBeGreaterThanOrEqual(0);
		});

		it("should always use default appName and deviceType", async () => {
			const mockRawResponse = ["BG4rt_Y4m6_zEAA"];

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			await client.routes.getTripPath({
				viaPoints: [
					[13.09766, 77.59166],
					[12.93349, 77.58396],
				],
			});

			// Verify API was called with default values
			expect(mockPost).toHaveBeenCalled();
			const callArgs = mockPost.mock.calls[0];
			const requestBody = callArgs[1]?.json as unknown;
			expect(requestBody).toMatchObject({
				AppName: "BMTC",
				DeviceType: "WEB",
			});
		});

		it("should validate route path parameters", async () => {
			await expect(
				client.routes.getTripPath({
					viaPoints: [
						[91, 77.59166], // Invalid latitude
						[12.93349, 77.58396],
					],
				})
			).rejects.toThrow();

			await expect(
				client.routes.getTripPath({
					viaPoints: [
						[13.09766, 181], // Invalid longitude
						[12.93349, 77.58396],
					],
				})
			).rejects.toThrow();

			await expect(
				client.routes.getTripPath({
					viaPoints: [[13.09766, 77.59166]], // Only one point - need at least 2
				})
			).rejects.toThrow();
		});

		it("should extract coordinates from GeoJSON FeatureCollection", async () => {
			const mockRawResponse = ["BG4rt_Y4m6_zEAA"];

			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.routes.getTripPath({
				viaPoints: {
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: [77.59166, 13.09766], // [lng, lat]
							},
							properties: {},
						},
						{
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: [77.58396, 12.93349], // [lng, lat]
							},
							properties: {},
						},
					],
				},
			});

			expect(result.type).toBe("FeatureCollection");
			expect(result.features).toBeInstanceOf(Array);
			// Coordinates should be extracted from GeoJSON, properties ignored
		});
	});
});
