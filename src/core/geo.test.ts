import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  resolveNearestDistrict,
  findNearestCenterForTrade,
  searchDistricts
} from './geo';

describe('GeoResolver and Haversine utility', () => {
  it('calculates accurate haversine distance between Varanasi and Lucknow', () => {
    // Varanasi (25.3176, 82.9739), Lucknow (26.8467, 80.9462) ~ 265-275 km
    const dist = calculateHaversineDistanceKm(25.3176, 82.9739, 26.8467, 80.9462);
    expect(dist).toBeGreaterThan(250);
    expect(dist).toBeLessThan(300);
  });

  it('resolves coordinates in Varanasi to Varanasi district', () => {
    // Near BHU / Sigra Varanasi: 25.31, 82.98
    const result = resolveNearestDistrict(25.31, 82.98);
    expect(result.district.name).toBe('Varanasi');
    expect(result.district.state).toBe('Uttar Pradesh');
    expect(result.isReliable).toBe(true);
    expect(result.distanceKm).toBeLessThan(10);
    expect(result.roundedLat).toBe(25.31);
    expect(result.roundedLng).toBe(82.98);
  });

  it('resolves coordinates in Pune to Pune district', () => {
    const result = resolveNearestDistrict(18.5204, 73.8567);
    expect(result.district.name).toBe('Pune');
    expect(result.district.state).toBe('Maharashtra');
    expect(result.isReliable).toBe(true);
  });

  it('flags coordinates in middle of ocean (>220km) as unreliable', () => {
    // Arabian Sea: 15.0, 65.0 (over 700km from Indian coast)
    const result = resolveNearestDistrict(15.0, 65.0);
    expect(result.isReliable).toBe(false);
    expect(result.distanceKm).toBeGreaterThan(220);
  });

  it('finds nearest training center for a trade in Varanasi', () => {
    const res = findNearestCenterForTrade(25.3176, 82.9739, 'app_sewing_machine_op');
    expect(res).not.toBeNull();
    expect(res?.center.district).toBe('Varanasi');
    expect(res?.distanceKm).toBeLessThan(15);
  });

  it('searches districts by English name and regional query', () => {
    const results = searchDistricts('varanasi');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Varanasi');
  });
});
