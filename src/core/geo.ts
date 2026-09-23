// Disha Sarathi - GeoResolver & Haversine Utilities (PS 26097)
import { DistrictCentroid, TrainingCenter } from './types';
import districtsData from '../data/districts.json';
import trainingCentersData from '../data/training_centers.json';

const districts = districtsData as DistrictCentroid[];
const trainingCenters = trainingCentersData as TrainingCenter[];

/**
 * Calculates the great-circle distance between two points in kilometers using Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

export interface GeoDistrictResult {
  district: DistrictCentroid;
  distanceKm: number;
  isReliable: boolean; // Sanity gate: distance <= 220km
  roundedLat: number;  // Rounded to 2 decimals (~1.1km) for privacy
  roundedLng: number;
}

/**
 * Resolves current GPS coordinates to the nearest Indian District centroid.
 * Applies the 220 km sanity gate.
 */
export function resolveNearestDistrict(lat: number, lng: number): GeoDistrictResult {
  let nearest: DistrictCentroid = districts[0];
  let minDistance = Infinity;

  for (const d of districts) {
    const dist = calculateHaversineDistanceKm(lat, lng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  const isReliable = minDistance <= 220; // 220 km sanity threshold
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLng = Math.round(lng * 100) / 100;

  return {
    district: nearest,
    distanceKm: minDistance,
    isReliable,
    roundedLat,
    roundedLng
  };
}

/**
 * Finds the nearest training center offering a specific trade.
 */
export function findNearestCenterForTrade(
  lat: number,
  lng: number,
  tradeId: string
): { center: TrainingCenter; distanceKm: number } | null {
  const matchingCenters = trainingCenters.filter((c) =>
    c.trades_offered.includes(tradeId)
  );

  if (matchingCenters.length === 0) return null;

  let nearest = matchingCenters[0];
  let minDistance = Infinity;

  for (const c of matchingCenters) {
    const dist = calculateHaversineDistanceKm(lat, lng, c.lat, c.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = c;
    }
  }

  return {
    center: nearest,
    distanceKm: minDistance
  };
}

/**
 * Find training centers in a district
 */
export function getCentersInDistrict(districtKey: string): TrainingCenter[] {
  return trainingCenters.filter((c) => c.district.toLowerCase() === districtKey.toLowerCase());
}

/**
 * Search districts by query (English or regional script)
 */
export function searchDistricts(query: string): DistrictCentroid[] {
  const q = query.trim().toLowerCase();
  if (!q) return districts.slice(0, 20);

  return districts.filter((d) => {
    if (d.name.toLowerCase().includes(q)) return true;
    if (d.state.toLowerCase().includes(q)) return true;
    for (const val of Object.values(d.name_local)) {
      if (val && val.toLowerCase().includes(q)) return true;
    }
    return false;
  });
}
