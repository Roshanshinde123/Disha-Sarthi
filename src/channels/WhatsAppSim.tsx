import React, { useState, useEffect, useRef } from 'react';
import { Session } from '../core/types';
import { createInitialSession, step, getPromptForState } from '../core/orchestrator';

export const WhatsAppSim: React.FC = () => {
  const [session, setSession] = useState<Session>(createInitialSession('hi'));
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptEntry = getPromptForState(session.state, session.lang);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.transcript]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const { session: nextSession } = step(session, {
      type: 'USER_INPUT',
      payload: text.trim(),
      engine: 'WhatsAppSim'
    });
    setSession(nextSession);
    setInputText('');
  };

  const handleChipClick = (val: string, label: string) => {
    const { session: nextSession } = step(session, {
      type: 'CHIP_CLICK',
      payload: { value: val, label },
      engine: 'WhatsAppSim'
    });
    setSession(nextSession);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: '#ECE5DD', border: '1px solid var(--stone)' }}>
      {/* Honesty Banner */}
      <div style={{ background: '#FFF3CD', color: '#856404', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #FFEEBA' }}>
        ⚠️ Simulated channel • WhatsApp Bot Simulation (Shared Pure Orchestrator)
      </div>

      {/* WhatsApp Header */}
      <div style={{ background: '#075E54', color: '#FFFFFF', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          🎙️
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>दिशा सारथी (Disha Sarathi)</div>
          <div style={{ fontSize: '0.7rem', color: '#D6D9D1' }}>Official PM-AJAY AI Assistant • Online</div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ alignSelf: 'center', background: '#FCF4E4', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#8A5B00' }}>
          🔒 End-to-end encrypted session
        </div>

        {session.transcript.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#DCF8C6' : '#FFFFFF',
              color: '#14201A',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '82%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}
          >
            <div>{msg.text}</div>
            <div style={{ fontSize: '0.65rem', color: '#888', textAlign: 'right', marginTop: '4px' }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {/* Interactive Quick Reply Buttons */}
        {promptEntry.chips.length > 0 && session.state !== 'END' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '85%' }}>
            {promptEntry.chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleChipClick(chip.value, chip.label)}
                style={{
                  background: '#FFFFFF',
                  color: '#075E54',
                  border: '1px solid #128C7E',
                  borderRadius: '16px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        style={{ padding: '8px 10px', background: '#F0F0F0', display: 'flex', gap: '8px', alignItems: 'center' }}
      >
        <input
          type="text"
          className="app-input"
          style={{ height: '42px', borderRadius: '24px', fontSize: '0.9rem' }}
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#128C7E',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
};
