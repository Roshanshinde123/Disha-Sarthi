// Disha Sarathi - WhatsApp Handler Comprehensive Unit Tests (PS 26097)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseWebhookPayload,
  handleWhatsAppWebhook,
  getWhatsAppSessionCount,
  getInteractiveButtonsForState,
  getRecommendationButtons,
  formatRecommendationsMessage,
  formatVoiceRecommendationSummary,
  formatCenterDetailsMessage,
  normalizeUserInput,
  _resetDeduplicationStore,
  _resetSessionStore,
  _setSessionForTesting,
  type WaTextMessage,
  type WaAudioMessage,
  type WaInteractiveMessage
} from './whatsappHandler';
import { ConversationState, LanguageCode, Session } from '../core/types';

// ---------------------------------------------------------------------------
// Mock WhatsApp, STT, and TTS services so tests are deterministic and fast
// ---------------------------------------------------------------------------
vi.mock('./services/whatsapp', () => ({
  sendTextMessage: vi.fn().mockResolvedValue(undefined),
  sendAudioMessage: vi.fn().mockResolvedValue(undefined),
  sendInteractiveButtonMessage: vi.fn().mockResolvedValue(undefined),
  sendLocationMessage: vi.fn().mockResolvedValue(undefined),
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
  sendLocationMessage,
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

// ---------------------------------------------------------------------------
// 14. Explainable Recommendations & Nearest Center WhatsApp Delivery (PS 26097)
// ---------------------------------------------------------------------------
describe('14. Explainable NSQF Recommendations & Nearest Center WhatsApp Delivery', () => {
  const mockRecSession: Session = {
    id: 'sess_wa_test_rec_01',
    ref_code: 'PMAJAY-WA-0001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lang: 'mr',
    state: 'RECOMMENDATION',
    profile: {
      district: 'Pune',
      education_level: 'secondary',
      skills_interests: ['electrical'],
      constraints: [],
      placement_status: 'NOT_STARTED',
      summary_confirmed: true,
      skill_gap_generated: true,
      profile_completed: true,
      selected_trade_id: 'el_asst_electrician'
    },
    recommendations: [
      {
        trade: {
          id: 'el_asst_electrician',
          name_en: 'Assistant Electrician (Construction / Domestic)',
          name_local: {
            mr: 'सहाय्यक इलेक्ट्रिशियन (इमारत व घरगुती)',
            hi: 'सहायक इलेक्ट्रीशियन'
          },
          sector: 'Construction',
          ssc: 'Construction Skill Development Council of India',
          nsqf_level: 3,
          qp_code: 'CON/Q0602',
          typical_wage_band_inr: '14,000 - 22,000 / month',
          duration_hours: 400,
          self_employment_viable: true,
          min_education: 'secondary',
          interest_tags: ['electrical', 'wiring'],
          related_occupations: ['electrician'],
          physical_demands: ['standing'],
          scheme_links: ['nsfdc', 'pm_svanidhi']
        },
        score: 0.95,
        rank: 1,
        rationale: 'तुमची "electrical" मधील आवड आणि अनुभवावर आधारित हा एनएसक्यूएफ स्तर 3 कोर्स सर्वाधिक उपयुक्त आहे.',
        skill_gap: {
          trade_id: 'el_asst_electrician',
          trade_name: 'Assistant Electrician',
          matched_skills: ['Basic Wiring', 'Safety Equipment'],
          missing_skills: ['Conduit Installation'],
          training_required_skills: ['Circuit Diagnostics & Multimeter Use', 'Conduit Installation'],
          severity: 'low',
          recommended_intervention: 'Fast-track certification'
        },
        nearest_center: {
          center: {
            id: 'tc_mh_pune_01',
            name: 'Industrial Training Institute (ITI) Aundh',
            district: 'Pune',
            state: 'Maharashtra',
            lat: 18.558,
            lng: 73.807,
            trades_offered: ['el_asst_electrician'],
            contact_phone: '+91 20 25880001',
            address: 'ITI Road, Aundh, Pune, Maharashtra 411007'
          },
          distance_km: 4.2
        },
        no_center_in_range: false
      },
      {
        trade: {
          id: 'el_solar_panel_installer',
          name_en: 'Solar Panel Installation Technician (Suryamitra)',
          name_local: {
            mr: 'सौर पॅनेल इन्स्टॉलेशन तंत्रज्ञ (सूर्यमित्र)',
            hi: 'सोलर पैनल इंस्टॉलेशन तकनीशियन'
          },
          sector: 'Green Energy',
          ssc: 'Skill Council for Green Jobs',
          nsqf_level: 4,
          qp_code: 'ELE/Q5901',
          typical_wage_band_inr: '16,000 - 32,000 / month',
          duration_hours: 300,
          self_employment_viable: true,
          min_education: 'secondary',
          interest_tags: ['solar', 'electrical'],
          related_occupations: ['technician'],
          physical_demands: ['outdoor_work'],
          scheme_links: ['stand_up_india']
        },
        score: 0.88,
        rank: 2,
        rationale: 'सौर ऊर्जेच्या वाढत्या मागणीमुळे हा कोर्स उत्तम स्वयंरोजगार देतो.',
        skill_gap: {
          trade_id: 'el_solar_panel_installer',
          trade_name: 'Solar Panel Installer',
          matched_skills: ['Basic Electrical'],
          missing_skills: ['Panel Mounting'],
          training_required_skills: ['Panel Mounting', 'Inverter Wiring'],
          severity: 'medium',
          recommended_intervention: 'Standard training'
        },
        nearest_center: {
          center: {
            id: 'tc_mh_pune_02',
            name: 'Maharashtra State Skill Development Center - Hadapsar',
            district: 'Pune',
            state: 'Maharashtra',
            lat: 18.502,
            lng: 73.928,
            trades_offered: ['el_solar_panel_installer'],
            contact_phone: '+91 20 26871020',
            address: 'Magarpatta Road, Hadapsar, Pune, MH - 411028'
          },
          distance_km: 7.8
        },
        no_center_in_range: false
      }
    ],
    transcript: []
  };

  it('formatRecommendationsMessage should generate rich WhatsApp card with trade names, scores, and center', () => {
    const text = formatRecommendationsMessage(mockRecSession);

    // Verify trade names (local & English)
    expect(text).toContain('सहाय्यक इलेक्ट्रिशियन (इमारत व घरगुती)');
    expect(text).toContain('सौर पॅनेल इन्स्टॉलेशन तंत्रज्ञ (सूर्यमित्र)');

    // Verify match score & NSQF level
    expect(text).toContain('95%');
    expect(text).toContain('NSQF Level 3');
    expect(text).toContain('88%');
    expect(text).toContain('NSQF Level 4');

    // Verify explainability rationale
    expect(text).toContain('तुमची "electrical" मधील आवड');

    // Verify key training skills
    expect(text).toContain('Circuit Diagnostics & Multimeter Use');

    // Verify nearest center info & distance
    expect(text).toContain('Industrial Training Institute (ITI) Aundh');
    expect(text).toContain('4.2 km');
  });

  it('formatVoiceRecommendationSummary should generate crisp spoken summary matching /talk', () => {
    const speech = formatVoiceRecommendationSummary(mockRecSession);
    expect(speech).toContain('सहाय्यक इलेक्ट्रिशियन (इमारत व घरगुती)');
    expect(speech).toContain('तुमची "electrical" मधील आवड');
    expect(speech).toContain('Circuit Diagnostics & Multimeter Use');
  });

  it('formatCenterDetailsMessage should include center name, address, distance and phone', () => {
    const center = mockRecSession.recommendations![0].nearest_center!.center;
    const msg = formatCenterDetailsMessage(center, 4.2, 'सहाय्यक इलेक्ट्रिशियन', 'mr');

    expect(msg).toContain('Industrial Training Institute (ITI) Aundh');
    expect(msg).toContain('ITI Road, Aundh, Pune, Maharashtra 411007');
    expect(msg).toContain('4.2 किमी');
    expect(msg).toContain('+91 20 25880001');
    expect(msg).toContain('सहाय्यक इलेक्ट्रिशियन');
  });

  it('getRecommendationButtons should return <= 3 buttons <= 20 chars with trade names', () => {
    const buttons = getRecommendationButtons(mockRecSession.recommendations, 'mr');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].id).toBe('select_1');
    expect(buttons[1].id).toBe('select_2');

    for (const btn of buttons) {
      expect(btn.title.length).toBeLessThanOrEqual(20);
      expect(btn.id).toBeTruthy();
    }
  });

  it('normalizeUserInput should cleanly normalize user inputs for recommendation & center states', () => {
    expect(normalizeUserInput('RECOMMENDATION', '1')).toBe('select_1');
    expect(normalizeUserInput('RECOMMENDATION', '१')).toBe('select_1');
    expect(normalizeUserInput('RECOMMENDATION', 'select 1')).toBe('select_1');
    expect(normalizeUserInput('RECOMMENDATION', '2')).toBe('select_2');
    expect(normalizeUserInput('RECOMMENDATION', '३')).toBe('select_3');

    expect(normalizeUserInput('CENTER_AND_NEXT_STEPS', 'होय')).toBe('yes_finance');
    expect(normalizeUserInput('CENTER_AND_NEXT_STEPS', 'कर्ज योजना')).toBe('yes_finance');
    expect(normalizeUserInput('CENTER_AND_NEXT_STEPS', 'loan scheme')).toBe('yes_finance');
    expect(normalizeUserInput('CENTER_AND_NEXT_STEPS', 'नाही')).toBe('no_finance');
    expect(normalizeUserInput('CENTER_AND_NEXT_STEPS', 'आकांक्षा कार्ड')).toBe('no_finance');
  });

  it('delivers rich recommendations, selection buttons, center details, and location pin upon CONFIRM_SUMMARY transition', async () => {
    vi.mocked(sendTextMessage).mockClear();
    vi.mocked(sendInteractiveButtonMessage).mockClear();
    vi.mocked(sendLocationMessage).mockClear();

    const sender = '919309276044';
    _resetSessionStore();

    // Set up session directly in CONFIRM_SUMMARY state with complete profile
    const setupSession: Session = {
      id: 'sess_wa_9309276044',
      ref_code: 'PMAJAY-WA-6044',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lang: 'mr',
      state: 'CONFIRM_SUMMARY',
      profile: {
        district: 'Pune',
        district_name_local: 'पुणे',
        education_level: 'secondary',
        skills_interests: ['electrical'],
        constraints: [],
        placement_status: 'NOT_STARTED',
        summary_confirmed: false,
        skill_gap_generated: false,
        profile_completed: false
      },
      transcript: []
    };
    _setSessionForTesting(sender, setupSession);

    // User confirms profile summary ("माहिती बरोबर आहे" / "होय")
    const confirmSummaryPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            contacts: [{ profile: { name: 'Pradeep' }, wa_id: sender }],
            messages: [{
              from: sender,
              id: 'wamid.rec_flow_06',
              type: 'interactive',
              interactive: { type: 'button_reply', button_reply: { id: 'होय', title: 'माहिती बरोबर आहे' } }
            }]
          }
        }]
      }]
    };

    handleWhatsAppWebhook(confirmSummaryPayload);
    await new Promise((r) => setTimeout(r, 80));

    // VERIFY:
    // 1. sendTextMessage called with formatted recommendations (contains trade names & match scores)
    const textCalls = vi.mocked(sendTextMessage).mock.calls;
    expect(textCalls.length).toBeGreaterThanOrEqual(2); // Recs card text + Center details text
    const recCall = textCalls.find((c) => c[1].includes('शीर्ष ३ NSQF कौशल्य शिफारसी') || c[1].includes('Assistant Electrician') || c[1].includes('इलेक्ट्रिशियन'));
    expect(recCall).toBeDefined();

    // 2. sendInteractiveButtonMessage called with trade selection buttons
    expect(sendInteractiveButtonMessage).toHaveBeenCalled();
    const buttonCalls = vi.mocked(sendInteractiveButtonMessage).mock.calls;
    const recButtonCall = buttonCalls.find((c) => c[2].some((b) => b.id === 'select_1'));
    expect(recButtonCall).toBeDefined();
    expect(recButtonCall![2][0].id).toBe('select_1');

    // 3. Nearest training center details message sent
    const centerCall = textCalls.find((c) => c[1].includes('अधिकृत कौशल्य प्रशिक्षण केंद्र') || c[1].includes('Industrial Training Institute') || c[1].includes('ITI'));
    expect(centerCall).toBeDefined();

    // 4. WhatsApp Location Pin sent with coordinates
    expect(sendLocationMessage).toHaveBeenCalled();
    const locationCall = vi.mocked(sendLocationMessage).mock.calls[0];
    expect(locationCall[0]).toBe(sender);
    expect(locationCall[1]).toBeCloseTo(18.5, 0.5); // Pune latitude
    expect(locationCall[2]).toBeCloseTo(73.8, 0.5); // Pune longitude
    expect(locationCall[3]).toContain('Pune');
  });

  it('delivers training center details and location pin in CENTER_AND_NEXT_STEPS state', async () => {
    vi.mocked(sendTextMessage).mockClear();
    vi.mocked(sendInteractiveButtonMessage).mockClear();
    vi.mocked(sendLocationMessage).mockClear();

    const sender = '919309276044';
    _resetSessionStore();

    // Set up session in LOCAL_OPPORTUNITY state; input advances to CENTER_AND_NEXT_STEPS
    const setupSession: Session = {
      ...mockRecSession,
      id: 'sess_wa_9309276044',
      state: 'LOCAL_OPPORTUNITY'
    };
    _setSessionForTesting(sender, setupSession);

    const stepPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            contacts: [{ profile: { name: 'Pradeep' }, wa_id: sender }],
            messages: [{
              from: sender,
              id: 'wamid.center_steps_01',
              type: 'text',
              text: { body: 'केंद्र कुठे आहे?' }
            }]
          }
        }]
      }]
    };

    handleWhatsAppWebhook(stepPayload);
    await new Promise((r) => setTimeout(r, 80));

    // Center details text message sent
    const textCalls = vi.mocked(sendTextMessage).mock.calls;
    const centerCall = textCalls.find((c) => c[1].includes('अधिकृत कौशल्य प्रशिक्षण केंद्र') || c[1].includes('प्रशिक्षण केंद्र') || c[1].includes('PMKK') || c[1].includes('Industrial Training Institute'));
    expect(centerCall).toBeDefined();

    // Location message sent
    expect(sendLocationMessage).toHaveBeenCalled();

    // Interactive buttons sent for finance / next steps
    expect(sendInteractiveButtonMessage).toHaveBeenCalled();
    const buttonCalls = vi.mocked(sendInteractiveButtonMessage).mock.calls;
    expect(buttonCalls[0][2].some((b) => b.id === 'yes_finance')).toBe(true);
  });
});
