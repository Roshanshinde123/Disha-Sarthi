// Disha Sarathi - Layer B Sarvam Speech Engine Adapter
import { LanguageCode } from '../../core/types';

const SARVAM_LANG_MAP: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  mr: 'mr-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

export class SarvamSpeechEngine {
  readonly id = 'Sarvam';
  readonly name = 'Sarvam AI Indic Speech (Bulbul v3)';
  private apiKey: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_SARVAM_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('SARVAM_API_KEY') : null);
  }

  async checkHealth(): Promise<boolean> {
    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY || this.apiKey;
    if (key && key.startsWith('sk_')) return true;

    // Check if backend /api/tts is reachable
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('http://localhost:8080/api/voice/exotel/health', { method: 'GET' });
        return res.ok;
      }
    } catch {
      return false;
    }
    return false;
  }

  isAvailable(): boolean {
    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY || this.apiKey;
    return Boolean(key && key.startsWith('sk_'));
  }

  async speak(text: string, lang: LanguageCode, onEnd?: () => void, onStart?: () => void): Promise<void> {
    this.stop();

    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY || this.apiKey;
    const targetLang = SARVAM_LANG_MAP[lang] || 'mr-IN';

    try {
      let audioBase64 = '';

      if (key) {
        console.log(`[TTS] TTS_REQUEST_STARTED: provider=SARVAM lang=${targetLang}`);
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': key
          },
          body: JSON.stringify({
            inputs: [text],
            target_language_code: targetLang,
            speaker: 'kavya',
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 16000,
            enable_preprocessing: true,
            model: 'bulbul:v3'
          })
        });

        if (!response.ok) {
          throw new Error(`Sarvam TTS API returned status: ${response.status}`);
        }

        const data = await response.json();
        audioBase64 = data.audios?.[0] || '';
      } else {
        // Fetch from backend TTS proxy
        const res = await fetch('http://localhost:8080/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang, sampleRate: 16000 })
        });
        if (res.ok) {
          const data = await res.json();
          audioBase64 = data.base64Payload || '';
        }
      }

      if (audioBase64) {
        console.log(`[TTS] TTS_PLAYBACK_STARTED: lang=${lang} bytes=${audioBase64.length}`);
        if (onStart) onStart();
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        this.currentAudio = audio;
        audio.onended = () => {
          console.log(`[TTS] TTS_PLAYBACK_ENDED`);
          this.currentAudio = null;
          if (onEnd) onEnd();
        };
        audio.onerror = (e) => {
          console.warn('[TTS] Audio playback error:', e);
          this.currentAudio = null;
          if (onEnd) onEnd();
        };
        await audio.play().catch((err) => {
          console.warn('[TTS] Autoplay blocked or playback failed:', err);
          if (onEnd) onEnd();
        });
      } else {
        if (onEnd) onEnd();
      }
    } catch (err: any) {
      console.warn('[TTS] TTS_ERROR in SarvamSpeechEngine:', err?.message || err);
      if (onEnd) onEnd();
    }
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
  }
}

