import { describe, it, expect } from 'vitest';
import { recommendNSQFTrades } from './recommender';
import { BeneficiaryProfile } from './types';

describe('Deterministic NSQF Recommender', () => {
  const sampleProfile: BeneficiaryProfile = {
    education_level: 'secondary',
    family_occupation: 'Tailoring',
    current_livelihood: 'Small tailoring at home',
    skills_interests: ['stitching', 'design'],
    constraints: [],
    travel_radius_km: 10,
    employment_preference: 'self_employment',
    district: 'Varanasi',
    lat: 25.3176,
    lng: 82.9739
  };

  it('runs deterministically and produces exact same scores across runs', () => {
    const run1 = recommendNSQFTrades(sampleProfile, 'hi', 'test_1');
    const run2 = recommendNSQFTrades(sampleProfile, 'hi', 'test_2');

    expect(run1.results.length).toBe(3);
    expect(run2.results.length).toBe(3);
    expect(run1.results[0].trade.id).toBe(run2.results[0].trade.id);
    expect(run1.results[0].score).toBe(run2.results[0].score);
    expect(run1.trace.surviving_candidates.length).toBe(run2.trace.surviving_candidates.length);
  });

  it('completes recommendation calculation in under 200 ms', () => {
    const start = performance.now();
    const { trace } = recommendNSQFTrades(sampleProfile, 'en', 'perf_test');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
    expect(trace.duration_ms).toBeLessThan(200);
  });

  it('interpolates actual spoken slots in the rationale', () => {
    const { results } = recommendNSQFTrades(sampleProfile, 'hi', 'test_rationale');
    expect(results[0].rationale).toContain('stitching');
    expect(results[0].rationale).toContain('Small tailoring at home');
  });

  it('filters out heavy climbing trades when locomotor constraint is present', () => {
    const disabledProfile: BeneficiaryProfile = {
      ...sampleProfile,
      constraints: ['locomotor_difficulty']
    };

    const { trace } = recommendNSQFTrades(disabledProfile, 'en', 'test_disability');
    const filteredSolar = trace.surviving_candidates.find(c => c.trade_id === 'el_solar_panel_installer');
    expect(filteredSolar).toBeUndefined(); // Should be filtered out
  });
});
