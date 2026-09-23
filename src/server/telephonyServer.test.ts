import { describe, it, expect } from 'vitest';
import {
  handleExotelIncomingCall,
  handleExotelGather,
  simulateTelephonyCallSession,
  getExotelConfig
} from './telephonyServer';

describe('Exotel PSTN Telephony & Call Synchronization Gateway', () => {
  it('returns valid Exotel configuration and provisioned number', () => {
    const config = getExotelConfig();
    expect(config.virtualPhoneNumber).toBeDefined();
    expect(config.webhookUrl).toContain('/api/exotel/incoming');
  });

  it('handles incoming Exotel call and produces Voice XML greeting', () => {
    const incoming = handleExotelIncomingCall({
      CallSid: 'test_call_001',
      From: '+919876543210',
      To: '+918047182609',
      Language: 'mr'
    });

    expect(incoming.xml).toContain('<Response>');
    expect(incoming.xml).toContain('<Say voice="female" language="mr-IN">');
    expect(incoming.callRecord.status).toBe('CONNECTED');
    expect(incoming.callRecord.callerPhone).toBe('+919876543210');
  });

  it('processes continuous conversational speech gather and advances FSM', () => {
    handleExotelIncomingCall({
      CallSid: 'test_call_002',
      From: '+919876543210',
      To: '+918047182609',
      Language: 'mr'
    });

    const gather = handleExotelGather({
      CallSid: 'test_call_002',
      SpeechResult: 'मी पुण्यात राहतो, माझं शिक्षण 10वी झालंय आणि मला इलेक्ट्रिकल काम आवडतं'
    });

    expect(gather.xml).toContain('<Response>');
    expect(gather.callRecord).toBeDefined();
    expect(gather.callRecord?.session.profile.district).toBe('Pune');
    expect(gather.callRecord?.session.profile.education_level).toBe('secondary');
  });

  it('simulates end-to-end phone call to generate recommendations and sync session', () => {
    const record = simulateTelephonyCallSession(
      '+919876543210',
      'mr',
      ['मी पुण्यात राहतो, माझं शिक्षण 10वी झालं आहे, मला इलेक्ट्रिकल काम आवडतं, नोकरी पाहिजे']
    );

    expect(record.session.profile.district).toBe('Pune');
    expect(record.session.profile.skills_interests).toContain('electrical');
  });
});
