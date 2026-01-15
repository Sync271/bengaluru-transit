import { BaseClient, type BaseClientConfig } from "./base-client";
import { InfoAPI } from "../api/info";
import { VehiclesAPI } from "../api/vehicles";
import { RoutesAPI } from "../api/routes";
import { StopsAPI } from "../api/stops";

/**
 * Main BMTC API client
 */
export class BMTCClient extends BaseClient {
	public readonly info: InfoAPI;
	public readonly vehicles: VehiclesAPI;
	public readonly routes: RoutesAPI;
	public readonly stops: StopsAPI;

	constructor(config: BaseClientConfig = {}) {
		super(config);
		this.info = new InfoAPI(this);
		this.vehicles = new VehiclesAPI(this);
		this.routes = new RoutesAPI(this);
		this.stops = new StopsAPI(this);
	}
}
