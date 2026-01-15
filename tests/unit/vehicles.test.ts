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

	describe("listVehicles", () => {
		it("should list vehicles by registration number successfully", async () => {
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

			const result = await client.vehicles.listVehicles({
				vehicleRegNo: "KA57f183",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.items).toHaveLength(3);
			expect(result.items[0].vehicleId).toBe(13270);
			expect(result.items[0].vehicleRegNo).toBe("KA57F1831");
			expect(result.items[1].vehicleRegNo).toBe("KA57F1832");
			expect(result.rowCount).toBe(3);
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

			const result = await client.vehicles.listVehicles({
				vehicleRegNo: "INVALID",
			});

			expect(result.success).toBe(true);
			expect(result.items).toHaveLength(0);
			expect(result.rowCount).toBe(0);
		});

		it("should validate input parameters and throw on empty vehicleRegNo", async () => {
			await expect(
				client.vehicles.listVehicles({ vehicleRegNo: "" })
			).rejects.toThrow("Invalid list vehicles parameters");
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
				client.vehicles.listVehicles({ vehicleRegNo: "KA57f183" })
			).rejects.toThrow("Invalid list vehicles response");
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
				client.vehicles.listVehicles({ vehicleRegNo: "KA57f183" })
			).rejects.toThrow();
		});
	});
});
