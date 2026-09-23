// Disha Sarathi - System Settings & Demo Management View (PS 26097)
import React, { useState } from 'react';
import { getAllSessions, resetAllData } from '../../core/store';

export const SystemConfigView: React.FC = () => {
  const [offlineLayerA, setOfflineLayerA] = useState(true);
  const [multiSlotNLU, setMultiSlotNLU] = useState(true);
  const [telephonyLiveSync, setTelephonyLiveSync] = useState(true);
  const [demoDataNotice, setDemoDataNotice] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const handleResetData = async () => {
    if (window.confirm('सर्व स्थानिक डेटा रीसेट करून सुरुवातीच्या पायलट कोहोर्टवर आणायचे आहे का? (Reset all store data?)')) {
      await resetAllData();
      setMsg('✅ सर्व डेटाबेस रीसेट करून मूळ पायलट कोहोर्ट लोड केले!');
    }
  };

  const handleExportJSON = async () => {
    const sessions = await getAllSessions();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Disha_Sarathi_Database_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
  };

  return (
    <div className="system-config-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <span className="demo-pill" style={{ marginBottom: '6px' }}>
          System Administration • Core Architecture & Demo Flags
        </span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
          ⚙️ सिस्टीम व पायलट कॉन्फिगरेशन (System Settings)
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
          वैशिष्ट्य नियंत्रणे (Feature Flags), स्थानिक प्राधान्ये आणि चाचणी डेटा व्यवस्थापन.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {/* Feature Flags */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '18px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '14px' }}>
          🚩 कार्यप्रणाली नियंत्रक (Feature Flags)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FBF9', borderRadius: '8px', cursor: 'pointer' }}>
            <div>
              <strong>Layer A: स्थानिक ऑफलाइन-प्रथम मॉडेल (Zero API Keys)</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>कोणत्याही बाह्य API की शिवाय १००% स्वावलंबी स्थानिक 6-फॅक्टर रेकमेंडर व NLU</div>
            </div>
            <input
              type="checkbox"
              checked={offlineLayerA}
              onChange={(e) => setOfflineLayerA(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--field)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FBF9', borderRadius: '8px', cursor: 'pointer' }}>
            <div>
              <strong>Multi-Slot Indic Conversational NLU</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>एकाच नैसर्गिक वाक्यातून एकाधिक स्लॉट्स (जिल्हा, शिक्षण, व्यवसाय) काढणे</div>
            </div>
            <input
              type="checkbox"
              checked={multiSlotNLU}
              onChange={(e) => setMultiSlotNLU(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--field)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FBF9', borderRadius: '8px', cursor: 'pointer' }}>
            <div>
              <strong>Exotel Voicebot WebSocket $\rightarrow$ Live Dashboard Sync</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>थेट फोन कॉलवरील संभाषण तात्काळ डॅशबोर्डवर सिंक करणे</div>
            </div>
            <input
              type="checkbox"
              checked={telephonyLiveSync}
              onChange={(e) => setTelephonyLiveSync(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--field)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FBF9', borderRadius: '8px', cursor: 'pointer' }}>
            <div>
              <strong>"Indicative Demo Data" स्पष्ट लेबल्स दाखवा</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>सर्व सिंथेटिक रेकॉर्ड्सवर पारदर्शक डेमो टॅग्ज लावणे</div>
            </div>
            <input
              type="checkbox"
              checked={demoDataNotice}
              onChange={(e) => setDemoDataNotice(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--field)' }}
            />
          </label>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '18px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '14px' }}>
          💾 डेटाबेस व पायलट कोहोर्ट व्यवस्थापन (Demo Data Manager)
        </h3>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: 'auto' }}
            onClick={handleExportJSON}
          >
            📥 सर्व सत्रांचा डेटा निर्यात करा (Export Full Database JSON)
          </button>
          <button
            type="button"
            className="btn-ctrl"
            style={{ color: 'var(--madder)', borderColor: 'var(--madder)' }}
            onClick={handleResetData}
          >
            🔄 सर्व डेटा रीसेट करा (Reset to Initial Seed Cohort)
          </button>
        </div>
      </div>
    </div>
  );
};
