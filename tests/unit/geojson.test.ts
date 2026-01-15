import { describe, it, expect } from 'vitest';
import {
  createStopFeature,
  createRouteFeature,
  createLocationFeature,
  createFeatureCollection,
  validateCoordinates,
  normalizeCoordinates,
} from '../../src/utils/geojson';

describe('GeoJSON Utilities', () => {
  describe('createStopFeature', () => {
    it('should create a valid stop feature', () => {
      const feature = createStopFeature([77.5946, 12.9716], {
        stopId: 'test-1',
        stopName: 'Test Stop',
      });

      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Point');
      expect(feature.geometry.coordinates).toEqual([77.5946, 12.9716]);
      expect(feature.properties.stopId).toBe('test-1');
    });
  });

  describe('createRouteFeature', () => {
    it('should create a valid route feature', () => {
      const coordinates: [number, number][] = [
        [77.5946, 12.9716],
        [77.5956, 12.9726],
      ];
      const feature = createRouteFeature(coordinates, {
        routeId: 'route-1',
        routeName: 'Test Route',
      });

      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('LineString');
      expect(feature.geometry.coordinates).toEqual(coordinates);
      expect(feature.properties.routeId).toBe('route-1');
    });
  });

  describe('createLocationFeature', () => {
    it('should create a valid location feature', () => {
      const feature = createLocationFeature([77.5946, 12.9716], {
        busId: 'bus-1',
        routeId: 'route-1',
      });

      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Point');
      expect(feature.geometry.coordinates).toEqual([77.5946, 12.9716]);
      expect(feature.properties.busId).toBe('bus-1');
    });
  });

  describe('createFeatureCollection', () => {
    it('should create a valid feature collection', () => {
      const features = [
        createStopFeature([77.5946, 12.9716], { stopId: 'stop-1' }),
        createStopFeature([77.5956, 12.9726], { stopId: 'stop-2' }),
      ];

      const collection = createFeatureCollection(features);

      expect(collection.type).toBe('FeatureCollection');
      expect(collection.features).toHaveLength(2);
      expect(collection.features[0].properties.stopId).toBe('stop-1');
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(validateCoordinates([77.5946, 12.9716])).toBe(true);
      expect(validateCoordinates([-180, -90])).toBe(true);
      expect(validateCoordinates([180, 90])).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates([200, 12.9716])).toBe(false); // Invalid longitude
      expect(validateCoordinates([77.5946, 100])).toBe(false); // Invalid latitude
      expect(validateCoordinates([77.5946])).toBe(false); // Missing latitude
      expect(validateCoordinates([])).toBe(false); // Empty array
    });
  });

  describe('normalizeCoordinates', () => {
    it('should normalize valid coordinate arrays', () => {
      expect(normalizeCoordinates([77.5946, 12.9716])).toEqual([
        77.5946, 12.9716,
      ]);
    });

    it('should return null for invalid input', () => {
      expect(normalizeCoordinates('invalid')).toBeNull();
      expect(normalizeCoordinates([200, 12.9716])).toBeNull(); // Out of range
      expect(normalizeCoordinates(null)).toBeNull();
    });
  });
});
