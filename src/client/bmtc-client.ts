import { BaseClient, type BaseClientConfig } from './base-client';

/**
 * Main BMTC API client
 * This class will be extended with API methods as we implement endpoints
 */
export class BMTCClient extends BaseClient {
  constructor(config: BaseClientConfig = {}) {
    super(config);
  }

  // API methods will be added here as we implement endpoints
  // Example structure:
  // routes: {
  //   getAll: () => Promise<RouteFeatureCollection>;
  //   getById: (id: string) => Promise<RouteFeature>;
  // }
}
