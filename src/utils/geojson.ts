import type {
  Feature,
  FeatureCollection,
  Position,
} from 'geojson';
import type {
  FacilityFeature,
  FacilityProperties,
  LocationFeature,
  LocationProperties,
  RouteFeature,
  RouteProperties,
  StopFeature,
  StopProperties,
} from '../types/geojson';

/**
 * GeoJSON utility functions for BMTC data conversion
 */

/**
 * Creates a Point feature for a bus stop
 */
export function createStopFeature(
  coordinates: Position,
  properties: StopProperties,
): StopFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties,
  };
}

/**
 * Creates a LineString feature for a bus route
 */
export function createRouteFeature(
  coordinates: Position[],
  properties: RouteProperties,
): RouteFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties,
  };
}

/**
 * Creates a Point feature for a bus location
 */
export function createLocationFeature(
  coordinates: Position,
  properties: LocationProperties,
): LocationFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties,
  };
}

/**
 * Creates a Point feature for a facility/amenity
 */
export function createFacilityFeature(
  coordinates: Position,
  properties: FacilityProperties,
): FacilityFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties,
  };
}

/**
 * Creates a FeatureCollection from an array of features
 */
export function createFeatureCollection<T extends Feature>(
  features: T[],
): FeatureCollection<T['geometry'], T['properties']> {
  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Validates that coordinates are in [longitude, latitude] format
 * GeoJSON standard requires longitude first, then latitude
 */
export function validateCoordinates(coordinates: Position): boolean {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return false;
  }

  const [lng, lat] = coordinates;

  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return false;
  }

  // Validate longitude: -180 to 180
  if (lng < -180 || lng > 180) {
    return false;
  }

  // Validate latitude: -90 to 90
  if (lat < -90 || lat > 90) {
    return false;
  }

  return true;
}

/**
 * Converts BMTC coordinate format to GeoJSON Position
 * Handles different possible input formats
 */
export function normalizeCoordinates(
  input: unknown,
): Position | null {
  if (!Array.isArray(input)) {
    return null;
  }

  // Handle [lng, lat] or [lat, lng] - we'll assume [lng, lat] is correct
  if (input.length >= 2) {
    const [first, second] = input;
    if (typeof first === 'number' && typeof second === 'number') {
      // If first value is > 90, it's likely longitude (India is ~70-90 lng)
      // If first value is < 90, it might be latitude
      // For Bangalore, longitude is ~77, latitude is ~13
      const coords: Position = [first, second];
      if (validateCoordinates(coords)) {
        return coords;
      }
      // Try swapping if validation fails
      const swapped: Position = [second, first];
      if (validateCoordinates(swapped)) {
        return swapped;
      }
    }
  }

  return null;
}
