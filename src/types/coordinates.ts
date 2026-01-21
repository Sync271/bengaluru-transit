/**
 * Coordinate type definition
 * Format: [latitude, longitude]
 * This matches the transit API format (latitude first, unlike GeoJSON which uses longitude first)
 */
export type Coordinate = [latitude: number, longitude: number];
