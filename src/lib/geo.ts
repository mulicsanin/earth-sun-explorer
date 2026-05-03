import type { Vector3Tuple } from './types';

export const EARTH_RADIUS = 1.65;

export function clampLatitude(latitude: number): number {
  return Math.max(-89.999, Math.min(89.999, latitude));
}

export function normalizeLongitude(longitude: number): number {
  const normalized = ((((longitude + 180) % 360) + 360) % 360) - 180;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function geoToVector(latitude: number, longitude: number, radius = 1): Vector3Tuple {
  const lat = degreesToRadians(clampLatitude(latitude));
  const lon = degreesToRadians(normalizeLongitude(longitude));
  const cosLat = Math.cos(lat);

  return {
    x: radius * cosLat * Math.sin(lon),
    y: radius * Math.sin(lat),
    z: radius * cosLat * Math.cos(lon)
  };
}

export function vectorLength(vector: Vector3Tuple): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

export function normalizeVector(vector: Vector3Tuple): Vector3Tuple {
  const length = vectorLength(vector) || 1;

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

export function formatCoordinate(value: number, axis: 'lat' | 'lon'): string {
  const direction = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(4)} ${direction}`;
}
