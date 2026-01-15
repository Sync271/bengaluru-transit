import ky, { type KyInstance } from "ky";

/**
 * Base HTTP client configuration for BMTC API
 */
export interface BaseClientConfig {
	baseURL?: string;
	timeout?: number;
	retry?: number;
	headers?: Record<string, string>;
	/**
	 * Language preference: 'en' for English, 'kn' for Kannada
	 * @default 'en'
	 */
	language?: "en" | "kn";
	/**
	 * Device type identifier
	 * @default ''
	 */
	deviceType?: string;
	/**
	 * Authentication token
	 * @default 'N/A'
	 */
	authToken?: string;
	/**
	 * Device identifier
	 * @default ''
	 */
	deviceId?: string;
}

/**
 * Base HTTP client class using ky
 */
export class BaseClient {
	protected client: KyInstance;
	protected baseURL: string;

	constructor(config: BaseClientConfig = {}) {
		this.baseURL =
			config.baseURL || "https://bmtcmobileapi.karnataka.gov.in/WebAPI";

		// Default BMTC API headers
		const defaultHeaders: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "application/json, text/plain, */*",
			lan: config.language || "en",
			deviceType: config.deviceType || "",
			authToken: config.authToken || "N/A",
			deviceId: config.deviceId || "",
		};

		this.client = ky.create({
			prefixUrl: this.baseURL,
			timeout: config.timeout,
			retry: config.retry || {
				limit: 2,
				methods: ["get"],
				statusCodes: [408, 413, 429, 500, 502, 503, 504],
			},
			headers: {
				...defaultHeaders,
				...config.headers, // Allow overriding any header
			},
			hooks: {
				beforeError: [
					async (error) => {
						// Enhance error message with API-specific details
						let errorMessage = error.message || "Request failed";

						// Try to parse error response body
						try {
							const errorBody = (await error.response?.json()) as
								| { message?: string; code?: string }
								| undefined;
							if (errorBody?.message) {
								errorMessage = errorBody.message;
							}
						} catch {
							// Ignore JSON parse errors
						}

						// Update the error message and return the original HTTPError
						error.message = errorMessage;
						return error;
					},
				],
			},
		});
	}

	/**
	 * Get the underlying ky client instance
	 */
	getClient(): KyInstance {
		return this.client;
	}

	/**
	 * Get the base URL
	 */
	getBaseURL(): string {
		return this.baseURL;
	}
}
