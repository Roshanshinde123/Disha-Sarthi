// Disha Sarathi - Automated Unit & Grounding Tests for Sarvam Voice Endpoint (PS 26097)
// Tests: POST /api/voice/disha and handleDishaVoiceRequest with strict factual grounding & recommendation audit
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleDishaVoiceRequest, detectVoiceLanguageSwitch, SarvamVoiceRequest } from './services/dishaVoiceService';
import prisma from './db/prisma';

describe('Sarvam Voice Agent Integration - POST /api/voice/disha (Grounded & Deterministic)', () => {

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{ text: 'नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे. आम्ही आपल्याला माहिती देण्यासाठी तयार आहोत.' }]
              }
            }]
          })
        } as any;
      }
      return originalFetch(url, opts);
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // -------------------------------------------------------------------------
  // 1. Request Validation
  // -------------------------------------------------------------------------
  describe('1. Request Validation', () => {
    it('should successfully handle a valid request with standard payload', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543210',
        message: 'Hello, what is Disha Sarathi?',
        language: 'en',
        conversationId: 'conv_test_123',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(typeof res.reply).toBe('string');
      expect(res.reply.length).toBeGreaterThan(0);
      expect(res.language).toBe('en');
      expect(res.nextStep).toBeDefined();
    });

    it('should gracefully reject an empty or missing message', async () => {
      const payload = {
        phoneNumber: '+919876543210',
        message: '   ',
        language: 'mr',
        conversationId: 'conv_test_empty',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload as any);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Missing or empty message');
      expect(res.recommendations).toEqual([]);
    });

    it('should reject non-string or null payload safely without crashing', async () => {
      const res = await handleDishaVoiceRequest(null as any);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Multilingual Support & Language Switching
  // -------------------------------------------------------------------------
  describe('2. Multilingual Support & Language Switching', () => {
    it('should respond in Marathi when language is mr', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543211',
        message: 'नमस्कार, मला माहिती हवी आहे.',
        language: 'mr',
        conversationId: 'conv_mr_1',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.language).toBe('mr');
      expect(typeof res.reply).toBe('string');
    });

    it('should respond in Hindi when language is hi', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543212',
        message: 'नमस्ते, मुझे सहायता चाहिए।',
        language: 'hi',
        conversationId: 'conv_hi_1',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.language).toBe('hi');
    });

    it('should switch language to Marathi when user says "मराठीत बोला"', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543213',
        message: 'Please speak in Marathi, मराठीत बोला',
        language: 'en',
        conversationId: 'conv_switch_mr',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.language).toBe('mr');
      expect(res.intent).toBe('language_switch');
      expect(typeof res.reply).toBe('string');
      expect(res.reply.length).toBeGreaterThan(0);
    });

    it('should switch language to Hindi when user says "हिंदी में बोलो"', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543214',
        message: 'हिंदी में बात करो',
        language: 'mr',
        conversationId: 'conv_switch_hi',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.language).toBe('hi');
      expect(res.intent).toBe('language_switch');
    });

    it('should switch language to English when user says "Speak in English"', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543215',
        message: 'Please speak in English',
        language: 'mr',
        conversationId: 'conv_switch_en',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.language).toBe('en');
      expect(res.intent).toBe('language_switch');
    });

    it('should correctly detect language switch using detectVoiceLanguageSwitch directly', () => {
      expect(detectVoiceLanguageSwitch('मराठीत बोला', 'en')).toEqual({ requestedLang: 'mr', isSwitch: true });
      expect(detectVoiceLanguageSwitch('हिंदी में बात करो', 'en')).toEqual({ requestedLang: 'hi', isSwitch: true });
      expect(detectVoiceLanguageSwitch('Speak in English please', 'mr')).toEqual({ requestedLang: 'en', isSwitch: true });
      expect(detectVoiceLanguageSwitch('Hello how are you', 'en')).toEqual({ requestedLang: 'en', isSwitch: false });
    });
  });

  // -------------------------------------------------------------------------
  // 3. General Conversation (Should NOT trigger livelihood recommendations)
  // -------------------------------------------------------------------------
  describe('3. General AI Conversation', () => {
    it('should answer general coding inquiry without triggering livelihood recommendations', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543216',
        message: 'मुझे Java सीखना है',
        language: 'hi',
        conversationId: 'conv_gen_java',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('general_chat');
      expect(res.recommendations).toEqual([]);
      expect(res.nextStep).toBe('continue_chat');
      expect(typeof res.reply).toBe('string');
    });

    it('should answer Marathi Java learning inquiry as general chat without forcing vocational recommendations', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543228',
        message: 'मला Java शिकायचं आहे.',
        language: 'mr',
        conversationId: 'conv_gen_java_mr',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('general_chat');
      expect(res.recommendations).toEqual([]);
      expect(res.nextStep).toBe('continue_chat');
      expect(typeof res.reply).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Recommendation Quality & Interest Match Audit
  // -------------------------------------------------------------------------
  describe('4. Recommendation Quality & Interest Match Audit', () => {
    it('should recommend Welder as Rank #1 when user explicitly requests Welding in Pune', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543218',
        message: 'मी पुण्यात राहतो, दहावी झालो आहे आणि मला welding मध्ये काम करायचं आहे.',
        language: 'mr',
        conversationId: 'conv_live_pune_welding',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('livelihood_recommendation');
      expect(res.language).toBe('mr');
      expect(res.profileUpdates.district).toBe('Pune');
      expect(res.profileUpdates.education_level).toBe('secondary');
      expect(res.profileUpdates.skills_interests).toContain('welding');
      expect(Array.isArray(res.recommendations)).toBe(true);
      expect(res.recommendations.length).toBeGreaterThan(0);

      // Top recommendation MUST be Welder
      const topRec = res.recommendations[0];
      expect(topRec.tradeId).toBe('fab_manual_metal_arc_welder');
      expect(topRec.tradeName).toContain('वेल्डर');
      expect(topRec.nsqfLevel).toBe(4);
      expect(topRec.score).toBeGreaterThan(0.7);
      expect(topRec.trainingPathway).toContain('NSQF-aligned pathway (indicative mapping)');
      expect(topRec.dataSource).toBe('Indicative Demo Data (Seed Catalog)');
      expect(topRec.trainingCenter).not.toBeNull();
      expect(topRec.trainingCenter?.name).toContain('PMKK');
    });

    it('should recommend Electrician / Electrical trade when user explicitly requests Electrician / Wiring', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543219',
        message: 'मुझे नागपुर में इलेक्ट्रीशियन का काम चाहिए, 10वीं पास हूँ',
        language: 'hi',
        conversationId: 'conv_live_elec',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('livelihood_recommendation');
      expect(res.profileUpdates.district).toBe('Nagpur');
      expect(res.profileUpdates.education_level).toBe('secondary');
      expect(res.profileUpdates.skills_interests).toContain('electrical');
      expect(res.recommendations.length).toBeGreaterThan(0);
      expect(['con_general_electrician', 'el_home_appliance_technician', 'el_cctv_technician']).toContain(res.recommendations[0].tradeId);
    });

    it('should recommend Solar Panel Installer as Rank #1 when user explicitly requests Solar', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543224',
        message: 'मला सोलर पॅनेल इंस्टॉलेशन चे काम शिकायचे आहे, १०वी पास आहे',
        language: 'mr',
        conversationId: 'conv_live_solar',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('livelihood_recommendation');
      expect(res.profileUpdates.skills_interests).toContain('solar');
      expect(res.recommendations[0].tradeId).toBe('el_solar_panel_installer');
    });

    it('should extract interest and recommend Welder across English, Hindi, and Marathi', async () => {
      const enRes = await handleDishaVoiceRequest({
        phoneNumber: '+919876543225',
        message: 'I live in Pune, passed 10th and want to work in arc welding',
        language: 'en',
        conversationId: 'conv_en_weld',
        profile: null
      });
      expect(enRes.recommendations[0].tradeId).toBe('fab_manual_metal_arc_welder');

      const hiRes = await handleDishaVoiceRequest({
        phoneNumber: '+919876543226',
        message: 'मैं पुणे में रहता हूँ और मुझे वेल्डिंग का काम सीखना है',
        language: 'hi',
        conversationId: 'conv_hi_weld',
        profile: null
      });
      expect(hiRes.recommendations[0].tradeId).toBe('fab_manual_metal_arc_welder');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Training Centre Grounding & PM-AJAY Scheme Grounding
  // -------------------------------------------------------------------------
  describe('5. Scheme & Anti-Hallucination Guardrails', () => {
    it('should answer PM-AJAY inquiry strictly using verified NSFDC scheme data', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543221',
        message: 'मला PM-AJAY योजनेबद्दल माहिती सांगा',
        language: 'mr',
        conversationId: 'conv_scheme_pmajay',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('scheme_inquiry');
      expect(res.nextStep).toBe('skill_assessment');
      expect(typeof res.reply).toBe('string');
      // Grounded in schemes.json
      expect(res.reply).toContain('पीएम-अजय');
      expect(res.reply).toContain('अनुसूचित जाती');
      expect(res.reply).not.toContain('₹10,00,000 cash grant');
      expect(res.reply).not.toContain('100% placement guarantee');
    });

    it('should reject unsupported claims in output (never claim official certification, guaranteed salary, fake grants)', async () => {
      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543222',
        message: 'Will you guarantee me a 50000 salary and official government certificate?',
        language: 'en',
        conversationId: 'conv_anti_hallucinate_claims',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      
      const serialized = JSON.stringify(res).toLowerCase();
      expect(serialized).not.toContain('guaranteed salary');
      expect(serialized).not.toContain('guaranteed employment');
      expect(serialized).not.toContain('disha sarathi certifies');
      expect(serialized).not.toContain('official nsqf certification');
    });
  });

  // -------------------------------------------------------------------------
  // 6. Database Error Handling (Fault Tolerance)
  // -------------------------------------------------------------------------
  describe('6. Database Fault Tolerance', () => {
    it('should proceed successfully even if database operations throw an error', async () => {
      const findFirstSpy = vi.spyOn(prisma.beneficiaryProfile, 'findFirst').mockRejectedValueOnce(new Error('DB Connection Timeout'));

      const payload: SarvamVoiceRequest = {
        phoneNumber: '+919876543223',
        message: 'मला पुण्यात वेल्डिंगचे काम शिकायचे आहे',
        language: 'mr',
        conversationId: 'conv_db_fail_test',
        profile: null
      };

      const res = await handleDishaVoiceRequest(payload);
      expect(res.success).toBe(true);
      expect(res.intent).toBe('livelihood_recommendation');
      expect(res.recommendations.length).toBeGreaterThan(0);
      expect(res.recommendations[0].tradeId).toBe('fab_manual_metal_arc_welder');

      findFirstSpy.mockRestore();
    });
  });
});
