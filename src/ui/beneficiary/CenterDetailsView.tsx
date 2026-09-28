import React from 'react';
import { ConversationEvent, Session } from '../../core/types';
import { OpportunityMap } from '../components/OpportunityMap';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface CenterDetailsViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
}

export const CenterDetailsView: React.FC<CenterDetailsViewProps> = ({ session, onEvent }) => {
  const lang = session.lang || 'mr';
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

  const userCoords = session.profile.lat && session.profile.lng
    ? { lat: session.profile.lat, lng: session.profile.lng, label: session.profile.district || 'Location' }
    : null;

  const centerItems = nearestInfo?.center
    ? [
        {
          id: nearestInfo.center.id,
          name: nearestInfo.center.name,
          district: nearestInfo.center.district,
          state: nearestInfo.center.state,
          lat: nearestInfo.center.lat,
          lng: nearestInfo.center.lng,
          distanceKm: nearestInfo.distance_km,
          address: nearestInfo.center.address,
          contactPhone: nearestInfo.center.contact_phone
        }
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '24px', maxWidth: '850px', margin: '0 auto', padding: '16px' }}>
      <div>
        <span className="demo-pill" style={{ marginBottom: '8px', background: '#DCFCE7', color: '#166534' }}>
          PM-AJAY GIA • {lang === 'mr' ? 'प्रशिक्षण केंद्र मॅपिंग' : lang === 'hi' ? 'प्रशिक्षण केंद्र मैपिंग' : 'Training Center Mapping'}
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>
          {lang === 'mr' ? 'प्रशिक्षण केंद्र व पुढील पायरी' : lang === 'hi' ? 'प्रशिक्षण केंद्र व अगला कदम' : 'Training Center & Next Steps'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: '2px' }}>
          {trade ? trade.name_local[lang] || trade.name_en : (lang === 'mr' ? 'चयनित कोर्स' : 'Selected Trade')} {lang === 'mr' ? 'साठी अधिकृत कौशल्य केंद्र.' : 'authorized skilling centre.'}
        </p>
      </div>

      {nearestInfo?.center ? (
        <div className="rec-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px' }}>
          <div style={{ marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {nearestInfo.center.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 600, marginTop: '2px' }}>
              {lang === 'mr' ? 'दूरी:' : 'Distance:'} {nearestInfo.distance_km} km ({nearestInfo.center.district}, {nearestInfo.center.state})
            </p>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
            <div><strong>{lang === 'mr' ? 'पत्ता:' : lang === 'hi' ? 'पता:' : 'Address:'}</strong> {nearestInfo.center.address}</div>
            <div style={{ marginTop: '4px' }}><strong>{lang === 'mr' ? 'संपर्क:' : lang === 'hi' ? 'संपर्क:' : 'Phone:'}</strong> {nearestInfo.center.contact_phone}</div>
          </div>

          {/* Interactive Map */}
          <OpportunityMap
            userLocation={userCoords}
            radiusKm={session.profile.travel_radius_km || 25}
            trainingCenters={centerItems}
            height="240px"
            lang={lang}
          />
        </div>
      ) : (
        <div className="rec-card" style={{ background: '#FFFDF9', borderColor: '#E0A32E' }}>
          <h3>{lang === 'mr' ? 'जिल्हा कौशल्य केंद्र' : lang === 'hi' ? 'जिला कौशल केंद्र' : 'District Skilling Center'}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>
            {session.profile.district || (lang === 'mr' ? 'आपल्या जिल्ह्यात' : 'In your district')} {lang === 'mr' ? 'नोंदणी उपलब्ध आहे.' : 'enrollment is available.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          id="btn-goto-training-placement"
          className="btn-primary"
          style={{ padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
          onClick={() => handleNext(false)}
        >
          {lang === 'mr' ? 'प्रशिक्षण व रोजगार लिंकेज पहा' : lang === 'hi' ? 'प्रशिक्षण व रोजगार लिंकेज देखें' : 'View Training & Placement Linkage'}
        </button>

        <button
          type="button"
          id="btn-goto-finance"
          className="btn-secondary"
          style={{ padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
          onClick={() => handleNext(true)}
        >
          {lang === 'mr' ? 'स्वरोजगार लोन व वित्तीय सहाय्य' : lang === 'hi' ? 'स्वरोजगार लोन व वित्तीय सहायता' : 'View Self-Employment Credit Support'}
        </button>
      </div>
    </div>
  );
};
