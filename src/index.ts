/**
 * Bengaluru Transit TypeScript SDK
 * Main entry point for the package
 */

export { BengaluruTransitClient } from './client/transit-client';
export { BengaluruTransitClientV2, occupancyLevel } from './client/v2-client';
export type { BaseClientConfig } from './client/base-client';
export type { BengaluruTransitClientV2Config } from './types/v2';

// Export types
export type * from './types';

// Export utilities (if needed for advanced usage)
export {
	createStopFeature,
	createRouteFeature,
	createLocationFeature,
	createFeatureCollection,
	validateCoordinates,
	normalizeCoordinates,
} from './utils/geojson';

export { validate, safeValidate } from './utils/validation';
export { TransitError, TransitValidationError } from './utils/errors';