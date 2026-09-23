// Disha Sarathi - Resilient Chat Router (PS 26097)
import { BeneficiaryProfile, LanguageCode, NSQFTrade } from '../../core/types';
import { LocalTemplateEngine } from './LocalTemplateEngine';

export class ChatRouter {
  private localEngine: LocalTemplateEngine;
  private activeEngineName = 'Local Deterministic Engine';

  constructor() {
    this.localEngine = new LocalTemplateEngine();
  }

  getActiveEngineName(): string {
    return this.activeEngineName;
  }

  async polishRationale(
    profile: BeneficiaryProfile,
    trade: NSQFTrade,
    lang: LanguageCode = 'hi'
  ): Promise<{ rationale: string; engine: string }> {
    const templateRationale = this.localEngine.generateRationale(profile, trade, lang);
    const geminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!geminiKey) {
      this.activeEngineName = 'Local Deterministic Engine';
      return { rationale: templateRationale, engine: 'LocalTemplate' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s hard timeout

      const spokenInterest = profile.skills_interests[0] || '';
      const spokenOcc = profile.current_livelihood || profile.family_occupation || '';

      const prompt = `Rewrite this vocational counselling sentence to sound slightly more natural in ${lang}, but YOU MUST KEEP the exact words "${spokenInterest}" and "${spokenOcc}". Do not add extra jargon. Output ONE sentence only:\n${templateRationale}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Validate that rewrite retained the user's spoken words
      if (text && (!spokenInterest || text.toLowerCase().includes(spokenInterest.toLowerCase()))) {
        this.activeEngineName = 'Gemini 2.5 Flash';
        return { rationale: text, engine: 'Gemini-2.5-Flash' };
      }
    } catch (err) {
      console.warn('Layer B Chat Router silent failover to LocalTemplate:', err);
    }

    this.activeEngineName = 'Local Deterministic Engine';
    return { rationale: templateRationale, engine: 'LocalTemplate' };
  }
}

export const chatRouter = new ChatRouter();
