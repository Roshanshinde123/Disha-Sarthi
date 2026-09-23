import { describe, it, expect } from 'vitest';
import { analyzeSkillGap } from './skillGap';
import { BeneficiaryProfile, NSQFTrade } from './types';
import nsqfTradesData from '../data/nsqf_trades.json';

const trades = nsqfTradesData as NSQFTrade[];

describe('Skill Gap Analysis Engine', () => {
  const tailorTrade = trades.find((t) => t.id === 'app_sewing_machine_op')!;
  const electricianTrade = trades.find((t) => t.id === 'con_general_electrician')!;

  it('correctly matches existing background and identifies training skill gaps', () => {
    const profile: BeneficiaryProfile = {
      skills_interests: ['stitching'],
      family_occupation: 'Tailoring',
      current_livelihood: 'Small tailoring at home',
      constraints: []
    };

    const result = analyzeSkillGap(profile, tailorTrade);

    expect(result.trade_id).toBe(tailorTrade.id);
    expect(result.matched_skills.length).toBeGreaterThan(0);
    expect(result.missing_skills.length).toBeGreaterThan(0);
    expect(result.training_required_skills).toContain('NSQF Standard Workplace Safety & Certification');
    expect(result.severity).toBeDefined();
    expect(result.recommended_intervention).toContain('PM-AJAY');
  });

  it('assigns high severity and foundation package when beneficiary has no prior background', () => {
    const freshProfile: BeneficiaryProfile = {
      skills_interests: ['computers'],
      family_occupation: 'Agriculture',
      current_livelihood: 'Farm labor',
      constraints: []
    };

    const result = analyzeSkillGap(freshProfile, electricianTrade);
    expect(result.severity).toBe('high');
    expect(result.recommended_intervention).toContain('Full Foundation');
  });
});
