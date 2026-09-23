// Disha Sarathi - Dedicated Placement Verification Queue for GIA Coordinators (PS 26097)
import React, { useState, useEffect } from 'react';
import { PlacementEvidence, VerificationLevel } from '../../core/types';
import { getAllEvidence, reviewPlacementEvidence } from '../../core/store';
import { getVerificationLevelLabel } from '../../core/placement';

interface VerificationQueueViewProps {
  onSelectBeneficiary?: (beneficiaryId: string) => void;
}

export const VerificationQueueView: React.FC<VerificationQueueViewProps> = ({
  onSelectBeneficiary
}) => {
  const [evidenceList, setEvidenceList] = useState<PlacementEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    setLoading(true);
    const list = await getAllEvidence();
    setEvidenceList(list);
    setLoading(false);
  };

  const handleReview = async (evidenceId: string, decision: VerificationLevel) => {
    await reviewPlacementEvidence(
      evidenceId,
      decision,
      'Pooja Kulkarni (GIA Coordinator)',
      reviewNotes || undefined
    );
    setActionMessage(`✅ पुरावा यशस्वीरित्या ${decision} म्हणून चिन्हांकित केला! (Evidence marked as ${decision})`);
    setActiveReviewId(null);
    setReviewNotes('');
    loadEvidence();
  };

  const filtered = statusFilter === 'ALL'
    ? evidenceList
    : evidenceList.filter((e) => e.status === statusFilter);

  const pendingCount = evidenceList.filter((e) => e.status === 'EVIDENCE_SUBMITTED').length;
  const verifiedCount = evidenceList.filter((e) => e.status === 'COORDINATOR_VERIFIED' || e.status === 'EMPLOYER_VERIFIED').length;

  return (
    <div className="verification-queue-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            PM-AJAY GIA Component • Placement Audit & Verification
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            📑 रुजू पुरावा पडताळणी कतार (Evidence Verification Queue)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            लाभार्थ्यांनी सादर केलेल्या ऑफर लेटर्स, नियुक्ती पत्रे व आयडी कार्ड्सची प्रत्यक्ष तपासणी व प्रमाणीकरण.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="dash-card" style={{ padding: '8px 14px', background: '#FCF4E4', borderLeft: '4px solid #E0A32E' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8A5B00' }}>समीक्षा प्रलंबित (Pending Review):</div>
            <strong style={{ fontSize: '1.2rem', color: '#8A5B00' }}>{pendingCount}</strong>
          </div>
          <div className="dash-card" style={{ padding: '8px 14px', background: '#E8F3ED', borderLeft: '4px solid #1F6F4A' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F6F4A' }}>सत्यापित (Verified):</div>
            <strong style={{ fontSize: '1.2rem', color: '#1F6F4A' }}>{verifiedCount}</strong>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '10px 14px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700 }}>
          {actionMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--stone)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {[
          { label: 'सर्व पुरावे (All)', value: 'ALL' },
          { label: `प्रलंबित तपासणी (${pendingCount})`, value: 'EVIDENCE_SUBMITTED' },
          { label: 'समन्वयक सत्यापित (Coordinator Verified)', value: 'COORDINATOR_VERIFIED' },
          { label: 'नियोक्ता पुष्टीकृत (Employer Verified)', value: 'EMPLOYER_VERIFIED' },
          { label: 'दुरुस्ती आवश्यक (Needs Correction)', value: 'NEEDS_CORRECTION' },
          { label: 'अस्वीकृत (Rejected)', value: 'REJECTED' }
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`btn-ctrl ${statusFilter === tab.value ? 'active' : ''}`}
            style={{
              background: statusFilter === tab.value ? 'var(--field-light)' : 'transparent',
              color: statusFilter === tab.value ? 'var(--field-deep)' : 'var(--muted)',
              fontWeight: 700
            }}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          className="btn-ctrl"
          style={{ marginLeft: 'auto' }}
          onClick={loadEvidence}
        >
          🔄 रिफ्रेश (Refresh)
        </button>
      </div>

      {/* Evidence Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>पुरावे लोड होत आहेत...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#FFFFFF', borderRadius: '12px', color: 'var(--muted)' }}>
          या फिल्टरमध्ये कोणतेही पुरावे उपलब्ध नाहीत.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((ev) => {
            const isReviewing = activeReviewId === ev.id;
            return (
              <div
                key={ev.id}
                className="dash-card"
                style={{
                  background: '#FFFFFF',
                  borderLeft: `5px solid ${
                    ev.status === 'COORDINATOR_VERIFIED' || ev.status === 'EMPLOYER_VERIFIED'
                      ? 'var(--field)'
                      : ev.status === 'REJECTED'
                      ? 'var(--madder)'
                      : '#E0A32E'
                  }`,
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="demo-pill" style={{ fontSize: '0.7rem' }}>ID: {ev.id}</span>
                      <span className="meta-tag">{ev.evidence_type}</span>
                      {ev.is_demo && <span className="demo-pill">Demo seed</span>}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)', marginTop: '6px' }}>
                      🏢 {ev.employer_name} — <em>{ev.designation}</em>
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
                      लाभार्थी ID: <strong>{ev.beneficiary_id}</strong> • दस्तऐवज: <code>{ev.document_name}</code> • वेतन: <strong>{ev.monthly_wage_inr}</strong> • रुजू दिनांक: <strong>{ev.joining_date}</strong>
                    </div>

                    {ev.coordinator_notes && (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#F8FBF9', borderRadius: '6px', fontSize: '0.82rem', color: '#165036' }}>
                        💬 <strong>समन्वयक शेरा:</strong> {ev.coordinator_notes} (सत्यापित: {ev.verified_by || 'GIA Nodal'})
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span
                      className="meta-tag"
                      style={{
                        padding: '6px 12px',
                        background:
                          ev.status === 'COORDINATOR_VERIFIED' || ev.status === 'EMPLOYER_VERIFIED'
                            ? '#E8F3ED'
                            : ev.status === 'REJECTED'
                            ? '#F7E9E8'
                            : '#FCF4E4',
                        color:
                          ev.status === 'COORDINATOR_VERIFIED' || ev.status === 'EMPLOYER_VERIFIED'
                            ? '#1F6F4A'
                            : ev.status === 'REJECTED'
                            ? '#A8322D'
                            : '#8A5B00',
                        fontWeight: 800
                      }}
                    >
                      ● {getVerificationLevelLabel(ev.status, 'mr')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      सादर: {new Date(ev.submitted_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Review Action Controls */}
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--stone-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onSelectBeneficiary && (
                      <button
                        type="button"
                        className="btn-ctrl"
                        onClick={() => onSelectBeneficiary(ev.beneficiary_id)}
                      >
                        👤 लाभार्थी तपशील उघडा (View 360° Profile)
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isReviewing ? (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
                        onClick={() => {
                          setActiveReviewId(ev.id);
                          setReviewNotes(ev.coordinator_notes || '');
                        }}
                      >
                        ⚖️ तपासणी निर्णय घ्या (Review Evidence)
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '480px' }}>
                        <input
                          type="text"
                          className="app-input"
                          placeholder="समन्वयक शेरा प्रविष्ट करा (e.g. Verified with offer letter & HR)..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ background: '#1F6F4A', width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleReview(ev.id, 'COORDINATOR_VERIFIED')}
                          >
                            ✓ मंजूर व सत्यापित करा (Approve)
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: '#8A5B00', borderColor: '#E0A32E' }}
                            onClick={() => handleReview(ev.id, 'NEEDS_CORRECTION')}
                          >
                            ⚠️ दुरुस्ती मागवा (Correction)
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: '#A8322D', borderColor: '#A8322D' }}
                            onClick={() => handleReview(ev.id, 'REJECTED')}
                          >
                            ✕ नाकारा (Reject)
                          </button>
                          <button
                            type="button"
                            className="btn-ctrl"
                            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => setActiveReviewId(null)}
                          >
                            रद्द
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
