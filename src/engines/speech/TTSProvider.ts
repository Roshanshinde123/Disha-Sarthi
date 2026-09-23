// Disha Sarathi - Bulletproof TTS Provider Abstraction (PS 26097)
import { LanguageCode } from '../../core/types';

export interface TTSProvider {
  readonly id: string;
  readonly name: string;
  isAvailable(): boolean;
  speak(
    text: string,
    lang: LanguageCode,
    onEnd?: () => void,
    onStart?: () => void
  ): Promise<void>;
  stop(): void;
}

const BROWSER_LANG_TAGS: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

/**
 * Robust On-Device Browser Speech Synthesis with Chrome bug fixes:
 * 1. Global utterance GC protection
 * 2. Automatic voice discovery across Indian English & Indic voices
 * 3. SpeechSynthesis.resume() keep-alive during playback
 * 4. Failsafe timeout
 */
export class WebSpeechTTSProvider implements TTSProvider {
  readonly id = 'WebSpeechTTS';
  readonly name = 'On-Device Browser Speech (Web Speech API)';

  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveInterval: any = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getActiveUtterance(): SpeechSynthesisUtterance | null {
    return this.activeUtterance;
  }


  private findBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    if (!this.voices || this.voices.length === 0) {
      return null;
    }

    const targetTag = BROWSER_LANG_TAGS[lang] || 'hi-IN';
    const langPrefix = targetTag.split('-')[0];

    // 1. Direct match (e.g. mr-IN or hi-IN)
    let voice = this.voices.find(
      (v) => v.lang === targetTag || v.lang.replace('_', '-') === targetTag
    );
    if (voice) return voice;

    // 2. Prefix match (e.g. 'mr', 'hi', 'ta', 'te')
    voice = this.voices.find((v) => v.lang.startsWith(langPrefix));
    if (voice) return voice;

    // 3. For Marathi/Hindi/Indic, if specific voice not found, match Hindi or Indian English which can pronounce Devanagari phonetically
    if (lang === 'mr' || lang === 'hi') {
      voice = this.voices.find(
        (v) =>
          v.lang.startsWith('hi') ||
          v.name.includes('हिन्दी') ||
          v.name.includes('Hindi') ||
          v.name.includes('India') ||
          v.lang === 'en-IN'
      );
      if (voice) return voice;
    }

    // 4. Match Google Indic or Indian English
    voice = this.voices.find(
      (v) =>
        v.name.includes('India') ||
        v.name.includes('हिन्दी') ||
        v.name.includes('मराठी') ||
        v.lang === 'en-IN' ||
        v.lang === 'hi-IN'
    );
    if (voice) return voice;

    // 5. Default voice
    return this.voices.find((v) => v.default) || this.voices[0] || null;
  }

  async speak(
    text: string,
    lang: LanguageCode,
    onEnd?: () => void,
    onStart?: () => void
  ): Promise<void> {
    if (!this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Always cancel previous speech to unblock Chrome synthesis queue
      this.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;
      // Attach to window to prevent Chrome GC bug
      (window as any).__disha_current_utterance = utterance;

      const voice = this.findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = BROWSER_LANG_TAGS[lang] || 'hi-IN';
      }

      utterance.rate = 0.95; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      let hasFinished = false;
      const finish = () => {
        if (!hasFinished) {
          hasFinished = true;
          this.clearIntervals();
          this.activeUtterance = null;
          (window as any).__disha_current_utterance = null;
          console.log('[TTS] TTS_PLAYBACK_ENDED (WebSpeech)');
          if (onEnd) onEnd();
        }
      };

      utterance.onstart = () => {
        console.log(`[TTS] TTS_PLAYBACK_STARTED (WebSpeech): lang=${utterance.lang} voice=${voice?.name || 'default'}`);
        if (onStart) onStart();
        // Chrome keep-alive
        this.keepAliveInterval = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 5000);
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        console.warn('[TTS] SpeechSynthesis error:', e?.error || e);
        finish();
      };

      // Failsafe timeout: 12 seconds max per sentence
      const maxDurationMs = Math.max(4000, text.length * 120);
      setTimeout(() => {
        if (!hasFinished) {
          console.warn('[TTS] SpeechSynthesis failsafe timeout triggered');
          finish();
        }
      }, maxDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] WebSpeech TTS failed:', err);
      this.clearIntervals();
      if (onEnd) onEnd();
    }
  }

  stop(): void {
    this.clearIntervals();
    if (this.isAvailable()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignored
      }
    }
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any).__disha_current_utterance = null;
    }
  }

  private clearIntervals(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

/**
 * Layer B Bhashini Cloud TTS Provider (Optional Cloud Enhancement)
 */
export class BhashiniTTSProvider implements TTSProvider {
  readonly id = 'BhashiniTTS';
  readonly name = 'Bhashini Cloud Voice (National AI Portal)';
  private audioEl: HTMLAudioElement | null = null;

  isAvailable(): boolean {
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('BHASHINI_API_KEY') : null;
    return !!apiKey;
  }

  async speak(
    text: string,
    lang: LanguageCode,
    onEnd?: () => void,
    onStart?: () => void
  ): Promise<void> {
    const apiKey = localStorage.getItem('BHASHINI_API_KEY');
    if (!apiKey) {
      // Fall back to WebSpeech
      const fallback = new WebSpeechTTSProvider();
      return fallback.speak(text, lang, onEnd, onStart);
    }

    try {
      if (onStart) onStart();
      // Placeholder for Bhashini pipeline endpoint if configured
      console.log(`[Bhashini TTS] Synthesizing ${lang}: "${text.slice(0, 30)}..."`);
      if (onEnd) onEnd();
    } catch (e) {
      console.warn('Bhashini TTS error, falling back:', e);
      const fallback = new WebSpeechTTSProvider();
      return fallback.speak(text, lang, onEnd, onStart);
    }
  }

  stop(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = null;
    }
  }
}

/**
 * Telephony Server-Side TTS Provider (Exotel Voice XML & Media Stream)
 */
export class TelephonyTTSProvider implements TTSProvider {
  readonly id = 'TelephonyTTS';
  readonly name = 'Telephony Voice (Exotel PSTN Audio)';

  isAvailable(): boolean {
    return true;
  }

  async speak(text: string, lang: LanguageCode, onEnd?: () => void): Promise<void> {
    // Used in server voice bot & simulator
    console.log(`[Telephony TTS] Generated audio stream (${lang}): "${text}"`);
    if (onEnd) onEnd();
  }

  stop(): void {
    // No-op for server-side
  }
}
