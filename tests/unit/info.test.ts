import { describe, it, expect, beforeEach, afterEach } from "vitest";
import nock from "nock";
import { BMTCClient } from "../../src/client/bmtc-client";

describe("InfoAPI", () => {
	let client: BMTCClient;
	const baseURL = "https://bmtcmobileapi.karnataka.gov.in";

	beforeEach(() => {
		nock.cleanAll();
		nock.disableNetConnect();
		client = new BMTCClient();
	});

	afterEach(() => {
		nock.enableNetConnect();
		nock.cleanAll();
	});

	describe("getHelplineData", () => {
		it("should fetch helpline data successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						labelname: "BMTC Helpline No",
						busstopname: null,
						helplinenumber: "08022483777",
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			nock(baseURL).post("/WebAPI/GetHelplineData").reply(200, mockRawResponse);

			const result = await client.info.getHelplineData();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(1);
			expect(result.items[0].helplineNumber).toBe("08022483777");
			expect(result.items[0].labelName).toBe("BMTC Helpline No");
			expect(result.items[0].busStopName).toBeNull();
			expect(result.rowCount).toBe(1);
		});

		it("should handle multiple helpline entries", async () => {
			const mockRawResponse = {
				data: [
					{
						labelname: "BMTC Helpline No",
						busstopname: null,
						helplinenumber: "08022483777",
						responsecode: 200,
					},
					{
						labelname: "Customer Care",
						busstopname: "Central",
						helplinenumber: "08012345678",
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 2,
				responsecode: 200,
			};

			nock(baseURL).post("/WebAPI/GetHelplineData").reply(200, mockRawResponse);

			const result = await client.info.getHelplineData();

			expect(result.items).toHaveLength(2);
			expect(result.rowCount).toBe(2);
			expect(result.items[1].labelName).toBe("Customer Care");
			expect(result.items[1].busStopName).toBe("Central");
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: "invalid",
				Message: "Success",
			};

			nock(baseURL).post("/WebAPI/GetHelplineData").reply(200, invalidResponse);

			await expect(client.info.getHelplineData()).rejects.toThrow(
				"Invalid helpline response"
			);
		});

		it("should handle API errors", async () => {
			nock(baseURL)
				.post("/WebAPI/GetHelplineData")
				.reply(500, { message: "Internal Server Error" });

			await expect(client.info.getHelplineData()).rejects.toThrow();
		});
	});

	describe("getAllServiceTypes", () => {
		it("should fetch service types successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						servicetype: "AC",
						servicetypeid: 73,
						responsecode: 200,
					},
					{
						servicetype: "Non AC/Ordinary",
						servicetypeid: 72,
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 2,
				responsecode: 200,
			};

			nock(baseURL)
				.post("/WebAPI/GetAllServiceTypes")
				.reply(200, mockRawResponse);

			const result = await client.info.getAllServiceTypes();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(2);
			expect(result.items[0].serviceType).toBe("AC");
			expect(result.items[0].serviceTypeId).toBe(73);
			expect(result.items[1].serviceType).toBe("Non AC/Ordinary");
			expect(result.items[1].serviceTypeId).toBe(72);
			expect(result.rowCount).toBe(2);
		});

		it("should handle single service type", async () => {
			const mockRawResponse = {
				data: [
					{
						servicetype: "AC",
						servicetypeid: 73,
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			nock(baseURL)
				.post("/WebAPI/GetAllServiceTypes")
				.reply(200, mockRawResponse);

			const result = await client.info.getAllServiceTypes();

			expect(result.items).toHaveLength(1);
			expect(result.items[0].serviceType).toBe("AC");
			expect(result.items[0].responseCode).toBe(200);
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: "invalid",
				Message: "Success",
			};

			nock(baseURL)
				.post("/WebAPI/GetAllServiceTypes")
				.reply(200, invalidResponse);

			await expect(client.info.getAllServiceTypes()).rejects.toThrow(
				"Invalid service types response"
			);
		});

		it("should handle API errors", async () => {
			nock(baseURL)
				.post("/WebAPI/GetAllServiceTypes")
				.reply(500, { message: "Internal Server Error" });

			await expect(client.info.getAllServiceTypes()).rejects.toThrow();
		});
	});

	describe("getAboutData", () => {
		it("should fetch about data successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						termsandconditionsurl:
							"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/TermsAndConditions.html",
						aboutbmtcurl:
							"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/AboutBMTC.html",
						aboutdeveloperurl:
							"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/AboutDeveloper.html",
						airportlattitude: 13.1986,
						airportlongitude: 77.7066,
						airportstationid: 111,
						airportstationname: "Kempegowda International Airport Bengaluru",
						responsecode: 200,
					},
				],
				Message: "Success",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			nock(baseURL).post("/WebAPI/GetAboutData").reply(200, mockRawResponse);

			const result = await client.info.getAboutData();

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.item.termsAndConditionsUrl).toBe(
				"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/TermsAndConditions.html"
			);
			expect(result.item.aboutBmtcUrl).toBe(
				"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/AboutBMTC.html"
			);
			expect(result.item.airportLatitude).toBe(13.1986);
			expect(result.item.airportLongitude).toBe(77.7066);
			expect(result.item.airportStationId).toBe(111);
			expect(result.item.airportStationName).toBe(
				"Kempegowda International Airport Bengaluru"
			);
		});

		it("should validate response schema and throw on invalid data", async () => {
			const invalidResponse = {
				data: "invalid",
				Message: "Success",
			};

			nock(baseURL).post("/WebAPI/GetAboutData").reply(200, invalidResponse);

			await expect(client.info.getAboutData()).rejects.toThrow(
				"Invalid about data response"
			);
		});

		it("should handle API errors", async () => {
			nock(baseURL)
				.post("/WebAPI/GetAboutData")
				.reply(500, { message: "Internal Server Error" });

			await expect(client.info.getAboutData()).rejects.toThrow();
		});
	});
});
