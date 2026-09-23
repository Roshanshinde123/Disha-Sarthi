// Disha Sarathi - Beneficiary Follow-Up Tracker (PS 26097)
import React, { useState } from 'react';
import { FollowUpRecord, Session } from '../../core/types';
import { updateFollowUpRecord } from '../../core/store';

interface FollowUpViewProps {
  session: Session;
  onBack?: () => void;
}

export const FollowUpView: React.FC<FollowUpViewProps> = ({ session, onBack }) => {
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(
    session.profile.follow_ups || [
      {
        id: `fu_${session.id}_7d`,
        beneficiary_id: session.id,
        period_days: 7,
        due_date: '2026-02-08',
        status: 'RETAINED',
        completed_at: '2026-02-08T11:00:00Z',
        completed_by: 'Pooja Kulkarni (Coordinator)',
        wage_status: 'कामावर रुजू, कामाचे वातावरण सकारात्मक.',
        remarks: 'लाभार्थ्याने समाधान व्यक्त केले.'
      },
      {
        id: `fu_${session.id}_30d`,
        beneficiary_id: session.id,
        period_days: 30,
        due_date: '2026-03-02',
        status: 'WAGE_RECEIVED',
        completed_at: '2026-03-03T10:00:00Z',
        completed_by: 'Pooja Kulkarni (Coordinator)',
        wage_status: 'पहिले वेतन ₹18,500 बँक खात्यात जमा झाले.',
        remarks: 'पे-स्लिप समन्वयकाने तपासली.'
      },
      {
        id: `fu_${session.id}_90d`,
        beneficiary_id: session.id,
        period_days: 90,
        due_date: '2026-05-02',
        status: 'PENDING',
        remarks: 'त्रैमासिक उपजीविका स्थिरता तपासणी नियोजित.'
      }
    ]
  );

  const [feedbackNote, setFeedbackNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const handleSelfReportWage = async (periodDays: 7 | 30 | 90) => {
    const fu = followUps.find((f) => f.period_days === periodDays);
    if (!fu) return;

    await updateFollowUpRecord(
      fu.id,
      'WAGE_RECEIVED',
      'Self-Reported (Beneficiary)',
      'वेतन वेळेवर मिळाले आणि काम समाधानकारक आहे.',
      feedbackNote || 'Beneficiary submitted 30-day retention confirmation.'
    );

    const updated = followUps.map((f) =>
      f.id === fu.id ? { ...f, status: 'WAGE_RECEIVED' as const, completed_at: new Date().toISOString() } : f
    );
    setFollowUps(updated);
    setMsg(`✅ ${periodDays} दिवसांचा पाठपुरावा अहवाल यशस्वीरित्या नोंदवला!`);
  };

  return (
    <div className="follow-up-page" style={{ paddingBottom: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        {onBack && (
          <button type="button" className="btn-ctrl" onClick={onBack} style={{ marginBottom: '6px' }}>
            ← मागे जा (Back)
          </button>
        )}
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          PM-AJAY GIA Component • Post-Placement Retention & Welfare Tracking
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
          📋 ७, ३० व ९० दिवसांचा पाठपुरावा (Follow-Up Lifecycle)
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          नोकरी किंवा व्यवसायात रुजू झाल्यानंतर उपजीविकेची शाश्वती व वेतन नियमिततेचा पाठपुरावा.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700, marginBottom: '16px' }}>
          {msg}
        </div>
      )}

      {/* Follow Up Milestones Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {followUps.map((fu) => {
          const isDone = fu.status === 'RETAINED' || fu.status === 'WAGE_RECEIVED';
          return (
            <div
              key={fu.id}
              className="dash-card"
              style={{
                background: isDone ? '#F8FBF9' : '#FFFFFF',
                borderLeft: `4px solid ${isDone ? 'var(--field)' : '#E0A32E'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {fu.period_days} दिवसांचा टप्पा ({fu.period_days}-Day Milestone)
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
                    {fu.period_days === 7
                      ? 'कामावर रुजू व वातावरण तपासणी (7-Day Check-in)'
                      : fu.period_days === 30
                      ? 'प्रथम वेतन व हजेरी तपासणी (30-Day First Wage)'
                      : 'त्रैमासिक उपजीविका शाश्वती (90-Day Sustainability)'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                    नियोजित दिनांक: <strong>{fu.due_date}</strong>
                  </div>
                </div>

                <span
                  className="meta-tag"
                  style={{
                    background: isDone ? '#E8F3ED' : '#FFF8E6',
                    color: isDone ? '#1F6F4A' : '#8A5B00',
                    fontWeight: 800,
                    padding: '6px 12px'
                  }}
                >
                  ● {fu.status}
                </span>
              </div>

              {fu.wage_status && (
                <div style={{ marginTop: '10px', fontSize: '0.88rem', color: 'var(--ink)', background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--stone-light)' }}>
                  💵 <strong>वेतन व स्थिती:</strong> {fu.wage_status}
                </div>
              )}

              {fu.remarks && (
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  💬 <strong>शेरा:</strong> {fu.remarks} ({fu.completed_by || 'GIA Nodal'})
                </div>
              )}

              {fu.status === 'PENDING' && (
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="app-input"
                    placeholder="तुमचा अनुभव / वेतन मिळाल्याची नोंद लिहा..."
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    style={{ flex: 1, minWidth: '220px' }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => handleSelfReportWage(fu.period_days)}
                  >
                    ✓ वेतन प्राप्त झाले नोंदवा
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
