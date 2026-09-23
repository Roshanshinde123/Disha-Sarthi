import React from 'react';
import { Session } from '../../core/types';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface MatrixTableProps {
  sessions: Session[];
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ sessions }) => {
  const trades = nsqfTradesData as any[];

  // Aggregate matrix: District -> Trade -> Count
  const matrix: Record<string, Record<string, number>> = {};
  const districtTotals: Record<string, number> = {};
  const tradeTotals: Record<string, number> = {};

  for (const s of sessions) {
    const dist = s.profile.district || 'Varanasi';
    const tradeId = s.recommendations?.[0]?.trade.id || 'app_sewing_machine_op';

    if (!matrix[dist]) matrix[dist] = {};
    matrix[dist][tradeId] = (matrix[dist][tradeId] || 0) + 1;

    districtTotals[dist] = (districtTotals[dist] || 0) + 1;
    tradeTotals[tradeId] = (tradeTotals[tradeId] || 0) + 1;
  }

  const sortedDistricts = Object.keys(districtTotals).sort(
    (a, b) => districtTotals[b] - districtTotals[a]
  );

  // Top 8 active trades for compact display
  const activeTrades = trades
    .filter((t) => (tradeTotals[t.id] || 0) > 0)
    .slice(0, 8);

  const handleExportCSV = () => {
    const headers = ['District', ...activeTrades.map((t) => t.name_en), 'Total Beneficiaries'];
    const rows = sortedDistricts.map((d) => {
      const counts = activeTrades.map((t) => matrix[d]?.[t.id] || 0);
      return [d, ...counts, districtTotals[d]];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `PM_AJAY_District_Trade_Matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            📊 जिला × एनएसक्यूएफ ट्रेड मैट्रिक्स (District × Trade Matrix)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            जिलेवार मांग विश्लेषण और योजना आवंटन।
          </p>
        </div>
        <button
          type="button"
          id="btn-export-matrix-csv"
          className="btn-ctrl"
          onClick={handleExportCSV}
          style={{ background: 'var(--field-light)', color: 'var(--field-deep)', borderColor: 'var(--field)', fontWeight: 700 }}
        >
          📥 CSV निर्यात करें (Download CSV)
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--paper-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--stone)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>जिला (District)</th>
              {activeTrades.map((t) => (
                <th key={t.id} style={{ maxWidth: '140px' }} title={t.name_en}>
                  {t.name_en.slice(0, 20)}...
                </th>
              ))}
              <th>कुल मांग (Total)</th>
            </tr>
          </thead>
          <tbody>
            {sortedDistricts.map((dist) => (
              <tr key={dist}>
                <td><strong>{dist}</strong></td>
                {activeTrades.map((t) => {
                  const val = matrix[dist]?.[t.id] || 0;
                  return (
                    <td key={t.id} style={{ textAlign: 'center', background: val > 3 ? '#E8F3ED' : undefined }}>
                      {val > 0 ? <strong>{val}</strong> : '-'}
                    </td>
                  );
                })}
                <td><strong>{districtTotals[dist]}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
