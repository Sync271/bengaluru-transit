/**
 * BMTC TypeScript Wrapper
 * Main entry point for the package
 */

export { BMTCClient } from './client/bmtc-client';
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
