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

	it("autocompletes routes by name", async () => {
		mockGet.mockResolvedValue({
			json: async () => [
				{
					route_id: "BfHeErB4",
					route_name: "V-500D",
					agency_name: "BMTC",
					first_stop_name: "Central Silk Board",
					last_stop_name: "Hebbala",
					direction_stop_name: "Hebbala",
					spf: ["Vajra"],
					mTicketEnabled: true,
					routePassEnabled: false,
					isFreeRide: false,
					transport_type: "bus",
					station_type: "bus",
					direction: "UP",
					total_stops: 35,
					total_stages: 18,
				},
			],
		});

		const result = await client.searchRoutes({
			query: "500D",
			day: "sunday",
		});

		const [, options] = mockGet.mock.calls[0];
		const params = options.searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v4/bengaluru/autocomplete/route"
		);
		expect(params.get("str")).toBe("500D");
		expect(params.get("day")).toBe("sunday");
		expect(result.routes[0]).toMatchObject({
			routeId: "BfHeErB4",
			routeName: "V-500D",
			agencyName: "BMTC",
			firstStopName: "Central Silk Board",
			lastStopName: "Hebbala",
			serviceTypes: ["Vajra"],
			ticketEnabled: true,
			passEnabled: false,
			freeRide: false,
			transportType: "bus",
			direction: "UP",
			totalStops: 35,
			totalStages: 18,
		});
	});

	it("lists routes between two stops", async () => {
		mockGet.mockResolvedValue({
			json: async () => [
				{
					specialFeatures: [],
					fromStop: {
						name: "Halasuru",
						lon: 77.6283,
						id: "ArYFEPLj",
						lat: 12.97793,
					},
					routeId: "5p8YE8Xl",
					toStop: {
						name: "Kempegowda Bus Station(Majestic/KBS)",
						lon: 77.57327,
						id: "5zunAhWl",
						lat: 12.97749,
					},
					spf: ["Vajra"],
					lastStop: {
						name: "Kempegowda Bus Station(Majestic/KBS)",
						lon: 77.57327,
						id: "5zunAhWl",
						lat: 12.97749,
					},
					serviceCategory: "VJ",
					firstStop: {
						name: "Hosakote Old  Bus Stand",
						lon: 77.78774,
						id: "DILko2Ic",
						lat: 13.0787,
					},
					routeName: "V-317A",
				},
			],
		});

		const result = await client.getRoutesBetweenStops({
			fromStopId: "ArYFEPLj",
			toStopId: "5zunAhWl",
		});

		const [, options] = mockGet.mock.calls[0];
		const params = options.searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v5/bengaluru/routesbetweenstops"
		);
		expect(params.get("fromStopId")).toBe("ArYFEPLj");
		expect(params.get("toStopId")).toBe("5zunAhWl");
		expect(params.get("mTicketEnabled")).toBe("true");
		expect(result.routes[0]).toMatchObject({
			routeId: "5p8YE8Xl",
			routeName: "V-317A",
			serviceTypes: ["Vajra"],
			serviceCategory: "VJ",
			fromStop: {
				stopId: "ArYFEPLj",
				name: "Halasuru",
				latitude: 12.97793,
				longitude: 77.6283,
			},
			toStop: { stopId: "5zunAhWl" },
			firstStop: { stopId: "DILko2Ic" },
			lastStop: { stopId: "5zunAhWl" },
		});
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

	it("fetches route details in bulk with polyline", async () => {
		mockPost.mockResolvedValue({
			json: async () => ({
				version: 112,
				routes: [
					{
						routeId: "NsbPdEdi",
						status: "UPDATED",
						version: 0,
						staticData: {
							route_name: "KIA-8E",
							agency_name: "BMTC",
							direction: "UP",
							stationType: "BUS",
							specialFeatures: ["Vayu Vajra"],
							polyline: "s_jmA{m~xM",
							stopSequenceWithDetails: [
								{
									stop_id: "uPOlfcFT",
									stop_name: "Electronic City Wipro Main Gate",
									stop_lat: 12.83594,
									stop_lon: 77.65742,
									short_id: 38209,
								},
							],
							timeTable: [
								{
									start_time: 16800,
									isFrequency: false,
									extrapolated: true,
								},
							],
						},
						liveData: {
							mTicketEnabled: true,
							routePassEnabled: false,
							isFreeRide: false,
							isAirportRoute: false,
							isPremiumBusRoute: false,
						},
					},
				],
			}),
		});

		const result = await client.getRouteDetailsBulk({
			routeIds: ["NsbPdEdi"],
		});

		expect(mockPost.mock.calls[0][0]).toBe(
			"scheduler_v4/v5/bengaluru/routedetails"
		);
		const [, options] = mockPost.mock.calls[0];
		expect(options.searchParams.get("isBackgroundSync")).toBe("false");
		expect(options.json).toEqual({
			routeIdsToVersionMap: { NsbPdEdi: 0 },
		});
		expect(result.catalogueVersion).toBe(112);
		expect(result.routes[0]).toMatchObject({
			routeId: "NsbPdEdi",
			routeName: "KIA-8E",
			agencyName: "BMTC",
			direction: "UP",
			status: "UPDATED",
			ticketEnabled: true,
			specialFeatures: ["Vayu Vajra"],
			polyline: "s_jmA{m~xM",
			stops: [
				{
					stopId: "uPOlfcFT",
					name: "Electronic City Wipro Main Gate",
					shortId: 38209,
				},
			],
			timetable: [{ startTimeSeconds: 16800, extrapolated: true }],
		});
	});

	it("returns stops and the timetable when trip type is a number", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				route: {
					route_id: "O8oSF0Jc",
					route_name: "500-D",
					agency_name: "BMTC",
					isLive: "true",
					mTicketEnabled: true,
					stopSequenceWithDetails: [
						{
							stop_id: "gKWioTGb",
							stop_name: "Majestic",
							stop_lat: 12.977,
							stop_lon: 77.572,
						},
					],
				},
				trips: [
					{
						trip_id: "trip-1",
						start_time: 21600,
						end_time: 25200,
						trip_duration: 3600,
						agency_name: "BMTC",
						type: 0,
						isFrequencyTrip: false,
						extrapolated: false,
					},
				],
				timings: [],
				timeTable: [
					{ start_time: 21600, isFrequency: false, extrapolated: false },
				],
			}),
		});

		const result = await client.getRouteDetails({
			routeId: "O8oSF0Jc",
			day: "tuesday",
		});

		expect(result.stops).toEqual([
			expect.objectContaining({ stopId: "gKWioTGb", name: "Majestic" }),
		]);
		expect(result.timetable).toEqual([
			{ startTimeSeconds: 21600, frequency: false, extrapolated: false },
		]);
		expect(result.trips[0]).toMatchObject({
			tripId: "trip-1",
			startTimeSeconds: 21600,
			durationSeconds: 3600,
		});
		expect(result.trips[0].serviceType).toBeUndefined();
	});

	it("uses the scheduled span when a frequency leg reports travel_time 0", async () => {
		mockGet.mockResolvedValue({
			json: async () => ({
				payload: {
					itineraries: [
						{
							legs: [
								{
									mode: "METRO",
									route_name: "Purple Line",
									start_time: 36000,
									end_time: 36690,
									travel_time: 0,
								},
								{
									mode: "BUS",
									route_name: "500-D",
									start_time: 36690,
									end_time: 37200,
									travel_time: 510,
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
			startTimeSeconds: 35000,
			day: "tuesday",
		});

		expect(result.itineraries[0].legs[0]).toMatchObject({
			mode: "METRO",
			routeName: "Purple Line",
			startTimeSeconds: 36000,
			endTimeSeconds: 36690,
			travelTimeSeconds: 690,
		});
		expect(result.itineraries[0].legs[1].travelTimeSeconds).toBe(510);
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

	it("finds nearby stops", async () => {
		mockGet.mockResolvedValue({
			json: async () => [
				{
					stop_id: "ArYFEPLj",
					stop_lat: 12.97793,
					stop_lon: 77.6283,
					station_type: "BUS",
					stop_name: "Halasuru",
					distance: 0,
				},
				{
					stop_id: "other",
					stop_lat: 12.978,
					stop_lon: 77.629,
					station_type: "BUS",
					stop_name: "Nearby Stop",
					distance: 120,
				},
			],
		});

		const result = await client.getNearbyStops({
			coordinates: [12.97793, 77.6283],
		});

		const [, options] = mockGet.mock.calls[0];
		const params = options.searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v4/bengaluru/nearby/stops"
		);
		expect(params.get("lat")).toBe("12.97793");
		expect(params.get("lon")).toBe("77.6283");
		expect(params.get("transitMode")).toBe("bus");
		expect(result.stops).toHaveLength(2);
		expect(result.stops[0]).toMatchObject({
			stop: {
				stopId: "ArYFEPLj",
				name: "Halasuru",
				latitude: 12.97793,
				longitude: 77.6283,
			},
			stationType: "BUS",
			distanceMeters: 0,
		});
		expect(result.stops[1].distanceMeters).toBe(120);
	});

	it("gets stop details timetable", async () => {
		mockGet.mockResolvedValue({
			json: async () => [
				{
					arrival_time: 27384,
					trip: {
						trip_id: "OB36Mp8m",
						route_id: "5h7NR3e9",
						route_name: "317-VT",
						agency_name: "BMTC",
						spf: ["Ordinary"],
						isFrequencyTrip: false,
						extrapolated: true,
						first_stop: { stop_name: "KR Market" },
						last_stop: { stop_name: "Vagata" },
						direction_stop: { stop_name: "Vagata" },
					},
				},
			],
		});

		const result = await client.getStopDetails({
			stopId: "CAQCTt7Q",
			day: "wednesday",
			startTimeSeconds: 2919,
		});

		const params = mockGet.mock.calls[0][1].searchParams as URLSearchParams;
		expect(mockGet.mock.calls[0][0]).toBe(
			"scheduler_v4/v4/bengaluru/stopdetails"
		);
		expect(params.get("stop_id")).toBe("CAQCTt7Q");
		expect(params.get("time")).toBe("2919");
		expect(params.get("day")).toBe("wednesday");
		expect(result.timetable[0]).toMatchObject({
			tripId: "OB36Mp8m",
			routeId: "5h7NR3e9",
			routeName: "317-VT",
			agencyName: "BMTC",
			destinationName: "Vagata",
			firstStopName: "KR Market",
			arrivalTimeSeconds: 27384,
			frequencyTrip: false,
			extrapolated: true,
			serviceTypes: ["Ordinary"],
		});
	});

	it("rejects an empty search", async () => {
		await expect(
			client.search({ query: "  ", coordinates: [12.97, 77.59] })
		).rejects.toBeInstanceOf(TransitValidationError);
		expect(mockGet).not.toHaveBeenCalled();
	});
});
