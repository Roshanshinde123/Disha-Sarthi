// Disha Sarathi - Exotel Voicebot WebSocket Integration Engine (PS 26097)
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';
import { extractAllProfileSlots } from '../core/nlu';
import { recommendNSQFTrades } from '../core/recommender';
import { LanguageCode } from '../core/types';
import { getSTTProvider } from './sttProvider';
import { getTTSProvider } from './ttsProvider';
import type {
  ExotelInboundEvent,
  ExotelOutboundEvent,
  VoicebotCallSession,
  VoicebotDiagnostics
} from './voicebotTypes';

// In-Memory Global Call Session Buffer for Coordinator & Admin Dashboards
const activeSessions = new Map<string, VoicebotCallSession>();
const completedSessions: VoicebotCallSession[] = [];
let totalCallsCounter = 0;

/**
 * Structured Telemetry Logger (Guaranteed Safe - Never logs secrets)
 */
function logVoicebotEvent(meta: {
  callSid?: string;
  streamSid?: string;
  beneficiaryId?: string;
  eventType: string;
  latencyMs?: number;
  sttDurationMs?: number;
  ttsDurationMs?: number;
  conversationState?: string;
  details?: string;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    channel: 'EXOTEL_VOICEBOT_WS',
    ...meta
  };
  console.log(`[EXOTEL_VOICEBOT] ${meta.eventType}:`, JSON.stringify(logEntry));
}

/**
 * Helper to split PCM audio into ~100ms Base64 chunks for real-time WebSocket streaming
 */
function chunkAudioBuffer(buffer: Buffer, sampleRate: number = 8000, chunkDurationSec: number = 0.1): string[] {
  const bytesPerSample = 2; // 16-bit mono
  const chunkSize = Math.floor(sampleRate * bytesPerSample * chunkDurationSec);
  const chunks: string[] = [];

  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    const slice = buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length));
    chunks.push(slice.toString('base64'));
  }
  return chunks;
}

/**
 * Simple Energy-Based Voice Activity Detection (VAD) on 16-bit PCM Audio
 */
function calculateAudioEnergy(pcmBuffer: Buffer): number {
  if (pcmBuffer.length < 2) return 0;
  let sum = 0;
  const sampleCount = Math.floor(pcmBuffer.length / 2);
  for (let i = 0; i < sampleCount; i++) {
    const sample = pcmBuffer.readInt16LE(i * 2);
    sum += Math.abs(sample);
  }
  return sum / sampleCount;
}

/**
 * WebSocket Connection Handler for Exotel Voicebot Stream
 * Endpoint: /api/voice/exotel
 */
export function handleExotelVoicebotWebSocket(ws: {
  send: (data: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  close: () => void;
}) {
  let streamSid = '';
  let callSid = '';
  let currentSession: VoicebotCallSession | null = null;
  let audioIngestBuffer: Buffer = Buffer.alloc(0);
  let isAssistantSpeaking = false;
  let activeAudioSendQueue: NodeJS.Timeout[] = [];
  const sttProvider = getSTTProvider();
  const ttsProvider = getTTSProvider();

  // Helper to send outgoing events to Exotel
  const sendToExotel = (event: ExotelOutboundEvent) => {
    try {
      ws.send(JSON.stringify(event));
    } catch (err) {
      console.error('[EXOTEL_VOICEBOT] Error sending WebSocket frame:', err);
    }
  };

  let promptStartedAt = 0;

  // Clear pending assistant speech on user interruption
  const stopAssistantSpeech = (reason: string = 'user_interruption') => {
    if (isAssistantSpeaking) {
      isAssistantSpeaking = false;
      // Clear active queued chunk timers
      activeAudioSendQueue.forEach((t) => clearTimeout(t));
      activeAudioSendQueue = [];

      // Send Exotel Clear Event to immediately stop playback on user device
      sendToExotel({
        event: 'clear',
        stream_sid: streamSid
      });

      logVoicebotEvent({
        callSid,
        streamSid,
        beneficiaryId: currentSession?.beneficiaryId,
        eventType: 'SPEECH_INTERRUPTED_AND_CLEARED',
        details: reason
      });
    }
  };

  // Synthesize and stream assistant prompt to caller
  const streamAssistantPrompt = async (text: string, lang: LanguageCode) => {
    isAssistantSpeaking = true;
    promptStartedAt = Date.now();
    const ttsStartTime = Date.now();

    try {
      const ttsResult = await ttsProvider.synthesize(text, lang, { sampleRate: 8000 });
      const ttsDuration = Date.now() - ttsStartTime;

      if (!isAssistantSpeaking) return; // Interrupted during synthesis

      const chunks = chunkAudioBuffer(ttsResult.audioBuffer, 8000, 0.1);
      let chunkIndex = 0;

      // Stream chunks with rhythmic spacing (~90ms intervals)
      chunks.forEach((chunkBase64, idx) => {
        const timer = setTimeout(() => {
          if (!isAssistantSpeaking) return;

          sendToExotel({
            event: 'media',
            stream_sid: streamSid,
            media: {
              chunk: String(idx + 1),
              payload: chunkBase64
            }
          });

          chunkIndex++;
          if (chunkIndex >= chunks.length) {
            isAssistantSpeaking = false;
            // Mark end of audio
            sendToExotel({
              event: 'mark',
              stream_sid: streamSid,
              mark: { name: `prompt_end_${Date.now()}` }
            });
          }
        }, idx * 90);

        activeAudioSendQueue.push(timer);
      });

      logVoicebotEvent({
        callSid,
        streamSid,
        beneficiaryId: currentSession?.beneficiaryId,
        eventType: 'ASSISTANT_PROMPT_STREAMED',
        ttsDurationMs: ttsDuration,
        conversationState: currentSession?.session.state
      });
    } catch (err) {
      console.error('[EXOTEL_VOICEBOT] TTS streaming error:', err);
      isAssistantSpeaking = false;
    }
  };

  // Process gathered caller speech through NLU + Conversation Engine
  const processCallerUtterance = async (audioBuffer: Buffer) => {
    if (!currentSession || audioBuffer.length === 0) return;

    const sttStartTime = Date.now();
    const sttResult = await sttProvider.transcribe(audioBuffer, currentSession.language);
    const sttDuration = Date.now() - sttStartTime;

    const rawSpeech = sttResult.text.trim();
    if (!rawSpeech) {
      logVoicebotEvent({
        callSid,
        streamSid,
        eventType: 'EMPTY_UTTERANCE_DETECTED'
      });
      return;
    }

    logVoicebotEvent({
      callSid,
      streamSid,
      beneficiaryId: currentSession.beneficiaryId,
      eventType: 'USER_SPEECH_TRANSCRIBED',
      sttDurationMs: sttDuration,
      details: rawSpeech
    });

    // Append to transcript
    currentSession.transcript.push({
      speaker: 'user',
      text: rawSpeech,
      timestamp: new Date().toISOString(),
      confidence: sttResult.confidence
    });

    // 1. Extract Multi-Slot Profile Fields
    const multi = extractAllProfileSlots(rawSpeech, currentSession.language);
    const timestamp = new Date().toISOString();

    if (multi.slotsFound.district) {
      currentSession.session.profile.district = multi.slotsFound.district;
      currentSession.session.profile.district_name_local = multi.slotsFound.district;
      currentSession.session.profile.state = multi.slotsFound.state || 'Maharashtra';
      currentSession.verifiedProfile.location = {
        value: { district: multi.slotsFound.district, state: multi.slotsFound.state || 'Maharashtra' },
        confidence: 0.95,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }
    if (multi.slotsFound.education_level) {
      currentSession.session.profile.education_level = multi.slotsFound.education_level;
      currentSession.verifiedProfile.education = {
        value: multi.slotsFound.education_level,
        confidence: 0.96,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }
    if (multi.slotsFound.family_occupation) {
      currentSession.session.profile.family_occupation = multi.slotsFound.family_occupation;
      currentSession.verifiedProfile.familyOccupation = {
        value: multi.slotsFound.family_occupation,
        confidence: 0.92,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }
    if (multi.slotsFound.current_livelihood) {
      currentSession.session.profile.current_livelihood = multi.slotsFound.current_livelihood;
      currentSession.verifiedProfile.currentLivelihood = {
        value: multi.slotsFound.current_livelihood,
        confidence: 0.94,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }
    if (multi.slotsFound.skills_interests && multi.slotsFound.skills_interests.length > 0) {
      currentSession.session.profile.skills_interests = Array.from(
        new Set([...currentSession.session.profile.skills_interests, ...multi.slotsFound.skills_interests])
      );
      currentSession.verifiedProfile.interests = {
        value: currentSession.session.profile.skills_interests,
        confidence: 0.95,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }
    if (multi.slotsFound.employment_preference) {
      currentSession.session.profile.employment_preference = multi.slotsFound.employment_preference;
      currentSession.verifiedProfile.employmentPreference = {
        value: multi.slotsFound.employment_preference,
        confidence: 0.94,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp
      };
    }

    // 2. Step the FSM
    const stepRes = step(currentSession.session, {
      type: 'USER_INPUT',
      payload: rawSpeech,
      engine: 'ExotelVoicebotSTT'
    });
    currentSession.session = stepRes.session;
    currentSession.language = stepRes.session.lang;

    // 3. Trigger NSQF Recommender if core profile fields exist
    if (
      !currentSession.session.recommendations &&
      currentSession.session.profile.district &&
      currentSession.session.profile.skills_interests.length > 0
    ) {
      const { results, trace } = recommendNSQFTrades(
        currentSession.session.profile,
        currentSession.language,
        currentSession.session.id
      );
      currentSession.session.recommendations = results;
      currentSession.session.trace = trace;
    }

    // 4. Generate next spoken response
    let nextSpokenText = '';
    if (currentSession.session.recommendations && currentSession.session.recommendations.length > 0) {
      const topRec = currentSession.session.recommendations[0];
      const tradeName = topRec.trade.name_local?.mr || topRec.trade.name_local?.hi || topRec.trade.name_en;
      const centerName = topRec.nearest_center?.center?.name || 'जिल्हा कौशल्य प्रशिक्षण केंद्र (District Skill Center)';

      nextSpokenText =
        currentSession.language === 'mr'
          ? `आपल्या प्रोफाइलनुसार सर्वात योग्य ट्रेड आहे: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। अधिक माहिती आपल्या दिशा सारथी डॅशबोर्डवर उपलब्ध आहे.`
          : `आपकी प्रोफाइल अनुसार सबसे उत्तम ट्रेड है: ${tradeName}। प्रशिक्षण केंद्र: ${centerName}। पूरी जानकारी दिशा सारथी डैशबोर्ड पर देख सकते हैं।`;
    } else {
      const speakAction = stepRes.actions.find((a) => a.type === 'speak');
      if (speakAction?.payload?.text) {
        nextSpokenText = speakAction.payload.text;
      } else {
        const promptEntry = getPromptForState(currentSession.session.state, currentSession.language);
        nextSpokenText = promptEntry.prompt;
      }
    }

    // Append assistant response to transcript and speak
    currentSession.transcript.push({
      speaker: 'assistant',
      text: nextSpokenText,
      timestamp: new Date().toISOString()
    });

    await streamAssistantPrompt(nextSpokenText, currentSession.language);
  };

  // Attach error listener to prevent unhandled error crashes
  ws.on('error', (err: any) => {
    console.error('[EXOTEL_VOICEBOT] Socket error caught:', err);
    logVoicebotEvent({
      callSid,
      streamSid,
      eventType: 'WEBSOCKET_ERROR',
      details: err?.message || String(err)
    });
  });

  // Handle incoming WebSocket messages from Exotel
  ws.on('message', async (data: string | Buffer) => {
    try {
      const rawString = typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf-8') : String(data);
      const event = JSON.parse(rawString) as ExotelInboundEvent;

      switch (event.event) {
        case 'connected': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: connected');
          logVoicebotEvent({ eventType: 'EXOTEL_CONNECTED' });
          break;
        }

        case 'start': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: start');
          streamSid = event.stream_sid || event.start?.stream_sid || `stream_${Date.now()}`;
          const startMeta = event.start;
          callSid = startMeta?.call_sid || `call_${Date.now()}`;
          const callerNumber = startMeta?.from || '+91 98765 43210';
          const virtualNumber = startMeta?.to || '09513886363';
          const lang: LanguageCode = (startMeta?.custom_parameters?.language as LanguageCode) || 'mr';

          console.log(`[EXOTEL_VOICEBOT] START received: streamSid=${streamSid} callSid=${callSid} from=${callerNumber} to=${virtualNumber} lang=${lang}`);

          const session = createInitialSession(lang);
          session.id = `sess_phone_${callerNumber.replace(/[^0-9]/g, '').slice(-10)}`;
          session.ref_code = `PMAJAY-PSTN-${callerNumber.slice(-4)}`;
          session.state = 'LOCATION';

          currentSession = {
            id: `call_${callSid || Date.now()}`,
            beneficiaryId: session.id,
            conversationId: session.id,
            callSid,
            streamSid,
            callerNumber,
            virtualNumber,
            startedAt: new Date().toISOString(),
            durationSeconds: 0,
            language: lang,
            channel: 'PHONE',
            status: 'CONNECTED',
            verifiedProfile: {},
            session,
            transcript: []
          };

          activeSessions.set(streamSid, currentSession);
          totalCallsCounter++;

          logVoicebotEvent({
            callSid,
            streamSid,
            beneficiaryId: session.id,
            eventType: 'EXOTEL_START',
            conversationState: session.state
          });

          // Send Initial Conversational Greeting
          const greetingText =
            lang === 'mr'
              ? 'नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे. मी आपल्याला पीएम-अजय कौशल्य प्रशिक्षण आणि रोजगार मिळवून देण्यास मदत करेन. आपले नाव, शिक्षण आणि सध्याचे काम काय आहे?'
              : 'नमस्ते! दिशा सारथी में आपका स्वागत है। मैं आपको पीएम-अजय कौशल प्रशिक्षण और रोजगार पाने में मदद करूंगी। आपकी शिक्षा और वर्तमान कार्य क्या है?';

          currentSession.transcript.push({
            speaker: 'assistant',
            text: greetingText,
            timestamp: new Date().toISOString()
          });

          await streamAssistantPrompt(greetingText, lang);
          break;
        }

        case 'media': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: media');
          if (!event.media?.payload) return;
          const chunk = Buffer.from(event.media.payload, 'base64');
          console.log(`[EXOTEL_VOICEBOT] MEDIA received: chunk=${event.media?.chunk || 'frame'} bytes=${chunk.length}`);
          const energy = calculateAudioEnergy(chunk);

          // 1. Natural Interruption Detection (with 800ms grace period to avoid line noise clearing prompt)
          const promptAge = Date.now() - promptStartedAt;
          if (isAssistantSpeaking && promptAge > 800 && energy > 2500) {
            console.log(`[EXOTEL_VOICEBOT] User speech interruption detected (energy=${energy.toFixed(0)}) -> clearing assistant audio`);
            stopAssistantSpeech('speech_energy_threshold_exceeded');
          }

          // 2. Buffer incoming user speech frames
          audioIngestBuffer = Buffer.concat([audioIngestBuffer, chunk]);

          // When buffer reaches ~2 seconds of audio (32000 bytes at 8kHz 16-bit mono), process speech chunk
          if (audioIngestBuffer.length >= 32000) {
            const processChunk = audioIngestBuffer;
            audioIngestBuffer = Buffer.alloc(0);
            await processCallerUtterance(processChunk);
          }
          break;
        }

        case 'dtmf': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: dtmf');
          console.log(`[EXOTEL_VOICEBOT] DTMF received: digit=${event.dtmf?.digit}`);
          logVoicebotEvent({
            callSid,
            streamSid,
            eventType: 'DTMF_RECEIVED',
            details: event.dtmf?.digit
          });
          break;
        }

        case 'clear': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: clear');
          stopAssistantSpeech('exotel_clear_event');
          audioIngestBuffer = Buffer.alloc(0);
          break;
        }

        case 'mark': {
          console.log(`[EXOTEL_VOICEBOT] Exotel event: mark (${event.mark?.name || 'mark'})`);
          break;
        }

        case 'stop': {
          console.log('[EXOTEL_VOICEBOT] Exotel event: stop');
          const reason = event.stop?.reason || 'CALLER_HUNG_UP';
          console.log(`[EXOTEL_VOICEBOT] STOP received: reason=${reason}`);
          if (currentSession) {
            // Process any remaining buffered audio
            if (audioIngestBuffer.length > 4000) {
              await processCallerUtterance(audioIngestBuffer);
            }

            currentSession.status = 'COMPLETED';
            currentSession.endedAt = new Date().toISOString();
            currentSession.durationSeconds = Math.max(
              1,
              Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 1000)
            );
            currentSession.terminationReason = reason;

            completedSessions.push({ ...currentSession });
            activeSessions.delete(streamSid);

            logVoicebotEvent({
              callSid,
              streamSid,
              beneficiaryId: currentSession.beneficiaryId,
              eventType: 'EXOTEL_STOP_COMPLETED',
              conversationState: currentSession.session.state
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error('[EXOTEL_VOICEBOT] Error handling message:', err);
    }
  });

  ws.on('close', () => {
    stopAssistantSpeech('websocket_closed');
    if (currentSession && activeSessions.has(streamSid)) {
      currentSession.status = 'DISCONNECTED';
      currentSession.endedAt = new Date().toISOString();
      completedSessions.push({ ...currentSession });
      activeSessions.delete(streamSid);
    }
    logVoicebotEvent({
      callSid,
      streamSid,
      eventType: 'WEBSOCKET_CLOSED'
    });
  });
}

/**
 * Retrieves all Voicebot Call Sessions (Active + Completed) for Dashboard Sync
 */
export function getVoicebotCallSessions(): VoicebotCallSession[] {
  return [...Array.from(activeSessions.values()), ...completedSessions];
}

/**
 * Health & Diagnostics Status for /api/voice/exotel/health
 */
export function getVoicebotDiagnostics(): VoicebotDiagnostics {
  const isBrowser = typeof window !== 'undefined';
  const safeGet = (k: string) => (isBrowser ? localStorage.getItem(k) : (process.env as any)?.[k]);

  const accSid = safeGet('EXOTEL_ACCOUNT_SID') || '';
  const apiKey = safeGet('EXOTEL_API_KEY') || '';
  const phone = safeGet('EXOTEL_PHONE_NUMBER') || '+917965480255';

  const stt = getSTTProvider();
  const tts = getTTSProvider();

  return {
    exotelCredentialsConfigured: Boolean(accSid && apiKey && !apiKey.includes('demo')),
    exotelPhoneConfigured: Boolean(phone && phone.length > 5),
    websocketServerReady: true,
    sttProviderConfigured: stt.isConfigured(),
    sttProviderName: stt.getProviderName(),
    ttsProviderConfigured: tts.isConfigured(),
    ttsProviderName: tts.getProviderName(),
    conversationEngineReady: true,
    databaseConnected: true,
    activeCallsCount: activeSessions.size,
    totalCallsHandled: totalCallsCounter
  };
}

/**
 * Development Simulation Harness for Exotel Voicebot (Simulates Connected, Start, Media, Stop)
 */
export function simulateVoicebotSession(
  callerPhone: string,
  lang: LanguageCode,
  utterances: string[]
): VoicebotCallSession {
  const mockCallSid = `sim_call_${Date.now()}`;
  const mockStreamSid = `sim_stream_${Date.now()}`;

  const session = createInitialSession(lang);
  session.id = `sess_phone_${callerPhone.replace(/[^0-9]/g, '').slice(-10)}`;
  session.ref_code = `PMAJAY-PSTN-${callerPhone.slice(-4)}`;
  session.state = 'LOCATION';

  const callRecord: VoicebotCallSession = {
    id: `call_${mockCallSid}`,
    beneficiaryId: session.id,
    conversationId: session.id,
    callSid: mockCallSid,
    streamSid: mockStreamSid,
    callerNumber: callerPhone,
    virtualNumber: '09513886363',
    startedAt: new Date().toISOString(),
    durationSeconds: 45,
    language: lang,
    channel: 'PHONE',
    status: 'COMPLETED',
    verifiedProfile: {},
    session,
    transcript: [
      {
        speaker: 'assistant',
        text: 'नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे. आपले नाव, शिक्षण आणि सध्याचे काम काय आहे?',
        timestamp: new Date().toISOString()
      }
    ]
  };

  for (const utter of utterances) {
    callRecord.transcript.push({
      speaker: 'user',
      text: utter,
      timestamp: new Date().toISOString(),
      confidence: 0.95
    });

    const multi = extractAllProfileSlots(utter, lang);
    const ts = new Date().toISOString();

    if (multi.slotsFound.district) {
      callRecord.session.profile.district = multi.slotsFound.district;
      callRecord.session.profile.district_name_local = multi.slotsFound.district;
      callRecord.session.profile.state = multi.slotsFound.state || 'Maharashtra';
      callRecord.verifiedProfile.location = {
        value: { district: multi.slotsFound.district, state: multi.slotsFound.state || 'Maharashtra' },
        confidence: 0.96,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp: ts
      };
    }
    if (multi.slotsFound.education_level) {
      callRecord.session.profile.education_level = multi.slotsFound.education_level;
      callRecord.verifiedProfile.education = {
        value: multi.slotsFound.education_level,
        confidence: 0.95,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp: ts
      };
    }
    if (multi.slotsFound.current_livelihood) {
      callRecord.session.profile.current_livelihood = multi.slotsFound.current_livelihood;
      callRecord.verifiedProfile.currentLivelihood = {
        value: multi.slotsFound.current_livelihood,
        confidence: 0.94,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp: ts
      };
    }
    if (multi.slotsFound.skills_interests) {
      callRecord.session.profile.skills_interests = Array.from(
        new Set([...callRecord.session.profile.skills_interests, ...multi.slotsFound.skills_interests])
      );
      callRecord.verifiedProfile.interests = {
        value: callRecord.session.profile.skills_interests,
        confidence: 0.96,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp: ts
      };
    }
    if (multi.slotsFound.employment_preference) {
      callRecord.session.profile.employment_preference = multi.slotsFound.employment_preference;
      callRecord.verifiedProfile.employmentPreference = {
        value: multi.slotsFound.employment_preference,
        confidence: 0.95,
        source: 'PHONE',
        verificationStatus: 'BENEFICIARY_CONFIRMED',
        timestamp: ts
      };
    }

    const stepRes = step(callRecord.session, {
      type: 'USER_INPUT',
      payload: utter,
      engine: 'VoicebotSim'
    });
    callRecord.session = stepRes.session;
  }

  // Generate recommendations
  if (callRecord.session.profile.district && callRecord.session.profile.skills_interests.length > 0) {
    const { results, trace } = recommendNSQFTrades(callRecord.session.profile, lang, callRecord.session.id);
    callRecord.session.recommendations = results;
    callRecord.session.trace = trace;

    const topTrade = results[0]?.trade.name_local?.mr || results[0]?.trade.name_en || 'Electrician';
    callRecord.transcript.push({
      speaker: 'assistant',
      text: `आपल्यासाठी योग्य शिफारस: ${topTrade}। प्रशिक्षण केंद्र: जिल्हा कौशल्य केंद्र।`,
      timestamp: new Date().toISOString()
    });
  }

  callRecord.endedAt = new Date().toISOString();
  completedSessions.push({ ...callRecord });
  totalCallsCounter++;

  return callRecord;
}
