// Disha Sarathi - Single Authoritative Conversation Audio Controller (PS 26097)
// Guarantees strictly ONE audio output at any given time, barge-in cancellation, and zero double greetings.

import { LanguageCode } from '../../core/types';

export class ConversationAudioController {
  private static instance: ConversationAudioController;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAbortController: AbortController | null = null;
  private isCurrentlySpeaking = false;
  private currentResponseId: string | null = null;
  private sessionGreetingsPlayed: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): ConversationAudioController {
    if (!ConversationAudioController.instance) {
      ConversationAudioController.instance = new ConversationAudioController();
    }
    return ConversationAudioController.instance;
  }

  public get isPlaying(): boolean {
    return this.isCurrentlySpeaking;
  }

  public get activeResponseId(): string | null {
    return this.currentResponseId;
  }

  /**
   * Has greeting already played for this session?
   */
  public hasGreetingPlayed(sessionId: string): boolean {
    return this.sessionGreetingsPlayed.has(sessionId);
  }

  public markGreetingPlayed(sessionId: string): void {
    this.sessionGreetingsPlayed.add(sessionId);
  }

  public resetGreetingState(sessionId?: string): void {
    if (sessionId) {
      this.sessionGreetingsPlayed.delete(sessionId);
    } else {
      this.sessionGreetingsPlayed.clear();
    }
  }

  /**
   * Immediately stops and cancels all currently active or queued audio/speech output.
   * Cleans up both HTML Audio and Browser WebSpeech to ensure ZERO overlapping voices.
   */
  public cancel(): void {
    this.currentResponseId = null;
    this.isCurrentlySpeaking = false;

    // 1. Abort any in-flight TTS fetch request
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (e) {}
      this.currentAbortController = null;
    }

    // 2. Stop HTMLAudioElement
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch (e) {}
      this.currentAudio = null;
    }

    // 3. Cancel browser WebSpeech SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  public stop(): void {
    this.cancel();
  }

  /**
   * Plays a single voice response through Sarvam Neural TTS with resilient WebSpeech fallback.
   * Guarantees all prior responses are completely aborted before playing the new response.
   */
  public async play(
    text: string,
    lang: LanguageCode = 'mr',
    onEnd?: () => void,
    onStart?: () => void
  ): Promise<void> {
    const cleanText = (text || '').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // 1. Stop everything immediately
    this.cancel();

    const responseId = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.currentResponseId = responseId;
    this.isCurrentlySpeaking = true;

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    const SARVAM_LANG_MAP: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      od: 'od-IN',
      pa: 'pa-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      as: 'as-IN'
    };
    const targetLang = SARVAM_LANG_MAP[lang] || 'mr-IN';

    // 2. Try Sarvam TTS via backend proxy
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang: targetLang.slice(0, 2), sampleRate: 16000 }),
        signal: abortController.signal
      });

      if (this.currentResponseId !== responseId) return; // Barge-in interrupted while fetching

      if (res.ok) {
        const data = await res.json();
        const audioBase64 = data.base64Payload || '';

        if (audioBase64 && this.currentResponseId === responseId) {
          if (onStart) onStart();
          const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
          this.currentAudio = audio;

          audio.onended = () => {
            if (this.currentResponseId === responseId) {
              this.isCurrentlySpeaking = false;
              this.currentAudio = null;
              if (onEnd) onEnd();
            }
          };

          audio.onerror = () => {
            if (this.currentResponseId === responseId) {
              this.playWebSpeechFallback(cleanText, lang, responseId, onEnd, onStart);
            }
          };

          await audio.play().catch(() => {
            if (this.currentResponseId === responseId) {
              this.playWebSpeechFallback(cleanText, lang, responseId, onEnd, onStart);
            }
          });
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Intentional barge-in cancellation
    }

    if (this.currentResponseId === responseId) {
      this.playWebSpeechFallback(cleanText, lang, responseId, onEnd, onStart);
    }
  }

  private playWebSpeechFallback(
    text: string,
    lang: LanguageCode,
    responseId: string,
    onEnd?: () => void,
    onStart?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isCurrentlySpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langTags: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      od: 'or-IN',
      pa: 'pa-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      as: 'as-IN'
    };
    utterance.lang = langTags[lang] || 'mr-IN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2))
    );
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (this.currentResponseId === responseId && onStart) onStart();
    };

    utterance.onend = () => {
      if (this.currentResponseId === responseId) {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = () => {
      if (this.currentResponseId === responseId) {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const conversationAudioController = ConversationAudioController.getInstance();
