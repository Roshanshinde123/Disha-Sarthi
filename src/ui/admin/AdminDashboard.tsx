// Disha Sarathi - Admin & System Supervision Dashboard (PS 26097)
import React, { useState, useEffect } from 'react';
import {
  getAllTelephonyCalls,
  getExotelConfig,
  TelephonyCallRecord
} from '../../server/telephonyServer';
import {
  getVoicebotCallSessions,
  getVoicebotDiagnostics,
  simulateVoicebotSession
} from '../../server/exotelVoicebot';
import { VoicebotCallSession } from '../../server/voicebotTypes';
import { saveCurrentSession } from '../../core/store';
import { UsersManagementView } from './UsersManagementView';
import { RolesManagementView } from './RolesManagementView';
import { ProvidersConfigView } from './ProvidersConfigView';
import { SystemConfigView } from './SystemConfigView';
import { AuditLogsView } from './AuditLogsView';
import { DiagnosticsView } from '../diagnostics/DiagnosticsView';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'roles'
  | 'providers'
  | 'system'
  | 'audit'
  | 'diagnostics';

interface AdminDashboardProps {
  initialTab?: AdminTab;
  onLogout: () => void;
  onNavigateToCoordinator: () => void;
  onNavigateToBeneficiary?: () => void;
}

// Utility to safely mask phone numbers for privacy
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    const start = digits.slice(0, 2);
    const end = digits.slice(-3);
    return `+91 ${start}*** **${end}`;
  }
  return phone;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'overview',
  onLogout,
  onNavigateToCoordinator,
  onNavigateToBeneficiary
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [telephonyCalls, setTelephonyCalls] = useState<TelephonyCallRecord[]>([]);
  const [voicebotSessions, setVoicebotSessions] = useState<VoicebotCallSession[]>([]);
  const [simPhone, setSimPhone] = useState('+91 98765 43210');
  const [simSpeech, setSimSpeech] = useState(
    'माझं शिक्षण 10वी झालं आहे. मी शेती करतो. मला इलेक्ट्रिकल आणि सोलर काम आवडतं. मला पुण्यात नोकरी करायची आहे.'
  );
  const [simStatus, setSimStatus] = useState<string | null>(null);

  const config = getExotelConfig();
  const diagnostics = getVoicebotDiagnostics();

  useEffect(() => {
    refreshCalls();
  }, []);

  const refreshCalls = () => {
    const telList = getAllTelephonyCalls();
    const vbList = getVoicebotCallSessions();
    setTelephonyCalls([...telList]);
    setVoicebotSessions([...vbList]);
  };

  const handleRunSimulatedCall = async () => {
    setSimStatus('📞 Initiating Exotel Voicebot WebSocket Stream (/api/voice/exotel)...');
    try {
      const record = simulateVoicebotSession(
        simPhone,
        'mr',
        [simSpeech, 'हो, मला प्रशिक्षण हवे आहे']
      );

      // Synchronize session into central store
      await saveCurrentSession(record.session);

      setSimStatus(`✅ Voicebot Session Completed (${record.callSid}). Profile & Recommendations synchronized!`);
      refreshCalls();
    } catch (e: any) {
      setSimStatus(`❌ Simulation Error: ${e.message}`);
    }
  };

  return (
    <div className="admin-dashboard-viewport" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Top Navbar */}
      <header className="admin-header" style={{
        background: '#1E293B',
        color: '#FFFFFF',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-logo" style={{ fontSize: '2rem', background: '#334155', borderRadius: '8px', padding: '6px' }}>🛡️</div>
          <div>
            <h1 className="brand-title" style={{ margin: 0, fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 800 }}>
              प्रशासक व सुपरव्हिजन नियंत्रण कक्ष (Admin & Supervision Cockpit)
            </h1>
            <p className="brand-subtitle" style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
              PM-AJAY GIA State Supervision • RBAC • Telephony Gateway • AI Diagnostics • Zero-Secret Policy
            </p>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateToBeneficiary && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateToBeneficiary}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              🎙️ लाभार्थी व्हॉईस (Beneficiary)
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={onNavigateToCoordinator}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            📊 समन्वयक (Coordinator)
          </button>
          <button
            type="button"
            className="btn-logout"
            onClick={onLogout}
            style={{ padding: '8px 14px', fontSize: '0.85rem', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            लॉगआउट (Logout)
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation Bar */}
      <nav style={{
        display: 'flex',
        gap: '6px',
        background: '#0F172A',
        padding: '8px 24px',
        overflowX: 'auto',
        borderBottom: '1px solid #334155'
      }}>
        {[
          { id: 'overview', label: '📞 Telephony & Gateway', icon: '📡' },
          { id: 'users', label: '👥 Users & Access', icon: '👤' },
          { id: 'roles', label: '🔐 RBAC Permissions', icon: '🛡️' },
          { id: 'providers', label: '🤖 Providers & Keys', icon: '⚙️' },
          { id: 'system', label: '🛠️ System Settings', icon: '⚡' },
          { id: 'audit', label: '📜 Audit Trail', icon: '📝' },
          { id: 'diagnostics', label: '🩺 AI Diagnostics', icon: '🧪' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: activeTab === tab.id ? '#2563EB' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
              borderRadius: '6px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Body */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'users' && <UsersManagementView />}
        {activeTab === 'roles' && <RolesManagementView />}
        {activeTab === 'providers' && <ProvidersConfigView />}
        {activeTab === 'system' && <SystemConfigView />}
        {activeTab === 'audit' && <AuditLogsView />}
        {activeTab === 'diagnostics' && <DiagnosticsView />}

        {activeTab === 'overview' && (
          <div className="admin-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {/* Left Card: Exotel Telephony Provisioning & Gateway Status */}
            <div className="dash-card exotel-config-card" style={{ background: '#FFFFFF', borderRadius: '10px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  📞 Exotel व्हर्च्युअल नंबर व व्हॉईसबॉट गेटवे
                </div>
                <span className="live-call-badge" style={{ background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  🟢 WebSocket Ready
                </span>
              </div>

              <div className="config-fields-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>नियुक्त फोन नंबर (Provisioned ExoPhone):</span>
                  <span className="config-val highlight-number" style={{ fontWeight: 700, color: '#2563EB' }}>{config.virtualPhoneNumber}</span>
                </div>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>Voicebot WebSocket Endpoint:</span>
                  <span className="config-val code-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0F172A' }}>wss://PUBLIC-DOMAIN/api/voice/exotel</span>
                </div>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>Voicebot Health Check:</span>
                  <span className="config-val code-val" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0F172A' }}>GET /api/voice/exotel/health</span>
                </div>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>Active STT Provider:</span>
                  <span className="config-val" style={{ fontWeight: 600 }}>🎙️ {diagnostics.sttProviderName}</span>
                </div>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>Active TTS Provider:</span>
                  <span className="config-val" style={{ fontWeight: 600 }}>🔊 {diagnostics.ttsProviderName}</span>
                </div>
                <div className="config-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <span className="config-label" style={{ color: '#64748B', fontSize: '0.85rem' }}>Audio Format:</span>
                  <span className="config-val" style={{ fontWeight: 500 }}>Linear 16-bit PCM (8kHz/16kHz Mono)</span>
                </div>
              </div>

              <div className="provisioning-guide-box" style={{ marginTop: '18px', padding: '12px', background: '#EFF6FF', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
                <div className="guide-title" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E40AF', marginBottom: '6px' }}>
                  📖 Exotel Voicebot Applet कसा जोडावा:
                </div>
                <p className="guide-text" style={{ margin: 0, fontSize: '0.8rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                  1. Exotel App Bazaar मध्ये जाऊन <strong>Voicebot Applet</strong> तयार करा.<br />
                  2. WebSocket URL म्हणून <code>wss://YOUR-PUBLIC-DOMAIN/api/voice/exotel</code> सेट करा.<br />
                  3. कॉल आल्यावर Exotel द्वारे द्वि-दिशा (Bidirectional) ऑडिओ स्ट्रीम थेट दिशा सारथीच्या FSM द्वारे प्रक्रिया होऊन सर्व डॅशबोर्डवर तात्काळ सिंक होईल.
                </p>
              </div>
            </div>

            {/* Right Card: Live Call Simulator & Real-time Call Logs */}
            <div className="dash-card telephony-logs-card" style={{ background: '#FFFFFF', borderRadius: '10px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  🎙️ थेट फोन कॉल चाचणी व सिमुलेटर (Voicebot Simulator)
                </div>
                <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Real-Time Sync
                </span>
              </div>

              <div className="sim-call-box">
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                    कॉलरचा फोन नंबर (Caller Phone):
                  </label>
                  <input
                    type="text"
                    className="app-input"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                    लाभार्थीचे नैसर्गिक संभाषण (Spoken Utterance):
                  </label>
                  <textarea
                    className="app-input"
                    rows={3}
                    value={simSpeech}
                    onChange={(e) => setSimSpeech(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="button"
                  id="btn-trigger-telephony-sim"
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  onClick={handleRunSimulatedCall}
                >
                  📞 Voicebot कॉल सुरू करा आणि डॅशबोर्डवर सिंक करा
                </button>

                {simStatus && (
                  <div className="sim-status-banner" style={{ marginTop: '12px', padding: '10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {simStatus}
                  </div>
                )}
              </div>

              {/* Call Logs Table */}
              <div className="call-logs-section" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A' }}>
                    नोंदवलेले फोन कॉल सत्र (Call Sessions): {voicebotSessions.length || telephonyCalls.length}
                  </h4>
                  <button
                    type="button"
                    className="btn-ctrl"
                    onClick={refreshCalls}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid #CBD5E1', borderRadius: '4px', background: '#F8FAFC' }}
                  >
                    🔄 रिफ्रेश (Refresh)
                  </button>
                </div>

                {voicebotSessions.length === 0 && telephonyCalls.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    अद्याप कोणतेही कॉल सत्र नोंदवले गेलेले नाही. वरून चाचणी कॉल करा.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>कॉल आयडी</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>कॉलर फोन</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>कालावधी</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>स्थिती</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>भाषा</th>
                          <th style={{ padding: '8px', textAlign: 'left' }}>सत्यापित माहिती</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voicebotSessions.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '8px' }}><code>{c.callSid || c.id}</code></td>
                            <td style={{ padding: '8px' }}><strong>{maskPhoneNumber(c.callerNumber)}</strong></td>
                            <td style={{ padding: '8px' }}>{c.durationSeconds}s</td>
                            <td style={{ padding: '8px' }}><span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{c.status}</span></td>
                            <td style={{ padding: '8px' }}>{c.language.toUpperCase()}</td>
                            <td style={{ padding: '8px' }}>
                              {c.verifiedProfile.education ? '🎓 10th ' : ''}
                              {c.verifiedProfile.location ? '📍 ' + c.verifiedProfile.location.value.district : ''}
                              {c.verifiedProfile.interests ? ' ⚡ Skills' : ''}
                            </td>
                          </tr>
                        ))}
                        {voicebotSessions.length === 0 && telephonyCalls.map((c) => (
                          <tr key={c.callSessionId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '8px' }}><code>{c.callSessionId}</code></td>
                            <td style={{ padding: '8px' }}><strong>{maskPhoneNumber(c.callerPhone)}</strong></td>
                            <td style={{ padding: '8px' }}>45s</td>
                            <td style={{ padding: '8px' }}><span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{c.status}</span></td>
                            <td style={{ padding: '8px' }}>{c.language.toUpperCase()}</td>
                            <td style={{ padding: '8px' }}>{c.recommendationsGenerated ? '🎯 Generated' : '⏳ In Progress'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
