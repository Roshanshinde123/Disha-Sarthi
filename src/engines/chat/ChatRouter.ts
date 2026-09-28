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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s hard timeout

      const response = await fetch('/api/opportunities/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          tradeName: trade.name_local[lang] || trade.name_en,
          tradeId: trade.id,
          rationale: templateRationale,
          language: lang
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.explanation) {
          this.activeEngineName = data.engine || 'Gemini Grounded Engine';
          return { rationale: data.explanation, engine: data.engine || 'Gemini-Grounded' };
        }
      }
    } catch (err) {
      // Graceful failover to Local Deterministic Engine
    }

    this.activeEngineName = 'Local Deterministic Engine';
    return { rationale: templateRationale, engine: 'LocalTemplate' };
  }
}

export const chatRouter = new ChatRouter();
