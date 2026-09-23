import React, { useState } from 'react';
import { PlacementStatus, Session } from '../../core/types';
import { getPlacementStatusLabel } from '../../core/placement';

interface PipelineViewProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({ sessions, onSelectSession }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const total = sessions.length;
  const recommended = sessions.filter((s) => s.recommendations && s.recommendations.length > 0).length;
  const inTrainingOrEnrolled = sessions.filter(
    (s) => s.profile.placement_status === 'ENROLLED' || s.profile.placement_status === 'IN_TRAINING'
  ).length;
  const completedTraining = sessions.filter(
    (s) => s.profile.placement_status === 'COMPLETED' || s.profile.placement_status === 'REFERRED' || s.profile.placement_status === 'PLACED'
  ).length;
  const placedWage = sessions.filter(
    (s) => s.profile.placement_status === 'PLACED' || s.profile.placement_status === 'REFERRED' || s.profile.placement_status === 'INTERVIEW'
  ).length;
  const enterpriseCount = sessions.filter(
    (s) => s.profile.placement_status === 'SELF_EMPLOYED' || s.profile.wants_finance_assistance
  ).length;

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'placed') return s.profile.placement_status === 'PLACED' || s.profile.placement_status === 'REFERRED';
    if (statusFilter === 'enterprise') return s.profile.placement_status === 'SELF_EMPLOYED' || s.profile.wants_finance_assistance;
    if (statusFilter === 'training') return s.profile.placement_status === 'ENROLLED' || s.profile.placement_status === 'IN_TRAINING' || s.profile.placement_status === 'COMPLETED';
    return s.state === statusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
          📈 लाभार्थी प्रगति एवं प्लेसमेंट पाइपलाइन (Beneficiary & Placement Pipeline)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          पीएम-अजय लाभार्थियों की कौशल मैपिंग, प्रशिक्षण नामांकन, प्रमाणन एवं रोजगार/स्वरोजगार स्थिति।
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <div className="rec-card" style={{ padding: '14px', borderLeft: '4px solid var(--sky)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>कुल परामर्शित</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>{total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Total Beneficiaries</div>
        </div>

        <div className="rec-card" style={{ padding: '14px', borderLeft: '4px solid var(--field)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>हुनर मैपिंग पूर्ण</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--field-deep)', marginTop: '2px' }}>{recommended}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>NSQF Trade Mapped</div>
        </div>

        <div className="rec-card" style={{ padding: '14px', borderLeft: '4px solid #205493' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>प्रशिक्षण नामांकित / पूर्ण</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#205493', marginTop: '2px' }}>
            {inTrainingOrEnrolled + completedTraining}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Enrolled & Certified</div>
        </div>

        <div className="rec-card" style={{ padding: '14px', borderLeft: '4px solid #1F6F4A' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>रोजगार लिंकेज / रेफरल</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1F6F4A', marginTop: '2px' }}>{placedWage}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Wage Placements / Referrals</div>
        </div>

        <div className="rec-card" style={{ padding: '14px', borderLeft: '4px solid var(--turmeric)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>स्वरोजगार ऋण सहायता</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#8A5B00', marginTop: '2px' }}>{enterpriseCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>NSFDC / PM-SVANidhi</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)' }}>फ़िल्टर:</span>
        <button
          type="button"
          className={`btn-ctrl ${statusFilter === 'all' ? 'active' : ''}`}
          style={{ background: statusFilter === 'all' ? 'var(--field-light)' : 'transparent', fontSize: '0.8rem' }}
          onClick={() => setStatusFilter('all')}
        >
          सभी लाभार्थी ({sessions.length})
        </button>
        <button
          type="button"
          className={`btn-ctrl ${statusFilter === 'training' ? 'active' : ''}`}
          style={{ background: statusFilter === 'training' ? 'var(--field-light)' : 'transparent', fontSize: '0.8rem' }}
          onClick={() => setStatusFilter('training')}
        >
          🎓 प्रशिक्षण में ({inTrainingOrEnrolled + completedTraining})
        </button>
        <button
          type="button"
          className={`btn-ctrl ${statusFilter === 'placed' ? 'active' : ''}`}
          style={{ background: statusFilter === 'placed' ? 'var(--field-light)' : 'transparent', fontSize: '0.8rem' }}
          onClick={() => setStatusFilter('placed')}
        >
          💼 रोजगार रेफरल ({placedWage})
        </button>
        <button
          type="button"
          className={`btn-ctrl ${statusFilter === 'enterprise' ? 'active' : ''}`}
          style={{ background: statusFilter === 'enterprise' ? 'var(--field-light)' : 'transparent', fontSize: '0.8rem' }}
          onClick={() => setStatusFilter('enterprise')}
        >
          🏪 स्वरोजगार ({enterpriseCount})
        </button>
      </div>

      {/* Recent Sessions Table */}
      <div style={{ background: 'var(--paper-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--stone)', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref Code</th>
              <th>नाम / जिला</th>
              <th>शिक्षा</th>
              <th>प्राथमिकता</th>
              <th>अनुशंसित एनएसक्यूएफ कोर्स</th>
              <th>पहचाने गए कौशल अंतर (Skill Gaps)</th>
              <th>प्लेसमेंट लिंकेज स्थिति</th>
              <th>विवरण</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.slice(0, 25).map((sess) => {
              const rec = sess.recommendations?.[0];
              const pStatus: PlacementStatus = sess.profile.placement_status || (sess.state === 'END' ? 'COMPLETED' : 'NOT_STARTED');
              const gaps = rec?.skill_gap?.training_required_skills || [];

              return (
                <tr key={sess.id}>
                  <td><code>{sess.ref_code}</code></td>
                  <td>
                    <strong>{sess.profile.first_name || 'Beneficiary'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {sess.profile.district || 'Varanasi'}, {sess.profile.state || 'UP'}
                    </div>
                  </td>
                  <td>{sess.profile.education_level || 'Middle'}</td>
                  <td>
                    {sess.profile.employment_preference === 'self_employment' ? (
                      <span style={{ color: '#8A5B00', fontWeight: 600 }}>स्वरोजगार</span>
                    ) : (
                      <span style={{ color: '#205493', fontWeight: 600 }}>वेतन रोजगार</span>
                    )}
                  </td>
                  <td>
                    <strong>{rec?.trade.name_en.slice(0, 24) || 'Tailor'}...</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      NSQF L{rec?.trade.nsqf_level || 4} • QP: {rec?.trade.qp_code || 'AMH/Q0301'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: '#A8322D', maxWidth: '200px' }}>
                      {gaps.length > 0 ? gaps.slice(0, 2).join(', ') : 'Safety & Certification'}
                    </div>
                  </td>
                  <td>
                    <span
                      className="meta-tag"
                      style={{
                        background:
                          pStatus === 'PLACED' || pStatus === 'SELF_EMPLOYED'
                            ? '#E8F3ED'
                            : pStatus === 'REFERRED' || pStatus === 'COMPLETED'
                            ? '#FCF4E4'
                            : '#EAF0F6',
                        color:
                          pStatus === 'PLACED' || pStatus === 'SELF_EMPLOYED'
                            ? '#1F6F4A'
                            : pStatus === 'REFERRED' || pStatus === 'COMPLETED'
                            ? '#8A5B00'
                            : '#205493',
                        fontWeight: 700
                      }}
                    >
                      ● {getPlacementStatusLabel(pStatus, 'hi')}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-ctrl"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => onSelectSession(sess)}
                    >
                      ट्रेस देखें (Trace) 🔍
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
