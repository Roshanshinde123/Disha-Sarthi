// Disha Sarathi - WebSpeechEngine (Layer A Browser Native STT & TTS)
import { LanguageCode } from '../../core/types';

export interface SpeechRecognitionResultPayload {
  transcript: string;
  confidence: number;
  isFinal: boolean;
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

export class WebSpeechEngine {
  readonly id = 'WebSpeech';
  readonly name = 'On-Device Web Speech';
  private recognitionInstance: any = null;
  private isListening = false;

  constructor() {
    // Initial check
  }

  isAvailable(): boolean {
    const avail = !!(
      (typeof window !== 'undefined') &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
    console.log('[VOICE] SpeechRecognition available:', avail);
    return avail;
  }

  startListening(
    lang: LanguageCode,
    onResult: (result: SpeechRecognitionResultPayload) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): void {
    console.log('[VOICE] Button clicked / listening requested');
    if (!this.isAvailable()) {
      console.warn('[VOICE] SpeechRecognition API not supported in this browser.');
      onError({
        error: 'not-supported',
        message: 'Voice input is not supported in this browser.'
      });
      return;
    }

    // Stop previous instance if active
    this.stopListening();

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = BROWSER_LANG_TAGS[lang] || 'mr-IN';
      console.log('[VOICE] recognition.lang =', rec.lang);

      rec.onstart = () => {
        console.log('[VOICE] onstart (lang:', rec.lang, ')');
        this.isListening = true;
      };

      rec.onspeechend = () => {
        console.log('[VOICE] onspeechend');
      };

      rec.onnomatch = () => {
        console.log('[VOICE] onnomatch');
      };

      rec.onresult = (event: any) => {
        console.log('[VOICE] onresult triggered');
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
            confidence = res[0].confidence || 0.9;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        if (interimTranscript) {
          console.log('[VOICE] interim transcript =', interimTranscript);
        }

        const transcript = (finalTranscript || interimTranscript).trim();
        if (transcript) {
          if (finalTranscript) {
            console.log('[VOICE] final transcript =', finalTranscript);
          }
          onResult({
            transcript,
            confidence,
            isFinal: Boolean(finalTranscript)
          });
        }
      };

      rec.onerror = (event: any) => {
        console.warn('[VOICE] onerror =', event.error, event);
        this.isListening = false;
        let mappedMsg = 'Voice input failed. Please try again.';
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            mappedMsg = 'Microphone permission denied.';
            break;
          case 'no-speech':
            mappedMsg = 'I couldn\'t hear anything. Please try again.';
            break;
          case 'audio-capture':
            mappedMsg = 'Microphone could not be accessed.';
            break;
          case 'network':
            mappedMsg = 'Speech recognition service is unavailable.';
            break;
          case 'aborted':
            mappedMsg = 'Voice input stopped.';
            break;
        }
        onError({ error: event.error, message: mappedMsg });
      };

      rec.onend = () => {
        console.log('[VOICE] onend');
        this.isListening = false;
        this.recognitionInstance = null;
        onEnd();
      };

      this.recognitionInstance = rec;
      console.log('[VOICE] recognition.start()');
      rec.start();
    } catch (e) {
      console.error('[VOICE] Exception starting speech recognition:', e);
      this.isListening = false;
      this.recognitionInstance = null;
      onError({ error: 'unknown', message: 'Voice input failed. Please try again.' });
    }
  }

  stopListening(): void {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {
        // Ignored
      }
      this.isListening = false;
      this.recognitionInstance = null;
    }
  }

  speak(text: string, lang: LanguageCode, onEnd?: () => void, onStart?: () => void): void {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = BROWSER_LANG_TAGS[lang] || 'mr-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('[VOICE] TTS error:', err);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[VOICE] TTS exception:', e);
      if (onEnd) onEnd();
    }
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
