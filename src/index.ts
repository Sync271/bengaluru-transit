/**
 * Bengaluru Transit TypeScript SDK
 * Main entry point for the package
 */

export { BengaluruTransitClient } from './client/transit-client';
export type { BaseClientConfig } from './client/base-client';

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