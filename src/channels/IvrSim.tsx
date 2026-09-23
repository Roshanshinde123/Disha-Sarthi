import React, { useState } from 'react';
import { Session } from '../core/types';
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';

export const IvrSim: React.FC = () => {
  const [session, setSession] = useState<Session>(createInitialSession('hi'));
  const [callActive, setCallActive] = useState(false);
  const [_enteredDigits, setEnteredDigits] = useState('');

  const promptEntry = getPromptForState(session.state, session.lang);

  const startCall = () => {
    setCallActive(true);
    setSession(createInitialSession('hi'));
  };

  const endCall = () => {
    setCallActive(false);
    setEnteredDigits('');
  };

  const handleDigit = (digit: string) => {
    if (!callActive) return;
    setEnteredDigits((prev) => prev + digit);

    // If matching a chip number (1, 2, 3...)
    const num = parseInt(digit, 10);
    if (num >= 1 && num <= promptEntry.chips.length) {
      const chip = promptEntry.chips[num - 1];
      const { session: nextSession } = step(session, {
        type: 'CHIP_CLICK',
        payload: { value: chip.value, label: chip.label },
        engine: 'IvrDTMF'
      });
      setSession(nextSession);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#14201A', color: '#FFFFFF', padding: '16px' }}>
      {/* Honesty Banner */}
      <div style={{ background: '#FFF3CD', color: '#856404', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', borderRadius: '6px', marginBottom: '12px' }}>
        ⚠️ Simulated channel • IVR Telephony / DTMF Simulation
      </div>

      {/* Telephony Header */}
      <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Toll-Free IVR: 1800-XXX-AJAY</div>
        <div style={{ fontSize: '0.8rem', color: '#D6D9D1', marginTop: '2px' }}>
          {callActive ? '🟢 Call in progress (00:32)' : '🔴 Idle / Not Connected'}
        </div>
      </div>

      {/* IVR Voice Output Simulator */}
      <div style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {callActive ? (
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--turmeric)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              🔊 Spoken IVR Voice Prompt:
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '6px', lineHeight: 1.4 }}>
              "{promptEntry.prompt}"
            </div>

            {/* DTMF Menu options */}
            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#A8B3AC', marginBottom: '6px' }}>Press number on keypad:</div>
              {promptEntry.chips.map((chip, idx) => (
                <div key={chip.value} style={{ fontSize: '0.85rem', padding: '3px 0' }}>
                  <strong style={{ color: 'var(--turmeric)' }}>Press {idx + 1}:</strong> {chip.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#A8B3AC', padding: '30px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📞</div>
            <div>Tap the green call button below to simulate an incoming voice call.</div>
          </div>
        )}
      </div>

      {/* DTMF Dialpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleDigit(k)}
            style={{
              height: '54px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              cursor: callActive ? 'pointer' : 'default'
            }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Call / End Button */}
      <div>
        {callActive ? (
          <button
            type="button"
            onClick={endCall}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--madder)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            🔴 End Call (Disconnect)
          </button>
        ) : (
          <button
            type="button"
            onClick={startCall}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--field)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            🟢 Start IVR Call Simulation
          </button>
        )}
      </div>
    </div>
  );
};
