// Disha Sarathi - Sarvam Speech-to-Text Engine (MediaRecorder → Sarvam STT API)
import { LanguageCode } from '../../core/types';
import { SpeechRecognitionResultPayload } from './WebSpeechEngine';

const SARVAM_LANG_MAP: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  mr: 'mr-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN'
};

export class SarvamSTTEngine {
  readonly id = 'SarvamSTT';
  readonly name = 'Sarvam AI Indic STT';
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private isRecording = false;

  isAvailable(): boolean {
    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY;
    return Boolean(
      key && key.startsWith('sk_') &&
      typeof window !== 'undefined' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  }

  async startListening(
    lang: LanguageCode,
    onResult: (result: SpeechRecognitionResultPayload) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): Promise<void> {
    const key = (import.meta as any).env?.VITE_SARVAM_API_KEY;
    if (!key || !this.isAvailable()) {
      onError({ error: 'not-supported', message: 'Sarvam STT not available' });
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      onError({ error: 'not-allowed', message: 'Microphone permission denied' });
      return;
    }

    const chunks: Blob[] = [];
    const targetLang = SARVAM_LANG_MAP[lang] || 'mr-IN';
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    this.mediaRecorder.onstop = async () => {
      this.isRecording = false;
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }

      if (chunks.length === 0) {
        onEnd();
        return;
      }

      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'saarika:v2');
        formData.append('language_code', targetLang);

        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: { 'api-subscription-key': key },
          body: formData
        });

        if (!response.ok) throw new Error(`Sarvam STT API ${response.status}`);

        const data = await response.json();
        const transcript = (data.transcript || '').trim();

        if (transcript) {
          onResult({ transcript, confidence: 0.9, isFinal: true });
        }
      } catch (err) {
        console.warn('[SarvamSTT] API error:', err);
      } finally {
        onEnd();
      }
    };

    this.mediaRecorder.onerror = (e) => {
      console.warn('[SarvamSTT] MediaRecorder error:', e);
      this.stopListening();
      onError({ error: 'audio-capture', message: 'Recording failed' });
    };

    // Record for max 8 seconds then stop
    this.mediaRecorder.start();
    console.log('[SarvamSTT] Recording started, lang:', targetLang);

    setTimeout(() => {
      if (this.isRecording) {
        console.log('[SarvamSTT] Auto-stopping after 8s');
        this.stopListening();
      }
    }, 8000);
  }

  stopListening(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
      this.isRecording = false;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}
