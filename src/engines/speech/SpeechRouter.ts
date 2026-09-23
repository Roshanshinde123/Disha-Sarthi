// Disha Sarathi - Speech Router with Multi-Tier Resilient Fallback (PS 26097)
import { LanguageCode } from '../../core/types';
import { WebSpeechEngine, SpeechRecognitionResultPayload } from './WebSpeechEngine';
import { SilentEngine } from './SilentEngine';
import { BhashiniSpeechEngine } from './BhashiniSpeechEngine';
import { SarvamSpeechEngine } from './SarvamSpeechEngine';
import { SarvamSTTEngine } from './SarvamSTTEngine';
import { WebSpeechTTSProvider, TTSProvider } from './TTSProvider';

export type SpeechEngineType = 'Bhashini' | 'Sarvam' | 'WebSpeech' | 'SarvamSTT' | 'SilentEngine';

export class SpeechRouter {
  private webSpeech: WebSpeechEngine;
  private silentEngine: SilentEngine;
  private bhashini: BhashiniSpeechEngine;
  private sarvam: SarvamSpeechEngine;
  private sarvamSTT: SarvamSTTEngine;
  private ttsProvider: TTSProvider;

  private activeEngineId: SpeechEngineType = 'WebSpeech';
  private forceSilentMode = false;

  constructor() {
    this.webSpeech = new WebSpeechEngine();
    this.silentEngine = new SilentEngine();
    this.bhashini = new BhashiniSpeechEngine();
    this.sarvam = new SarvamSpeechEngine();
    this.sarvamSTT = new SarvamSTTEngine();
    this.ttsProvider = new WebSpeechTTSProvider();

    if (!this.webSpeech.isAvailable()) {
      this.activeEngineId = 'SilentEngine';
    }
  }

  getActiveEngineName(): string {
    if (this.forceSilentMode) return this.silentEngine.name;
    switch (this.activeEngineId) {
      case 'Bhashini':
        return this.bhashini.name;
      case 'Sarvam':
        return this.sarvam.name;
      case 'SarvamSTT':
        return this.sarvamSTT.name;
      case 'WebSpeech':
        return this.webSpeech.name;
      default:
        return this.silentEngine.name;
    }
  }

  getActiveEngineId(): SpeechEngineType {
    return this.forceSilentMode ? 'SilentEngine' : this.activeEngineId;
  }

  getActiveTTSProviderName(): string {
    return this.ttsProvider.name;
  }

  setForceSilentMode(val: boolean): void {
    this.forceSilentMode = val;
  }

  async selectBestEngine(): Promise<SpeechEngineType> {
    if (this.forceSilentMode) {
      this.activeEngineId = 'SilentEngine';
      return 'SilentEngine';
    }

    // 1. Probe Bhashini (Layer B)
    if (await this.bhashini.checkHealth()) {
      this.activeEngineId = 'Bhashini';
      return 'Bhashini';
    }

    // 2. Layer A Web Speech (preferred — zero latency, on-device)
    if (this.webSpeech.isAvailable()) {
      this.activeEngineId = 'WebSpeech';
      return 'WebSpeech';
    }

    // 3. Sarvam STT (cloud fallback for non-Chrome browsers)
    if (this.sarvamSTT.isAvailable()) {
      this.activeEngineId = 'SarvamSTT';
      return 'SarvamSTT';
    }

    // 4. Silent Fallback
    this.activeEngineId = 'SilentEngine';
    return 'SilentEngine';
  }

  startListening(
    lang: LanguageCode,
    onResult: (result: SpeechRecognitionResultPayload) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): void {
    if (this.forceSilentMode) {
      this.activeEngineId = 'SilentEngine';
      this.silentEngine.startListening(lang, onResult, onError, onEnd);
      return;
    }

    // Prefer Web Speech API (low latency, real-time transcription)
    if (this.webSpeech.isAvailable()) {
      this.activeEngineId = 'WebSpeech';
      this.webSpeech.startListening(
        lang,
        onResult,
        (err) => {
          const errCode = err?.error || err;
          console.warn('[SpeechRouter] WebSpeech error:', errCode);

          // On terminal errors, try Sarvam STT if available
          if (
            errCode !== 'aborted' &&
            errCode !== 'no-speech' &&
            this.sarvamSTT.isAvailable()
          ) {
            console.log('[SpeechRouter] Falling back to SarvamSTT');
            this.activeEngineId = 'SarvamSTT';
            this.sarvamSTT.startListening(lang, onResult, onError, onEnd);
          } else {
            onError(err);
          }
        },
        onEnd
      );
      return;
    }

    // Fallback: Sarvam STT via MediaRecorder
    if (this.sarvamSTT.isAvailable()) {
      this.activeEngineId = 'SarvamSTT';
      this.sarvamSTT.startListening(lang, onResult, onError, onEnd);
      return;
    }

    // Final fallback: silent (text-only mode)
    this.activeEngineId = 'SilentEngine';
    this.silentEngine.startListening(lang, onResult, onError, onEnd);
  }

  stopListening(): void {
    this.webSpeech.stopListening();
    this.sarvamSTT.stopListening();
    this.silentEngine.stopListening();
  }

  speak(text: string, lang: LanguageCode, onEnd?: () => void, onStart?: () => void): void {
    if (this.forceSilentMode) {
      this.silentEngine.speak(text, lang, onEnd);
      return;
    }

    if (this.sarvam.isAvailable()) {
      this.sarvam.speak(text, lang, onEnd, onStart);
      return;
    }

    this.ttsProvider.speak(text, lang, onEnd, onStart);
  }

  stopSpeaking(): void {
    this.sarvam.stop();
    this.ttsProvider.stop();
    this.silentEngine.stopSpeaking();
  }
}

export const speechRouter = new SpeechRouter();
