import { describe, it, expect } from 'vitest';
import {
  getOpportunitiesForTradeAndDistrict,
  getPlacementStatusLabel,
  updatePlacementRecord
} from './placement';
import { BeneficiaryProfile } from './types';

describe('Placement & Opportunity Linkage Engine', () => {
  it('retrieves opportunities matching trade and district', () => {
    const opps = getOpportunitiesForTradeAndDistrict('app_sewing_machine_op', 'Varanasi', 'wage_employment');
    expect(opps.length).toBeGreaterThan(0);
    expect(opps[0].trade_id).toBe('app_sewing_machine_op');
    expect(opps[0].district).toBe('Varanasi');
  });

  it('provides multilingual labels for placement statuses', () => {
    expect(getPlacementStatusLabel('ENROLLED', 'hi')).toContain('नामांकित');
    expect(getPlacementStatusLabel('PLACED', 'mr')).toContain('रुजू');
    expect(getPlacementStatusLabel('SELF_EMPLOYED', 'en')).toContain('Self-Employment');
  });

  it('updates placement record on beneficiary profile', () => {
    const profile: BeneficiaryProfile = {
      skills_interests: ['stitching'],
      constraints: []
    };

    const updated = updatePlacementRecord(profile, 'PLACED', 'opp_var_app_01', 'Placed at Kashi Handloom');
    expect(updated.placement_status).toBe('PLACED');
    expect(updated.selected_opportunity_id).toBe('opp_var_app_01');
    expect(updated.placement_notes).toContain('Kashi Handloom');
  });
});
