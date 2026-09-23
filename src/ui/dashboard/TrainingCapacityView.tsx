// Disha Sarathi - Training Centers & Batch Capacity Management for Coordinators (PS 26097)
import React, { useState } from 'react';
import { TrainingCenter } from '../../core/types';
import trainingCentersData from '../../data/training_centers.json';

export const TrainingCapacityView: React.FC = () => {
  const [centers] = useState<TrainingCenter[]>(trainingCentersData as TrainingCenter[]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  const districts = Array.from(new Set(centers.map((c) => c.district)));
  const filtered = selectedDistrict === 'ALL' ? centers : centers.filter((c) => c.district === selectedDistrict);

  return (
    <div className="training-capacity-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            PM-AJAY GIA Component • Kaushal Kendra Capacity
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            🏫 प्रशिक्षण केंद्रे व बॅच क्षमता (Training Centers & Batches)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            जिल्हा कौशल्य विकास केंद्रांची क्षमता, उपलब्ध जागा व ट्रेड वाटप.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label className="form-label" style={{ margin: 0 }}>जिल्हा निवडा:</label>
          <select
            className="app-input"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">सर्व जिल्हे ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((center) => (
          <div key={center.id} className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--field)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>{center.name}</h3>
              <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', fontWeight: 700 }}>
                📍 {center.district}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
              पत्ता: {center.address} • संपर्क: <strong>{center.contact_phone}</strong>
            </div>

            <div style={{ marginTop: '12px', borderTop: '1px solid var(--stone-light)', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                उपलब्ध NSQF ट्रेड्स (Trades Offered):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {center.trades_offered.map((tradeId, idx) => (
                  <span key={idx} className="meta-tag" style={{ background: '#F0F4F8', color: '#14201A', fontSize: '0.78rem' }}>
                    🛠️ {tradeId.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
              <div>बॅच क्षमता: <strong>६०/महिना</strong></div>
              <div>नोंदणीकृत: <strong style={{ color: 'var(--field-deep)' }}>४२</strong></div>
              <div>शिल्लक जागा: <strong style={{ color: '#E0A32E' }}>१८</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
