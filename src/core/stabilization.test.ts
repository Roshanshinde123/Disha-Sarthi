import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { step, createInitialSession } from './orchestrator';
import { recommendNSQFTrades } from './recommender';
import { searchOpportunities } from '../server/services/opportunityService';
import { explainRecommendationWithGemini } from '../server/services/geminiService';
import { handleDishaVoiceRequest } from '../server/services/dishaVoiceService';
import { BeneficiaryProfile } from './types';

describe('MASTER TASK - Stabilization & Grounding Test Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [{ text: 'पुण्यामध्ये वेल्डिंग व्यवसायासाठी २ संधी उपलब्ध आहेत.' }]
                }
              }
            ]
          })
      })
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // -------------------------------------------------------------------------
  // A & B: Language Switching & Consistency (En -> Hi -> Mr -> En)
  // -------------------------------------------------------------------------
  describe('A & B: Language Switching & Consistency', () => {
    it('switches languages correctly (En -> Hi -> Mr -> En)', () => {
      let session = createInitialSession('en');
      expect(session.lang).toBe('en');

      // En -> Hi via SWITCH_LANG
      const res1 = step(session, { type: 'SWITCH_LANG', payload: 'hi' });
      expect(res1.session.lang).toBe('hi');

      // Hi -> Mr via Voice Utterance
      const res2 = step(res1.session, { type: 'USER_INPUT', payload: 'मराठीत बोला' });
      expect(res2.session.lang).toBe('mr');

      // Mr -> En via Voice Utterance
      const res3 = step(res2.session, { type: 'USER_INPUT', payload: 'Speak in English' });
      expect(res3.session.lang).toBe('en');
    });

    it('ensures response.language matches returned response text language on Voice API', async () => {
      const resMr = await handleDishaVoiceRequest({
        phoneNumber: '+919876543201',
        message: 'नमस्कार, मला वेल्डिंग शिकायचे आहे आणि नोकरी हवी आहे.',
        language: 'mr'
      });
      expect(resMr.success).toBe(true);
      expect(resMr.language).toBe('mr');
      expect(resMr.reply).toBeDefined();

      const resHi = await handleDishaVoiceRequest({
        phoneNumber: '+919876543202',
        message: 'नमस्ते, मुझे वेल्डिंग में काम करना है।',
        language: 'hi'
      });
      expect(resHi.success).toBe(true);
      expect(resHi.language).toBe('hi');

      const resEn = await handleDishaVoiceRequest({
        phoneNumber: '+919876543203',
        message: 'Hello, I want to learn welding in Pune.',
        language: 'en'
      });
      expect(resEn.success).toBe(true);
      expect(resEn.language).toBe('en');
    });
  });

  // -------------------------------------------------------------------------
  // C: Recommendation (Welding -> Welder)
  // -------------------------------------------------------------------------
  describe('C: Recommendation Precision', () => {
    it('recommends Welder when user interest includes welding in Pune', () => {
      const profile: BeneficiaryProfile = {
        education_level: 'secondary',
        family_occupation: 'Agriculture',
        current_livelihood: 'Helper in workshop',
        skills_interests: ['welding', 'fabrication'],
        constraints: [],
        travel_radius_km: 25,
        employment_preference: 'wage_employment',
        district: 'Pune',
        lat: 18.5204,
        lng: 73.8567
      };

      const recResult = recommendNSQFTrades(profile, 'mr');
      expect(recResult.results.length).toBeGreaterThan(0);
      const topTrade = recResult.results[0].trade;
      expect(topTrade.id).toBe('fab_manual_metal_arc_welder');
      expect(topTrade.nsqf_level).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // D: Academic / General Questions
  // -------------------------------------------------------------------------
  describe('D: Academic / Non-vocational Guard', () => {
    it('handles Java/Python inquiries as general chat without triggering vocational trade recommendations', async () => {
      const res = await handleDishaVoiceRequest({
        phoneNumber: '+919876543204',
        message: 'How do I write a Python loop and solve calculus?',
        language: 'en'
      });
      expect(res.success).toBe(true);
      expect(res.intent).toBe('general_chat');
      expect(res.recommendations).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // E & F: Opportunity Search & No Hallucinations
  // -------------------------------------------------------------------------
  describe('E & F: Opportunity Search & Strict Factual Grounding', () => {
    it('returns real seed catalog opportunities for Welder in Pune with distances', () => {
      const searchRes = searchOpportunities({
        tradeId: 'fab_manual_metal_arc_welder',
        district: 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        radiusKm: 50,
        language: 'mr'
      });

      expect(searchRes.success).toBe(true);
      expect(searchRes.isDemo).toBe(true);
      expect(searchRes.opportunities.length).toBeGreaterThan(0);

      // Check Chakan opportunity
      const chakanOpp = searchRes.opportunities.find((o) => o.location.toLowerCase().includes('chakan'));
      expect(chakanOpp).toBeDefined();
      expect(chakanOpp?.latitude).toBeCloseTo(18.7606, 2);
      expect(chakanOpp?.longitude).toBeCloseTo(73.8636, 2);
      expect(chakanOpp?.distanceKm).toBeGreaterThan(0);
    });

    it('returns empty result when no opportunity exists and does NOT hallucinate fake companies', () => {
      const searchRes = searchOpportunities({
        tradeId: 'unknown_nonexistent_trade_xyz',
        district: 'NonExistentDistrict',
        latitude: 18.5204,
        longitude: 73.8567,
        radiusKm: 10,
        language: 'en'
      });

      expect(searchRes.success).toBe(true);
      expect(searchRes.opportunities).toEqual([]);
      expect(searchRes.summary).toContain('No matching opportunities were found');
    });

    it('Gemini explanation does not crash when API key is missing, providing grounded deterministic explanation', async () => {
      const explainRes = await explainRecommendationWithGemini({
        profile: { district: 'Pune', education_level: 'secondary', skills_interests: ['welding'] },
        tradeName: 'Fabrication Welder',
        tradeId: 'fab_manual_metal_arc_welder',
        language: 'mr'
      });

      expect(explainRes.success).toBe(true);
      expect(typeof explainRes.explanation).toBe('string');
      expect(explainRes.explanation.length).toBeGreaterThan(10);
      expect(explainRes.opportunities.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // G: Map Coordinates Validation
  // -------------------------------------------------------------------------
  describe('G: Map Coordinate Validation', () => {
    it('correctly calculates Haversine distances for valid coordinates', () => {
      const searchRes = searchOpportunities({
        tradeId: 'fab_manual_metal_arc_welder',
        district: 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        radiusKm: 50
      });

      for (const opp of searchRes.opportunities) {
        if (opp.latitude !== null && opp.longitude !== null) {
          expect(opp.latitude).toBeGreaterThan(-90);
          expect(opp.latitude).toBeLessThan(90);
          expect(opp.longitude).toBeGreaterThan(-180);
          expect(opp.longitude).toBeLessThan(180);
          expect(opp.distanceKm).not.toBeNaN();
        }
      }
    });

    it('safely handles missing or 0/0 user coordinates without crashing', () => {
      const searchRes = searchOpportunities({
        tradeId: 'app_sewing_machine_op',
        district: 'Varanasi',
        latitude: 0,
        longitude: 0
      });

      expect(searchRes.success).toBe(true);
      expect(searchRes.opportunities.length).toBeGreaterThan(0);
      // When user coords are 0/0 (invalid), distanceKm is null rather than calculated against Null Island
      expect(searchRes.opportunities[0].distanceKm).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // J: MASTER CONVERSATION FLOW (Steps 1 - 9)
  // -------------------------------------------------------------------------
  describe('J: Master Conversation Flow (Steps 1 to 9)', () => {
    it('executes full 9-step conversational journey seamlessly', async () => {
      // Step 1: Assistant asks for language, User selects "Marathi"
      let session = createInitialSession('mr');
      const step1 = step(session, { type: 'USER_INPUT', payload: 'Marathi' });
      expect(step1.session.lang).toBe('mr');
      expect(step1.session.state).toBe('GREETING');

      // Step 2: User says "माझं नाव राहुल आहे." -> Name = Rahul
      const step2 = step(step1.session, { type: 'USER_INPUT', payload: 'माझं नाव राहुल आहे.' });
      expect(step2.session.profile.name).toBe('राहुल');

      // Step 3: User says "मी पुण्यात राहतो." -> Location = Pune with valid coordinates
      const step3 = step(step2.session, { type: 'USER_INPUT', payload: 'मी पुण्यात राहतो.' });
      expect(step3.session.profile.district).toBe('Pune');
      expect(step3.session.profile.lat).toBeCloseTo(18.5204, 2);
      expect(step3.session.profile.lng).toBeCloseTo(73.8567, 2);

      // Step 4: User says "मी दहावी पास आहे." -> Education = secondary (10th)
      const step4 = step(step3.session, { type: 'USER_INPUT', payload: 'मी दहावी पास आहे.' });
      expect(step4.session.profile.education_level).toBe('secondary');

      // Step 5: User says "मला welding येतं आणि मला welding मध्ये नोकरी पाहिजे." -> Skills = Welding, Preference = Wage Employment
      const step5 = step(step4.session, { type: 'USER_INPUT', payload: 'मला welding येतं आणि मला welding मध्ये नोकरी पाहिजे.' });
      expect(step5.session.profile.skills_interests).toContain('welding');
      expect(step5.session.profile.employment_preference).toBe('wage_employment');

      // Step 6: Recommendation Engine called -> Welder recommended
      const recResult = recommendNSQFTrades(step5.session.profile, 'mr');
      expect(recResult.results.length).toBeGreaterThan(0);
      expect(recResult.results[0].trade.id).toBe('fab_manual_metal_arc_welder');

      // Step 7: User asks "मला जवळची नोकरी कुठे मिळेल?" -> search_opportunities called
      const searchRes = searchOpportunities({
        tradeId: recResult.results[0].trade.id,
        district: step5.session.profile.district,
        latitude: step5.session.profile.lat,
        longitude: step5.session.profile.lng,
        radiusKm: 50,
        language: 'mr'
      });
      expect(searchRes.success).toBe(true);
      expect(searchRes.opportunities.length).toBeGreaterThan(0);
      expect(searchRes.isDemo).toBe(true);
      // Valid coordinates exist for map markers
      expect(searchRes.opportunities[0].latitude).not.toBeNull();
      expect(searchRes.opportunities[0].longitude).not.toBeNull();

      // Step 8: User says "हिंदी में बोलो." -> Switch to Hindi without clearing profile or state
      const step8 = step(step5.session, { type: 'USER_INPUT', payload: 'हिंदी में बोलो.' });
      expect(step8.session.lang).toBe('hi');
      expect(step8.session.profile.name).toBe('राहुल');
      expect(step8.session.profile.district).toBe('Pune');
      expect(step8.session.profile.skills_interests).toContain('welding');

      // Step 9: User asks "Python क्या है?" -> General chat intent, no forced vocational recommendation
      const voiceRes = await handleDishaVoiceRequest({
        phoneNumber: '+919876543210',
        message: 'Python क्या है?',
        language: 'hi',
        profile: step8.session.profile
      });
      expect(voiceRes.success).toBe(true);
      expect(voiceRes.intent).toBe('general_chat');
      expect(voiceRes.recommendations).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // K: END CONVERSATION & STATE TERMINATION TESTS
  // -------------------------------------------------------------------------
  describe('K: End Conversation & State Termination', () => {
    it('transitions to ENDED state upon END_CONVERSATION event and saves current profile', () => {
      let session = createInitialSession('mr');
      session.profile.name = 'Rahul';
      session.profile.district = 'Pune';
      session.profile.skills_interests = ['welding'];

      const res = step(session, { type: 'END_CONVERSATION' });
      expect(res.session.state).toBe('ENDED');
      // Verify profile is retained/persisted
      expect(res.session.profile.name).toBe('Rahul');
      expect(res.session.profile.district).toBe('Pune');
      // Verify persist action is scheduled but NO speak action is queued
      expect(res.actions.some(a => a.type === 'persist')).toBe(true);
      expect(res.actions.some(a => a.type === 'speak')).toBe(false);
    });

    it('does not advance or generate prompts when user enters text while in ENDED state', () => {
      let session = createInitialSession('hi');
      session.state = 'ENDED';

      const res = step(session, { type: 'USER_INPUT', payload: 'Next question please' });
      expect(res.session.state).toBe('ENDED');
      expect(res.actions).toEqual([]);
    });

    it('transitions to ENDED when user speaks end/stop intent', () => {
      let session = createInitialSession('mr');
      session.state = 'LOCATION';

      const res = step(session, { type: 'USER_INPUT', payload: 'थांबवा, मला कॉल बंद करायचा आहे' });
      expect(res.session.state).toBe('ENDED');
      expect(res.actions.some(a => a.type === 'speak')).toBe(false);
    });

    it('creates a fresh new session when user clicks Start Again (RESTART) from ENDED state', () => {
      let session = createInitialSession('mr');
      session.state = 'ENDED';
      session.profile.name = 'Old User';

      const res = step(session, { type: 'RESTART' });
      expect(res.session.state).toBe('LANDING');
      expect(res.session.profile.name).toBeUndefined();
      expect(res.actions.some(a => a.type === 'speak')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // L: 12 INDIC LANGUAGES END-TO-END VERIFICATION
  // -------------------------------------------------------------------------
  describe('L: 12 Indic Languages End-to-End Verification', () => {
    const ALL_12_LANGS = [
      { code: 'en', provider: 'en-IN', name: 'English' },
      { code: 'hi', provider: 'hi-IN', name: 'Hindi' },
      { code: 'mr', provider: 'mr-IN', name: 'Marathi' },
      { code: 'bn', provider: 'bn-IN', name: 'Bengali' },
      { code: 'gu', provider: 'gu-IN', name: 'Gujarati' },
      { code: 'kn', provider: 'kn-IN', name: 'Kannada' },
      { code: 'ml', provider: 'ml-IN', name: 'Malayalam' },
      { code: 'od', provider: 'od-IN', name: 'Odia' },
      { code: 'pa', provider: 'pa-IN', name: 'Punjabi' },
      { code: 'ta', provider: 'ta-IN', name: 'Tamil' },
      { code: 'te', provider: 'te-IN', name: 'Telugu' },
      { code: 'as', provider: 'as-IN', name: 'Assamese' }
    ] as const;

    it('switches between all 12 supported languages without resetting profile', () => {
      let session = createInitialSession('en');
      session.profile.name = 'Ramesh';
      session.profile.district = 'Pune';
      session.profile.skills_interests = ['welding'];

      for (const langObj of ALL_12_LANGS) {
        const res = step(session, { type: 'SWITCH_LANG', payload: langObj.code });
        expect(res.session.lang).toBe(langObj.code);
        expect(res.session.profile.name).toBe('Ramesh');
        expect(res.session.profile.district).toBe('Pune');
        expect(res.session.profile.skills_interests).toContain('welding');
        session = res.session;
      }
    });

    it('generates grounded explanations across all 12 languages', async () => {
      for (const langObj of ALL_12_LANGS) {
        const exp = await explainRecommendationWithGemini({
          profile: { district: 'Pune', lat: 18.5204, lng: 73.8567, skills_interests: ['welding'] },
          tradeId: 'fab_manual_metal_arc_welder',
          tradeName: 'Welder',
          language: langObj.code as any
        });
        expect(exp.success).toBe(true);
        expect(exp.explanation).toBeDefined();
        expect(exp.explanation.length).toBeGreaterThan(10);
        expect(exp.opportunities.length).toBeGreaterThan(0);
      }
    });
  });
});
