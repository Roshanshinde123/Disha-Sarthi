// Disha Sarathi - WhatsApp Webhook Handler & Conversation Bridge (PS 26097)
// Connects Meta WhatsApp Cloud API webhooks to the Disha Sarathi conversation engine.
// SERVER-SIDE ONLY — never import this from Vite/React client code.

import { createHash } from 'crypto';
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';
import { extractAllProfileSlots } from '../core/nlu';
import { LanguageCode, Session, ConversationEvent } from '../core/types';
import { getSTTProvider } from './sttProvider';
import { getTTSProvider } from './ttsProvider';
import {
  sendTextMessage,
  sendAudioMessage,
  getMediaUrl,
  downloadMedia,
  markMessageRead,
  senderLogTag,
  isWhatsAppConfigured
} from './services/whatsapp';

// ---------------------------------------------------------------------------
// Structured Logging — never logs raw sender IDs or tokens
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
// Deduplication Store
// Bounded at MAX_DEDUP_SIZE; oldest entries evicted on overflow.
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
// Session Store — keyed by hashed WA sender ID
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
  sessionStore.set(key, session);
  return { session, isNew: true };
}

function saveSession(waId: string, session: Session): void {
  sessionStore.set(sessionKey(waId), session);
}

/** Exported for diagnostics/testing only */
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
  // Devanagari Unicode block: U+0900–U+097F
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  // Latin block
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount === 0 && latinCount > 0) return 'en';

  // Heuristic: if text contains Marathi-specific conjuncts or words, prefer 'mr'
  // Otherwise fall back to 'hi'. Default for this project is Marathi.
  const marathiMarkers = /ाहे|आहे|माझ|तुमच|आपल|मला|नाही|आणि|किंवा|कारण|होय|नको/;
  if (marathiMarkers.test(text)) return 'mr';

  if (devanagariCount > 0) return 'mr'; // Default Devanagari → Marathi for Disha Sarathi
  return 'mr';
}

// ---------------------------------------------------------------------------
// Greeting Messages (used when session is brand-new)
// ---------------------------------------------------------------------------
const GREETINGS: Record<LanguageCode, string> = {
  mr: 'नमस्कार! 🙏 मी दिशा सारथी आहे. तुम्हाला रोजगार, कौशल्य किंवा प्रशिक्षणाबाबत मदत हवी आहे का?\n\n(Type "हो" to start / "yes" for English / "हाँ" for Hindi)',
  hi: 'नमस्ते! 🙏 मैं दिशा सारथी हूँ। क्या आपको रोजगार, कौशल्य या प्रशिक्षण के बारे में मदद चाहिए?\n\n("हाँ" बोलें या टाइप करें)',
  en: 'Hello! 🙏 I\'m Disha Sarathi, a PM-AJAY livelihood assistant. Can I help you with employment, skills, or training opportunities?\n\n(Type "yes" to begin)',
  bn: 'নমস্কার! 🙏 আমি দিশা সারথী। আপনি কি কর্মসংস্থান বা দক্ষতা প্রশিক্ষণের ব্যাপারে সাহায্য চান?',
  ta: 'வணக்கம்! 🙏 நான் திஷா சாரதி. வேலைவாய்ப்பு, திறன் அல்லது பயிற்சி பற்றி உதவி வேண்டுமா?',
  te: 'నమస్కారం! 🙏 నేను దిశా సారథి. ఉపాధి, నైపుణ్యం లేదా శిక్షణ గురించి సహాయం కావాలా?',
  kn: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು ದಿಶಾ ಸಾರಥಿ. ಉದ್ಯೋಗ, ಕೌಶಲ್ಯ ಅಥವಾ ತರಬೇತಿಯ ಬಗ್ಗೆ ಸಹಾಯ ಬೇಕೇ?'
};

// ---------------------------------------------------------------------------
// Core: Drive conversation step and extract response text
// ---------------------------------------------------------------------------
function driveConversation(
  session: Session,
  userText: string,
  engine: string
): { updatedSession: Session; responseText: string } {
  // Extract slots from user speech to update profile
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

  const event: ConversationEvent = {
    type: 'USER_INPUT',
    payload: userText,
    engine
  };

  const { session: nextSession, actions } = step(workingSession, event);

  // Extract text from the first 'speak' action
  const speakAction = actions.find((a) => a.type === 'speak');
  let responseText = speakAction?.payload?.text || '';

  // If no speak action but chips present, use the state prompt
  if (!responseText) {
    const promptEntry = getPromptForState(nextSession.state, nextSession.lang, nextSession.profile);
    responseText = promptEntry.prompt;
  }

  return { updatedSession: nextSession, responseText };
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

  await markMessageRead(msgId).catch(() => { });

  const detectedLang = detectLanguage(text);
  const { session, isNew } = getOrCreateSession(from, detectedLang);

  // Switch language if detected language differs from session language
  let activeSession = session;
  if (!isNew && detectedLang !== session.lang && text.length > 3) {
    activeSession = { ...session, lang: detectedLang };
  }

  // Brand-new user: send greeting, move session to GREETING state
  if (isNew) {
    log('NEW_SESSION', 'New WhatsApp user session created', { tag, lang: detectedLang });
    const greeting = GREETINGS[detectedLang] || GREETINGS.mr;

    // Advance session past LANDING before storing
    const { session: greetedSession } = step(activeSession, {
      type: 'USER_INPUT',
      payload: 'start',
      engine: 'WhatsApp'
    });
    saveSession(from, greetedSession);

    if (!isWhatsAppConfigured()) {
      logWarn('CONFIG_MISSING', 'WhatsApp not configured — reply skipped', { tag });
      return;
    }

    await sendTextMessage(from, greeting);
    log('REPLY_SENT', 'Greeting sent to new user', { tag });
    return;
  }

  // Existing user: drive FSM
  const { updatedSession, responseText } = driveConversation(activeSession, text, 'WhatsApp');
  saveSession(from, updatedSession);

  log('CONVERSATION_RESPONSE', 'Response generated', {
    tag,
    state: updatedSession.state,
    responseLenChars: responseText.length
  });

  if (!isWhatsAppConfigured()) {
    logWarn('CONFIG_MISSING', 'WhatsApp not configured — reply skipped', { tag });
    return;
  }

  if (!responseText) {
    await sendTextMessage(from, GREETINGS[updatedSession.lang] || GREETINGS.mr);
  } else {
    await sendTextMessage(from, responseText);
    log('REPLY_SENT', 'Text reply sent', { tag, state: updatedSession.state });
  }
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

  await markMessageRead(msgId).catch(() => { });

  const { session, isNew } = getOrCreateSession(from, 'mr');
  let activeSession = session;

  if (isNew) {
    // Store session before going async so we don't lose it
    saveSession(from, activeSession);
    log('NEW_SESSION', 'New WhatsApp user session (audio)', { tag });
  }

  if (!isWhatsAppConfigured()) {
    logWarn('CONFIG_MISSING', 'WhatsApp not configured — audio skipped', { tag });
    return;
  }

  // Send a "processing" acknowledgement so user knows we received it
  await sendTextMessage(
    from,
    activeSession.lang === 'hi'
      ? '🎙️ आपका संदेश मिला। एक पल रुकिए...'
      : activeSession.lang === 'en'
        ? '🎙️ Received your voice message. Processing...'
        : '🎙️ आपला आवाज संदेश मिळाला. एक क्षण थांबा...'
  ).catch(() => { });

  try {
    // 1. Fetch media download URL
    const mediaUrl = await getMediaUrl(mediaId);
    log('STT_DOWNLOAD_START', 'Fetching media binary', { tag });

    // 2. Download audio binary
    const audioBuffer = await downloadMedia(mediaUrl);
    log('STT_DOWNLOAD_DONE', 'Media downloaded', { tag, bytes: audioBuffer.length });

    // 3. Transcribe with configured STT provider
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

    // Detect language from transcript if not already set
    const transcriptLang = detectLanguage(transcript);
    if (transcriptLang !== activeSession.lang) {
      activeSession = { ...activeSession, lang: transcriptLang };
    }

    // 4. Drive conversation FSM
    const { updatedSession, responseText } = driveConversation(activeSession, transcript, 'WhatsApp-STT');
    saveSession(from, updatedSession);

    log('CONVERSATION_RESPONSE', 'Response generated from audio transcript', {
      tag,
      state: updatedSession.state
    });

    // 5. Try TTS for audio reply; fall back to text if TTS fails or audio upload fails
    try {
      const ttsProvider = getTTSProvider();
      const ttsResult = await ttsProvider.synthesize(responseText, updatedSession.lang, {
        sampleRate: 16000,
        encoding: 'audio/x-l16'
      });
      log('TTS_COMPLETED', 'TTS synthesized', {
        tag,
        provider: ttsProvider.getProviderName(),
        latencyMs: ttsResult.latencyMs,
        bytes: ttsResult.audioBuffer.length
      });

      await sendAudioMessage(from, ttsResult.audioBuffer, 'audio/ogg; codecs=opus');
      log('AUDIO_REPLY_SENT', 'Audio reply sent via WhatsApp', { tag });
    } catch (ttsErr) {
      logWarn('TTS_FALLBACK', 'TTS/audio-upload failed, sending text fallback', {
        tag,
        error: String(ttsErr)
      });
      await sendTextMessage(from, responseText);
      log('TEXT_REPLY_SENT', 'Text fallback reply sent', { tag });
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
    ).catch(() => { });
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
  ).catch(() => { });
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

export interface WaUnsupportedMessage {
  type: string;
  from: string;
  id: string;
}

export type ParsedWaMessage = WaTextMessage | WaAudioMessage | WaUnsupportedMessage;

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

    // Meta sends object with "object": "whatsapp_business_account"
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
    // Status updates, read receipts, etc. — not message events
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
    } else {
      processUnsupportedMessage(msg.from, msg.id, msg.type).catch(() => { });
    }
  }
}
