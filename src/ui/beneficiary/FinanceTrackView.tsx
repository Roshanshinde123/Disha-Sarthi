import React from 'react';
import { ConversationEvent, Session } from '../../core/types';
import schemesData from '../../data/schemes.json';
import coordinatorsData from '../../data/coordinators.json';

interface FinanceTrackViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
}

export const FinanceTrackView: React.FC<FinanceTrackViewProps> = ({ session, onEvent }) => {
  const schemes = schemesData as any[];
  const coordinators = coordinatorsData as any[];
  const districtCoordinator = coordinators.find(
    (c) => c.district.toLowerCase() === (session.profile.district || '').toLowerCase()
  ) || coordinators[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '24px' }}>
      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
          <span className="demo-pill">
            PM-AJAY • GIA Credit Linkages & Financial Support
          </span>
          <span className="demo-pill-small">Demo Data</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>
          सरकारी लोन व वित्तीय योजनाएं (Credit & Enterprise Schemes)
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          अनुसूचित जाति के लाभार्थियों व नए उद्यमियों के लिए रियायती ब्याज दर पर सहायता।
        </p>
      </div>

      {/* Official Mandatory Disclaimer */}
      <div className="alert-disclaimer-box" style={{ background: '#FFF8E6', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px 14px', fontSize: '0.88rem', color: '#795548' }}>
        ⚠️ <strong>महत्त्वाची सूचना (Notice):</strong> Potential support pathway — verify eligibility with the concerned authority. (योजनांचे निकष आणि अंतिम पात्रता संबंधित शासकीय प्राधिकरणाद्वारे तपासली जाईल.)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {schemes.map((scheme) => (
          <div key={scheme.id} className="rec-card" style={{ borderLeft: '4px solid var(--field)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--field-deep)' }}>
                {scheme.name[session.lang] || scheme.name.en}
              </h2>
              <span className="demo-pill-small">Scheme Guide</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: '1.45', marginTop: '6px' }}>
              {scheme.short_desc[session.lang] || scheme.short_desc.en}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A' }}>
                ऋण सीमा: {scheme.max_subsidy_loan}
              </span>
              <span className="meta-tag" style={{ background: '#FCF4E4', color: '#8A5B00' }}>
                ब्याज छूट: {scheme.interest_subvention}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* District Financial Consultant Contact */}
      <div className="rec-card" style={{ background: '#F5FAF7', borderColor: 'var(--field)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--field-deep)' }}>
          👨‍💼 जिल्हा वित्तीय परामर्शदाता (District Financial Advisor)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
          लोन प्रक्रिया और सब्सिडी सहायता के लिए आपके जिले के अधिकृत अधिकारी:
        </p>
        <div style={{ marginTop: '8px', fontSize: '0.95rem' }}>
          <div><strong>{districtCoordinator.name}</strong> ({districtCoordinator.role === 'financial_consultant' ? 'वित्तीय सलाहकार' : 'जिला समन्वयक'})</div>
          <div style={{ color: 'var(--field)', fontWeight: 'bold', marginTop: '2px' }}>
            📞 {districtCoordinator.phone}
          </div>
        </div>
      </div>

      <button
        type="button"
        id="btn-finance-done"
        className="btn-primary"
        onClick={() => onEvent({ type: 'CHIP_CLICK', payload: { value: 'generate_card' } })}
      >
        आगे बढ़ें और आकांक्षा कार्ड बनाएं (Generate Card) →
      </button>
    </div>
  );
};
