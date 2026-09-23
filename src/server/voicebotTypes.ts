// Disha Sarathi - Exotel Voicebot WebSocket Types & Protocol Definitions (PS 26097)
import { LanguageCode, Session } from '../core/types';

/**
 * Exotel Voicebot Inbound WebSocket Events
 */
export type ExotelInboundEvent =
  | ExotelConnectedEvent
  | ExotelStartEvent
  | ExotelMediaEvent
  | ExotelDtmfEvent
  | ExotelStopEvent
  | ExotelMarkEvent
  | ExotelClearEvent;

export interface ExotelConnectedEvent {
  event: 'connected';
  protocol?: string;
  version?: string;
}

export interface ExotelStartEvent {
  event: 'start';
  sequence_number?: string;
  stream_sid: string;
  start: {
    stream_sid: string;
    call_sid: string;
    account_sid: string;
    from: string;
    to: string;
    custom_parameters?: Record<string, any>;
    media_format: {
      encoding: 'audio/x-l16' | 'audio/x-mulaw' | 'audio/x-alaw' | string;
      sample_rate: number; // 8000, 16000, 24000
      channels: number; // 1 (mono)
    };
  };
}

export interface ExotelMediaEvent {
  event: 'media';
  sequence_number?: string;
  stream_sid: string;
  media: {
    chunk?: string;
    timestamp?: string;
    payload: string; // Base64-encoded PCM audio
  };
}

export interface ExotelDtmfEvent {
  event: 'dtmf';
  sequence_number?: string;
  stream_sid: string;
  dtmf: {
    digit: string;
  };
}

export interface ExotelStopEvent {
  event: 'stop';
  sequence_number?: string;
  stream_sid: string;
  stop: {
    call_sid: string;
    reason?: string;
  };
}

export interface ExotelMarkEvent {
  event: 'mark';
  sequence_number?: string;
  stream_sid: string;
  mark: {
    name: string;
  };
}

export interface ExotelClearEvent {
  event: 'clear';
  stream_sid: string;
}

/**
 * Exotel Voicebot Outbound WebSocket Events
 */
export type ExotelOutboundEvent =
  | ExotelOutgoingMediaEvent
  | ExotelOutgoingMarkEvent
  | ExotelOutgoingClearEvent;

export interface ExotelOutgoingMediaEvent {
  event: 'media';
  stream_sid: string;
  media: {
    payload: string; // Base64-encoded PCM audio chunk
    chunk?: string;
  };
}

export interface ExotelOutgoingMarkEvent {
  event: 'mark';
  stream_sid: string;
  mark: {
    name: string;
  };
}

export interface ExotelOutgoingClearEvent {
  event: 'clear';
  stream_sid: string;
}

/**
 * Profile Field Verification Metadata
 */
export interface VerifiedProfileField<T = any> {
  value: T;
  confidence: number;
  source: 'PHONE' | 'WEB' | 'WHATSAPP' | 'MANUAL';
  verificationStatus: 'BENEFICIARY_CONFIRMED' | 'INFERRED' | 'PROVISIONAL';
  timestamp: string;
}

/**
 * Verified Beneficiary Profile Container
 */
export interface VerifiedBeneficiaryProfile {
  name?: VerifiedProfileField<string>;
  education?: VerifiedProfileField<string>;
  familyOccupation?: VerifiedProfileField<string>;
  currentLivelihood?: VerifiedProfileField<string>;
  interests?: VerifiedProfileField<string[]>;
  skills?: VerifiedProfileField<string[]>;
  location?: VerifiedProfileField<{
    village?: string;
    district: string;
    state: string;
  }>;
  travelRadiusKm?: VerifiedProfileField<number>;
  employmentPreference?: VerifiedProfileField<'wage_employment' | 'self_employment' | 'entrepreneurship' | 'either'>;
}

/**
 * Telephony Call Session Record
 */
export interface VoicebotCallSession {
  id: string;
  beneficiaryId: string;
  conversationId: string;
  callSid: string;
  streamSid: string;
  callerNumber: string;
  virtualNumber: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  language: LanguageCode;
  channel: 'PHONE';
  status: 'CONNECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'DISCONNECTED';
  terminationReason?: string;
  verifiedProfile: VerifiedBeneficiaryProfile;
  session: Session;
  transcript: Array<{
    speaker: 'assistant' | 'user';
    text: string;
    timestamp: string;
    confidence?: number;
  }>;
}

/**
 * Voicebot Diagnostic Metrics
 */
export interface VoicebotDiagnostics {
  exotelCredentialsConfigured: boolean;
  exotelPhoneConfigured: boolean;
  websocketServerReady: boolean;
  sttProviderConfigured: boolean;
  sttProviderName: string;
  ttsProviderConfigured: boolean;
  ttsProviderName: string;
  conversationEngineReady: boolean;
  databaseConnected: boolean;
  activeCallsCount: number;
  totalCallsHandled: number;
}
