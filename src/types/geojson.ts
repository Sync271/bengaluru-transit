import type { Feature, FeatureCollection, LineString, Point } from 'geojson';

/**
 * Extended GeoJSON types for BMTC-specific use cases
 */

/**
 * A bus route represented as a GeoJSON LineString Feature
 */
export type RouteFeature = Feature<LineString, RouteProperties>;

/**
 * A bus stop represented as a GeoJSON Point Feature
 */
export type StopFeature = Feature<Point, StopProperties>;

/**
 * A bus location represented as a GeoJSON Point Feature
 */
export type LocationFeature = Feature<Point, LocationProperties>;

/**
 * A facility/amenity represented as a GeoJSON Point Feature
 */
export type FacilityFeature = Feature<Point, FacilityProperties>;

/**
 * Properties for a route feature
 */
export interface RouteProperties {
  routeId: string;
  routeName?: string;
  routeNumber?: string;
  from?: string;
  to?: string;
  distance?: number;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Properties for a stop feature
 */
export interface StopProperties {
  stopId: string;
  stopName?: string;
  stopCode?: string;
  address?: string;
  [key: string]: unknown;
}

/**
 * Properties for a location feature (real-time bus location)
 */
export interface LocationProperties {
  busId?: string;
  routeId?: string;
  direction?: string;
  speed?: number;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Properties for a facility feature (amenities around bus stations)
 */
export interface FacilityProperties {
  facilityId?: string;
  facilityName: string;
  facilityType: string;
  facilityTypeId: string;
  icon?: string;
  distance?: number;
  stationName?: string;
  [key: string]: unknown;
}

/**
 * Collection of route features
 */
export type RouteFeatureCollection = FeatureCollection<LineString, RouteProperties>;

/**
 * Collection of stop features
 */
export type StopFeatureCollection = FeatureCollection<Point, StopProperties>;

/**
 * Collection of location features
 */
export type LocationFeatureCollection = FeatureCollection<Point, LocationProperties>;

/**
 * Collection of facility features
 */
export type FacilityFeatureCollection = FeatureCollection<Point, FacilityProperties>;
