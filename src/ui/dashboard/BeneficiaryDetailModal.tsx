// Disha Sarathi - Comprehensive 360° Beneficiary Detail & Management Portal (PS 26097)
import React, { useState } from 'react';
import { PlacementStatus, Session, VerificationLevel } from '../../core/types';
import { MiniMap } from '../components/MiniMap';
import { getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';
import { addCoordinatorNote, reviewPlacementEvidence, updateSession } from '../../core/store';

interface BeneficiaryDetailModalProps {
  session: Session | null;
  onClose: () => void;
  onSessionUpdated?: (updated: Session) => void;
}

export const BeneficiaryDetailModal: React.FC<BeneficiaryDetailModalProps> = ({
  session,
  onClose,
  onSessionUpdated
}) => {
  if (!session) return null;

  const [activeTab, setActiveTab] = useState<'TRACE' | 'TRANSCRIPT' | 'TRAINING_PLACEMENT' | 'EVIDENCE' | 'NOTES'>('TRACE');
  const [currentSession, setCurrentSession] = useState<Session>(session);
  const [newNote, setNewNote] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const profile = currentSession.profile;
  const trace = currentSession.trace;
  const rec = currentSession.recommendations?.[0];
  const placementStatus = profile.placement_status || 'NOT_STARTED';

  const handleUpdatePlacementStatus = async (newStatus: PlacementStatus) => {
    const updated = await updateSession(currentSession.id, {
      profile: {
        ...currentSession.profile,
        placement_status: newStatus
      }
    });
    if (updated) {
      setCurrentSession(updated);
      if (onSessionUpdated) onSessionUpdated(updated);
      setStatusMsg(`✅ लाभार्थी प्रगती स्थिती "${newStatus}" म्हणून अद्ययावत केली.`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addCoordinatorNote(currentSession.id, 'Pooja Kulkarni (GIA Coordinator)', newNote.trim());
    const updated = await updateSession(currentSession.id, {
      profile: {
        ...currentSession.profile,
        coordinator_notes: [
          {
            id: `note_${Date.now()}`,
            beneficiary_id: currentSession.id,
            coordinator_name: 'Pooja Kulkarni (GIA Coordinator)',
            content: newNote.trim(),
            created_at: new Date().toISOString()
          },
          ...(currentSession.profile.coordinator_notes || [])
        ]
      }
    });
    if (updated) {
      setCurrentSession(updated);
      if (onSessionUpdated) onSessionUpdated(updated);
      setNewNote('');
      setStatusMsg('✅ समन्वयक शेरा यशस्वीरित्या जोडला (Note added).');
    }
  };

  const handleReviewEvidence = async (evidenceId: string, decision: VerificationLevel) => {
    await reviewPlacementEvidence(
      evidenceId,
      decision,
      'Pooja Kulkarni (GIA Coordinator)',
      'Verified in 360° Beneficiary Review Portal'
    );
    const updated = await updateSession(currentSession.id, {
      profile: {
        ...currentSession.profile,
        verification_level: decision,
        placement_status: decision === 'COORDINATOR_VERIFIED' ? 'PLACED' : currentSession.profile.placement_status,
        evidence_list: (currentSession.profile.evidence_list || []).map((ev) =>
          ev.id === evidenceId ? { ...ev, status: decision, verified_at: new Date().toISOString() } : ev
        )
      }
    });
    if (updated) {
      setCurrentSession(updated);
      if (onSessionUpdated) onSessionUpdated(updated);
      setStatusMsg(`✅ रुजू पुरावा ${decision} म्हणून चिन्हांकित केला.`);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 32, 26, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div
        className="modal-dialog dash-card"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--stone)', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="demo-pill">PM-AJAY 360° Beneficiary View</span>
              <span className="meta-tag">Ref: <strong>{currentSession.ref_code}</strong></span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>
              {profile.name || profile.first_name || 'Ramesh Sonawane'} — {profile.district || 'Pune'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              फोन: {profile.phone_number || '+91 98765 43210'} • शिक्षण: {profile.education_level ? profile.education_level.replace('_', ' ') : '10th'} • भाषा: {currentSession.lang.toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            className="btn-ctrl"
            onClick={onClose}
            style={{ fontWeight: 'bold', fontSize: '1.2rem', padding: '4px 10px' }}
          >
            ✕
          </button>
        </div>

        {statusMsg && (
          <div style={{ padding: '8px 14px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
            {statusMsg}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '2px solid var(--stone-light)', paddingBottom: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'TRACE', label: '🔬 व्याख्यात्मक ट्रेस व नकाशा (Trace & Map)' },
            { id: 'TRAINING_PLACEMENT', label: '🏫 प्रशिक्षण व लिंकेज (Pipeline)' },
            { id: 'EVIDENCE', label: '📑 पुरावे व पडताळणी (Evidence)' },
            { id: 'TRANSCRIPT', label: '🎙️ संभाषण लॉग (Transcript)' },
            { id: 'NOTES', label: '📝 समन्वयक शेरे (Notes & Audit)' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn-ctrl ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                background: activeTab === tab.id ? 'var(--field-light)' : 'transparent',
                color: activeTab === tab.id ? 'var(--field-deep)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: TRACE & MAP */}
        {activeTab === 'TRACE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Profile Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'var(--paper)', padding: '12px', borderRadius: '8px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>कौटुंबिक व्यवसाय:</span>
                <div style={{ fontWeight: 700 }}>{profile.family_occupation || 'Handloom & Agri'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>सध्याचे काम:</span>
                <div style={{ fontWeight: 700 }}>{profile.current_livelihood || 'Daily Wage'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>कौशल्य व आवडी:</span>
                <div style={{ fontWeight: 700 }}>{profile.skills_interests.join(', ') || 'Electrical, Stitching'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>प्रवास मर्यादा:</span>
                <div style={{ fontWeight: 700 }}>{profile.travel_radius_km || 15} किमी (km)</div>
              </div>
            </div>

            {/* Skill Gap Summary */}
            {rec?.skill_gap && (
              <div style={{ background: '#FFFDF9', border: '1px solid #E0A32E', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#8A5B00', fontSize: '0.9rem' }}>
                  ⚠️ कौशल्य अंतर (Skill Gap Analysis - {rec.trade.name_en}):
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  <strong>आवश्यक प्रशिक्षण:</strong> {rec.skill_gap.training_required_skills.join(', ')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                  <strong>योजना हस्तक्षेप:</strong> {rec.skill_gap.recommended_intervention}
                </div>
              </div>
            )}

            {/* Mini Map */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                📍 स्थान, प्रशिक्षण केंद्र व प्रवास परिमिती
              </h4>
              <MiniMap
                lat={profile.lat || 18.5204}
                lng={profile.lng || 73.8567}
                radiusKm={profile.travel_radius_km || 15}
                centerName={rec?.nearest_center?.center.name || 'Pune Kaushal Kendra'}
                centerLat={rec?.nearest_center?.center.lat || 18.5204}
                centerLng={rec?.nearest_center?.center.lng || 73.8567}
              />
            </div>

            {/* 6-Factor Deterministic Score Breakdown */}
            {trace && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
                  🔬 6-घटक व्याख्यात्मक मॉडेल ट्रेस (6-Factor Deterministic Scoring Matrix)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '8px' }}>
                  Score = 0.32·interest + 0.20·transfer + 0.16·edu + 0.16·demand + 0.10·pref + 0.06·access
                </p>

                <div style={{ overflowX: 'auto', border: '1px solid var(--stone)', borderRadius: '8px' }}>
                  <table className="app-table" style={{ width: '100%', margin: 0, fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>NSQF Trade</th>
                        <th>Interest (32%)</th>
                        <th>Transfer (20%)</th>
                        <th>Edu (16%)</th>
                        <th>Demand (16%)</th>
                        <th>Pref (10%)</th>
                        <th>Access (6%)</th>
                        <th>Final Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trace.surviving_candidates.slice(0, 5).map((cand) => (
                        <tr key={cand.trade_id}>
                          <td><strong>{cand.trade_name}</strong></td>
                          <td>{cand.interest_match}</td>
                          <td>{cand.skill_transfer}</td>
                          <td>{cand.education_fit}</td>
                          <td>{cand.local_demand}</td>
                          <td>{cand.preference_fit}</td>
                          <td>{cand.accessibility}</td>
                          <td>
                            <strong style={{ color: 'var(--field-deep)' }}>
                              {cand.final_score}
                            </strong>
                            {cand.no_center_in_range && (
                              <span style={{ fontSize: '0.7rem', color: '#A8322D', display: 'block' }}>
                                (0.6x Transport Penalty)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAINING & PLACEMENT PIPELINE */}
        {activeTab === 'TRAINING_PLACEMENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dash-card" style={{ background: '#F8FBF9', padding: '16px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                🎯 कोर्स व प्रशिक्षण केंद्र निवड
              </h4>
              <div style={{ fontSize: '0.9rem' }}>
                <div><strong>निवडलेला कोर्स:</strong> {rec?.trade.name_local?.mr || rec?.trade.name_en || 'General NSQF Trade'} (Level {rec?.trade.nsqf_level || 4})</div>
                <div><strong>प्रशिक्षण केंद्र:</strong> {rec?.nearest_center?.center.name || 'District PM-AJAY Kaushal Kendra, Pune'}</div>
                <div><strong>कालावधी:</strong> {rec?.trade.duration_hours || 300} तास • <strong>वेतन श्रेणी:</strong> {rec?.trade.typical_wage_band_inr || '15,000 - 22,000 / month'}</div>
              </div>
            </div>

            <div className="dash-card" style={{ background: '#FFFFFF', padding: '16px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                ⚙️ समन्वयकाद्वारे प्रगती स्थिती बदल (Update Placement Lifecycle)
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '12px' }}>
                सध्याची स्थिती: <strong>{getPlacementStatusLabel(placementStatus, 'mr')}</strong>
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['ENROLLED', 'IN_TRAINING', 'COMPLETED', 'REFERRED', 'INTERVIEW', 'SELECTED', 'PLACED', 'SELF_EMPLOYED'] as PlacementStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn-ctrl ${placementStatus === st ? 'active' : ''}`}
                    style={{
                      background: placementStatus === st ? 'var(--field)' : '#F8F9FA',
                      color: placementStatus === st ? '#FFFFFF' : 'var(--ink)',
                      fontWeight: 700,
                      fontSize: '0.8rem'
                    }}
                    onClick={() => handleUpdatePlacementStatus(st)}
                  >
                    ● {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE VERIFICATION */}
        {activeTab === 'EVIDENCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
              📑 लाभार्थ्याने सादर केलेले रुजू पुरावे (Submitted Evidence Proofs)
            </h4>

            {(!profile.evidence_list || profile.evidence_list.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', background: '#F8F9FA', borderRadius: '8px', color: 'var(--muted)' }}>
                या लाभार्थ्याने अद्याप कोणताही पुरावा सादर केलेला नाही.
              </div>
            ) : (
              profile.evidence_list.map((ev) => (
                <div key={ev.id} className="dash-card" style={{ background: '#FFFFFF', border: '1px solid var(--stone)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>
                        🏢 {ev.employer_name} — <em>{ev.designation}</em>
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                        प्रकार: <strong>{ev.evidence_type}</strong> • फाईल: <code>{ev.document_name}</code> • वेतन: <strong>{ev.monthly_wage_inr}</strong> • रुजू दिनांक: {ev.joining_date}
                      </div>
                    </div>

                    <span className="meta-tag" style={{ background: ev.status === 'COORDINATOR_VERIFIED' ? '#E8F3ED' : '#FCF4E4', color: ev.status === 'COORDINATOR_VERIFIED' ? '#1F6F4A' : '#8A5B00', fontWeight: 800 }}>
                      ● {getVerificationLevelLabel(ev.status, 'mr')}
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', borderTop: '1px solid var(--stone-light)', paddingTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: '#1F6F4A', width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleReviewEvidence(ev.id, 'COORDINATOR_VERIFIED')}
                    >
                      ✓ पुरावा मंजूर व सत्यापित करा (Approve)
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: '#8A5B00' }}
                      onClick={() => handleReviewEvidence(ev.id, 'NEEDS_CORRECTION')}
                    >
                      ⚠️ दुरुस्ती मागवा (Correction)
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', color: '#A8322D' }}
                      onClick={() => handleReviewEvidence(ev.id, 'REJECTED')}
                    >
                      ✕ नाकारा (Reject)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: CONVERSATION TRANSCRIPT */}
        {activeTab === 'TRANSCRIPT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
              🎙️ संपूर्ण संभाषण इतिहास (Web Voice & PSTN Phone Call Transcript)
            </h4>

            {(!currentSession.transcript || currentSession.transcript.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', background: '#F8F9FA', borderRadius: '8px', color: 'var(--muted)' }}>
                या सत्रात कोणताही संभाषण इतिहास उपलब्ध नाही.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', padding: '8px', background: '#F8F9FA', borderRadius: '8px' }}>
                {currentSession.transcript.map((turn, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: turn.sender === 'bot' ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        background: turn.sender === 'bot' ? '#FFFFFF' : 'var(--field)',
                        color: turn.sender === 'bot' ? 'var(--ink)' : '#FFFFFF',
                        border: turn.sender === 'bot' ? '1px solid var(--stone)' : 'none',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '2px', opacity: 0.8 }}>
                        {turn.sender === 'bot' ? '🤖 दिशा सारथी (Bot)' : '👤 लाभार्थी (Beneficiary)'}
                      </div>
                      {turn.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTES & AUDIT */}
        {activeTab === 'NOTES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
              📝 GIA समन्वयक शेरे व ऑडिट ट्रेल (Coordinator Notes & Audit Trail)
            </h4>

            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="app-input"
                placeholder="नवीन समन्वयक शेरा प्रविष्ट करा (e.g. Beneficiary verified by phone)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                + शेरा जोडा
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!profile.coordinator_notes || profile.coordinator_notes.length === 0) ? (
                <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  अद्याप कोणतेही शेरे जोडलेले नाहीत.
                </div>
              ) : (
                profile.coordinator_notes.map((note) => (
                  <div key={note.id} style={{ padding: '10px 12px', background: '#F8FBF9', borderLeft: '3px solid var(--field)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div><strong>{note.coordinator_name}</strong>: {note.content}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                      दिनांक: {new Date(note.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--stone-light)', paddingTop: '12px' }}>
          <button type="button" className="btn-primary" style={{ width: 'auto' }} onClick={onClose}>
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
