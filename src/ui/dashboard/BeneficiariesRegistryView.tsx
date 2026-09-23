// Disha Sarathi - Beneficiaries Registry for GIA Coordinators (PS 26097)
import React, { useState } from 'react';
import { Session } from '../../core/types';
import { getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';

interface BeneficiariesRegistryViewProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

export const BeneficiariesRegistryView: React.FC<BeneficiariesRegistryViewProps> = ({
  sessions,
  onSelectSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  // Extract unique districts
  const districts = Array.from(
    new Set(sessions.map((s) => s.profile.district).filter(Boolean))
  ) as string[];

  const filtered = sessions.filter((s) => {
    const prof = s.profile;
    const name = (prof.name || prof.first_name || '').toLowerCase();
    const phone = (prof.phone_number || '').toLowerCase();
    const id = s.id.toLowerCase();
    const ref = (s.ref_code || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = !term || name.includes(term) || phone.includes(term) || id.includes(term) || ref.includes(term);
    const matchesDistrict = districtFilter === 'ALL' || prof.district?.toLowerCase() === districtFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || prof.placement_status === statusFilter;
    const matchesVerif = verificationFilter === 'ALL' || prof.verification_level === verificationFilter;

    return matchesSearch && matchesDistrict && matchesStatus && matchesVerif;
  });

  const handleExportCSV = () => {
    const headers = ['Ref Code', 'Beneficiary Name', 'Phone', 'District', 'Education', 'Occupation', 'Trade', 'Status', 'Verification'];
    const rows = filtered.map((s) => [
      s.ref_code || s.id,
      `"${s.profile.name || s.profile.first_name || 'Beneficiary'}"`,
      `"${s.profile.phone_number || ''}"`,
      `"${s.profile.district || ''}"`,
      `"${s.profile.education_level || ''}"`,
      `"${s.profile.current_livelihood || s.profile.family_occupation || ''}"`,
      `"${s.profile.selected_trade_id || s.recommendations?.[0]?.trade.name_en || ''}"`,
      `"${s.profile.placement_status || ''}"`,
      `"${s.profile.verification_level || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PM_AJAY_Beneficiaries_${districtFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="beneficiaries-registry-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            PM-AJAY GIA Component • Beneficiary Roster
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            👥 अनुसूचित जाती लाभार्थी नोंदणी (Beneficiary Registry)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            जिल्हास्तरीय लाभार्थी प्रोफाइल, कौशल्य मॅपिंग, प्रशिक्षण व पडताळणी स्थिती.
          </p>
        </div>

        <button type="button" className="btn-secondary" onClick={handleExportCSV}>
          📥 CSV निर्यात करा (Export CSV)
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label className="form-label">नाव, फोन किंवा ID शोधा:</label>
            <input
              type="text"
              className="app-input"
              placeholder="e.g. Ramesh, 9876543210, PMAJAY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">जिल्हा (District):</label>
            <select
              className="app-input"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="ALL">सर्व जिल्हे (All Districts)</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">प्रगती स्थिती (Placement Status):</label>
            <select
              className="app-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">सर्व स्थिती (All Statuses)</option>
              <option value="NOT_STARTED">प्रारंभ नाही (Not Started)</option>
              <option value="ENROLLED">प्रशिक्षण नोंदणी (Enrolled)</option>
              <option value="IN_TRAINING">प्रशिक्षण सुरू (In Training)</option>
              <option value="COMPLETED">प्रशिक्षण पूर्ण (Completed)</option>
              <option value="EVIDENCE_SUBMITTED">पुरावा सादर (Evidence Submitted)</option>
              <option value="COORDINATOR_VERIFIED">सत्यापित (Coordinator Verified)</option>
              <option value="PLACED">रुजू (Placed)</option>
              <option value="SELF_EMPLOYED">स्वरोजगार (Self-Employed)</option>
            </select>
          </div>

          <div>
            <label className="form-label">पडताळणी स्तर (Verification Level):</label>
            <select
              className="app-input"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="ALL">सर्व पडताळणी स्तर (All)</option>
              <option value="SELF_REPORTED">स्व-घोषित (Self-Reported)</option>
              <option value="EVIDENCE_SUBMITTED">समीक्षाधीन (Under Review)</option>
              <option value="COORDINATOR_VERIFIED">समन्वयक सत्यापित (Coordinator Verified)</option>
              <option value="EMPLOYER_VERIFIED">नियोक्ता पुष्टीकृत (Employer Verified)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--stone)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>एकूण लाभार्थी संख्या: {filtered.length}</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>तपशील पाहण्यासाठी ओळीवर क्लिक करा (Click to view 360° Profile)</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="app-table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>संदर्भ कोड / नाव</th>
                <th>जिल्हा व फोन</th>
                <th>शिक्षण व व्यवसाय</th>
                <th>अनुशंसित ट्रेड</th>
                <th>प्रगती स्थिती</th>
                <th>पडताळणी स्तर</th>
                <th>कृती</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const prof = s.profile;
                const rec = s.recommendations?.[0];
                return (
                  <tr
                    key={s.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectSession(s)}
                  >
                    <td>
                      <strong>{prof.name || prof.first_name || 'Beneficiary'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}><code>{s.ref_code || s.id}</code></div>
                    </td>
                    <td>
                      <div>📍 {prof.district || 'Pune'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{prof.phone_number || '+91 98765 43210'}</div>
                    </td>
                    <td>
                      <div>🎓 {prof.education_level ? prof.education_level.replace('_', ' ') : '10th'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{prof.current_livelihood || prof.family_occupation || 'Daily Wage'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--field-deep)' }}>
                        {rec?.trade.name_local?.mr || rec?.trade.name_en || 'General Trade'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Level {rec?.trade.nsqf_level || 4} • QP: {rec?.trade.qp_code || 'AMH/Q0301'}
                      </div>
                    </td>
                    <td>
                      <span className="badge-placement">
                        {getPlacementStatusLabel(prof.placement_status || 'NOT_STARTED', 'mr')}
                      </span>
                    </td>
                    <td>
                      <span
                        className="meta-tag"
                        style={{
                          background:
                            prof.verification_level === 'COORDINATOR_VERIFIED' || prof.verification_level === 'EMPLOYER_VERIFIED'
                              ? '#E8F3ED'
                              : prof.verification_level === 'EVIDENCE_SUBMITTED'
                              ? '#FCF4E4'
                              : '#F0F4F8',
                          color:
                            prof.verification_level === 'COORDINATOR_VERIFIED' || prof.verification_level === 'EMPLOYER_VERIFIED'
                              ? '#1F6F4A'
                              : prof.verification_level === 'EVIDENCE_SUBMITTED'
                              ? '#8A5B00'
                              : 'var(--ink)',
                          fontWeight: 700
                        }}
                      >
                        {getVerificationLevelLabel(prof.verification_level || 'SELF_REPORTED', 'mr')}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-ctrl"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(s);
                        }}
                      >
                        पहा 👁️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
