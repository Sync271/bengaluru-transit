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
				routeId: 11797,
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
				client.routes.getRoutePoints({ routeId: 0 })
			).rejects.toThrow("Invalid route points parameters");

			await expect(
				client.routes.getRoutePoints({ routeId: -1 })
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
});
