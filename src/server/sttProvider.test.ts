// Disha Sarathi - STT Provider Unit Tests (PS 26097)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSTTProvider,
  SarvamSTTProvider,
  MockSTTProvider
} from './sttProvider';

describe('STT Provider Abstraction', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Provider resolution via getSTTProvider', () => {
    it('defaults to SarvamSTTProvider when no env var is set', () => {
      delete process.env.STT_PROVIDER;
      const provider = getSTTProvider();
      expect(provider.getProviderName()).toBe('SarvamSTT');
    });

    it('returns SarvamSTTProvider when STT_PROVIDER=sarvam', () => {
      process.env.STT_PROVIDER = 'sarvam';
      const provider = getSTTProvider();
      expect(provider.getProviderName()).toBe('SarvamSTT');
    });

    it('returns GoogleCloudSTTProvider when STT_PROVIDER=google', () => {
      process.env.STT_PROVIDER = 'google';
      const provider = getSTTProvider();
      expect(provider.getProviderName()).toBe('GoogleCloudSTT');
    });

    it('returns BhashiniSTTProvider when STT_PROVIDER=bhashini', () => {
      process.env.STT_PROVIDER = 'bhashini';
      const provider = getSTTProvider();
      expect(provider.getProviderName()).toBe('BhashiniSTT');
    });
  });

  describe('MockSTTProvider', () => {
    it('transcribes string input directly if provided as text', async () => {
      const provider = new MockSTTProvider();
      const result = await provider.transcribe('मी १०वी पास आहे', 'mr');
      expect(result.text).toBe('मी १०वी पास आहे');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.isFinal).toBe(true);
    });

    it('returns default localized fallback when binary buffer is provided', async () => {
      const provider = new MockSTTProvider();
      const resultMr = await provider.transcribe(Buffer.from('fake-audio'), 'mr');
      expect(resultMr.text).toContain('पुण्यात');

      const resultHi = await provider.transcribe(Buffer.from('fake-audio'), 'hi');
      expect(resultHi.text).toContain('पुणे');

      const resultEn = await provider.transcribe(Buffer.from('fake-audio'), 'en');
      expect(resultEn.text).toContain('Pune');
    });
  });

  describe('SarvamSTTProvider', () => {
    it('reports isConfigured correctly', () => {
      process.env.SARVAM_API_KEY = 'test_key';
      const provider = new SarvamSTTProvider();
      expect(provider.isConfigured()).toBe(true);

      delete process.env.SARVAM_API_KEY;
      const unconfigured = new SarvamSTTProvider();
      expect(unconfigured.isConfigured()).toBe(false);
    });

    it('falls back to Mock provider if unconfigured and Google is unconfigured', async () => {
      delete process.env.SARVAM_API_KEY;
      delete process.env.GOOGLE_STT_API_KEY;
      const provider = new SarvamSTTProvider();
      const res = await provider.transcribe('मी वेल्डर आहे', 'mr');
      expect(res.text).toBe('मी वेल्डर आहे');
    });

    it('successfully calls Sarvam STT API when configured', async () => {
      process.env.SARVAM_API_KEY = 'test_sarvam_key';
      const provider = new SarvamSTTProvider();

      const fakeFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ transcript: 'मी इलेक्ट्रिशियन आहे' })
      });
      globalThis.fetch = fakeFetch as any;

      const result = await provider.transcribe(Buffer.from('dummy_audio_bytes'), 'mr', {
        encoding: 'ogg_opus'
      });

      expect(fakeFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = fakeFetch.mock.calls[0];
      expect(url).toBe('https://api.sarvam.ai/speech-to-text');
      expect(opts.headers['api-subscription-key']).toBe('test_sarvam_key');
      expect(result.text).toBe('मी इलेक्ट्रिशियन आहे');
      expect(result.confidence).toBe(0.95);
    });
  });
});
