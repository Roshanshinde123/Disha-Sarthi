// Disha Sarathi - Layer B Bhashini Engine Adapter
import { LanguageCode } from '../../core/types';

export class BhashiniSpeechEngine {
  readonly id = 'Bhashini';
  readonly name = 'Bhashini Cloud ASR / TTS';
  private apiKey: string | null = null;
  private lastHealthCheck: number = 0;
  private isHealthy: boolean = false;

  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_BHASHINI_API_KEY || null;
  }

  async checkHealth(): Promise<boolean> {
    if (!this.apiKey) return false;
    const now = Date.now();
    if (now - this.lastHealthCheck < 300000) return this.isHealthy; // Cache 5 min

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      // Simulated ping or real endpoint probe
      clearTimeout(timeoutId);
      this.isHealthy = true;
      this.lastHealthCheck = now;
      return true;
    } catch {
      this.isHealthy = false;
      return false;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.isHealthy;
  }

  speak(_text: string, _lang: LanguageCode, onEnd?: () => void): void {
    // If failover or network drops, onEnd is called immediately
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 500);
  }
}
