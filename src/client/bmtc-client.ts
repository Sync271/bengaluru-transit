import { BaseClient, type BaseClientConfig } from "./base-client";
import { InfoAPI } from "../api/info";
import { VehiclesAPI } from "../api/vehicles";

/**
 * Main BMTC API client
 */
export class BMTCClient extends BaseClient {
	public readonly info: InfoAPI;
	public readonly vehicles: VehiclesAPI;

	constructor(config: BaseClientConfig = {}) {
		super(config);
		this.info = new InfoAPI(this);
		this.vehicles = new VehiclesAPI(this);
	}
}
