// Disha Sarathi - WhatsApp Handler Comprehensive Unit Tests (PS 26097)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseWebhookPayload,
  handleWhatsAppWebhook,
  getWhatsAppSessionCount,
  getInteractiveButtonsForState,
  _resetDeduplicationStore,
  _resetSessionStore,
  type WaTextMessage,
  type WaAudioMessage,
  type WaInteractiveMessage
} from './whatsappHandler';
import { ConversationState, LanguageCode } from '../core/types';

// ---------------------------------------------------------------------------
// Mock WhatsApp, STT, and TTS services so tests are deterministic and fast
// ---------------------------------------------------------------------------
vi.mock('./services/whatsapp', () => ({
  sendTextMessage: vi.fn().mockResolvedValue(undefined),
  sendAudioMessage: vi.fn().mockResolvedValue(undefined),
  sendInteractiveButtonMessage: vi.fn().mockResolvedValue(undefined),
  getMediaUrl: vi.fn().mockResolvedValue('https://example.com/media/fake-audio.ogg'),
  downloadMedia: vi.fn().mockResolvedValue(Buffer.from('fake-ogg-bytes')),
  markMessageRead: vi.fn().mockResolvedValue(undefined),
  senderLogTag: vi.fn((id: string) => 'wa_' + id.slice(0, 8)),
  isWhatsAppConfigured: vi.fn().mockReturnValue(true)
}));

vi.mock('./sttProvider', () => ({
  getSTTProvider: vi.fn().mockReturnValue({
    transcribe: vi.fn().mockResolvedValue({ text: 'नमस्कार, मला इलेक्ट्रिकल काम आवडतं', confidence: 0.95, latencyMs: 10 }),
    getProviderName: () => 'MockSTT',
    isConfigured: () => true
  })
}));

vi.mock('./ttsProvider', () => ({
  getTTSProvider: vi.fn().mockReturnValue({
    synthesize: vi.fn().mockResolvedValue({
      audioBuffer: Buffer.from('OggSfake_opus_audio_bytes'),
      base64Payload: 'T2dnU2Zha2Vfb3B1c19hdWRpb19ieXRlcw==',
      sampleRate: 16000,
      encoding: 'audio/ogg',
      mimeType: 'audio/ogg; codecs=opus',
      latencyMs: 15
    }),
    getProviderName: () => 'MockTTS',
    isConfigured: () => true
  })
}));

import {
  sendTextMessage,
  sendAudioMessage,
  sendInteractiveButtonMessage,
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

const SAMPLE_INTERACTIVE_BUTTON_PAYLOAD = {
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
            contacts: [{ profile: { name: 'Interactive User' }, wa_id: '919876543210' }],
            messages: [
              {
                from: '919876543210',
                id: 'wamid.test_interactive_001',
                timestamp: '1727000002',
                type: 'interactive',
                interactive: {
                  type: 'button_reply',
                  button_reply: {
                    id: 'mr',
                    title: 'मराठी (Marathi)'
                  }
                }
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
beforeEach(async () => {
  await new Promise((r) => setTimeout(r, 60));
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

describe('2. parseWebhookPayload — interactive button replies', () => {
  it('should parse an interactive button_reply webhook payload', () => {
    const result = parseWebhookPayload(SAMPLE_INTERACTIVE_BUTTON_PAYLOAD);

    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].type).toBe('interactive');
    expect(result.messages[0].from).toBe('919876543210');
    expect(result.messages[0].id).toBe('wamid.test_interactive_001');
    const msg = result.messages[0] as WaInteractiveMessage;
    expect(msg.interactive.type).toBe('button_reply');
    expect(msg.interactive.button_reply?.id).toBe('mr');
    expect(msg.interactive.button_reply?.title).toBe('मराठी (Marathi)');
  });

  it('should parse an interactive list_reply webhook payload', () => {
    const listPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '1393780486296707',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919876543210',
                    id: 'wamid.test_list_001',
                    type: 'interactive',
                    interactive: {
                      type: 'list_reply',
                      list_reply: {
                        id: 'opt_pune',
                        title: 'Pune District'
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const result = parseWebhookPayload(listPayload);
    expect(result.valid).toBe(true);
    expect(result.messages).toHaveLength(1);
    const msg = result.messages[0] as WaInteractiveMessage;
    expect(msg.interactive.type).toBe('list_reply');
    expect(msg.interactive.list_reply?.id).toBe('opt_pune');
    expect(msg.interactive.list_reply?.title).toBe('Pune District');
  });
});

describe('3. parseWebhookPayload — audio messages', () => {
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

describe('4. parseWebhookPayload — invalid payloads', () => {
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

describe('5. parseWebhookPayload — unsupported message types', () => {
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
// 6. Interactive Buttons Configuration per FSM State
// ---------------------------------------------------------------------------
describe('6. getInteractiveButtonsForState — small fixed choice set verification', () => {
  const supportedStates: ConversationState[] = [
    'LANG_SELECT',
    'GREETING',
    'LANDING',
    'CONSENT',
    'EMPLOYMENT_PREFERENCE',
    'CONFIRM_SUMMARY',
    'CENTER_AND_NEXT_STEPS',
    'FINANCE_TRACK',
    'ASPIRATION_CARD',
    'END',
    'DECLINED_END',
    'DELETED_END'
  ];

  it('should return <= 3 buttons for all supported states in Marathi, Hindi, English', () => {
    const languages: LanguageCode[] = ['mr', 'hi', 'en'];

    for (const state of supportedStates) {
      for (const lang of languages) {
        const buttons = getInteractiveButtonsForState(state, lang);
        expect(buttons).not.toBeNull();
        expect(buttons!.length).toBeGreaterThan(0);
        expect(buttons!.length).toBeLessThanOrEqual(3);

        // WhatsApp requirement: button title must be <= 20 characters
        for (const btn of buttons!) {
          expect(btn.id).toBeTruthy();
          expect(btn.title.length).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it('should return 3 language choices (Marathi, Hindi, English) for LANG_SELECT', () => {
    const buttons = getInteractiveButtonsForState('LANG_SELECT', 'mr');
    expect(buttons).toHaveLength(3);
    expect(buttons?.map((b) => b.id)).toEqual(['mr', 'hi', 'en']);
  });

  it('should return wage, self, both choices for EMPLOYMENT_PREFERENCE', () => {
    const buttons = getInteractiveButtonsForState('EMPLOYMENT_PREFERENCE', 'mr');
    expect(buttons).toHaveLength(3);
    expect(buttons?.map((b) => b.id)).toEqual(['wage_employment', 'self_employment', 'both']);
  });

  it('should return null for open-ended states where free-form text or speech is required', () => {
    const openEndedStates: ConversationState[] = [
      'LOCATION',
      'BACKGROUND',
      'SKILLS_INTERESTS',
      'EXPERIENCE',
      'TRAVEL_RADIUS',
      'SESSION_FEEDBACK'
    ];

    for (const state of openEndedStates) {
      expect(getInteractiveButtonsForState(state, 'mr')).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Deduplication
// ---------------------------------------------------------------------------
describe('7. Deduplication — same message ID cannot trigger two replies', () => {
  it('should process a text message only once for the same msgId', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 40));

    const textCallsFirst = vi.mocked(sendTextMessage).mock.calls.length;
    const buttonCallsFirst = vi.mocked(sendInteractiveButtonMessage).mock.calls.length;
    const totalFirst = textCallsFirst + buttonCallsFirst;

    _resetSessionStore();

    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 40));

    const textCallsSecond = vi.mocked(sendTextMessage).mock.calls.length;
    const buttonCallsSecond = vi.mocked(sendInteractiveButtonMessage).mock.calls.length;
    const totalSecond = textCallsSecond + buttonCallsSecond;

    expect(totalSecond).toBe(totalFirst);
  });

  it('should process two different message IDs independently', async () => {
    const payload1 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    const payload2 = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload2.entry[0].changes[0].value.messages[0].id = 'wamid.different_id_xyz';

    handleWhatsAppWebhook(payload1);
    await new Promise((r) => setTimeout(r, 40));
    const count1 =
      vi.mocked(sendTextMessage).mock.calls.length + vi.mocked(sendInteractiveButtonMessage).mock.calls.length;

    handleWhatsAppWebhook(payload2);
    await new Promise((r) => setTimeout(r, 40));
    const count2 =
      vi.mocked(sendTextMessage).mock.calls.length + vi.mocked(sendInteractiveButtonMessage).mock.calls.length;

    expect(count2).toBeGreaterThan(count1);
  });
});

// ---------------------------------------------------------------------------
// 8. Text & Button Reply Flow
// ---------------------------------------------------------------------------
describe('8. Text & Button Message Reply Flow', () => {
  it('should send an interactive button greeting to a new user on first message', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 60));

    const btnCalled = vi.mocked(sendInteractiveButtonMessage).mock.calls.length > 0;
    const txtCalled = vi.mocked(sendTextMessage).mock.calls.length > 0;
    expect(btnCalled || txtCalled).toBe(true);

    if (btnCalled) {
      const [to, text, buttons] = vi.mocked(sendInteractiveButtonMessage).mock.calls[0];
      expect(to).toBe('919876543210');
      expect(text).toBeTruthy();
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.length).toBeLessThanOrEqual(3);
    }
  });

  it('should process interactive button tap and advance FSM', async () => {
    handleWhatsAppWebhook(SAMPLE_INTERACTIVE_BUTTON_PAYLOAD);
    await new Promise((r) => setTimeout(r, 60));

    const btnCalled = vi.mocked(sendInteractiveButtonMessage).mock.calls.length > 0;
    const txtCalled = vi.mocked(sendTextMessage).mock.calls.length > 0;
    expect(btnCalled || txtCalled).toBe(true);
  });

  it('should not reply if WhatsApp is not configured', async () => {
    vi.mocked(isWhatsAppConfigured).mockReturnValue(false);

    const payload = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.nocfg_001';

    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 50));

    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(sendInteractiveButtonMessage).not.toHaveBeenCalled();
  });

  it('should send reply to correct recipient phone number', async () => {
    handleWhatsAppWebhook(SAMPLE_TEXT_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));

    const textCalls = vi.mocked(sendTextMessage).mock.calls;
    const btnCalls = vi.mocked(sendInteractiveButtonMessage).mock.calls;

    const allRecipientCalls = [...textCalls.map((c) => c[0]), ...btnCalls.map((c) => c[0])];
    expect(allRecipientCalls.length).toBeGreaterThan(0);
    for (const to of allRecipientCalls) {
      expect(to).toBe('919876543210');
    }
  });

  it('should handle status update payloads without sending any reply', async () => {
    handleWhatsAppWebhook(SAMPLE_STATUS_UPDATE_PAYLOAD);
    await new Promise((r) => setTimeout(r, 50));
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(sendInteractiveButtonMessage).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 9. Audio Message Parsing
// ---------------------------------------------------------------------------
describe('9. Audio message handling', () => {
  it('should attempt to get media URL for an audio message', async () => {
    const payload = JSON.parse(JSON.stringify(SAMPLE_AUDIO_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.audio_test_url_001';
    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 80));

    expect(getMediaUrl).toHaveBeenCalledWith('media_id_abc123');
  });

  it('should attempt to download audio binary after getting URL', async () => {
    const payload = JSON.parse(JSON.stringify(SAMPLE_AUDIO_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.audio_test_dl_001';
    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 80));

    expect(downloadMedia).toHaveBeenCalled();
  });

  it('should process audio message and deliver voice reply + companion buttons/text', async () => {
    const payload = JSON.parse(JSON.stringify(SAMPLE_AUDIO_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.audio_test_reply_001';
    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 120));

    const audioCalled = vi.mocked(sendAudioMessage).mock.calls.length > 0;
    const buttonCalled = vi.mocked(sendInteractiveButtonMessage).mock.calls.length > 0;
    const textCalled = vi.mocked(sendTextMessage).mock.calls.length > 0;

    expect(audioCalled).toBe(true);
    expect(buttonCalled || textCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. Unsupported Message Types
// ---------------------------------------------------------------------------
describe('10. Unsupported message type handling', () => {
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
// 11. Missing Environment Variables
// ---------------------------------------------------------------------------
describe('11. Missing env variables — graceful fallback', () => {
  it('handleWhatsAppWebhook should not throw when WhatsApp not configured', async () => {
    vi.mocked(isWhatsAppConfigured).mockReturnValue(false);

    const payload = JSON.parse(JSON.stringify(SAMPLE_TEXT_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.noenv_001';

    expect(() => handleWhatsAppWebhook(payload)).not.toThrow();
    await new Promise((r) => setTimeout(r, 50));
  });
});

// ---------------------------------------------------------------------------
// 12. Session Management
// ---------------------------------------------------------------------------
describe('12. Session management', () => {
  it('should create a new session for a new sender', async () => {
    _resetSessionStore();
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

    expect(getWhatsAppSessionCount()).toBe(1);
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

// ---------------------------------------------------------------------------
// 13. Voice Note Pipeline & Dashboard Call Session Sync
// ---------------------------------------------------------------------------
describe('13. Voice Note Pipeline & Dashboard Sync', () => {
  it('should execute full voice-note STT -> NLU -> FSM -> TTS -> sendAudioMessage flow', async () => {
    const payload = JSON.parse(JSON.stringify(SAMPLE_AUDIO_PAYLOAD));
    payload.entry[0].changes[0].value.messages[0].id = 'wamid.voice_flow_001';

    handleWhatsAppWebhook(payload);
    await new Promise((r) => setTimeout(r, 120));

    expect(getMediaUrl).toHaveBeenCalledWith('media_id_abc123');
    expect(downloadMedia).toHaveBeenCalledWith('https://example.com/media/fake-audio.ogg');

    const audioCalled = vi.mocked(sendAudioMessage).mock.calls.length > 0;
    const buttonCalled = vi.mocked(sendInteractiveButtonMessage).mock.calls.length > 0;
    const textCalled = vi.mocked(sendTextMessage).mock.calls.length > 0;

    expect(audioCalled).toBe(true);
    expect(buttonCalled || textCalled).toBe(true);
  });
});
