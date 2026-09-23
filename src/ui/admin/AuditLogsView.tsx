// Disha Sarathi - System Audit Logs View for Administrators (PS 26097)
import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../core/types';
import { getAuditLogs } from '../../core/store';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const filtered = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      (log.user_id && log.user_id.toLowerCase().includes(term));
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'User ID', 'Role', 'Channel', 'Details'];
    const rows = filtered.map((l) => [
      l.timestamp,
      `"${l.action}"`,
      `"${l.user_id || 'System'}"`,
      `"${l.user_role || 'ADMIN'}"`,
      `"${l.ip_or_channel || 'WEB'}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Disha_Sarathi_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-logs-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            Security & Compliance • DPDP Act & System Audit Logs
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            📜 सिस्टीम ऑडिट लॉग (Central Audit Logs)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            वापरकर्ता लॉगिन, प्रोफाइल बदल, पुरावा तपासणी, डेटा हटवणे व प्रशासकीय क्रियांची अपरिवर्तनीय नोंद.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" onClick={handleExportCSV}>
            📥 CSV निर्यात (Export CSV)
          </button>
          <button type="button" className="btn-ctrl" onClick={loadLogs}>
            🔄 रिफ्रेश (Refresh)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="app-input"
            style={{ flex: 1, minWidth: '220px' }}
            placeholder="लॉग तपशील किंवा वापरकर्ता शोधा..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="app-input"
            style={{ width: 'auto' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">सर्व कृती (All Actions)</option>
            <option value="SYSTEM_INITIALIZED">SYSTEM_INITIALIZED</option>
            <option value="EVIDENCE_SUBMITTED">EVIDENCE_SUBMITTED</option>
            <option value="EVIDENCE_REVIEWED">EVIDENCE_REVIEWED</option>
            <option value="COORDINATOR_NOTE_ADDED">COORDINATOR_NOTE_ADDED</option>
            <option value="FOLLOW_UP_COMPLETED">FOLLOW_UP_COMPLETED</option>
            <option value="BENEFICIARY_DATA_DELETED">BENEFICIARY_DATA_DELETED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--stone)', display: 'flex', justifyContent: 'space-between' }}>
          <strong>एकूण नोंदी संख्या: {filtered.length}</strong>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>ऑडिट लॉग लोड होत आहेत...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>कोणत्याही नोंदी आढळल्या नाहीत.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="app-table" style={{ width: '100%', margin: 0, fontSize: '0.84rem' }}>
              <thead>
                <tr>
                  <th>दिनांक व वेळ (Timestamp)</th>
                  <th>कृती प्रकार (Action)</th>
                  <th>वापरकर्ता / भूमिका</th>
                  <th>चॅनेल</th>
                  <th>तपशील (Details)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                      {new Date(entry.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className="meta-tag"
                        style={{
                          background:
                            entry.action.includes('DELETED')
                              ? '#F7E9E8'
                              : entry.action.includes('REVIEWED') || entry.action.includes('COMPLETED')
                              ? '#E8F3ED'
                              : '#F0F4F8',
                          color:
                            entry.action.includes('DELETED')
                              ? '#A8322D'
                              : entry.action.includes('REVIEWED') || entry.action.includes('COMPLETED')
                              ? '#1F6F4A'
                              : '#14201A',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      <strong>{entry.user_id || 'System'}</strong>
                      {entry.user_role && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          ({entry.user_role})
                        </div>
                      )}
                    </td>
                    <td><code>{entry.ip_or_channel || 'WEB'}</code></td>
                    <td>{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
