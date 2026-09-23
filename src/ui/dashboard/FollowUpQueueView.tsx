// Disha Sarathi - Coordinator Post-Placement Follow-Up & Retention Queue (PS 26097)
import React, { useState } from 'react';
import { FollowUpRecord, FollowUpStatus, Session } from '../../core/types';
import { updateFollowUpRecord } from '../../core/store';

interface FollowUpQueueViewProps {
  sessions: Session[];
  onSelectBeneficiary?: (session: Session) => void;
  onRefresh?: () => void;
}

export const FollowUpQueueView: React.FC<FollowUpQueueViewProps> = ({
  sessions,
  onSelectBeneficiary,
  onRefresh
}) => {
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 7 | 30 | 90>('ALL');
  const [activeFollowUpId, setActiveFollowUpId] = useState<string | null>(null);
  const [wageStatus, setWageStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  // Aggregate all follow-ups from sessions
  const allFollowUps: Array<{ followUp: FollowUpRecord; session: Session }> = [];
  for (const s of sessions) {
    if (s.profile.follow_ups) {
      for (const fu of s.profile.follow_ups) {
        allFollowUps.push({ followUp: fu, session: s });
      }
    }
  }

  const filtered = periodFilter === 'ALL'
    ? allFollowUps
    : allFollowUps.filter((item) => item.followUp.period_days === periodFilter);

  const handleUpdate = async (fuId: string, status: FollowUpStatus) => {
    await updateFollowUpRecord(
      fuId,
      status,
      'Pooja Kulkarni (GIA Coordinator)',
      wageStatus || 'Workplace retained and salary received.',
      remarks || 'Follow-up conducted via phone call.'
    );
    setMsg(`✅ पाठपुरावा अहवाल यशस्वीरित्या ${status} म्हणून नोंदवला.`);
    setActiveFollowUpId(null);
    setWageStatus('');
    setRemarks('');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="follow-up-queue-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            PM-AJAY GIA Component • Post-Placement Retention & Welfare
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            📋 ७, ३० व ९० दिवसांचा पाठपुरावा कतार (Follow-Up Queue)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            रुजू झालेल्या अनुसूचित जाती उमेदवारांच्या नोकरीतील स्थिरता व वेतनाची नियमित तपासणी.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn-ctrl ${periodFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setPeriodFilter('ALL')}
          >
            सर्व ({allFollowUps.length})
          </button>
          <button
            type="button"
            className={`btn-ctrl ${periodFilter === 7 ? 'active' : ''}`}
            onClick={() => setPeriodFilter(7)}
          >
            ७ दिवस
          </button>
          <button
            type="button"
            className={`btn-ctrl ${periodFilter === 30 ? 'active' : ''}`}
            onClick={() => setPeriodFilter(30)}
          >
            ३० दिवस (वेतन)
          </button>
          <button
            type="button"
            className={`btn-ctrl ${periodFilter === 90 ? 'active' : ''}`}
            onClick={() => setPeriodFilter(90)}
          >
            ९० दिवस (शाश्वती)
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', color: 'var(--muted)' }}>
          या फिल्टरमध्ये कोणतेही पाठपुरावा नोंदी उपलब्ध नाहीत.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(({ followUp, session: s }) => {
            const isDone = followUp.status === 'RETAINED' || followUp.status === 'WAGE_RECEIVED';
            const isEditing = activeFollowUpId === followUp.id;

            return (
              <div
                key={followUp.id}
                className="dash-card"
                style={{
                  background: '#FFFFFF',
                  borderLeft: `4px solid ${isDone ? 'var(--field)' : '#E0A32E'}`,
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="demo-pill">{followUp.period_days}-Day Follow-Up</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>
                        {s.profile.name || s.profile.first_name || 'Beneficiary'}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}><code>{s.ref_code}</code></span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
                      📍 {s.profile.district || 'Pune'} • फोन: <strong>{s.profile.phone_number || '+91 98765 43210'}</strong> • देय दिनांक: <strong>{followUp.due_date}</strong>
                    </div>

                    {followUp.wage_status && (
                      <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--field-deep)', fontWeight: 600 }}>
                        💵 {followUp.wage_status}
                      </div>
                    )}
                    {followUp.remarks && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                        💬 {followUp.remarks} ({followUp.completed_by})
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      className="meta-tag"
                      style={{
                        background: isDone ? '#E8F3ED' : '#FFF8E6',
                        color: isDone ? '#1F6F4A' : '#8A5B00',
                        fontWeight: 800
                      }}
                    >
                      ● {followUp.status}
                    </span>

                    {onSelectBeneficiary && (
                      <button
                        type="button"
                        className="btn-ctrl"
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        onClick={() => onSelectBeneficiary(s)}
                      >
                        तपशील 👁️
                      </button>
                    )}
                  </div>
                </div>

                {/* Follow Up Action Bar */}
                <div style={{ marginTop: '12px', borderTop: '1px solid var(--stone-light)', paddingTop: '10px' }}>
                  {!isEditing ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                      onClick={() => setActiveFollowUpId(followUp.id)}
                    >
                      📝 पाठपुरावा अहवाल नोंदवा (Log Follow-Up)
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '480px' }}>
                      <input
                        type="text"
                        className="app-input"
                        placeholder="वेतन स्थिती (e.g. ₹18,500 received on 1st)..."
                        value={wageStatus}
                        onChange={(e) => setWageStatus(e.target.value)}
                      />
                      <input
                        type="text"
                        className="app-input"
                        placeholder="समन्वयक शेरा (Remarks)..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ background: '#1F6F4A', width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdate(followUp.id, 'WAGE_RECEIVED')}
                        >
                          ✓ वेतन व रुजू पुष्टी (Confirmed)
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: '#8A5B00' }}
                          onClick={() => handleUpdate(followUp.id, 'ISSUE_REPORTED')}
                        >
                          ⚠️ समस्या नोंदवा (Issue)
                        </button>
                        <button
                          type="button"
                          className="btn-ctrl"
                          style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => setActiveFollowUpId(null)}
                        >
                          रद्द
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
