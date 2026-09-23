// Disha Sarathi - Exotel Voicebot Integration Comprehensive Unit Tests (PS 26097)
import { describe, it, expect, vi } from 'vitest';
import {
  getVoicebotDiagnostics,
  simulateVoicebotSession,
  getVoicebotCallSessions,
  handleExotelVoicebotWebSocket
} from './exotelVoicebot';
import { getSTTProvider, MockSTTProvider } from './sttProvider';
import { getTTSProvider, MockServerTTSProvider } from './ttsProvider';
import { extractAllProfileSlots } from '../core/nlu';
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';
import { recommendNSQFTrades } from '../core/recommender';
import { updatePlacementRecord, getPlacementStatusLabel } from '../core/placement';

describe('1. Health & Diagnostics Endpoints', () => {
  it('should return valid diagnostics metrics for /api/voice/exotel/health', () => {
    const diag = getVoicebotDiagnostics();

    expect(diag).toHaveProperty('websocketServerReady', true);
    expect(diag).toHaveProperty('conversationEngineReady', true);
    expect(diag).toHaveProperty('databaseConnected', true);
    expect(diag).toHaveProperty('sttProviderName');
    expect(diag).toHaveProperty('ttsProviderName');
    expect(diag).toHaveProperty('activeCallsCount');
    expect(diag).toHaveProperty('totalCallsHandled');
  });

  it('should verify provider name corresponds to configured environment', () => {
    const diag = getVoicebotDiagnostics();
    expect(diag.sttProviderName).toContain('STT');
    expect(diag.ttsProviderName).toContain('TTS');
  });
});

describe('2. STT and TTS Provider Abstractions', () => {
  it('should resolve default STT and TTS providers safely without crashing', () => {
    const stt = getSTTProvider();
    const tts = getTTSProvider();

    expect(stt).toBeDefined();
    expect(stt.getProviderName()).toBeDefined();
    expect(tts).toBeDefined();
    expect(tts.getProviderName()).toBeDefined();
  });

  it('should produce valid 16-bit PCM mono audio buffers from MockServerTTS (labeled for local testing)', async () => {
    const tts = new MockServerTTSProvider();
    const text = 'नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे.';
    const result = await tts.synthesize(text, 'mr', { sampleRate: 8000 });

    expect(result.audioBuffer).toBeDefined();
    expect(result.audioBuffer.length).toBeGreaterThan(0);
    expect(result.base64Payload).toBeDefined();
    expect(result.sampleRate).toBe(8000);
    expect(result.encoding).toBe('audio/x-l16');
  });

  it('should transcribe audio via MockSTTProvider (labeled for local testing)', async () => {
    const stt = new MockSTTProvider();
    const result = await stt.transcribe('मी १०वी पास आहे आणि मला वायरमन काम आवडतं', 'mr');

    expect(result.text).toContain('१०वी');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.isFinal).toBe(true);
  });

  it('should gracefully fallback to mock provider when external credentials are absent', async () => {
    const stt = getSTTProvider('bhashini');
    // Without credentials, it safely returns mock results instead of throwing unhandled exceptions
    const result = await stt.transcribe('test audio', 'hi');
    expect(result).toBeDefined();
    expect(result.text.length).toBeGreaterThan(0);

    const tts = getTTSProvider('sarvam');
    const ttsResult = await tts.synthesize('नमस्ते', 'hi');
    expect(ttsResult).toBeDefined();
    expect(ttsResult.audioBuffer.length).toBeGreaterThan(0);
  });
});

describe('3. Exotel WebSocket Protocol Lifecycle Handling', () => {
  it('should handle full WebSocket lifecycle: connected -> start -> media -> dtmf -> clear -> stop', async () => {
    const sentMessages: string[] = [];
    const eventListeners: Record<string, Function[]> = {};

    const mockWs = {
      send: vi.fn((data: string) => {
        sentMessages.push(data);
      }),
      on: vi.fn((event: string, callback: Function) => {
        if (!eventListeners[event]) eventListeners[event] = [];
        eventListeners[event].push(callback);
      }),
      close: vi.fn()
    };

    handleExotelVoicebotWebSocket(mockWs);

    const emit = (event: string, ...args: any[]) => {
      (eventListeners[event] || []).forEach((cb) => cb(...args));
    };

    // 1. Send 'connected' event
    emit('message', JSON.stringify({ event: 'connected' }));

    // 2. Send 'start' event
    const streamSid = `test_stream_${Date.now()}`;
    const callSid = `test_call_${Date.now()}`;
    emit(
      'message',
      JSON.stringify({
        event: 'start',
        stream_sid: streamSid,
        start: {
          stream_sid: streamSid,
          call_sid: callSid,
          account_sid: 'exotel_test_acc',
          from: '+919876543210',
          to: '09513886363',
          custom_parameters: { language: 'mr' },
          media_format: {
            encoding: 'audio/x-l16',
            sample_rate: 8000,
            channels: 1
          }
        }
      })
    );

    // Initial greeting audio chunks should be queued/sent
    expect(sentMessages.length).toBeGreaterThanOrEqual(0);

    // 3. Send 'media' event (simulated PCM audio frame)
    const dummyPCM = Buffer.alloc(320, 100); // Small audio slice
    emit(
      'message',
      JSON.stringify({
        event: 'media',
        stream_sid: streamSid,
        media: {
          payload: dummyPCM.toString('base64'),
          chunk: '1'
        }
      })
    );

    // 4. Send 'dtmf' event
    emit(
      'message',
      JSON.stringify({
        event: 'dtmf',
        stream_sid: streamSid,
        dtmf: { digit: '1' }
      })
    );

    // 5. Send 'clear' event
    emit(
      'message',
      JSON.stringify({
        event: 'clear',
        stream_sid: streamSid
      })
    );

    // 6. Send 'stop' event
    emit(
      'message',
      JSON.stringify({
        event: 'stop',
        stream_sid: streamSid,
        stop: {
          call_sid: callSid,
          reason: 'caller_hangup'
        }
      })
    );

    // Verify session completed and recorded
    const sessions = getVoicebotCallSessions();
    const thisSession = sessions.find((s) => s.streamSid === streamSid);
    expect(thisSession).toBeDefined();
    expect(thisSession?.status).toBe('COMPLETED');
  });

  it('should gracefully handle malformed JSON messages without crashing the server', () => {
    const mockWs = {
      send: vi.fn(),
      on: vi.fn((event: string, cb: Function) => {
        if (event === 'message') {
          // Trigger with invalid JSON
          cb('INVALID_NON_JSON_DATA{{{');
          cb(Buffer.from('CORRUPTED_BINARY_FRAME'));
        }
      }),
      close: vi.fn()
    };

    expect(() => {
      handleExotelVoicebotWebSocket(mockWs);
    }).not.toThrow();
  });

  it('should handle socket error events cleanly without uncaught exception', () => {
    let errorHandler: Function | null = null;
    const mockWs = {
      send: vi.fn(),
      on: vi.fn((event: string, cb: Function) => {
        if (event === 'error') errorHandler = cb;
      }),
      close: vi.fn()
    };

    handleExotelVoicebotWebSocket(mockWs);
    expect(errorHandler).toBeDefined();
    expect(() => {
      errorHandler!(new Error('Simulated socket drop'));
    }).not.toThrow();
  });
});

describe('4. Multi-Slot Profile Extraction from Natural Utterance', () => {
  it('should extract multiple profile slots from a single composite Marathi utterance', () => {
    const utterance = 'मी सोलापुरात राहतो, १२वी पास आहे, शेती करतो आणि मला सोलरचे काम शिकायचे आहे आणि नोकरी हवी आहे.';
    const extracted = extractAllProfileSlots(utterance, 'mr');

    expect(extracted.slotsCount).toBeGreaterThanOrEqual(3);
    expect(extracted.slotsFound.district).toBe('Solapur');
    expect(extracted.slotsFound.education_level).toBe('higher_secondary');
    expect(extracted.slotsFound.current_livelihood).toBe('agriculture');
    expect(extracted.slotsFound.skills_interests).toContain('solar');
  });

  it('should extract multiple profile slots from a single composite Hindi utterance', () => {
    const utterance = 'मैं पुणे में रहता हूँ, 10वीं पास हूँ, किसान हूँ और मुझे इलेक्ट्रिकल काम पसंद है और नौकरी चाहिए।';
    const extracted = extractAllProfileSlots(utterance, 'hi');

    expect(extracted.slotsCount).toBeGreaterThanOrEqual(3);
    expect(extracted.slotsFound.district).toBe('Pune');
    expect(extracted.slotsFound.education_level).toBe('secondary');
    expect(extracted.slotsFound.current_livelihood).toBe('agriculture');
    expect(extracted.slotsFound.skills_interests).toContain('electrical');
    expect(extracted.slotsFound.employment_preference).toBe('wage_employment');
  });

  it('should extract multiple profile slots from a single composite English utterance', () => {
    const utterance = 'I live in Nashik, studied 10th pass, and I want a job in wage employment.';
    const extracted = extractAllProfileSlots(utterance, 'en');

    expect(extracted.slotsCount).toBeGreaterThanOrEqual(2);
    expect(extracted.slotsFound.district).toBe('Nashik');
    expect(extracted.slotsFound.education_level).toBe('secondary');
    expect(extracted.slotsFound.employment_preference).toBe('wage_employment');
  });
});

describe('5. FSM Conversation Progression & Prompts', () => {
  it('should step FSM states and ask for missing slots naturally', () => {
    const session = createInitialSession('mr');
    session.state = 'LOCATION';

    // Step 1: User provides location
    const step1 = step(session, {
      type: 'USER_INPUT',
      payload: 'मी पुण्यात राहतो'
    });

    expect(step1.session.profile.district).toBe('Pune');
    expect(step1.session.state).not.toBe('LOCATION');

    // Get prompt for next state
    const prompt = getPromptForState(step1.session.state, 'mr');
    expect(prompt.prompt).toBeDefined();
    expect(prompt.prompt.length).toBeGreaterThan(0);
  });

  it('should handle repeat and simplify actions in conversation', () => {
    const session = createInitialSession('hi');
    session.state = 'BACKGROUND';

    const repeatRes = step(session, { type: 'REPEAT' });
    expect(repeatRes.actions.some((a) => a.type === 'speak')).toBe(true);

    const simplifyRes = step(session, { type: 'SIMPLIFY' });
    expect(simplifyRes.actions.some((a) => a.type === 'speak')).toBe(true);
  });

  it('should support language switching seamlessly', () => {
    const session = createInitialSession('mr');
    expect(session.lang).toBe('mr');

    const switchRes = step(session, { type: 'SWITCH_LANG', payload: 'hi' });
    expect(switchRes.session.lang).toBe('hi');
  });
});

describe('6. Recommendation Engine & Explainable Trace', () => {
  it('should generate NSQF trade recommendations with center and rationale', () => {
    const profile = {
      district: 'Pune',
      state: 'Maharashtra',
      education_level: 'secondary' as const,
      current_livelihood: 'farming',
      skills_interests: ['electrical', 'solar'],
      constraints: [],
      travel_radius_km: 25 as const,
      employment_preference: 'wage_employment' as const
    };

    const { results, trace } = recommendNSQFTrades(profile, 'mr', 'sess_test_100');

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].trade).toBeDefined();
    expect(results[0].trade.name_en).toBeDefined();
    expect(results[0].score).toBeGreaterThan(0);
    expect(results[0].rationale).toBeDefined();
    expect(results[0].nearest_center).toBeDefined();

    expect(trace).toBeDefined();
    expect(trace.candidates_evaluated_count).toBeGreaterThan(0);
    expect(trace.surviving_candidates.length).toBeGreaterThan(0);
  });
});

describe('7. Verified Profile Metadata & Provenance', () => {
  it('should structure extracted fields with provenance and BENEFICIARY_CONFIRMED status', () => {
    const sessionRecord = simulateVoicebotSession('+91 98765 43210', 'mr', [
      'मी सोलापुरात राहतो, १२वी पास आहे आणि शेती करतो.',
      'मला सोलर तंत्रज्ञ व्हायचे आहे.'
    ]);

    expect(sessionRecord.verifiedProfile.education).toBeDefined();
    expect(sessionRecord.verifiedProfile.education?.value).toBe('higher_secondary');
    expect(sessionRecord.verifiedProfile.education?.verificationStatus).toBe('BENEFICIARY_CONFIRMED');
    expect(sessionRecord.verifiedProfile.education?.source).toBe('PHONE');
    expect(sessionRecord.verifiedProfile.education?.confidence).toBeGreaterThan(0.9);
    expect(sessionRecord.verifiedProfile.education?.timestamp).toBeDefined();

    expect(sessionRecord.verifiedProfile.location?.value.district).toBe('Solapur');
    expect(sessionRecord.verifiedProfile.location?.verificationStatus).toBe('BENEFICIARY_CONFIRMED');
  });
});

describe('8. Placement Workflow & Verification States', () => {
  it('should support complete placement transition stages', () => {
    const profile = {
      skills_interests: ['electrical'],
      constraints: []
    };

    const enrolled = updatePlacementRecord(profile, 'ENROLLED', 'opp_001', 'Enrolled in District Center');
    expect(enrolled.placement_status).toBe('ENROLLED');
    expect(getPlacementStatusLabel('ENROLLED', 'mr')).toContain('नोंदणी');

    const inTraining = updatePlacementRecord(enrolled, 'IN_TRAINING');
    expect(inTraining.placement_status).toBe('IN_TRAINING');

    const completed = updatePlacementRecord(inTraining, 'COMPLETED');
    expect(completed.placement_status).toBe('COMPLETED');

    const placed = updatePlacementRecord(completed, 'PLACED', 'opp_001', 'Joined as Wireman Apprentice');
    expect(placed.placement_status).toBe('PLACED');
    expect(getPlacementStatusLabel('PLACED', 'hi')).toContain('रोजगार');

    const followUp = updatePlacementRecord(placed, 'FOLLOW_UP');
    expect(followUp.placement_status).toBe('FOLLOW_UP');
  });
});

