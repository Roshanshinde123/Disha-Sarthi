import React from 'react';

interface CorrectionItem {
  id: string;
  raw_asr: string;
  inferred_slot: string;
  confidence: number;
  lang: string;
  timestamp: string;
  status: 'auto_corrected' | 'flagged';
}

const sampleCorrections: CorrectionItem[] = [
  { id: 'cor_01', raw_asr: 'सिलई का काम', inferred_slot: 'tailoring (stitching)', confidence: 0.94, lang: 'hi', timestamp: '10 mins ago', status: 'auto_corrected' },
  { id: 'cor_02', raw_asr: 'ब्यूटी पार्लर शिकायचय', inferred_slot: 'beauty (salon)', confidence: 0.92, lang: 'mr', timestamp: '25 mins ago', status: 'auto_corrected' },
  { id: 'cor_03', raw_asr: '10 ki meter', inferred_slot: 'travel_radius_km: 10', confidence: 0.88, lang: 'hi', timestamp: '1 hour ago', status: 'auto_corrected' },
  { id: 'cor_04', raw_asr: 'পাখা ও মোটর মেরামত', inferred_slot: 'electrical (repairs)', confidence: 0.91, lang: 'bn', timestamp: '2 hours ago', status: 'auto_corrected' },
  { id: 'cor_05', raw_asr: 'गाड़ी मैकेनिक', inferred_slot: 'two_wheeler_mechanic', confidence: 0.95, lang: 'hi', timestamp: '3 hours ago', status: 'auto_corrected' }
];

export const CorrectionQueue: React.FC = () => {
  return (
    <div style={{ background: 'var(--paper-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--stone)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
          🛠️ भाषा पहचान सुधार कतार (ASR & NLU Correction Queue)
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          क्षेत्रीय बोलियों और उच्चारणों के स्वचालित NLU सुधार का वास्तविक समय लॉग।
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>बोला गया शब्द (Raw ASR)</th>
              <th>पहचाना गया कौशल (Inferred Slot)</th>
              <th>विश्वास स्कोर (Confidence)</th>
              <th>भाषा</th>
              <th>स्थिति</th>
            </tr>
          </thead>
          <tbody>
            {sampleCorrections.map((item) => (
              <tr key={item.id}>
                <td><code>"{item.raw_asr}"</code></td>
                <td><strong>{item.inferred_slot}</strong></td>
                <td>
                  <span style={{ color: item.confidence >= 0.9 ? 'var(--field-deep)' : '#8A5B00', fontWeight: 700 }}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </td>
                <td><span className="meta-tag">{item.lang.toUpperCase()}</span></td>
                <td>
                  <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A' }}>
                    ✓ Auto-Aligned
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
