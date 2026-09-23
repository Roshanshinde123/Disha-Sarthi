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
    return true;
  }

  isAvailable(): boolean {
    return true;
  }

  async speak(text: string, lang: LanguageCode, onEnd?: () => void, onStart?: () => void): Promise<void> {
    this.stop();

    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY || this.apiKey;
    const targetLang = SARVAM_LANG_MAP[lang] || 'mr-IN';

    try {
      let audioBase64 = '';

      if (key && key.startsWith('sk_')) {
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

        if (response.ok) {
          const data = await response.json();
          audioBase64 = data.audios?.[0] || '';
        }
      }

      // If no direct key or direct call failed, use backend /api/tts proxy
      if (!audioBase64) {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang, sampleRate: 16000 })
          });
          if (res.ok) {
            const data = await res.json();
            audioBase64 = data.base64Payload || '';
          }
        } catch {
          try {
            const res = await fetch('http://localhost:8080/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, lang, sampleRate: 16000 })
            });
            if (res.ok) {
              const data = await res.json();
              audioBase64 = data.base64Payload || '';
            }
          } catch {}
        }
      }

      if (audioBase64) {
        if (onStart) onStart();
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        this.currentAudio = audio;
        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          this.currentAudio = null;
          this.speakFallbackWebSpeech(text, lang, onEnd, onStart);
        };
        await audio.play().catch(() => {
          this.speakFallbackWebSpeech(text, lang, onEnd, onStart);
        });
        return;
      }
    } catch (err: any) {
      console.warn('[TTS] Neural TTS failed, fallback to WebSpeech:', err);
    }

    this.speakFallbackWebSpeech(text, lang, onEnd, onStart);
  }

  private speakFallbackWebSpeech(text: string, lang: LanguageCode, onEnd?: () => void, onStart?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langTags: Record<LanguageCode, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN'
    };
    utterance.lang = langTags[lang] || 'mr-IN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    if (onStart) utterance.onstart = () => onStart();
    if (onEnd) utterance.onend = () => onEnd();
    utterance.onerror = () => { if (onEnd) onEnd(); };

    window.speechSynthesis.speak(utterance);
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

