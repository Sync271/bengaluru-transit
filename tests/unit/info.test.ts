import { describe, it, expect, beforeEach, vi } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";
import type { KyInstance } from "ky";

describe("InfoAPI", () => {
	let client: BMTCClient;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BMTCClient();
		// Mock the ky client's post method
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	describe("getHelpline", () => {
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

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getHelpline();

			expect(result.items).toHaveLength(1);
			expect(result.items[0].helplineNumber).toBe("08022483777");
			expect(result.items[0].labelName).toBe("BMTC Helpline No");
			expect(result.items[0].busStopName).toBeNull();
			expect(result.items.length).toBe(1);
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

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getHelpline();

			expect(result.items).toHaveLength(2);
			expect(result.items.length).toBe(2);
			expect(result.items[1].labelName).toBe("Customer Care");
			expect(result.items[1].busStopName).toBe("Central");
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

			await expect(client.info.getHelpline()).rejects.toThrow(
				"Invalid helpline response"
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

			await expect(client.info.getHelpline()).rejects.toThrow();
		});
	});

	describe("getServiceTypes", () => {
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

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getServiceTypes();

			expect(result.items).toHaveLength(2);
			expect(result.items[0].serviceType).toBe("AC");
			expect(result.items[0].serviceTypeId).toBe("73");
			expect(result.items[1].serviceType).toBe("Non AC/Ordinary");
			expect(result.items[1].serviceTypeId).toBe("72");
			expect(result.items.length).toBe(2);
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

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getServiceTypes();

			expect(result.items).toHaveLength(1);
			expect(result.items[0].serviceType).toBe("AC");
			expect(result.items[0].responseCode).toBe(200);
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

			await expect(client.info.getServiceTypes()).rejects.toThrow(
				"Invalid service types response"
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

			await expect(client.info.getServiceTypes()).rejects.toThrow();
		});
	});

	describe("getAbout", () => {
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

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getAbout();

			expect(result.item.termsAndConditionsUrl).toBe(
				"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/TermsAndConditions.html"
			);
			expect(result.item.aboutBmtcUrl).toBe(
				"https://bmtcmobileapi.karnataka.gov.in/StaticFiles/AboutBMTC.html"
			);
			expect(result.item.airportLatitude).toBe(13.1986);
			expect(result.item.airportLongitude).toBe(77.7066);
			expect(result.item.airportStationId).toBe("111");
			expect(result.item.airportStationName).toBe(
				"Kempegowda International Airport Bengaluru"
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

			await expect(client.info.getAbout()).rejects.toThrow(
				"Invalid about data response"
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

			await expect(client.info.getAbout()).rejects.toThrow();
		});
	});

	describe("getEmergencyMessages", () => {
		it("should fetch emergency messages successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 1,
						message_english:
							"Currently we are tracking 6287 buses and the Fleet Integration is in progress.",
						message_kannada:
							"ಪ್ರಸ್ತುತ ನಾವು 6287 ಬಸ್\u200cಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತಿದ್ದೇವೆ ಮತ್ತು ಫ್ಲೀಟ್ ಇಂಟಿಗ್ರೇಷನ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ.",
						isdisplay: 1,
						display_key: "Home_screen",
					},
					{
						id: 2,
						message_english:
							"Default results displayed are within the next hour. For further details, use the filter functionality.",
						message_kannada:
							"ಇಲ್ಲಿನ ವಿವರ ಮುಂದಿನ 1 ಗಂಟೆಯೊಳಗಿನ  ಫಲಿತಾಂಶಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ, ಫಿಲ್ಟರನ್ನು ಬಳಸಿ",
						isdisplay: 1,
						display_key: "Journey_Planner",
					},
				],
				Message: "",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getEmergencyMessages();

			expect(result.items).toHaveLength(2);
			expect(result.items[0].id).toBe("1");
			expect(result.items[0].messageEnglish).toContain("6287 buses");
			expect(result.items[0].messageKannada).toBeDefined();
			expect(result.items[0].isDisplay).toBe(true);
			expect(result.items[0].displayKey).toBe("Home_screen");
			expect(result.items[1].id).toBe("2");
			expect(result.items[1].displayKey).toBe("Journey_Planner");
		});

		it("should convert isdisplay 0 to false", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 1,
						message_english: "Test message",
						message_kannada: "ಪರೀಕ್ಷಾ ಸಂದೇಶ",
						isdisplay: 0,
						display_key: "Test",
					},
				],
				Message: "",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getEmergencyMessages();

			expect(result.items[0].isDisplay).toBe(false);
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

			await expect(client.info.getEmergencyMessages()).rejects.toThrow(
				"Invalid emergency messages response"
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

			await expect(client.info.getEmergencyMessages()).rejects.toThrow();
		});
	});

	describe("getFareScrollMessages", () => {
		it("should fetch fare scroll messages successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 3,
						message_english:
							"All the approx fares are inclusive of toll charges wherever applicable & these fares may vary with actual fares.",
						message_kannada:
							"ಎಲ್ಲಾ ಅಂದಾಜು ದರಗಳು ಟೋಲ್ ಶುಲ್ಕಗಳನ್ನು ಒಳಗೊಂಡಿರುತ್ತವೆ ಮತ್ತು ಈ ದರಗಳು ನಿಜವಾದ ದರಗಳೊಂದಿಗೆ ಬದಲಾಗಬಹುದು.",
						display_key: "Fare_Calculator",
						isdisplay: 1,
					},
				],
				Message: "",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getFareScrollMessages();

			expect(result.items).toHaveLength(1);
			expect(result.items.length).toBe(1);
			expect(result.items[0].id).toBe("3");
			expect(result.items[0].messageEnglish).toContain(
				"approx fares are inclusive"
			);
			expect(result.items[0].messageKannada).toBeDefined();
			expect(result.items[0].isDisplay).toBe(true);
			expect(result.items[0].displayKey).toBe("Fare_Calculator");

			// Verify API call
			expect(mockPost).toHaveBeenCalledWith("GetFareScrollMessage", {
				json: {},
			});
		});

		it("should handle empty results", async () => {
			const mockRawResponse = {
				data: [],
				Message: "",
				Issuccess: true,
				exception: null,
				RowCount: 0,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getFareScrollMessages();

			expect(result.items).toHaveLength(0);
			expect(result.items.length).toBe(0);
		});

		it("should convert isdisplay 0 to false", async () => {
			const mockRawResponse = {
				data: [
					{
						id: 1,
						message_english: "Test message",
						message_kannada: "ಪರೀಕ್ಷಾ ಸಂದೇಶ",
						isdisplay: 0,
						display_key: "Test",
					},
				],
				Message: "",
				Issuccess: true,
				exception: null,
				RowCount: 1,
				responsecode: 200,
			};

			// Mock the response
			mockPost.mockResolvedValue({
				json: async () => mockRawResponse,
			} as Response);

			const result = await client.info.getFareScrollMessages();

			expect(result.items[0].isDisplay).toBe(false);
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

			await expect(client.info.getFareScrollMessages()).rejects.toThrow(
				"Invalid fare scroll messages response"
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

			await expect(client.info.getFareScrollMessages()).rejects.toThrow();
		});
	});
});
