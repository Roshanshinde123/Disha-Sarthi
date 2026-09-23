// Disha Sarathi - TTS Provider Unit Tests (PS 26097)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTTSProvider,
  SarvamServerTTSProvider,
  MockServerTTSProvider
} from './ttsProvider';

describe('TTS Provider Abstraction', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Provider resolution via getTTSProvider', () => {
    it('defaults to SarvamServerTTSProvider when TTS_PROVIDER is sarvam or unset', () => {
      delete process.env.TTS_PROVIDER;
      const provider = getTTSProvider();
      expect(provider.getProviderName()).toBe('SarvamTTS');
    });

    it('returns SarvamServerTTSProvider when TTS_PROVIDER=sarvam', () => {
      process.env.TTS_PROVIDER = 'sarvam';
      const provider = getTTSProvider();
      expect(provider.getProviderName()).toBe('SarvamTTS');
    });

    it('returns BhashiniServerTTSProvider when TTS_PROVIDER=bhashini', () => {
      process.env.TTS_PROVIDER = 'bhashini';
      const provider = getTTSProvider();
      expect(provider.getProviderName()).toBe('BhashiniTTS');
    });
  });

  describe('MockServerTTSProvider', () => {
    it('generates synthetic 16-bit PCM audio buffer', async () => {
      const provider = new MockServerTTSProvider();
      const result = await provider.synthesize('नमस्कार', 'mr', { sampleRate: 8000 });
      expect(result.audioBuffer).toBeDefined();
      expect(result.audioBuffer.length).toBeGreaterThan(0);
      expect(result.base64Payload).toBeDefined();
      expect(result.sampleRate).toBe(8000);
      expect(result.encoding).toBe('audio/x-l16');
    });
  });

  describe('SarvamServerTTSProvider', () => {
    it('reports isConfigured correctly', () => {
      process.env.SARVAM_API_KEY = 'test_key';
      const provider = new SarvamServerTTSProvider();
      expect(provider.isConfigured()).toBe(true);

      delete process.env.SARVAM_API_KEY;
      const unconfigured = new SarvamServerTTSProvider();
      expect(unconfigured.isConfigured()).toBe(false);
    });

    it('falls back to Mock provider if unconfigured', async () => {
      delete process.env.SARVAM_API_KEY;
      const provider = new SarvamServerTTSProvider();
      const res = await provider.synthesize('नमस्कार', 'mr');
      expect(res.audioBuffer.length).toBeGreaterThan(0);
    });

    it('synthesizes audio using Sarvam bulbul:v3 API with kavya voice', async () => {
      process.env.SARVAM_API_KEY = 'test_sarvam_key';
      const provider = new SarvamServerTTSProvider();

      // Create a dummy 44-byte WAV header + dummy PCM
      const fakeWav = Buffer.alloc(100);
      fakeWav.write('RIFF', 0);
      fakeWav.write('WAVE', 8);

      const fakeFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ audios: [fakeWav.toString('base64')] })
      });
      globalThis.fetch = fakeFetch as any;

      const result = await provider.synthesize('नमस्कार, मी दिशा सारथी आहे.', 'mr', {
        sampleRate: 8000,
        encoding: 'audio/x-l16'
      });

      expect(fakeFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = fakeFetch.mock.calls[0];
      expect(url).toBe('https://api.sarvam.ai/text-to-speech');
      expect(opts.headers['api-subscription-key']).toBe('test_sarvam_key');
      const body = JSON.parse(opts.body);
      expect(body.model).toBe('bulbul:v3');
      expect(body.speaker).toBe('kavya');
      expect(body.target_language_code).toBe('mr-IN');

      // Header stripped for raw linear PCM (audio/x-l16)
      expect(result.audioBuffer.length).toBe(100 - 44);
      expect(result.encoding).toBe('audio/x-l16');
    });
  });
});
