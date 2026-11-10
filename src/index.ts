/**
 * Bengaluru Transit TypeScript SDK
 * Main entry point for the package
 */

export { BengaluruTransitClient } from './client/transit-client.js';
export { BengaluruTransitClientV2, occupancyLevel } from './client/v2-client.js';
export type { BaseClientConfig } from './client/base-client.js';
export type { BengaluruTransitClientV2Config } from './types/v2.js';

// Export types
export type * from './types/index.js';

// Export utilities (if needed for advanced usage)
export {
	createStopFeature,
	createRouteFeature,
	createLocationFeature,
	createFeatureCollection,
	validateCoordinates,
	normalizeCoordinates,
} from './utils/geojson.js';

export { validate, safeValidate } from './utils/validation.js';
export { TransitError, TransitValidationError } from './utils/errors.js';