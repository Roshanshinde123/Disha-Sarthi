// Disha Sarathi - Server-Side Text-to-Speech (TTS) Provider Abstraction for Exotel Voicebot (PS 26097)
import { LanguageCode } from '../core/types';

export interface ServerTTSAudioResult {
  audioBuffer: Buffer;
  base64Payload: string;
  sampleRate: number;
  encoding: 'audio/x-l16' | 'audio/x-mulaw';
  latencyMs: number;
}

export interface TextToSpeechProvider {
  synthesize(
    text: string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: 'audio/x-l16' | 'audio/x-mulaw' }
  ): Promise<ServerTTSAudioResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}

/**
 * 1. Mock Server-Side TTS Provider
 * Generates synthetic 16-bit PCM mono audio buffers formatted for Exotel Voicebot.
 */
export class MockServerTTSProvider implements TextToSpeechProvider {
  async synthesize(
    text: string,
    _language: LanguageCode,
    options?: { sampleRate?: number; encoding?: 'audio/x-l16' | 'audio/x-mulaw' }
  ): Promise<ServerTTSAudioResult> {
    const startTime = Date.now();
    const sampleRate = options?.sampleRate || 8000;
    // Generate ~1.2s of lightweight synthetic 16-bit PCM sine wave tones
    const durationSeconds = Math.max(0.6, Math.min(2.5, text.length * 0.05));
    const totalSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = Buffer.alloc(totalSamples * 2); // 16-bit = 2 bytes per sample

    const freq = 440; // 440Hz tone
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.2 * 32767; // 20% volume
      buffer.writeInt16LE(Math.floor(sample), i * 2);
    }

    return {
      audioBuffer: buffer,
      base64Payload: buffer.toString('base64'),
      sampleRate,
      encoding: options?.encoding || 'audio/x-l16',
      latencyMs: Date.now() - startTime
    };
  }

  getProviderName(): string {
    return 'MockServerTTS';
  }

  isConfigured(): boolean {
    return true;
  }
}

/**
 * 2. Sarvam AI Indic Neural TTS Provider
 */
export class SarvamServerTTSProvider implements TextToSpeechProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' ? process.env.SARVAM_API_KEY : '') || '';
  }

  async synthesize(
    text: string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: 'audio/x-l16' | 'audio/x-mulaw' }
  ): Promise<ServerTTSAudioResult> {
    if (!this.isConfigured()) {
      return new MockServerTTSProvider().synthesize(text, language, options);
    }

    const startTime = Date.now();
    const SARVAM_LANG_MAP: Record<string, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
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
    const langCode = SARVAM_LANG_MAP[language] || 'mr-IN';
    const sampleRate = options?.sampleRate || 8000;

    console.log(`[TTS] TTS_REQUEST_STARTED: provider=SARVAM lang=${langCode} sampleRate=${sampleRate}`);

    try {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: langCode,
          speaker: 'kavya',
          pitch: 0,
          pace: 1.0,
          loudness: 1.5,
          speech_sample_rate: sampleRate,
          enable_preprocessing: true,
          model: 'bulbul:v3'
        })
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Sarvam TTS HTTP ${response.status}: ${errBody}`);
      }

      const data = (await response.json()) as { audios?: string[] };
      const base64Audio = data.audios?.[0] || '';
      const rawAudioBuffer = Buffer.from(base64Audio, 'base64');
      const latencyMs = Date.now() - startTime;

      console.log(`[TTS] TTS_REQUEST_SUCCESS: provider=SARVAM bytes=${rawAudioBuffer.length} latencyMs=${latencyMs}`);

      // If linear PCM is expected for telephony (e.g. Exotel), strip 44-byte WAV header if present
      let finalBuffer = rawAudioBuffer;
      if (options?.encoding === 'audio/x-l16' && rawAudioBuffer.length > 44 && rawAudioBuffer.subarray(0, 4).toString('ascii') === 'RIFF') {
        finalBuffer = rawAudioBuffer.subarray(44);
      }

      return {
        audioBuffer: finalBuffer,
        base64Payload: finalBuffer.toString('base64'),
        sampleRate,
        encoding: options?.encoding || 'audio/x-l16',
        latencyMs
      };
    } catch (error: any) {
      console.warn(`[TTS] TTS_ERROR: Sarvam TTS failed, falling back to mock:`, error?.message || error);
      return new MockServerTTSProvider().synthesize(text, language, options);
    }
  }

  getProviderName(): string {
    return 'SarvamTTS';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
}

/**
 * 3. Bhashini Indic Neural TTS Provider
 */
export class BhashiniServerTTSProvider implements TextToSpeechProvider {
  private apiKey: string;
  private userId: string;

  constructor() {
    this.apiKey = (typeof process !== 'undefined' ? process.env.BHASHINI_API_KEY : '') || '';
    this.userId = (typeof process !== 'undefined' ? process.env.BHASHINI_USER_ID : '') || '';
  }

  async synthesize(
    text: string,
    language: LanguageCode,
    options?: { sampleRate?: number; encoding?: 'audio/x-l16' | 'audio/x-mulaw' }
  ): Promise<ServerTTSAudioResult> {
    if (!this.isConfigured()) {
      return new MockServerTTSProvider().synthesize(text, language, options);
    }

    const startTime = Date.now();

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
              taskType: 'tts',
              config: {
                language: { sourceLanguage: language },
                gender: 'female',
                samplingRate: options?.sampleRate || 8000
              }
            }
          ],
          inputData: {
            input: [{ source: text }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Bhashini TTS HTTP ${response.status}`);
      }

      const data = await response.json();
      const base64Audio = data.pipelineResponse?.[0]?.audio?.[0]?.audioContent || '';
      const audioBuffer = Buffer.from(base64Audio, 'base64');

      return {
        audioBuffer,
        base64Payload: base64Audio,
        sampleRate: options?.sampleRate || 8000,
        encoding: options?.encoding || 'audio/x-l16',
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Bhashini TTS failed, falling back to mock provider:', error);
      return new MockServerTTSProvider().synthesize(text, language, options);
    }
  }

  getProviderName(): string {
    return 'BhashiniTTS';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
}

/**
 * Factory for resolving the configured TTS provider
 */
export function getTTSProvider(providerName?: string): TextToSpeechProvider {
  const selected = (
    providerName ||
    (typeof process !== 'undefined' ? process.env.TTS_PROVIDER : '') ||
    'sarvam'
  ).toLowerCase();

  if (selected.includes('sarvam')) {
    return new SarvamServerTTSProvider();
  }
  if (selected.includes('bhashini')) {
    return new BhashiniServerTTSProvider();
  }
  return new SarvamServerTTSProvider();
}
