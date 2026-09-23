// Disha Sarathi - Opportunities & Employer Linkages View for Coordinators (PS 26097)
import React, { useState } from 'react';
import { Opportunity } from '../../core/types';
import opportunitiesData from '../../data/opportunities.json';

export const OpportunitiesListView: React.FC = () => {
  const [opportunities] = useState<Opportunity[]>(opportunitiesData as Opportunity[]);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'wage_employment' | 'self_employment'>('ALL');

  const filtered = typeFilter === 'ALL'
    ? opportunities
    : opportunities.filter((o) => o.type === typeFilter);

  return (
    <div className="opportunities-list-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            PM-AJAY GIA Component • Employer & Credit Pipeline
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            💼 स्थानिक रोजगार व सूक्ष्म-उद्यम लिंकेजेस (Opportunities & Linkages)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            सत्यापित स्थानिक आस्थापना, नोकरीच्या रिक्त जागा व NSFDC/मुद्रा अर्थसहाय्य योजना.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn-ctrl ${typeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setTypeFilter('ALL')}
          >
            सर्व ({opportunities.length})
          </button>
          <button
            type="button"
            className={`btn-ctrl ${typeFilter === 'wage_employment' ? 'active' : ''}`}
            onClick={() => setTypeFilter('wage_employment')}
          >
            💼 वेतन रोजगार
          </button>
          <button
            type="button"
            className={`btn-ctrl ${typeFilter === 'self_employment' ? 'active' : ''}`}
            onClick={() => setTypeFilter('self_employment')}
          >
            🏪 स्वरोजगार व कर्ज
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((opp) => (
          <div key={opp.id} className="dash-card" style={{ background: '#FFFFFF', borderLeft: `4px solid ${opp.type === 'self_employment' ? '#1F6F4A' : '#205493'}`, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>{opp.title}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--field-deep)', fontWeight: 700 }}>
                  🏢 {opp.company_or_agency}
                </div>
              </div>
              <span
                className="meta-tag"
                style={{
                  background: opp.type === 'self_employment' ? '#E8F3ED' : '#EAF0F6',
                  color: opp.type === 'self_employment' ? '#1F6F4A' : '#205493',
                  fontWeight: 700
                }}
              >
                {opp.type === 'self_employment' ? '🏪 स्वरोजगार' : '💼 नोकरी'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '6px' }}>
              📍 {opp.address}, {opp.district}, {opp.state} • सेक्टर: <strong>{opp.sector}</strong>
            </div>

            <div style={{ marginTop: '10px', background: '#F8F9FA', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>💵 वेतन/सहाय्य: <strong>{opp.wage_or_support_inr}</strong> <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>(Demo data)</span></div>
              <div>👥 जागा: <strong>{opp.openings_or_capacity}</strong></div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--muted)' }}>
              📞 <strong>नोडल अधिकारी:</strong> {opp.contact_person} ({opp.contact_phone})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
