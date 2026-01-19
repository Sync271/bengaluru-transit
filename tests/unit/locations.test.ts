import { describe, it, expect, beforeEach, vi } from "vitest";
import { BMTCClient } from "../../src/client/bmtc-client";
import type { KyInstance } from "ky";

describe("LocationsAPI", () => {
	let client: BMTCClient;
	let mockPost: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		client = new BMTCClient();
		// Mock the ky client's post method
		mockPost = vi.fn();
		const kyClient = client.getClient() as unknown as KyInstance;
		vi.spyOn(kyClient, "post").mockImplementation(mockPost);
	});

	describe("searchPlaces", () => {
		it("should search places successfully", async () => {
			const mockRawResponse = {
				data: [
					{
						title: "Cbi Quarters",
						placename:
							"Cbi Quarters, Service Road, Ganga Nagar, Bengaluru 560032, India",
						lat: 13.02582,
						lng: 77.58543,
					},
					{
						title: "Cbi Bus Stop",
						placename:
							"Cbi Bus Stop, 4th Main Road, Vasanthappa Block, Ganga Nagar, Bengaluru 560032, India",
						lat: 13.02679,
						lng: 77.59075,
					},
					{
						title: "Cbi Vasanthappa",
						placename:
							"Cbi Vasanthappa, C B I Road, Vasanthappa Block, Ganga Nagar, Bengaluru 560032, India",
						lat: 13.02645,
						lng: 77.58951,
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

			const result = await client.locations.searchPlaces({
				query: "cbi",
			});

			expect(result.items).toHaveLength(3);
			expect(result.items.length).toBe(3);

			// Verify first place
			expect(result.items[0].title).toBe("Cbi Quarters");
			expect(result.items[0].address).toBe(
				"Cbi Quarters, Service Road, Ganga Nagar, Bengaluru 560032, India"
			);
			expect(result.items[0].latitude).toBe(13.02582);
			expect(result.items[0].longitude).toBe(77.58543);

			// Verify second place
			expect(result.items[1].title).toBe("Cbi Bus Stop");
			expect(result.items[1].latitude).toBe(13.02679);
			expect(result.items[1].longitude).toBe(77.59075);

			// Verify third place
			expect(result.items[2].title).toBe("Cbi Vasanthappa");
			expect(result.items[2].latitude).toBe(13.02645);
			expect(result.items[2].longitude).toBe(77.58951);

			// Verify API call
			expect(mockPost).toHaveBeenCalledWith("GetSearchPlaceData", {
				json: { placename: "cbi" },
			});
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

			const result = await client.locations.searchPlaces({
				query: "nonexistentplace",
			});

			expect(result.items).toHaveLength(0);
			expect(result.items.length).toBe(0);
		});

		it("should handle single result", async () => {
			const mockRawResponse = {
				data: [
					{
						title: "Test Place",
						placename: "Test Place, Test City, Test Country",
						lat: 12.9716,
						lng: 77.5946,
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

			const result = await client.locations.searchPlaces({
				query: "test",
			});

			expect(result.items).toHaveLength(1);
			expect(result.items[0].title).toBe("Test Place");
			expect(result.items[0].latitude).toBe(12.9716);
			expect(result.items[0].longitude).toBe(77.5946);
		});

		it("should validate input parameters and throw on empty query", async () => {
			await expect(
				client.locations.searchPlaces({
					query: "",
				})
			).rejects.toThrow("Invalid search places parameters");
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
				client.locations.searchPlaces({
					query: "test",
				})
			).rejects.toThrow("Invalid search places response");
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
				client.locations.searchPlaces({
					query: "test",
				})
			).rejects.toThrow();
		});

		it("should handle places with special characters in name", async () => {
			const mockRawResponse = {
				data: [
					{
						title: "Test & Co.",
						placename: "Test & Co., Main Street, City",
						lat: 13.0,
						lng: 77.0,
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

			const result = await client.locations.searchPlaces({
				query: "test &",
			});

			expect(result.items[0].title).toBe("Test & Co.");
			expect(result.items[0].address).toBe("Test & Co., Main Street, City");
		});
	});
});