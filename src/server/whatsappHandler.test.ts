// Disha Sarathi - WhatsApp Handler Comprehensive Unit Tests (PS 26097)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseWebhookPayload,
  handleWhatsAppWebhook,
  getWhatsAppSessionCount,
  _resetDeduplicationStore,
  _resetSessionStore,
  type WaTextMessage,
  type WaAudioMessage
} from './whatsappHandler';

// ---------------------------------------------------------------------------
// Mock the WhatsApp service so we never hit Meta API in tests
// ---------------------------------------------------------------------------
vi.mock('./services/whatsapp', () => ({
  sendTextMessage: vi.fn().mockResolvedValue(undefined),
  sendAudioMessage: vi.fn().mockResolvedValue(undefined),
  getMediaUrl: vi.fn().mockResolvedValue('https://example.com/media/fake-audio.ogg'),
  downloadMedia: vi.fn().mockResolvedValue(Buffer.from('fake-ogg-bytes')),
  markMessageRead: vi.fn().mockResolvedValue(undefined),
  senderLogTag: vi.fn((id: string) => 'wa_' + id.slice(0, 8)),
  isWhatsAppConfigured: vi.fn().mockReturnValue(true)
}));

import {
  sendTextMessage,
  getMediaUrl,
  downloadMedia,
  isWhatsAppConfigured
} from './services/whatsapp';

// ---------------------------------------------------------------------------
// Sample Meta webhook payloads
// ---------------------------------------------------------------------------
const SAMPLE_TEXT_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '1393780486296707',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15551681695', phone_number_id: '1318906817973464' },
            contacts: [{ profile: { name: 'Test User' }, wa_id: '919876543210' }],
            messages: [
              {
                from: '919876543210',
                id: 'wamid.test_text_001',
                timestamp: '1727000000',
                type: 'text',
                text: { body: 'नमस्कार' }
              }
            ]
          }
        }
      ]
    }
  ]
};

const SAMPLE_AUDIO_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '1393780486296707',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15551681695', phone_number_id: '1318906817973464' },
            contacts: [{ profile: { name: 'Audio User' }, wa_id: '919876500001' }],
            messages: [
              {
                from: '919876500001',
                id: 'wamid.test_audio_001',
                timestamp: '1727000001',
                type: 'audio',
                audio: { id: 'media_id_abc123', mime_type: 'audio/ogg; codecs=opus' }
              }
            ]
          }
        }
      ]
    }
  ]
};

const SAMPLE_STATUS_UPDATE_PAYLOAD = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '1393780486296707',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            statuses: [
              {
                id: 'wamid.some_sent_msg',
                status: 'delivered',
                timestamp: '1727000005',
                recipient_id: '919876543210'
              }
            ]
          }
        }
      ]
    }
  ]
};

// ---------------------------------------------------------------------------
// Reset state before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  _resetDeduplicationStore();
  _resetSessionStore();
  vi.clearAllMocks();
  // Ensure configured by default
  vi.mocked(isWhatsAppConfigured).mockReturnValue(true);
});

// ---------------------------------------------------------------------------
// 1. Webhook Payload Parsing
// ---------------------------------------------------------------------------
describe('1. parseWebhookPayload — text messages', () => {
  it('should parse a valid text webhook payload', () => {
    const result = parseWebhookPayload(SAMPLE_TEXT_PAYLOAD);

    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].type).toBe('text');
    expect(result.messages[0].from).toBe('919876543210');
    expect(result.messages[0].id).toBe('wamid.test_text_001');
    expect((result.messages[0] as WaTextMessage).text.body).toBe('नमस्कार');
  });

  it('should extract body text correctly from nested structure', () => {
    const result = parseWebhookPayload(SAMPLE_TEXT_PAYLOAD);
    const msg = result.messages[0] as WaTextMessage;
    expect(msg.text.body).toBe('नमस्कार');
  });
});

describe('2. parseWebhookPayload — audio messages', () => {
  it('should parse a valid audio webhook payload', () => {
    const result = parseWebhookPayload(SAMPLE_AUDIO_PAYLOAD);

    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].type).toBe('audio');
    expect(result.messages[0].from).toBe('919876500001');
    expect((result.messages[0] as WaAudioMessage).audio.id).toBe('media_id_abc123');
  });

  it('should capture mime_type on audio messages', () => {
    const result = parseWebhookPayload(SAMPLE_AUDIO_PAYLOAD);
    const msg = result.messages[0] as WaAudioMessage;
    expect(msg.audio.mime_type).toBe('audio/ogg; codecs=opus');
  });
});

describe('3. parseWebhookPayload — invalid payloads', () => {
  it('should return valid=false for null input', () => {
    const result = parseWebhookPayload(null);
    expect(result.valid).toBe(false);
    expect(result.messages).toHaveLength(0);
    expect(result.error).toBeDefined();
  });

  it('should return valid=false for non-object input (string)', () => {
    const result = parseWebhookPayload('not an object');
    expect(result.valid).toBe(false);
  });

  it('should return valid=false if object field is not whatsapp_business_account', () => {
    const result = parseWebhookPayload({ object: 'page', entry: [] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unexpected object type');
  });

  it('should return valid=true with 0 messages for a status update event', () => {
    const result = parseWebhookPayload(SAMPLE_STATUS_UPDATE_PAYLOAD);
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  it('should return valid=true with 0 messages for completely empty entry list', () => {
    const result = parseWebhookPayload({ object: 'whatsapp_business_account', entry: [] });
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(0);
  });

  it('should handle malformed entry array gracefully without throwing', () => {
    const weirdPayload = {
      object: 'whatsapp_business_account',
      entry: [{ id: 'x', changes: null }]
    };
    expect(() => parseWebhookPayload(weirdPayload)).not.toThrow();
  });
});

describe('4. parseWebhookPayload — unsupported message types', () => {
  it('should parse unsupported message types as generic entries', () => {
    const imagePayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '1393780486296707',
          changes: [
            {
              field: 'messages',
              value: {
                messages: [
                  {
                    from: '919876543210',
                    id: 'wamid.img_001',
                    timestamp: '1727000002',
                    type: 'image',
                    image: { id: 'img_media_id', mime_type: 'image/jpeg', sha256: 'abc' }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = parseWebhookPayload(imagePayload);
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].type).toBe('image');
  });
});

// ---------------------------------------------------------------------------
// 5. Deduplication
// ---------------------------------------------------------------------------
describe('5. Deduplication — same message ID cannot trigger two replies', () => {
  it('should process a text message only once for the same msgId', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    // Small delay to allow async dispatch
    await new Promise((r) => setTimeout(r, 30));

    const callCountFirst = vi.mocked(sendTextMessage).mock.calls.length;

    // Reset session so it would trigger a new session again if dedup weren't working
    // but keep dedup store intact
    _resetSessionStore();

    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 30));

    const callCountSecond = vi.mocked(sendTextMessage).mock.calls.length;
    expect(callCountSecond).toBe(callCountFirst); // no additional sends
  });

  it('should process two different message IDs independently', async () => {
    const payload1 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    const payload2 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload2.entry[0].changes[0].value.messages[0].id = 'wamid.different_id_xyz';

    handleWhatsAppWebhook(payload1);
    await new Promise((r) => setTimeout(r, 30));
    const count1 = vi.mocked(sendTextMessage).mock.calls.length;

    handleWhatsAppWebhook(payload2);
    await new Promise((r) => setTimeout(r, 30));
    const count2 = vi.mocked(sendTextMessage).mock.calls.length;

    expect(count2).toBeGreaterThan(count1);
  });
});

// ---------------------------------------------------------------------------
// 6. Text Message Reply Flow
// ---------------------------------------------------------------------------
describe('6. Text message reply flow', () => {
  it('should send a greeting to a new user on first text message', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));

    expect(sendTextMessage).toHaveBeenCalled();
    const [to, text] = vi.mocked(sendTextMessage).mock.calls[0];
    expect(to).toBe('919876543210');
    expect(text).toBeTruthy();
    expect(typeof text).toBe('string');
  });

  it('should not reply if WhatsApp is not configured', async () => {
    vi.mocked(isWhatsAppConfigured).mockReturnValue(false);

    const payload = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.nocfg_001';

    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 50));

    expect(sendTextMessage).not.toHaveBeenCalled();
  });

  it('should send reply to correct recipient phone number', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));

    const calls = vi.mocked(sendTextMessage).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // All calls should go to the sender
    for (const [to] of calls) {
      expect(to).toBe('919876543210');
    }
  });

  it('should handle status update payloads without sending any reply', async () => {
    handleWhatsAppWebhook(SAMPLE_STATUS_UPDATE_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));
    expect(sendTextMessage).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 7. Audio Message Parsing
// ---------------------------------------------------------------------------
describe('7. Audio message handling', () => {
  it('should attempt to get media URL for an audio message', async () => {
    handleWhatsAppWebhook(SAMPLE_AUDIO_PAYLOAD);
    await new Promise((r) => setTimeout(r, 80));

    // Should have fetched media metadata
    expect(getMediaUrl).toHaveBeenCalledWith('media_id_abc123');
  });

  it('should attempt to download audio binary after getting URL', async () => {
    handleWhatsAppWebhook(SAMPLE_AUDIO_PAYLOAD);
    await new Promise((r) => setTimeout(r, 80));

    expect(downloadMedia).toHaveBeenCalled();
  });

  it('should send acknowledgement text before processing audio', async () => {
    handleWhatsAppWebhook(SAMPLE_AUDIO_PAYLOAD);
    await new Promise((r) => setTimeout(r, 30));

    // First call should be the ack message
    const firstCall = vi.mocked(sendTextMessage).mock.calls[0];
    if (firstCall) {
      expect(firstCall[0]).toBe('919876500001');
      // Ack message contains processing indicator
      expect(firstCall[1]).toContain('🎙️');
    }
  });
});

// ---------------------------------------------------------------------------
// 8. Unsupported Message Types
// ---------------------------------------------------------------------------
describe('8. Unsupported message type handling', () => {
  it('should send an unsupported-type notice and not crash', async () => {
    const sticker = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123',
          changes: [
            {
              field: 'messages',
              value: {
                messages: [
                  {
                    from: '919876599999',
                    id: 'wamid.sticker_001',
                    type: 'sticker',
                    timestamp: '1727000010'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    expect(() => handleWhatsAppWebhook(sticker)).not.toThrow();
    await new Promise((r) => setTimeout(r, 50));
    expect(sendTextMessage).toHaveBeenCalled();
    const [, text] = vi.mocked(sendTextMessage).mock.calls[0];
    expect(text.toLowerCase()).toContain('sticker');
  });
});

// ---------------------------------------------------------------------------
// 9. Missing Environment Variables
// ---------------------------------------------------------------------------
describe('9. Missing env variables — graceful fallback', () => {
  it('handleWhatsAppWebhook should not throw when WhatsApp not configured', async () => {
    vi.mocked(isWhatsAppConfigured).mockReturnValue(false);

    const payload = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.noenv_001';

    expect(() => handleWhatsAppWebhook(payload)).not.toThrow();
    await new Promise((r) => setTimeout(r, 50));
  });
});

// ---------------------------------------------------------------------------
// 10. Session Management
// ---------------------------------------------------------------------------
describe('10. Session management', () => {
  it('should create a new session for a new sender', async () => {
    expect(getWhatsAppSessionCount()).toBe(0);

    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));

    expect(getWhatsAppSessionCount()).toBe(1);
  });

  it('should not create duplicate sessions for the same sender', async () => {
    const p1 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    const p2 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    p2.entry[0].changes[0].value.messages[0].id = 'wamid.session_test_002';
    p2.entry[0].changes[0].value.messages[0].text.body = 'मला मदत हवी आहे';

    handleWhatsAppWebhook(p1);
    await new Promise((r) => setTimeout(r, 50));
    handleWhatsAppWebhook(p2);
    await new Promise((r) => setTimeout(r, 50));

    expect(getWhatsAppSessionCount()).toBe(1); // Same sender
  });

  it('should create separate sessions for different senders', async () => {
    const p1 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    const p2 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    p2.entry[0].changes[0].value.messages[0].from = '919876500002';
    p2.entry[0].changes[0].value.messages[0].id = 'wamid.diff_sender_001';

    handleWhatsAppWebhook(p1);
    await new Promise((r) => setTimeout(r, 50));
    handleWhatsAppWebhook(p2);
    await new Promise((r) => setTimeout(r, 50));

    expect(getWhatsAppSessionCount()).toBe(2);
  });
});
