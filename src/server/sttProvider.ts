// Disha Sarathi - Speech-to-Text (STT) Provider Abstraction (PS 26097)
import { LanguageCode } from '../core/types';

export interface STTResult {
  text: string;
  confidence: number;
  language: string;
  isFinal: boolean;
  latencyMs?: number;
}

export interface SpeechToTextProvider {
  transcribe(
    audioData: Buffer | Uint8Array | string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: string }
  ): Promise<STTResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}

/**
 * 1. Mock / Local Development STT Provider
 * Fallback for testing, offline evaluation, and development without external API keys.
 */
export class MockSTTProvider implements SpeechToTextProvider {
  async transcribe(
    audioData: Buffer | Uint8Array | string,
    language: LanguageCode,
    _options?: { sampleRate?: number; encoding?: string }
  ): Promise<STTResult> {
    const startTime = Date.now();
    // If input is text or recognizable metadata, return it
    let extractedText = '';
    if (typeof audioData === 'string' && !audioData.startsWith('UklGR') && audioData.length < 500) {
      extractedText = audioData;
    } else {
      // Default fallback conversational reply depending on language
      extractedText =
        language === 'mr'
          ? 'मी पुण्यात राहतो, १०वी शिकलो आहे आणि मला इलेक्ट्रिकल काम आवडतं.'
          : language === 'hi'
          ? 'मैं पुणे में रहता हूँ, 10वीं पास हूँ और मुझे इलेक्ट्रिकल काम पसंद है।'
          : 'I live in Pune, passed 10th and like electrical work.';
    }

    return {
      text: extractedText,
      confidence: 0.94,
      language,
      isFinal: true,
      latencyMs: Date.now() - startTime
    };
  }

  getProviderName(): string {
    return 'MockLocalSTT';
  }

  isConfigured(): boolean {
    return true;
  }
}

/**
 * 2. Bhashini Indic STT Provider (Official MeitY API)
 */
export class BhashiniSTTProvider implements SpeechToTextProvider {
  private apiKey: string;
  private userId: string;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' ? process.env.BHASHINI_API_KEY : '') || '';
    this.userId = (typeof process !== 'undefined' ? process.env.BHASHINI_USER_ID : '') || '';
  }

  async transcribe(
    audioData: Buffer | Uint8Array | string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: string }
  ): Promise<STTResult> {
    if (!this.isConfigured()) {
      return new MockSTTProvider().transcribe(audioData, language, options);
    }

    const startTime = Date.now();
    const base64Audio = typeof audioData === 'string' ? audioData : Buffer.from(audioData).toString('base64');

    try {
      const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey,
          userID: this.userId
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'asr',
              config: {
                language: { sourceLanguage: language },
                audioFormat: options?.encoding || 'wav',
                samplingRate: options?.sampleRate || 16000
              }
            }
          ],
          inputData: {
            audio: [{ audioContent: base64Audio }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Bhashini STT HTTP ${response.status}`);
      }

      const data = await response.json();
      const outputText =
        data.pipelineResponse?.[0]?.output?.[0]?.source ||
        data.pipelineResponse?.[0]?.output?.[0]?.target ||
        '';

      return {
        text: outputText,
        confidence: 0.92,
        language,
        isFinal: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Bhashini STT failed, falling back to local provider:', error);
      return new MockSTTProvider().transcribe(audioData, language, options);
    }
  }

  getProviderName(): string {
    return 'BhashiniSTT';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
}

/**
 * 3. Sarvam AI Indic STT Provider (Saarika v2)
 * Primary speech-to-text provider for Indic languages (Marathi, Hindi, English, etc.)
 */
export class SarvamSTTProvider implements SpeechToTextProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' ? process.env.SARVAM_API_KEY : '') || '';
  }

  async transcribe(
    audioData: Buffer | Uint8Array | string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: string }
  ): Promise<STTResult> {
    if (!this.isConfigured()) {
      const google = new GoogleCloudSTTProvider();
      if (google.isConfigured()) {
        return google.transcribe(audioData, language, options);
      }
      return new MockSTTProvider().transcribe(audioData, language, options);
    }

    const startTime = Date.now();
    const SARVAM_LANG_MAP: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      en: 'en-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ml: 'ml-IN',
      od: 'od-IN'
    };
    const targetLang = SARVAM_LANG_MAP[language] || 'mr-IN';

    try {
      const buffer = typeof audioData === 'string'
        ? Buffer.from(audioData, 'base64')
        : Buffer.isBuffer(audioData)
        ? audioData
        : Buffer.from(audioData);

      const mimeType = options?.encoding === 'ogg_opus' ? 'audio/ogg' : 'audio/wav';
      const filename = options?.encoding === 'ogg_opus' ? 'audio.ogg' : 'audio.wav';
      const uint8 = new Uint8Array(buffer);
      const blob = new Blob([uint8], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('model', 'saarika:v2');
      formData.append('language_code', targetLang);

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Sarvam STT HTTP ${response.status}`);
      }

      const data = (await response.json()) as { transcript?: string };
      const outputText = (data.transcript || '').trim();

      return {
        text: outputText,
        confidence: 0.95,
        language,
        isFinal: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Sarvam STT failed, falling back to Google/Mock STT:', error);
      const google = new GoogleCloudSTTProvider();
      if (google.isConfigured()) {
        return google.transcribe(audioData, language, options);
      }
      return new MockSTTProvider().transcribe(audioData, language, options);
    }
  }

  getProviderName(): string {
    return 'SarvamSTT';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
}

/**
 * 4. Google Cloud STT Provider
 * Documented fallback provider when GOOGLE_STT_API_KEY is configured.
 */
export class GoogleCloudSTTProvider implements SpeechToTextProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' ? process.env.GOOGLE_STT_API_KEY : '') || '';
  }

  async transcribe(
    audioData: Buffer | Uint8Array | string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: string }
  ): Promise<STTResult> {
    if (!this.isConfigured()) {
      return new MockSTTProvider().transcribe(audioData, language, options);
    }

    const startTime = Date.now();
    const base64Audio = typeof audioData === 'string' ? audioData : Buffer.from(audioData).toString('base64');
    const langTag = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: options?.encoding === 'mulaw' ? 'MULAW' : 'LINEAR16',
              sampleRateHertz: options?.sampleRate || 16000,
              languageCode: langTag,
              enableAutomaticPunctuation: true
            },
            audio: { content: base64Audio }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google Cloud STT HTTP ${response.status}`);
      }

      const data = await response.json();
      const transcription = data.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = data.results?.[0]?.alternatives?.[0]?.confidence || 0.9;

      return {
        text: transcription,
        confidence,
        language,
        isFinal: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Google Cloud STT failed, falling back to local mock:', error);
      return new MockSTTProvider().transcribe(audioData, language, options);
    }
  }

  getProviderName(): string {
    return 'GoogleCloudSTT';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
}

/**
 * Factory for resolving the configured STT provider.
 * Defaults to Sarvam STT (Indic neural STT) with Google Cloud STT & Mock fallbacks.
 */
export function getSTTProvider(providerName?: string): SpeechToTextProvider {
  const selected = (
    providerName ||
    (typeof process !== 'undefined' ? process.env.STT_PROVIDER : '') ||
    'sarvam'
  ).toLowerCase();

  if (selected.includes('sarvam')) {
    return new SarvamSTTProvider();
  }
  if (selected.includes('bhashini')) {
    return new BhashiniSTTProvider();
  }
  if (selected.includes('google')) {
    return new GoogleCloudSTTProvider();
  }
  return new SarvamSTTProvider();
}
