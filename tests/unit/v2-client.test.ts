import { describe, it, expect, beforeEach, vi } from "vitest";
import { BengaluruTransitClient } from "../../src/client/transit-client";
import {
	BengaluruTransitClientV2,
	occupancyLevel,
} from "../../src/client/v2-client";
import { TransitValidationError } from "../../src/utils/errors";
import type { KyInstance } from "ky";

describe("BengaluruTransitClientV2", () => {
	let client: BengaluruTransitClientV2;
	let mockGet: ReturnType<typeof vi.fn>;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BengaluruTransitClientV2();
		mockGet = vi.fn();
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "get").mockImplementation(mockGet);
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	it("keeps the existing client on the original API", () => {
		const v1 = new BengaluruTransitClient();

		expect(v1.getBaseURL()).toBe(
			"https://bmtcmobileapi.karnataka.gov.in/WebAPI"
		);
		expect(v1.info).toBeDefined();
		expect(v1.routes).toBeDefined();
		expect(client.getBaseURL()).toBe("https://chalo.com/app/api");
		expect(client.getCity()).toBe("bengaluru");
	});

	it("searches routes, stops, and places", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				data: {
					routes: [
						{
							result_type: "ROUTE",
							route_id: "O8oSF0Jc",
							route_name: "500-D",
							agency_name: "BMTC",
							first_stop_name: "Hebbala",
							last_stop_name: "Central Silk Board",
							direction_stop_name: "Central Silk Board",
							spf: ["Ordinary"],
							mTicketEnabled: true,
						},
					],
					stopsAndPlaces: [
						{
							result_type: "STOP",
							stop_id: "gKWioTGb",
							stop_name: "Nadaprabhu Kempegowda Station,Majestic",
							stop_lat: 12.975692,
							stop_lon: 77.572836,
							station_type: "METRO",
						},
						{
							result_type: "PLACE",
							place_id: "here:place:1",
							description: "Majestic, Bengaluru",
						},
					],
				},
			}),
		});

		const result = await client.search({
			query: "Majestic",
			coordinates: [12.9716, 77.5946],
			day: "10-11-2026",
			filter: "stops",
		});

		const [, options] = mockGet.mock.calls[0];
		const params = options.searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v5/bengaluru/search"
		);
		expect(params.get("str")).toBe("Majestic");
		expect(params.get("serachFilter")).toBe("stops");
		expect(params.get("day")).toBe("10-11-2026");
		expect(JSON.parse(params.get("location") ?? "")).toEqual({
			lat: 12.9716,
			lon: 77.5946,
		});
		expect(result.routes[0]).toMatchObject({
			routeId: "O8oSF0Jc",
			routeName: "500-D",
			ticketEnabled: true,
		});
		expect(result.stops[0].stopId).toBe("gKWioTGb");
		expect(result.places[0].description).toBe("Majestic, Bengaluru");
	});

	it("plans a trip", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				payload: {
					itineraries: [
						{
							total_fare: 60,
							time_taken: 2102,
							distance: 0,
							legs: [
								{ mode: "AUTO", distance: 1150 },
								{
									mode: "BUS",
									route_name: "314-D",
									route_id: "eqr48yAH",
									agency_name: "BMTC",
									first_stop_id: "ArYFEPLj",
									last_stop_id: "5zunAhWl",
									first_stop: { stop_name: "Halasuru" },
									last_stop: { stop_name: "Kempegowda Bus Station" },
									start_time: 71700,
									end_time: 72812,
									distance: 6693,
								},
							],
						},
					],
					nearbyItineraries: [],
				},
			}),
		});

		const result = await client.planTrip({
			fromCoordinates: [12.97849, 77.63848],
			toCoordinates: [12.97793, 77.57389],
			startTimeSeconds: 71287,
			day: "tuesday",
		});

		const params = mockGet.mock.calls[0][1].searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v4/bengaluru/tripplanner"
		);
		expect(params.get("from_lat")).toBe("12.97849");
		expect(params.get("start_time")).toBe("71287");
		expect(params.get("day")).toBe("tuesday");
		expect(params.get("num_itineraries")).toBe("25");
		expect(result.itineraries[0].totalFare).toBe(60);
		expect(result.itineraries[0].legs[1]).toMatchObject({
			mode: "BUS",
			routeId: "eqr48yAH",
			fromStopName: "Halasuru",
			startTimeSeconds: 71700,
		});
	});

	it("gets route details", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				route: {
					route_id: "F6JRDbGN",
					route_name: "304-J",
					agency_name: "BMTC",
					direction: "UP",
					isLive: "false",
					mTicketEnabled: true,
					first_stop: {
						stop_id: "s324jmdZ",
						stop_name: "Kalkunte Agrahara",
						stop_lat: 12.93275,
						stop_lon: 77.84092,
						short_id: 34883,
					},
					last_stop: {
						stop_id: "5zunAhWl",
						stop_name: "Kempegowda Bus Station(Majestic/KBS)",
						stop_lat: 12.97749,
						stop_lon: 77.57327,
					},
					stopSequenceWithDetails: [
						{
							stop_id: "ArYFEPLj",
							stop_name: "Halasuru",
							stop_lat: 12.97793,
							stop_lon: 77.6283,
							short_id: 27342,
						},
					],
				},
				trips: [
					{
						trip_id: "0xjwPwHN",
						start_time: 23400,
						end_time: 29327,
						trip_duration: 5927,
						agency_name: "BMTC",
						type: "Ordinary",
						isFrequencyTrip: false,
						extrapolated: true,
					},
				],
				timings: [],
				timeTable: [
					{ start_time: 23400, isFrequency: false, extrapolated: true },
				],
			}),
		});

		const result = await client.getRouteDetails({
			routeId: "F6JRDbGN",
			day: "tuesday",
		});

		expect(result.routeName).toBe("304-J");
		expect(result.live).toBe(false);
		expect(result.stops[0]).toMatchObject({
			stopId: "ArYFEPLj",
			name: "Halasuru",
			shortId: 27342,
		});
		expect(result.trips[0].startTimeSeconds).toBe(23400);
		expect(result.timetable).toHaveLength(1);
	});

	it("parses live vehicle payloads", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				routeLiveInfo: {
					"00ipDHcuJcsQh": JSON.stringify({
						lSId: "5zunAhWl",
						_longitude: 77.66888,
						_latitude: 12.996194,
						bearing: 246,
						vNo: "KA57F3775",
						_isHalted: false,
						tS: 1794320733000,
					}),
				},
				stopsEta: {
					ArYFEPLj: {
						"00ipDHcuJcsQh": JSON.stringify({
							eta: 1780,
							isHalted: false,
							vNo: "KA57F3775",
							dist: 4910,
							dest: "Kempegowda Bus Station(Majestic/KBS)",
							rN: "304-J",
							tS: 1794320663000,
						}),
					},
				},
			}),
		});

		const result = await client.getLiveVehicles({
			routeId: "F6JRDbGN",
			stopIds: ["ArYFEPLj", "5zunAhWl"],
		});

		const params = mockGet.mock.calls[0][1].searchParams as URLSearchParams;
		expect(params.get("stopIds")).toBe("ArYFEPLj,5zunAhWl");
		expect(result.vehicles[0]).toMatchObject({
			id: "00ipDHcuJcsQh",
			number: "KA57F3775",
			latitude: 12.996194,
			longitude: 77.66888,
			halted: false,
		});
		expect(result.arrivals[0]).toMatchObject({
			stopId: "ArYFEPLj",
			vehicleNumber: "KA57F3775",
			etaSeconds: 1780,
			distanceMeters: 4910,
			routeName: "304-J",
		});
	});

	it("requests stop arrivals as stopId:routeId", async () => {
		mockPost.mockResolvedValue({
			json: async () => ({
				stopRouteEtas: {
					"ArYFEPLj:F6JRDbGN": {
						"00ipDHcuJcsQh": JSON.stringify({
							eta: 1780,
							vNo: "KA57F3775",
							dist: 4910,
							rN: "304-J",
						}),
					},
				},
			}),
		});

		const result = await client.getStopArrivals({
			pairs: [{ stopId: "ArYFEPLj", routeId: "F6JRDbGN" }],
		});

		expect(mockPost).toHaveBeenCalledWith(
			"vasudha/cities/bengaluru/stop-route-eta",
			expect.objectContaining({
				json: { stopIdRouteIdList: ["ArYFEPLj:F6JRDbGN"] },
			})
		);
		expect(result.arrivals[0]).toMatchObject({
			stopRouteKey: "ArYFEPLj:F6JRDbGN",
			etaSeconds: 1780,
			vehicleNumber: "KA57F3775",
		});
	});

	it("maps occupancy status numbers to levels", async () => {
		mockPost.mockResolvedValue({
			json: async () => ({
				vehicle: [
					{ number: "KA51AJ8588", status: -1 },
					{ number: "KA57F3775", status: 3 },
					{ number: "KA51AJ8579", status: 4 },
					{ number: "KA51AJ8849", status: 5 },
				],
				vehicleCount: 4,
			}),
		});

		const result = await client.getOccupancy({
			vehicles: [
				{
					number: "KA57F3775",
					updatedAt: 1794320663000,
					routeId: "F6JRDbGN",
					stopId: "ArYFEPLj",
				},
			],
		});

		expect(mockPost).toHaveBeenCalledWith(
			"seat/availability",
			expect.objectContaining({
				json: {
					cityId: "bengaluru",
					mode: 2,
					maxDelay: 15,
					occupancyFactor: 50,
					vehicle: [
						{
							number: "KA57F3775",
							timeStamp: 1794320663000,
							routeId: "F6JRDbGN",
							stopId: "ArYFEPLj",
						},
					],
				},
			})
		);
		expect(result.vehicles.map((vehicle) => vehicle.level)).toEqual([
			"hidden",
			"seats-available",
			"standing-available",
			"overcrowded",
		]);
		expect(occupancyLevel(0)).toBe("seats-available");
		expect(occupancyLevel(1)).toBe("standing-available");
		expect(occupancyLevel(2)).toBe("overcrowded");
		expect(occupancyLevel(9)).toBe("unknown");
	});

	it("lists nearby stops and attaches live vehicles", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				payload: [
					{
						stop_id: "ArYFEPLj",
						distance: 0,
						agency_name: "BMTC",
						stop: {
							stop_id: "ArYFEPLj",
							stop_name: "Halasuru",
							stop_lat: 12.97793,
							stop_lon: 77.6283,
							short_id: 27342,
						},
						summary: [
							{
								arrival_time: 73560,
								trip: {
									trip_id: "eIV8es3k",
									route_id: "VE5C8LL8",
									route_name: "304-P",
									agency_name: "BMTC",
									last_stop: { stop_name: "KR Market" },
								},
							},
						],
					},
				],
			}),
		});
		mockPost.mockResolvedValue({
			json: async () => ({
				stopRouteEtas: {
					"ArYFEPLj:VE5C8LL8": {
						bus1: JSON.stringify({
							vNo: "KA57F3131",
							eta: 1390,
							dist: 5710,
							isHalted: false,
							rN: "314-P",
						}),
					},
				},
			}),
		});

		const result = await client.getNearbyBuses({
			coordinates: [12.97793, 77.6283],
			day: "tuesday",
			startTimeSeconds: 73500,
		});

		const params = mockGet.mock.calls[0][1].searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe("scheduler_v4/v4/bengaluru/summary");
		expect(params.get("lat")).toBe("12.97793");
		expect(params.get("time")).toBe("73500");
		expect(mockPost).toHaveBeenCalledWith(
			"vasudha/cities/bengaluru/stop-route-eta",
			expect.objectContaining({
				json: { stopIdRouteIdList: ["ArYFEPLj:VE5C8LL8"] },
			})
		);
		expect(result.stops[0].stop.name).toBe("Halasuru");
		expect(result.stops[0].buses[0]).toMatchObject({
			routeName: "304-P",
			destinationName: "KR Market",
			arrivalTimeSeconds: 73560,
		});
		expect(result.stops[0].buses[0].vehicles[0]).toMatchObject({
			number: "KA57F3131",
			etaSeconds: 1390,
			distanceMeters: 5710,
		});
	});

	it("rejects an empty search", async () => {
		await expect(
			client.search({ query: "  ", coordinates: [12.97, 77.59] })
		).rejects.toBeInstanceOf(TransitValidationError);
		expect(mockGet).not.toHaveBeenCalled();
	});
});
