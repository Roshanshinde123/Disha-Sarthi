// Disha Sarathi - WhatsApp Webhook Handler & Voice-Note Bridge (PS 26097)
// Connects Meta WhatsApp Cloud API webhooks to the Disha Sarathi conversation engine.
// SERVER-SIDE ONLY — never import this from Vite/React client code.

import { createHash } from 'crypto';
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';
import { extractAllProfileSlots } from '../core/nlu';
import { recommendNSQFTrades } from '../core/recommender';
import { LanguageCode, Session, ConversationEvent, ConversationState } from '../core/types';
import { getSTTProvider } from './sttProvider';
import { getTTSProvider } from './ttsProvider';
import {
  sendTextMessage,
  sendAudioMessage,
  sendInteractiveButtonMessage,
  WhatsAppReplyButton,
  getMediaUrl,
  downloadMedia,
  markMessageRead,
  senderLogTag,
  isWhatsAppConfigured
} from './services/whatsapp';
import { registerVoicebotCallSession } from './exotelVoicebot';
import { saveCurrentSession } from '../core/store';
import prisma from './db/prisma';
import type { VoicebotCallSession } from './voicebotTypes';

// ---------------------------------------------------------------------------
// Structured Telemetry Logger — guaranteed safe, never logs raw tokens/secrets
// ---------------------------------------------------------------------------
function log(tag: string, msg: string, extra?: Record<string, unknown>): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    channel: 'WHATSAPP',
    event: tag,
    ...extra
  };
  console.log(`[WHATSAPP] ${tag}: ${msg}`, JSON.stringify(entry));
}

function logWarn(tag: string, msg: string, extra?: Record<string, unknown>): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    channel: 'WHATSAPP',
    event: tag,
    ...extra
  };
  console.warn(`[WHATSAPP] ${tag}: ${msg}`, JSON.stringify(entry));
}

// ---------------------------------------------------------------------------
// Deduplication Store (bounded cache to handle Meta delivery retries)
// ---------------------------------------------------------------------------
const MAX_DEDUP_SIZE = 10_000;
const processedMessageIds = new Set<string>();
const processedMessageIdOrder: string[] = [];

function isDuplicate(msgId: string): boolean {
  return processedMessageIds.has(msgId);
}

function markProcessed(msgId: string): void {
  if (processedMessageIds.has(msgId)) return;
  if (processedMessageIds.size >= MAX_DEDUP_SIZE) {
    const oldest = processedMessageIdOrder.shift();
    if (oldest) processedMessageIds.delete(oldest);
  }
  processedMessageIds.add(msgId);
  processedMessageIdOrder.push(msgId);
}

// ---------------------------------------------------------------------------
// Session Store — keyed by hashed WhatsApp sender ID (wa_id)
// ---------------------------------------------------------------------------
const sessionStore = new Map<string, Session>();

function sessionKey(waId: string): string {
  return createHash('sha256').update(waId).digest('hex').slice(0, 32);
}

function getOrCreateSession(waId: string, detectedLang: LanguageCode = 'mr'): {
  session: Session;
  isNew: boolean;
} {
  const key = sessionKey(waId);
  const existing = sessionStore.get(key);
  if (existing) return { session: existing, isNew: false };

  const session = createInitialSession(detectedLang);
  const cleanDigits = waId.replace(/[^0-9]/g, '');
  const last10 = cleanDigits.slice(-10) || cleanDigits;
  const last4 = cleanDigits.slice(-4) || '0000';

  session.id = `sess_wa_${last10}`;
  session.ref_code = `PMAJAY-WA-${last4}`;
  (session as any).channel = 'WHATSAPP';
  session.profile.phone_number = waId.startsWith('+') ? waId : `+${waId}`;
  session.profile.name = session.profile.name || `Beneficiary (+${last10})`;

  sessionStore.set(key, session);
  return { session, isNew: true };
}

/**
 * Persists session to database and synchronizes with central store & dashboard lists
 */
async function syncSession(waId: string, session: Session, msgId?: string): Promise<void> {
  const key = sessionKey(waId);
  sessionStore.set(key, session);

  // 1. IndexedDB / memory store sync for web application
  try {
    await saveCurrentSession(session);
  } catch (err) {
    // Non-fatal store sync
  }

  // 2. Database persistence via Prisma (if configured)
  try {
    if (prisma && prisma.beneficiaryProfile) {
      const phone = waId.startsWith('+') ? waId : `+${waId}`;
      const p = session.profile;

      let existing = await prisma.beneficiaryProfile.findFirst({
        where: {
          OR: [
            { phone },
            ...(session.ref_code ? [{ refCode: session.ref_code }] : [])
          ]
        }
      }).catch(() => null);

      const dbData = {
        phone,
        language: session.lang,
        district: p.district || existing?.district || null,
        educationLevel: p.education_level || existing?.educationLevel || null,
        familyOccupation: p.family_occupation || existing?.familyOccupation || null,
        currentLivelihood: p.current_livelihood || existing?.currentLivelihood || null,
        skillsInterests: (p.skills_interests && p.skills_interests.length > 0) ? p.skills_interests : (existing?.skillsInterests || []),
        employmentPreference: p.employment_preference || existing?.employmentPreference || null,
        travelRadiusKm: p.travel_radius_km || existing?.travelRadiusKm || null,
        experienceYears: p.experience_years !== undefined ? p.experience_years : (existing?.experienceYears ?? null),
        profileCompleted: Boolean(p.district && p.education_level && p.skills_interests?.length),
        summaryConfirmed: Boolean(p.summary_confirmed)
      };

      if (existing) {
        await prisma.beneficiaryProfile.update({
          where: { id: existing.id },
          data: dbData
        }).catch(() => null);
      } else {
        await prisma.beneficiaryProfile.create({
          data: {
            ...dbData,
            refCode: session.ref_code || `PMAJAY-WA-${waId.slice(-4)}_${Date.now().toString(36)}`
          }
        }).catch(() => null);
      }

      if (session.id && prisma.session) {
        const convSession = await prisma.session.findFirst({
          where: { id: session.id }
        }).catch(() => null);

        const transcriptJson = (session.transcript || []).map((t) => ({
          sender: t.sender,
          text: t.text,
          timestamp: t.timestamp
        }));

        if (convSession) {
          await prisma.session.update({
            where: { id: convSession.id },
            data: {
              transcript: transcriptJson,
              state: session.state,
              recommendations: session.recommendations ? (session.recommendations as any) : [],
              updatedAt: new Date()
            }
          }).catch(() => null);
        } else {
          await prisma.session.create({
            data: {
              id: session.id,
              refCode: session.ref_code,
              lang: session.lang,
              state: session.state,
              transcript: transcriptJson,
              recommendations: session.recommendations ? (session.recommendations as any) : []
            }
          }).catch(() => null);
        }
      }
    }
  } catch (dbErr) {
    // Non-fatal database persistence error
  }

  // 3. Register to Call Sessions list for Admin/Coordinator dashboard
  try {
    const phoneFormatted = waId.startsWith('+') ? waId : `+${waId}`;
    const p = session.profile;
    const callRecord: VoicebotCallSession = {
      id: `wa_${msgId || Date.now()}`,
      beneficiaryId: session.id,
      conversationId: session.id,
      callSid: `wa_${msgId || Date.now()}`,
      streamSid: `wa_stream_${key.slice(0, 12)}`,
      callerNumber: phoneFormatted,
      virtualNumber: process.env.WHATSAPP_PHONE_NUMBER_ID || 'WhatsApp-Cloud-API',
      startedAt: session.created_at || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: Math.max(5, (session.transcript?.length || 1) * 6),
      language: session.lang,
      channel: 'WHATSAPP',
      status: 'COMPLETED',
      verifiedProfile: {
        education: p.education_level ? {
          value: p.education_level,
          confidence: 1.0,
          source: 'WHATSAPP',
          verificationStatus: 'BENEFICIARY_CONFIRMED',
          timestamp: new Date().toISOString()
        } : undefined,
        location: p.district ? {
          value: { district: p.district, state: p.state || 'Maharashtra' },
          confidence: 1.0,
          source: 'WHATSAPP',
          verificationStatus: 'BENEFICIARY_CONFIRMED',
          timestamp: new Date().toISOString()
        } : undefined,
        interests: p.skills_interests?.length ? {
          value: p.skills_interests,
          confidence: 1.0,
          source: 'WHATSAPP',
          verificationStatus: 'BENEFICIARY_CONFIRMED',
          timestamp: new Date().toISOString()
        } : undefined
      },
      session,
      transcript: (session.transcript || []).map((t) => ({
        speaker: (t.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        text: t.text,
        timestamp: t.timestamp
      }))
    };

    registerVoicebotCallSession(callRecord);
  } catch (dashErr) {
    // Non-fatal dashboard registration error
  }
}

function saveSession(waId: string, session: Session, msgId?: string): void {
  syncSession(waId, session, msgId).catch(() => {});
}

/** Exported for diagnostics/testing */
export function getWhatsAppSessionCount(): number {
  return sessionStore.size;
}

/** Exported for test reset */
export function _resetDeduplicationStore(): void {
  processedMessageIds.clear();
  processedMessageIdOrder.length = 0;
}

/** Exported for test reset */
export function _resetSessionStore(): void {
  sessionStore.clear();
}

// ---------------------------------------------------------------------------
// Language Detection from text
// ---------------------------------------------------------------------------
function detectLanguage(text: string): LanguageCode {
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount === 0 && latinCount > 0) return 'en';

  const marathiMarkers = /ाहे|आहे|माझ|तुमच|आपल|मला|नाही|आणि|किंवा|कारण|होय|नको|नमस्कार/;
  if (marathiMarkers.test(text)) return 'mr';

  if (devanagariCount > 0) return 'mr';
  return 'mr';
}

// ---------------------------------------------------------------------------
// Greeting Messages
// ---------------------------------------------------------------------------
const GREETINGS: Record<LanguageCode, string> = {
  mr: 'नमस्कार! 🙏 मी दिशा सारथी आहे. तुम्हाला रोजगार, कौशल्य किंवा प्रशिक्षणाबाबत मदत हवी आहे का?\n\n(Type "हो" to start / "yes" for English / "हाँ" for Hindi)',
  hi: 'नमस्ते! 🙏 मैं दिशा सारथी हूँ। क्या आपको रोजगार, कौशल्य या प्रशिक्षण के बारे में मदद चाहिए?\n\n("हाँ" बोलें या टाइप करें)',
  en: 'Hello! 🙏 I\'m Disha Sarathi, a PM-AJAY livelihood assistant. Can I help you with employment, skills, or training opportunities?\n\n(Type "yes" to begin)',
  bn: 'নমস্কার! 🙏 আমি দিশা সারথী। আপনি কি কর্মসংস্থান বা दक्षता প্রশিক্ষণের ব্যাপারে সাহায্য চান?',
  ta: 'வணக்கம்! 🙏 நான் திஷா சாரதி. வேலைவாய்ப்பு, திறன் அல்லது பயிற்சி பற்றி உதவி வேண்டுமா?',
  te: 'నమస్కారం! 🙏 నేను దిశా సారథి. ఉపాధి, నైపుణ్యం లేదా శిక్షణ గురించి సహాయం కావాలా?',
  kn: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು ದಿಶಾ ಸಾರಥಿ. ಉದ್ಯೋಗ, ಕೌಶಲ್ಯ ಅಥವಾ ತರಬೇತಿಯ ಬಗ್ಗೆ ಸಹಾಯ ಬೇಕೇ?'
};

// ---------------------------------------------------------------------------
// Interactive Reply Buttons Mapping for States with Fixed Small Choice Sets (<= 3 options)
// Meta WhatsApp Cloud API limit: maximum 3 reply buttons, titles max 20 chars
// ---------------------------------------------------------------------------
export function getInteractiveButtonsForState(
  state: ConversationState,
  lang: LanguageCode = 'mr'
): WhatsAppReplyButton[] | null {
  switch (state) {
    case 'LANG_SELECT':
      return [
        { id: 'mr', title: 'मराठी (Marathi)' },
        { id: 'hi', title: 'हिंदी (Hindi)' },
        { id: 'en', title: 'English' }
      ];

    case 'LANDING':
    case 'GREETING':
      if (lang === 'hi') {
        return [
          { id: 'हाँ, शुरू करें', title: 'हाँ, शुरू करें' },
          { id: 'जानकारी चाहिए', title: 'जानकारी चाहिए' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'yes', title: 'Yes, Start' },
          { id: 'help', title: 'How it works' }
        ];
      }
      return [
        { id: 'होय, सुरू करा', title: 'होय, सुरू करा' },
        { id: 'माहिती हवी आहे', title: 'माहिती हवी आहे' }
      ];

    case 'CONSENT':
      if (lang === 'hi') {
        return [
          { id: 'हाँ, सहमति है', title: 'हाँ, सहमति है' },
          { id: 'नहीं, अभी नहीं', title: 'नहीं, अभी नहीं' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'yes', title: 'Yes, I Agree' },
          { id: 'no', title: 'No, Decline' }
        ];
      }
      return [
        { id: 'होय, संमती आहे', title: 'होय, संमती आहे' },
        { id: 'नाही, नको', title: 'नाही, नको' }
      ];

    case 'EMPLOYMENT_PREFERENCE':
      if (lang === 'hi') {
        return [
          { id: 'wage_employment', title: 'वेतन नौकरी' },
          { id: 'self_employment', title: 'स्वरोजगार' },
          { id: 'both', title: 'दोनों चलेगा' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'wage_employment', title: 'Wage Job' },
          { id: 'self_employment', title: 'Self-Employment' },
          { id: 'both', title: 'Open to Both' }
        ];
      }
      return [
        { id: 'wage_employment', title: 'पगारी नोकरी' },
        { id: 'self_employment', title: 'स्वतःचा व्यवसाय' },
        { id: 'both', title: 'दोन्ही चालेल' }
      ];

    case 'CONFIRM_SUMMARY':
      if (lang === 'hi') {
        return [
          { id: 'हाँ', title: 'जानकारी सही है' },
          { id: 'जानकारी बदलें', title: 'बदलाव करना है' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'yes', title: 'Confirm Profile' },
          { id: 'edit', title: 'Edit Details' }
        ];
      }
      return [
        { id: 'होय', title: 'माहिती बरोबर आहे' },
        { id: 'माहिती बदलायची आहे', title: 'बदल करायचा आहे' }
      ];

    case 'CENTER_AND_NEXT_STEPS':
      if (lang === 'hi') {
        return [
          { id: 'हाँ', title: 'ऋण योजना जानकारी' },
          { id: 'नहीं', title: 'आकांक्षा कार्ड' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'yes', title: 'Loan Schemes' },
          { id: 'no', title: 'Aspiration Card' }
        ];
      }
      return [
        { id: 'होय', title: 'कर्ज योजना माहिती' },
        { id: 'नाही', title: 'आकांक्षा कार्ड' }
      ];

    case 'FINANCE_TRACK':
      if (lang === 'hi') {
        return [
          { id: 'कार्ड बनाएं', title: 'आकांक्षा कार्ड' },
          { id: 'सलाहकार', title: 'सलाहकार से बात' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'card', title: 'Get Card' },
          { id: 'advisor', title: 'Talk to Advisor' }
        ];
      }
      return [
        { id: 'कार्ड बनवा', title: 'आकांक्षा कार्ड' },
        { id: 'मार्गदर्शक', title: 'मार्गदर्शकाशी बोला' }
      ];

    case 'ASPIRATION_CARD':
      if (lang === 'hi') {
        return [
          { id: 'फीडबैक', title: 'प्रतिक्रिया दें' },
          { id: 'नया सत्र', title: 'नया संवाद' }
        ];
      }
      if (lang === 'en') {
        return [
          { id: 'feedback', title: 'Give Feedback' },
          { id: 'restart', title: 'Start Again' }
        ];
      }
      return [
        { id: 'अभिप्राय', title: 'अभिप्राय नोंदवा' },
        { id: 'नवीन संवाद', title: 'नवीन संवाद' }
      ];

    case 'DECLINED_END':
    case 'DELETED_END':
    case 'END':
      if (lang === 'hi') {
        return [{ id: 'फिर से शुरू करें', title: 'फिर से शुरू करें' }];
      }
      if (lang === 'en') {
        return [{ id: 'restart', title: 'Start Again' }];
      }
      return [{ id: 'पुन्हा सुरू करा', title: 'पुन्हा सुरू करा' }];

    default:
      return null;
  }
}

/**
 * Sends either an Interactive Button message (for states with <= 3 options) or a plain text message.
 */
async function sendTurnTextOrButtons(
  from: string,
  text: string,
  state: ConversationState,
  lang: LanguageCode
): Promise<void> {
  const buttons = getInteractiveButtonsForState(state, lang);
  if (buttons && buttons.length > 0) {
    await sendInteractiveButtonMessage(from, text, buttons);
    log('BUTTONS_REPLY_SENT', 'Interactive reply buttons sent', { state, buttonCount: buttons.length });
  } else {
    await sendTextMessage(from, text);
    log('TEXT_REPLY_SENT', 'Text reply sent', { state });
  }
}

// ---------------------------------------------------------------------------
// Helper: Detects audio container or wraps buffer if needed
// ---------------------------------------------------------------------------
function ensureAudioContainer(buffer: Buffer, _sampleRate: number = 16000): { buffer: Buffer; mimeType: string } {
  if (buffer.length >= 4) {
    const magic = buffer.subarray(0, 4).toString('ascii');
    if (magic === 'OggS') {
      return { buffer, mimeType: 'audio/ogg; codecs=opus' };
    }
    if (magic === 'RIFF') {
      return { buffer, mimeType: 'audio/wav' };
    }
    if (magic.startsWith('ID3') || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)) {
      return { buffer, mimeType: 'audio/mpeg' };
    }
    if (buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0) {
      return { buffer, mimeType: 'audio/aac' };
    }
  }

  return {
    buffer,
    mimeType: 'audio/ogg; codecs=opus'
  };
}

// ---------------------------------------------------------------------------
// Core: Drive conversation step, extract slots, compute recommendations & response text
// ---------------------------------------------------------------------------
function driveConversation(
  session: Session,
  userText: string,
  engine: string
): { updatedSession: Session; responseText: string } {
  // 1. Extract multi-slot profile data from user text
  const slots = extractAllProfileSlots(userText, session.lang);
  let workingSession = { ...session };

  if (slots.slotsCount > 0) {
    const p = { ...workingSession.profile };
    if (slots.slotsFound.district) {
      p.district = slots.slotsFound.district;
      p.district_name_local = slots.slotsFound.district;
      p.state = slots.slotsFound.state || 'Maharashtra';
    }
    if (slots.slotsFound.education_level) p.education_level = slots.slotsFound.education_level;
    if (slots.slotsFound.family_occupation) p.family_occupation = slots.slotsFound.family_occupation;
    if (slots.slotsFound.current_livelihood) p.current_livelihood = slots.slotsFound.current_livelihood;
    if (slots.slotsFound.skills_interests?.length) {
      p.skills_interests = Array.from(new Set([...p.skills_interests, ...slots.slotsFound.skills_interests]));
    }
    if (slots.slotsFound.constraints) p.constraints = slots.slotsFound.constraints;
    if (slots.slotsFound.travel_radius_km) p.travel_radius_km = slots.slotsFound.travel_radius_km;
    if (slots.slotsFound.employment_preference) p.employment_preference = slots.slotsFound.employment_preference;
    workingSession = { ...workingSession, profile: p };
  }

  // 2. Drive FSM Step
  const event: ConversationEvent = {
    type: 'USER_INPUT',
    payload: userText,
    engine
  };

  const { session: nextSession, actions } = step(workingSession, event);

  // 3. Compute deterministic recommendations if core criteria present
  let recommendedSession = { ...nextSession };
  if (
    !recommendedSession.recommendations &&
    recommendedSession.profile.district &&
    recommendedSession.profile.skills_interests.length > 0
  ) {
    const { results, trace } = recommendNSQFTrades(
      recommendedSession.profile,
      recommendedSession.lang,
      recommendedSession.id
    );
    recommendedSession.recommendations = results;
    recommendedSession.trace = trace;
  }

  // 4. Extract response text from speak action or state prompt
  const speakAction = actions.find((a) => a.type === 'speak');
  let responseText = speakAction?.payload?.text || '';

  if (!responseText) {
    if (recommendedSession.recommendations && recommendedSession.recommendations.length > 0) {
      const topRec = recommendedSession.recommendations[0];
      const tradeName = topRec.trade.name_local?.[recommendedSession.lang] || topRec.trade.name_en;
      const centerName = topRec.nearest_center?.center?.name || 'जिल्हा कौशल्य प्रशिक्षण केंद्र';
      responseText =
        recommendedSession.lang === 'mr'
          ? `आपल्या प्रोफाइलनुसार सर्वात योग्य ट्रेड आहे: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। अधिक माहिती आपल्या दिशा सारथी डॅशबोर्डवर उपलब्ध आहे.`
          : `आपकी प्रोफाइल अनुसार सबसे उत्तम ट्रेड है: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। पूरी जानकारी दिशा सारथी डैशबोर्ड पर उपलब्ध है।`;
    } else {
      const promptEntry = getPromptForState(recommendedSession.state, recommendedSession.lang, recommendedSession.profile);
      responseText = promptEntry.prompt;
    }
  }

  return { updatedSession: recommendedSession, responseText };
}

// ---------------------------------------------------------------------------
// Phase 1: Text Message Handler
// ---------------------------------------------------------------------------
async function processTextMessage(
  from: string,
  msgId: string,
  text: string
): Promise<void> {
  const tag = senderLogTag(from);

  if (isDuplicate(msgId)) {
    logWarn('DUPLICATE_SKIPPED', 'Message already processed', { tag, msgId });
    return;
  }
  markProcessed(msgId);

  log('TEXT_RECEIVED', 'Text message received', { tag, textLen: text.length });

  await markMessageRead(msgId).catch(() => {});

  const detectedLang = detectLanguage(text);
  const { session, isNew } = getOrCreateSession(from, detectedLang);

  let activeSession = session;
  if (!isNew && detectedLang !== session.lang && text.length > 3) {
    activeSession = { ...session, lang: detectedLang };
  }

  // Brand-new user: send greeting with language selection interactive buttons
  if (isNew) {
    log('NEW_SESSION', 'New WhatsApp user session created', { tag, lang: detectedLang });
    const greeting = GREETINGS[detectedLang] || GREETINGS.mr;

    const { session: greetedSession } = step(activeSession, {
      type: 'USER_INPUT',
      payload: 'start',
      engine: 'WhatsApp'
    });
    saveSession(from, greetedSession, msgId);

    if (!isWhatsAppConfigured()) {
      logWarn('CONFIG_MISSING', 'WhatsApp not configured — reply skipped', { tag });
      return;
    }

    await sendTurnTextOrButtons(from, greeting, greetedSession.state, detectedLang);
    log('REPLY_SENT', 'Greeting sent to new user', { tag, state: greetedSession.state });
    return;
  }

  // Existing user: drive FSM
  const { updatedSession, responseText } = driveConversation(activeSession, text, 'WhatsApp');
  saveSession(from, updatedSession, msgId);

  log('CONVERSATION_RESPONSE', 'Response generated', {
    tag,
    state: updatedSession.state,
    responseLenChars: responseText.length
  });

  if (!isWhatsAppConfigured()) {
    logWarn('CONFIG_MISSING', 'WhatsApp not configured — reply skipped', { tag });
    return;
  }

  const finalReplyText = responseText || (GREETINGS[updatedSession.lang] || GREETINGS.mr);
  await sendTurnTextOrButtons(from, finalReplyText, updatedSession.state, updatedSession.lang);
}

// ---------------------------------------------------------------------------
// Phase 2: Audio/Voice Message Handler
// ---------------------------------------------------------------------------
async function processAudioMessage(
  from: string,
  msgId: string,
  mediaId: string
): Promise<void> {
  const tag = senderLogTag(from);

  if (isDuplicate(msgId)) {
    logWarn('DUPLICATE_SKIPPED', 'Audio message already processed', { tag, msgId });
    return;
  }
  markProcessed(msgId);

  log('AUDIO_RECEIVED', 'Audio message received — starting STT pipeline', { tag, mediaId });

  await markMessageRead(msgId).catch(() => {});

  const { session, isNew } = getOrCreateSession(from, 'mr');
  let activeSession = session;

  if (isNew) {
    saveSession(from, activeSession, msgId);
    log('NEW_SESSION', 'New WhatsApp user session (audio)', { tag });
  }

  if (!isWhatsAppConfigured()) {
    logWarn('CONFIG_MISSING', 'WhatsApp not configured — audio skipped', { tag });
    return;
  }

  try {
    // 1. Fetch media download URL from Meta
    const mediaUrl = await getMediaUrl(mediaId);
    log('STT_DOWNLOAD_START', 'Fetching media binary', { tag });

    // 2. Download audio binary from Meta
    const audioBuffer = await downloadMedia(mediaUrl);
    log('STT_DOWNLOAD_DONE', 'Media downloaded', { tag, bytes: audioBuffer.length });

    // 3. Transcribe audio with Sarvam STT provider (reusing existing Sarvam STT integration)
    const sttProvider = getSTTProvider();
    const sttResult = await sttProvider.transcribe(audioBuffer, activeSession.lang, {
      encoding: 'ogg_opus',
      sampleRate: 16000
    });
    log('STT_COMPLETED', 'Transcription done', {
      tag,
      provider: sttProvider.getProviderName(),
      confidence: sttResult.confidence,
      latencyMs: sttResult.latencyMs,
      textLen: sttResult.text.length
    });

    const transcript = sttResult.text.trim();
    if (!transcript) {
      await sendTextMessage(
        from,
        activeSession.lang === 'mr'
          ? 'माफ करा, आपला आवाज नीट ऐकू आला नाही. कृपया पुन्हा बोला किंवा टाइप करा.'
          : activeSession.lang === 'hi'
          ? 'माफ़ करें, आवाज़ स्पष्ट नहीं आई। कृपया फिर बोलें या टाइप करें।'
          : 'Sorry, I could not understand the audio. Please try again or type your message.'
      );
      return;
    }

    // Detect language switch if user spoke in another language
    const transcriptLang = detectLanguage(transcript);
    if (transcriptLang !== activeSession.lang) {
      activeSession = { ...activeSession, lang: transcriptLang };
    }

    // 4. Drive conversation FSM with transcribed text
    const { updatedSession, responseText } = driveConversation(activeSession, transcript, 'WhatsApp-STT');
    saveSession(from, updatedSession, msgId);

    log('CONVERSATION_RESPONSE', 'Response generated from audio transcript', {
      tag,
      state: updatedSession.state
    });

    // 5. Synthesize reply audio using native Opus/OGG for WhatsApp voice notes & send back via WhatsApp
    try {
      const ttsProvider = getTTSProvider();
      const ttsResult = await ttsProvider.synthesize(responseText, updatedSession.lang, {
        sampleRate: 16000,
        outputCodec: 'opus',
        encoding: 'audio/ogg'
      });
      log('TTS_COMPLETED', 'TTS synthesized', {
        tag,
        provider: ttsProvider.getProviderName(),
        latencyMs: ttsResult.latencyMs,
        bytes: ttsResult.audioBuffer.length
      });

      const { buffer: containerAudio, mimeType } = ensureAudioContainer(ttsResult.audioBuffer, 16000);
      await sendAudioMessage(from, containerAudio, mimeType);
      log('AUDIO_REPLY_SENT', 'Audio reply sent via WhatsApp', { tag, mimeType });

      // Deliver companion text or interactive buttons alongside audio
      await sendTurnTextOrButtons(from, responseText, updatedSession.state, updatedSession.lang).catch(() => {});
    } catch (ttsErr) {
      logWarn('TTS_FALLBACK', 'TTS/audio-upload failed, sending text fallback', {
        tag,
        error: String(ttsErr)
      });
      await sendTurnTextOrButtons(from, responseText, updatedSession.state, updatedSession.lang);
    }
  } catch (err) {
    logWarn('AUDIO_PIPELINE_ERROR', 'Audio pipeline failed', {
      tag,
      error: String(err)
    });
    await sendTextMessage(
      from,
      activeSession.lang === 'mr'
        ? 'तांत्रिक अडचण आली आहे. कृपया टेक्स्ट संदेश पाठवा.'
        : activeSession.lang === 'hi'
        ? 'तकनीकी समस्या हुई। कृपया टेक्स्ट संदेश भेजें।'
        : 'Technical issue. Please send a text message instead.'
    ).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Unsupported Message Type Handler
// ---------------------------------------------------------------------------
async function processUnsupportedMessage(from: string, msgId: string, type: string): Promise<void> {
  const tag = senderLogTag(from);

  if (isDuplicate(msgId)) return;
  markProcessed(msgId);

  logWarn('UNSUPPORTED_TYPE', `Unsupported message type: ${type}`, { tag });

  if (!isWhatsAppConfigured()) return;

  const { session } = getOrCreateSession(from, 'mr');
  await sendTextMessage(
    from,
    session.lang === 'mr'
      ? `माफ करा, सध्या फक्त मजकूर आणि आवाज संदेश स्वीकारले जातात. (${type} समर्थित नाही)`
      : session.lang === 'hi'
      ? `माफ़ करें, अभी केवल टेक्स्ट और वॉयस संदेश स्वीकार किए जाते हैं। (${type} समर्थित नहीं)`
      : `Sorry, only text and voice messages are supported right now. (${type} not supported)`
  ).catch(() => {});
}

// ---------------------------------------------------------------------------
// Meta WhatsApp Webhook Payload Types
// ---------------------------------------------------------------------------
export interface WaTextMessage {
  type: 'text';
  from: string;
  id: string;
  text: { body: string };
}

export interface WaAudioMessage {
  type: 'audio';
  from: string;
  id: string;
  audio: { id: string; mime_type?: string };
}

export interface WaInteractiveMessage {
  type: 'interactive';
  from: string;
  id: string;
  interactive: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}

export interface WaUnsupportedMessage {
  type: string;
  from: string;
  id: string;
}

export type ParsedWaMessage = WaTextMessage | WaAudioMessage | WaInteractiveMessage | WaUnsupportedMessage;

export interface WebhookParseResult {
  valid: boolean;
  messages: ParsedWaMessage[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Webhook Payload Parser
// ---------------------------------------------------------------------------
export function parseWebhookPayload(body: unknown): WebhookParseResult {
  try {
    if (typeof body !== 'object' || body === null) {
      return { valid: false, messages: [], error: 'Body is not an object' };
    }

    const b = body as Record<string, unknown>;

    if (b['object'] !== 'whatsapp_business_account') {
      return { valid: false, messages: [], error: `Unexpected object type: ${b['object']}` };
    }

    const entries = (b['entry'] as unknown[]) || [];
    const messages: ParsedWaMessage[] = [];

    for (const entry of entries) {
      const e = entry as Record<string, unknown>;
      const changes = (e['changes'] as unknown[]) || [];

      for (const change of changes) {
        const c = change as Record<string, unknown>;
        if (c['field'] !== 'messages') continue;

        const value = c['value'] as Record<string, unknown> | undefined;
        if (!value) continue;

        const msgs = (value['messages'] as unknown[]) || [];

        for (const msg of msgs) {
          const m = msg as Record<string, unknown>;
          const from = (m['from'] as string) || '';
          const id = (m['id'] as string) || '';
          const type = (m['type'] as string) || '';

          if (!from || !id || !type) continue;

          if (type === 'text') {
            const textObj = m['text'] as Record<string, unknown> | undefined;
            messages.push({
              type: 'text',
              from,
              id,
              text: { body: (textObj?.['body'] as string) || '' }
            } as WaTextMessage);
          } else if (type === 'audio') {
            const audioObj = m['audio'] as Record<string, unknown> | undefined;
            messages.push({
              type: 'audio',
              from,
              id,
              audio: {
                id: (audioObj?.['id'] as string) || '',
                mime_type: (audioObj?.['mime_type'] as string) || undefined
              }
            } as WaAudioMessage);
          } else if (type === 'interactive') {
            const interactiveObj = m['interactive'] as Record<string, unknown> | undefined;
            const subType = (interactiveObj?.['type'] as string) || '';
            const buttonReply = interactiveObj?.['button_reply'] as { id: string; title: string } | undefined;
            const listReply = interactiveObj?.['list_reply'] as { id: string; title: string } | undefined;

            messages.push({
              type: 'interactive',
              from,
              id,
              interactive: {
                type: subType,
                button_reply: buttonReply ? { id: buttonReply.id, title: buttonReply.title } : undefined,
                list_reply: listReply ? { id: listReply.id, title: listReply.title } : undefined
              }
            } as WaInteractiveMessage);
          } else {
            messages.push({ type, from, id } as WaUnsupportedMessage);
          }
        }
      }
    }

    return { valid: true, messages };
  } catch (err) {
    return { valid: false, messages: [], error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Top-Level Dispatcher — called from voicebotServer POST handler
// Returns HTTP 200 IMMEDIATELY; all processing is async (fire-and-forget).
// ---------------------------------------------------------------------------
export function handleWhatsAppWebhook(body: unknown): void {
  log('WEBHOOK_RECEIVED', 'POST webhook received');

  const parsed = parseWebhookPayload(body);

  if (!parsed.valid) {
    logWarn('PARSE_FAILED', `Payload parse failed: ${parsed.error}`);
    return;
  }

  if (parsed.messages.length === 0) {
    log('STATUS_EVENT', 'No messages in payload (likely status update)');
    return;
  }

  log('MESSAGES_PARSED', `Dispatching ${parsed.messages.length} message(s)`);

  for (const msg of parsed.messages) {
    if (msg.type === 'text') {
      const m = msg as WaTextMessage;
      processTextMessage(m.from, m.id, m.text.body).catch((err) => {
        logWarn('TEXT_HANDLER_ERROR', `Unhandled error in processTextMessage: ${err}`);
      });
    } else if (msg.type === 'audio') {
      const m = msg as WaAudioMessage;
      processAudioMessage(m.from, m.id, m.audio.id).catch((err) => {
        logWarn('AUDIO_HANDLER_ERROR', `Unhandled error in processAudioMessage: ${err}`);
      });
    } else if (msg.type === 'interactive') {
      const m = msg as WaInteractiveMessage;
      // Button tap response: extract button ID or title as user input text
      const replyPayload =
        m.interactive.button_reply?.id ||
        m.interactive.button_reply?.title ||
        m.interactive.list_reply?.id ||
        m.interactive.list_reply?.title ||
        '';
      log('BUTTON_CLICKED', 'Interactive reply button clicked', { tag: senderLogTag(m.from), replyPayload });
      processTextMessage(m.from, m.id, replyPayload).catch((err) => {
        logWarn('INTERACTIVE_HANDLER_ERROR', `Unhandled error in interactive reply: ${err}`);
      });
    } else {
      processUnsupportedMessage(msg.from, msg.id, msg.type).catch(() => {});
    }
  }
}
