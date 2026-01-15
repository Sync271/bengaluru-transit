import { BaseClient, type BaseClientConfig } from "./base-client";
import { InfoAPI } from "../api/info";

/**
 * Main BMTC API client
 */
export class BMTCClient extends BaseClient {
	public readonly info: InfoAPI;

	constructor(config: BaseClientConfig = {}) {
		super(config);
		this.info = new InfoAPI(this);
	}
}
