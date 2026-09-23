import React from 'react';
import { ConversationEvent, Session } from '../../core/types';
import { MiniMap } from '../components/MiniMap';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface CenterDetailsViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
}

export const CenterDetailsView: React.FC<CenterDetailsViewProps> = ({ session, onEvent }) => {
  const selectedTradeId =
    session.profile.selected_trade_id || (session.recommendations && session.recommendations[0]?.trade.id);
  const trade =
    (nsqfTradesData as any[]).find((t) => t.id === selectedTradeId) || session.recommendations?.[0]?.trade;
  const nearestInfo = session.recommendations?.[0]?.nearest_center;

  const handleNext = (wantsFinance: boolean) => {
    onEvent({
      type: 'CHIP_CLICK',
      payload: { value: wantsFinance ? 'yes_finance' : 'no_finance' }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '24px' }}>
      <div>
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          PM-AJAY GIA • Authorized Training Center Mapping
        </span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>
          प्रशिक्षण केंद्र व अगला कदम (Training Center & Next Steps)
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          {trade ? trade.name_local[session.lang] || trade.name_en : 'चयनित कोर्स'} के लिए अधिकृत कौशल केंद्र।
        </p>
      </div>

      {nearestInfo?.center ? (
        <div className="rec-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏢</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{nearestInfo.center.name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                दूरी: <strong>{nearestInfo.distance_km} किमी</strong> ({nearestInfo.center.district}, {nearestInfo.center.state})
              </p>
            </div>
          </div>

          <div style={{ background: '#F8F9FA', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
            <div>📍 <strong>पता (Address):</strong> {nearestInfo.center.address}</div>
            <div style={{ marginTop: '6px' }}>📞 <strong>संपर्क (Phone):</strong> {nearestInfo.center.contact_phone}</div>
          </div>

          {/* Interactive Mini Map */}
          <MiniMap
            lat={session.profile.lat || 25.3176}
            lng={session.profile.lng || 82.9739}
            radiusKm={session.profile.travel_radius_km || 10}
            centerName={nearestInfo.center.name}
            centerLat={nearestInfo.center.lat}
            centerLng={nearestInfo.center.lng}
          />
        </div>
      ) : (
        <div className="rec-card" style={{ background: '#FFFDF9', borderColor: '#E0A32E' }}>
          <h3>📍 जिला कौशल केंद्र (District Skilling Center)</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>
            {session.profile.district || 'आपके जिले'} में आगामी बैच के लिए पंजीकरण उपलब्ध है।
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          id="btn-goto-training-placement"
          className="btn-primary"
          onClick={() => handleNext(false)}
        >
          🎓 प्रशिक्षण बैच एवं रोजगार लिंकेज देखें (Training & Placement) →
        </button>

        <button
          type="button"
          id="btn-goto-finance"
          className="btn-secondary"
          onClick={() => handleNext(true)}
        >
          💰 स्वरोजगार लोन व वित्तीय सहायता देखें (Credit Support) →
        </button>
      </div>
    </div>
  );
};
