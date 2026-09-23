import { describe, it, expect } from 'vitest';
import { createInitialSession, step, getNextUnfilledProfilingState } from './orchestrator';
import { canGenerateRecommendations } from './recommender';

describe('Pure ConversationOrchestrator FSM & Profiling Gating', () => {
  it('initializes session at LANDING state with NOT_STARTED placement and empty clean profile', () => {
    const session = createInitialSession('mr');
    expect(session.state).toBe('LANDING');
    expect(session.lang).toBe('mr');
    expect(session.profile.skills_interests).toEqual([]);
    expect(session.profile.placement_status).toBe('NOT_STARTED');
    expect(canGenerateRecommendations(session)).toBe(false);
  });

  it('correctly determines next missing required profiling state', () => {
    const emptyProfile = { skills_interests: [], constraints: [] };
    expect(getNextUnfilledProfilingState(emptyProfile)).toBe('LOCATION');

    const partialProfile = {
      district: 'Pune',
      education_level: 'secondary' as any,
      family_occupation: 'Agriculture',
      current_livelihood: 'Farming',
      skills_interests: ['electrical'],
      constraints: []
    };
    expect(getNextUnfilledProfilingState(partialProfile)).toBe('EXPERIENCE');
  });

  it('extracts multiple profile slots from natural spoken Marathi utterance and asks only missing fields', () => {
    let session = createInitialSession('mr');
    session.state = 'BACKGROUND';

    // Utterance with 3 facts: 10th pass, agriculture family occupation, farming livelihood
    const out = step(session, {
      type: 'USER_INPUT',
      payload: 'मी 10 वी पर्यंत शिकलो आहे, माझ्या कुटुंबाचा शेतीचा व्यवसाय आहे आणि मी सध्या शेती करतो.'
    });

    expect(out.session.profile.education_level).toBe('secondary');
    expect(out.session.profile.family_occupation).toBe('agriculture');
    expect(out.session.profile.current_livelihood).toBe('agriculture');
    // Next missing question should NOT be education, family occupation, or livelihood!
    expect(out.session.state).not.toBe('BACKGROUND');
    expect(out.session.state).not.toBe('FAMILY_OCCUPATION');
    expect(out.session.state).not.toBe('CURRENT_LIVELIHOOD');
  });

  it('completes the full gated linear flow from empty profile to confirmation, passport, skill gap, and recommendations', () => {
    let session = createInitialSession('mr');

    // 1. LANDING -> LANG_SELECT
    let out = step(session, { type: 'CHIP_CLICK', payload: { value: 'start' } });
    expect(out.session.state).toBe('LANG_SELECT');

    // 2. LANG_SELECT -> GREETING
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'mr' } });
    expect(out.session.state).toBe('GREETING');

    // 3. GREETING -> CONSENT
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'continue' } });
    expect(out.session.state).toBe('CONSENT');

    // 4. CONSENT -> LOCATION
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'yes' } });
    expect(out.session.state).toBe('LOCATION');

    // 5. LOCATION -> BACKGROUND
    out = step(out.session, {
      type: 'LOCATION_RESOLVED',
      payload: { district: 'Pune', state: 'Maharashtra', lat: 18.52, lng: 73.85, accuracy: 10 }
    });
    expect(out.session.state).toBe('BACKGROUND');
    expect(out.session.profile.district).toBe('Pune');

    // 6. BACKGROUND -> FAMILY_OCCUPATION
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'secondary' } });
    expect(out.session.state).toBe('FAMILY_OCCUPATION');
    expect(out.session.profile.education_level).toBe('secondary');

    // 7. FAMILY_OCCUPATION -> CURRENT_LIVELIHOOD
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'agriculture' } });
    expect(out.session.state).toBe('CURRENT_LIVELIHOOD');

    // 8. CURRENT_LIVELIHOOD -> SKILLS_INPUT
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'farming' } });
    expect(out.session.state).toBe('SKILLS_INPUT');

    // 9. SKILLS_INPUT -> EXPERIENCE
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'electrical' } });
    expect(out.session.state).toBe('EXPERIENCE');
    expect(out.session.profile.skills_interests).toContain('electrical');

    // 10. EXPERIENCE -> CONSTRAINTS
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: '2' } });
    expect(out.session.state).toBe('CONSTRAINTS');
    expect(out.session.profile.experience_years).toBe(2);

    // 11. CONSTRAINTS -> TRAVEL_RADIUS
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'none' } });
    expect(out.session.state).toBe('TRAVEL_RADIUS');

    // 12. TRAVEL_RADIUS -> EMPLOYMENT_PREFERENCE
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: '15' } });
    expect(out.session.state).toBe('EMPLOYMENT_PREFERENCE');
    expect(out.session.profile.travel_radius_km).toBe(10); // closest valid

    // 13. EMPLOYMENT_PREFERENCE -> CONFIRM_SUMMARY
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'wage_employment' } });
    expect(out.session.state).toBe('CONFIRM_SUMMARY');
    expect(out.session.profile.employment_preference).toBe('wage_employment');

    // Before confirming, recommendation gate MUST still return false!
    expect(canGenerateRecommendations(out.session)).toBe(false);

    // 14. User confirms summary: CONFIRM_SUMMARY -> RECOMMENDATION
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'confirm' } });
    expect(out.session.state).toBe('RECOMMENDATION');
    expect(out.session.profile.summary_confirmed).toBe(true);
    expect(canGenerateRecommendations(out.session)).toBe(true);
    expect(out.session.recommendations?.length).toBe(3);

    // 15. RECOMMENDATION -> BENEFICIARY_CHOICE (User actively chooses trade)
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'select_1' } });
    expect(out.session.state).toBe('BENEFICIARY_CHOICE');

    // 18. BENEFICIARY_CHOICE -> LOCAL_OPPORTUNITY
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'continue' } });
    expect(out.session.state).toBe('LOCAL_OPPORTUNITY');

    // 19. LOCAL_OPPORTUNITY -> CENTER_AND_NEXT_STEPS
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'view_training' } });
    expect(out.session.state).toBe('CENTER_AND_NEXT_STEPS');

    // 20. CENTER_AND_NEXT_STEPS -> TRAINING_PATHWAY
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'continue_training' } });
    expect(out.session.state).toBe('TRAINING_PATHWAY');

    // 21. TRAINING_PATHWAY -> PLACEMENT_LINKAGE
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'simulate_complete' } });
    expect(out.session.state).toBe('PLACEMENT_LINKAGE');

    // 22. PLACEMENT_LINKAGE -> ASPIRATION_CARD
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'apply_placement' } });
    expect(out.session.state).toBe('ASPIRATION_CARD');

    // 23. ASPIRATION_CARD -> SESSION_FEEDBACK
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: 'feedback' } });
    expect(out.session.state).toBe('SESSION_FEEDBACK');

    // 24. SESSION_FEEDBACK -> END
    out = step(out.session, { type: 'CHIP_CLICK', payload: { value: '5' } });
    expect(out.session.state).toBe('END');
  });

  it('branches to DECLINED_END when consent is refused', () => {
    let session = createInitialSession('hi');
    session.state = 'CONSENT';

    const out = step(session, { type: 'CHIP_CLICK', payload: { value: 'no' } });
    expect(out.session.state).toBe('DECLINED_END');
  });

  it('purges data and transitions to DELETED_END on delete event', () => {
    let session = createInitialSession('hi');
    session.state = 'CURRENT_LIVELIHOOD';
    session.profile.family_occupation = 'Tailoring';

    const out = step(session, { type: 'DELETE_DATA' });
    expect(out.session.state).toBe('DELETED_END');
    expect(out.session.profile.family_occupation).toBeUndefined();
  });

  it('escalates to human immediately when crisis words or help requested', () => {
    let session = createInitialSession('hi');
    session.state = 'BACKGROUND';

    const out = step(session, { type: 'USER_INPUT', payload: 'Mujhe emergency madad chahiye' });
    expect(out.session.state).toBe('ESCALATE_TO_HUMAN');
    const escalateAction = out.actions.find(a => a.type === 'escalate');
    expect(escalateAction).toBeDefined();
  });

  it('switches language and preserves prior profile data', () => {
    let session = createInitialSession('hi');
    session.state = 'TRAVEL_RADIUS';
    session.profile.education_level = 'secondary';
    session.profile.district = 'Pune';

    const out = step(session, { type: 'SWITCH_LANG', payload: 'mr' });
    expect(out.session.lang).toBe('mr');
    expect(out.session.state).toBe('TRAVEL_RADIUS');
    expect(out.session.profile.education_level).toBe('secondary');
    expect(out.session.profile.district).toBe('Pune');
  });
});
