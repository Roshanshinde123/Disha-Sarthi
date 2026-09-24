// Disha Sarathi - Exotel PSTN Telephony Server & Synchronization Gateway (PS 26097)
import { createInitialSession, step } from '../core/orchestrator';
import { extractAllProfileSlots } from '../core/nlu';
import { recommendNSQFTrades } from '../core/recommender';
import { LanguageCode, Session } from '../core/types';

export interface TelephonyCallRecord {
  callSessionId: string;
  beneficiaryId: string;
  callerPhone: string;
  virtualNumber: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  status: 'RINGING' | 'CONNECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  language: LanguageCode;
  profileCompleted: boolean;
  recommendationsGenerated: boolean;
  session: Session;
  recordingUrl?: string;
}

// In-Memory & Synced Telephony Session Buffer
const activeCalls = new Map<string, TelephonyCallRecord>();
const completedCalls: TelephonyCallRecord[] = [];

export interface ExotelConfig {
  accountSid: string;
  apiKey: string;
  apiToken: string;
  virtualPhoneNumber: string;
  webhookUrl: string;
  mediaStreamUrl: string;
}

export function getExotelConfig(): ExotelConfig {
  const isBrowser = typeof window !== 'undefined';
  const safeGet = (key: string) => {
    if (isBrowser) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return (process.env as any)?.[key] || null;
  };

  return {
    accountSid: safeGet('EXOTEL_ACCOUNT_SID') || 'exotel_pmajay_sid_01',
    apiKey: safeGet('EXOTEL_API_KEY') || 'exotel_api_key_01',
    apiToken: safeGet('EXOTEL_API_TOKEN') || 'exotel_api_token_01',
    virtualPhoneNumber: safeGet('EXOTEL_PHONE_NUMBER') || '+917965480255', // Demo configured Exotel Virtual Line
    webhookUrl: safeGet('EXOTEL_WEBHOOK_URL') || 'https://api.dishasarathi.gov.in/api/exotel/incoming',
    mediaStreamUrl: safeGet('EXOTEL_MEDIA_STREAM_URL') || 'wss://api.dishasarathi.gov.in/api/exotel/stream'
  };
}

/**
 * Generates Exotel-compliant Voice XML response
 */
export function buildExotelVoiceXML(promptText: string, gatherActionUrl: string, language: LanguageCode = 'hi'): string {
  const langTag = language === 'mr' ? 'mr-IN' : language === 'en' ? 'en-IN' : 'hi-IN';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="${langTag}">${promptText}</Say>
  <Gather action="${gatherActionUrl}" method="POST" speechTimeout="3" speechModel="telephony" language="${langTag}">
    <Pause length="1"/>
  </Gather>
</Response>`;
}

/**
 * 1. Handles incoming call webhook from Exotel Virtual Phone Number
 */
export function handleExotelIncomingCall(params: {
  CallSid: string;
  From: string;
  To: string;
  Direction?: string;
  Digits?: string;
  Language?: string;
}): { xml: string; callRecord: TelephonyCallRecord } {
  const callSessionId = params.CallSid || `exotel_call_${Date.now()}`;
  const callerPhone = params.From || '+91 98765 43210';
  const lang: LanguageCode = (params.Language as LanguageCode) || 'mr';

  const session = createInitialSession(lang);
  session.id = `sess_phone_${callerPhone.replace(/[^0-9]/g, '').slice(-10)}`;
  session.ref_code = `PMAJAY-PSTN-${callerPhone.slice(-4)}`;
  session.state = 'LOCATION'; // Ready to accept location & background

  const greetingPrompt =
    lang === 'mr'
      ? 'नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे. मी आपल्याला पीएम-अजय कौशल्य प्रशिक्षण आणि रोजगार मिळवून देण्यास मदत करेन. आपले शिक्षण आणि सध्याचे काम काय आहे?'
      : 'नमस्ते! दिशा सारथी में आपका स्वागत है। मैं आपको पीएम-अजय कौशल प्रशिक्षण और रोजगार पाने में मदद करूंगी। आपकी शिक्षा और वर्तमान कार्य क्या है?';

  const callRecord: TelephonyCallRecord = {
    callSessionId,
    beneficiaryId: session.id,
    callerPhone,
    virtualNumber: params.To || getExotelConfig().virtualPhoneNumber,
    startTime: new Date().toISOString(),
    status: 'CONNECTED',
    language: lang,
    profileCompleted: false,
    recommendationsGenerated: false,
    session
  };

  activeCalls.set(callSessionId, callRecord);

  const xml = buildExotelVoiceXML(greetingPrompt, '/api/exotel/gather', lang);
  return { xml, callRecord };
}

/**
 * 2. Handles continuous speech gather from PSTN caller
 */
export function handleExotelGather(params: {
  CallSid: string;
  SpeechResult?: string;
  Digits?: string;
}): { xml: string; callRecord?: TelephonyCallRecord } {
  const callRecord = activeCalls.get(params.CallSid);
  if (!callRecord) {
    return {
      xml: buildExotelVoiceXML('सत्र समाप्त झाले आहे. (Session ended.)', '/api/exotel/incoming')
    };
  }

  const rawSpeech = params.SpeechResult || params.Digits || '';

  // Extract all profile slots from conversational speech
  const multi = extractAllProfileSlots(rawSpeech, callRecord.language);
  if (multi.slotsCount > 0) {
    if (multi.slotsFound.district) {
      callRecord.session.profile.district = multi.slotsFound.district;
      callRecord.session.profile.district_name_local = multi.slotsFound.district;
      callRecord.session.profile.state = multi.slotsFound.state || 'Maharashtra';
    }
    if (multi.slotsFound.education_level) callRecord.session.profile.education_level = multi.slotsFound.education_level;
    if (multi.slotsFound.family_occupation) callRecord.session.profile.family_occupation = multi.slotsFound.family_occupation;
    if (multi.slotsFound.current_livelihood) callRecord.session.profile.current_livelihood = multi.slotsFound.current_livelihood;
    if (multi.slotsFound.skills_interests && multi.slotsFound.skills_interests.length > 0) {
      callRecord.session.profile.skills_interests = Array.from(
        new Set([...callRecord.session.profile.skills_interests, ...multi.slotsFound.skills_interests])
      );
    }
    if (multi.slotsFound.constraints) callRecord.session.profile.constraints = multi.slotsFound.constraints;
    if (multi.slotsFound.travel_radius_km) callRecord.session.profile.travel_radius_km = multi.slotsFound.travel_radius_km;
    if (multi.slotsFound.employment_preference) callRecord.session.profile.employment_preference = multi.slotsFound.employment_preference;
  }

  // Also step the FSM
  const stepRes = step(callRecord.session, {
    type: 'USER_INPUT',
    payload: rawSpeech,
    engine: 'TelephonySTT'
  });

  callRecord.session = stepRes.session;
  callRecord.language = stepRes.session.lang;

  // If profile has key fields (district + skills), generate recommendations
  if (
    !callRecord.session.recommendations &&
    callRecord.session.profile.district &&
    callRecord.session.profile.skills_interests.length > 0
  ) {
    const { results, trace } = recommendNSQFTrades(callRecord.session.profile, callRecord.language, callRecord.session.id);
    callRecord.session.recommendations = results;
    callRecord.session.trace = trace;
    callRecord.recommendationsGenerated = true;
    callRecord.profileCompleted = true;
  }

  // Check if recommendations are present
  if (callRecord.session.recommendations && callRecord.session.recommendations.length > 0) {
    callRecord.recommendationsGenerated = true;
    callRecord.profileCompleted = true;
    const topRec = callRecord.session.recommendations[0];
    const centerName = topRec.nearest_center?.center?.name || 'जिल्हा कौशल्य प्रशिक्षण केंद्र (District Skill Center)';
    const tradeName = topRec.trade.name_local?.mr || topRec.trade.name_local?.hi || topRec.trade.name_en;

    const recPrompt =
      callRecord.language === 'mr'
        ? `आपल्या प्रोफाइलनुसार सर्वात योग्य ट्रेड आहे: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। अधिक माहिती आपल्या दिशा सारथी डॅशबोर्डवर उपलब्ध आहे.`
        : `आपकी प्रोफाइल अनुसार सबसे उत्तम ट्रेड है: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। पूरी जानकारी दिशा सारथी डैशबोर्ड पर देख सकते हैं।`;


    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="${callRecord.language === 'mr' ? 'mr-IN' : 'hi-IN'}">${recPrompt}</Say>
  <Hangup/>
</Response>`;
    callRecord.status = 'COMPLETED';
    callRecord.endTime = new Date().toISOString();
    completedCalls.push({ ...callRecord });
    activeCalls.delete(params.CallSid);
    return { xml, callRecord };
  }

  // Find next spoken prompt from orchestrator actions
  const speakAction = stepRes.actions.find((a) => a.type === 'speak');
  const nextPrompt = speakAction?.payload?.text || 'कृपया पुढील माहिती सांगा.';

  const xml = buildExotelVoiceXML(nextPrompt, '/api/exotel/gather', callRecord.language);
  return { xml, callRecord };
}

/**
 * 3. Retrieves all telephony call sessions for Coordinator/Admin Dashboard sync
 */
export function getAllTelephonyCalls(): TelephonyCallRecord[] {
  return [...Array.from(activeCalls.values()), ...completedCalls];
}

/**
 * 4. Simulates a complete telephony call end-to-end for instant demonstration
 */
export function simulateTelephonyCallSession(
  callerPhone: string,
  language: LanguageCode,
  spokenUtterances: string[]
): TelephonyCallRecord {
  const callSid = `sim_call_${Date.now()}`;
  const incoming = handleExotelIncomingCall({
    CallSid: callSid,
    From: callerPhone,
    To: getExotelConfig().virtualPhoneNumber,
    Language: language
  });

  let currentRecord = incoming.callRecord;

  for (const utterance of spokenUtterances) {
    const res = handleExotelGather({
      CallSid: callSid,
      SpeechResult: utterance
    });
    if (res.callRecord) {
      currentRecord = res.callRecord;
    }
  }

  return currentRecord;
}
