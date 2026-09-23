import { describe, it, expect } from 'vitest';
import { matchNLUIntent, normalizeIndicText, parseSpokenNumeral, extractAllProfileSlots } from './nlu';


describe('Indic NLU, Normalizer & Numeral Parser', () => {
  it('normalizes Devanagari text by stripping diacritics and excess spaces', () => {
    const raw = '  सिलाई   मशीन  ';
    expect(normalizeIndicText(raw)).toBe('सिलाई मशीन');
  });

  it('parses spoken numerals across Indic digits and words', () => {
    expect(parseSpokenNumeral('१० किमी')).toBe(10);
    expect(parseSpokenNumeral('pachis km')).toBe(25);
    expect(parseSpokenNumeral('don km')).toBe(2);
    expect(parseSpokenNumeral('das kilometre')).toBe(10);
  });

  it('matches Marathi spoken livelihood slot values', () => {
    const res = matchNLUIntent('मी शेती करतो', 'current_livelihood', 'mr');
    expect(res.matchedSlotValue).toBe('agriculture');
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  it('matches Hindi spoken education level slot values', () => {
    const res = matchNLUIntent('मैंने दसवीं पास की है', 'education_level', 'hi');
    expect(res.matchedSlotValue).toBe('secondary');
    expect(res.confidence).toBeGreaterThan(0.7);
  });

  it('detects emergency crisis words and flags escalation', () => {
    const res = matchNLUIntent('Mujhe bachao emergency khatra', undefined, 'hi');
    expect(res.isDistressCrisis).toBe(true);
    expect(res.controlIntent).toBe('escalate');
  });

  it('extracts multiple profile slots simultaneously from natural conversational speech', () => {
    const speech = 'मी पुण्यात राहतो, माझं शिक्षण 10वी झालं आहे, मला इलेक्ट्रिकल काम आवडतं आणि मला नोकरी हवी आहे';
    const multi = extractAllProfileSlots(speech, 'mr');
    expect(multi.slotsCount).toBeGreaterThanOrEqual(3);
    expect(multi.slotsFound.district).toBe('Pune');
    expect(multi.slotsFound.education_level).toBe('secondary');
    expect(multi.slotsFound.skills_interests).toContain('electrical');
    expect(multi.slotsFound.employment_preference).toBe('wage_employment');
  });
});

