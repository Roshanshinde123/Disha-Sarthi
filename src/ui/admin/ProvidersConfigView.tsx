// Disha Sarathi - Voice & AI Providers Configuration View (PS 26097)
import React from 'react';
import { getExotelConfig } from '../../server/telephonyServer';
import { getVoicebotDiagnostics } from '../../server/exotelVoicebot';

export const ProvidersConfigView: React.FC = () => {
  const config = getExotelConfig();
  const diagnostics = getVoicebotDiagnostics();

  return (
    <div className="providers-config-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <span className="demo-pill" style={{ marginBottom: '6px' }}>
          System Administration • Two-Layer Architecture Bridge
        </span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
          🔌 प्रदाते व गेटवे स्थिती (Providers & Gateways)
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
          Layer A (ऑफलाइन-प्रथम स्थानिक इंजिन) आणि Layer B (क्लाउड टेलिफोनी व न्यूरल स्पीच) स्थिती.
        </p>
      </div>

      {/* Security Banner */}
      <div style={{ background: '#E8F3ED', border: '1px solid var(--field)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#165036' }}>
        🔒 <strong>सुरक्षा मानके (Zero-Secret Policy):</strong> कोणतेही API टोकन्स, पासवर्ड्स किंवा सीक्रेट्स UI मध्ये प्रदर्शित केले जात नाहीत. केवळ <em>"Configured"</em> किंवा <em>"Connected"</em> स्थिती दर्शविली जाते.
      </div>

      {/* Exotel Telephony Gateway Card */}
      <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--field)', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>
              📞 Exotel PSTN टेलिफोनी गेटवे (Voicebot WebSocket Gateway)
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
              द्वि-दिशा (Bidirectional) ऑडिओ स्ट्रीमिंग • Linear 16-bit PCM (8 kHz / 16 kHz Mono)
            </div>
          </div>
          <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', fontWeight: 800 }}>
            ● WebSocket Ready
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px', fontSize: '0.88rem' }}>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>नियुक्त फोन नंबर (Provisioned ExoPhone):</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--field-deep)' }}>{config.virtualPhoneNumber}</strong>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>WebSocket Endpoint:</span>
            <code>wss://[DOMAIN]/api/voice/exotel</code>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Health Check Endpoint:</span>
            <code>GET /api/voice/exotel/health</code>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem', display: 'block' }}>Account Credentials Status:</span>
            <strong style={{ color: diagnostics.exotelCredentialsConfigured ? '#1F6F4A' : '#8A5B00' }}>
              {diagnostics.exotelCredentialsConfigured ? '🟢 Configured (Environment Protected)' : '🟡 Demo Mode Active'}
            </strong>
          </div>
        </div>
      </div>

      {/* Speech STT & TTS Providers Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* STT Providers */}
        <div className="dash-card" style={{ background: '#FFFFFF', padding: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
            🎙️ भाषण-ते-मजकूर (STT Speech Recognition)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FBF9', borderRadius: '6px' }}>
              <div>
                <strong>Web Speech API (Layer A)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>स्थानिक ब्राऊझर इंजिन (Zero API Key)</div>
              </div>
              <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', fontWeight: 700 }}>सक्रिय (Active)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8F9FA', borderRadius: '6px' }}>
              <div>
                <strong>Bhashini ASR (Layer B)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>राष्ट्रीय भाषा अनुवाद मिशन</div>
              </div>
              <span className="meta-tag">Failover Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8F9FA', borderRadius: '6px' }}>
              <div>
                <strong>Sarvam AI ASR (Layer B)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>भारतीय भाषा मॉडेल</div>
              </div>
              <span className="meta-tag">Failover Ready</span>
            </div>
          </div>
        </div>

        {/* TTS Providers */}
        <div className="dash-card" style={{ background: '#FFFFFF', padding: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
            🔊 मजकूर-ते-भाषण (TTS Speech Synthesis)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FBF9', borderRadius: '6px' }}>
              <div>
                <strong>Web Speech Synthesis (Layer A)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>स्थानिक व्हॉईस सिंथेसिस (Offline)</div>
              </div>
              <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', fontWeight: 700 }}>सक्रिय (Active)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8F9FA', borderRadius: '6px' }}>
              <div>
                <strong>Bhashini TTS (Layer B)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>भारतीय भाषा व्हॉईस</div>
              </div>
              <span className="meta-tag">Failover Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8F9FA', borderRadius: '6px' }}>
              <div>
                <strong>Sarvam AI Bulbul TTS (Layer B)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>न्यूरल व्हॉईस मॉडेल</div>
              </div>
              <span className="meta-tag">Failover Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database & Storage */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
          💾 डेटाबेस व स्थानिक स्टोरेज (Database Architecture)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <strong>Client-Side: IndexedDB (idb-keyval)</strong>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
              ऑफलाइन-सक्षम, ७-दिवसीय ऑटोमॅटिक सेशन परसिस्टन्स.
            </div>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <strong>Server-Side: WebSocket In-Memory + Node Store</strong>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
              Exotel कॉल सेशन आणि वेब डॅशबोर्ड रिअल-टाइम सिंक.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
