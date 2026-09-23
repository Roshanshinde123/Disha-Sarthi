// Disha Sarathi - Post-Training Placement & Opportunity Linkage Engine (PS 26097)
import React, { useState } from 'react';
import { ConversationEvent, Opportunity, PlacementEvidence, PlacementStatus, Session } from '../../core/types';
import { getOpportunitiesForTradeAndDistrict, getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';
import { EvidenceUploadModal } from './EvidenceUploadModal';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface PlacementViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
  onNavigateToFollowUp?: () => void;
  onNavigateToCard?: () => void;
}

export const PlacementView: React.FC<PlacementViewProps> = ({
  session,
  onEvent,
  onNavigateToFollowUp,
  onNavigateToCard
}) => {
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [localEvidenceList, setLocalEvidenceList] = useState<PlacementEvidence[]>(
    session.profile.evidence_list || []
  );

  const selectedTradeId =
    session.profile.selected_trade_id || session.recommendations?.[0]?.trade.id || 'app_sewing_machine_op';
  const trade =
    (nsqfTradesData as any[]).find((t) => t.id === selectedTradeId) || session.recommendations?.[0]?.trade;
  const nearestCenter = session.recommendations?.[0]?.nearest_center?.center;

  const [currentStatus, setCurrentStatus] = useState<PlacementStatus>(
    session.profile.placement_status || 'ENROLLED'
  );

  const opportunities: Opportunity[] = getOpportunitiesForTradeAndDistrict(
    selectedTradeId,
    session.profile.district,
    session.profile.employment_preference
  );

  const handleSimulateCompletion = () => {
    const nextStatus: PlacementStatus = 'COMPLETED';
    setCurrentStatus(nextStatus);
    onEvent({
      type: 'UPDATE_PLACEMENT',
      payload: {
        status: nextStatus,
        notes: `Simulated training completion for ${trade?.name_en || 'Trade'} under PM-AJAY GIA.`
      }
    });
  };

  const handleSelectOpportunity = (opp: Opportunity) => {
    const nextStatus: PlacementStatus = opp.type === 'self_employment' ? 'SELF_EMPLOYED' : 'REFERRED';
    setCurrentStatus(nextStatus);
    onEvent({
      type: 'UPDATE_PLACEMENT',
      payload: {
        status: nextStatus,
        opportunityId: opp.id,
        notes: `Linked to ${opp.company_or_agency} (${opp.title}) in ${opp.district}.`
      }
    });
  };

  const handleEvidenceSuccess = (newEvidence: PlacementEvidence) => {
    setShowEvidenceModal(false);
    const updatedList = [newEvidence, ...localEvidenceList];
    setLocalEvidenceList(updatedList);
    setCurrentStatus('EVIDENCE_SUBMITTED');
    onEvent({
      type: 'UPDATE_PLACEMENT',
      payload: {
        status: 'EVIDENCE_SUBMITTED',
        notes: `Submitted proof "${newEvidence.document_name}" for ${newEvidence.employer_name}.`
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--ink)' }}>
          💼 रोजगार व उपजीविका लिंकेज
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          कौशल्य प्रशिक्षण पूर्ण झाल्यानंतर {session.profile.district || 'जिले'}तील अधिकृत आस्थापनांमध्ये रुजू व्हा व पुरावा सादर करा.
        </p>
      </div>

      {/* 8-Stage Pipeline Status Card */}
      <div className="dash-card" style={{ borderLeft: '4px solid var(--field)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--field-deep)', textTransform: 'uppercase' }}>
              वर्तमान पाइपलाइन प्रगती
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
              {trade?.name_local?.mr || trade?.name_en}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
              अधिकृत केंद्र: {nearestCenter?.name || 'District PM-AJAY Kaushal Kendra'} ({session.profile.district || 'Pune'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="meta-tag"
              style={{
                fontSize: '0.85rem',
                padding: '6px 12px',
                background:
                  currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'SELF_EMPLOYED'
                    ? '#E8F3ED'
                    : currentStatus === 'COMPLETED' || currentStatus === 'EVIDENCE_SUBMITTED'
                    ? '#FCF4E4'
                    : '#EAF0F6',
                color:
                  currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'SELF_EMPLOYED'
                    ? '#1F6F4A'
                    : currentStatus === 'COMPLETED' || currentStatus === 'EVIDENCE_SUBMITTED'
                    ? '#8A5B00'
                    : '#205493',
                fontWeight: 800
              }}
            >
              ● {getPlacementStatusLabel(currentStatus, 'mr')}
            </span>

            <span
              className="meta-tag"
              style={{
                fontSize: '0.85rem',
                padding: '6px 12px',
                background: '#F0F4F8',
                color: '#14201A',
                fontWeight: 700
              }}
            >
              पडताळणी: {getVerificationLevelLabel(session.profile.verification_level || 'SELF_REPORTED', 'mr')}
            </span>
          </div>
        </div>

        {/* Training Simulation Action Bar */}
        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            background: '#F8F9FA',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              🎓 प्रशिक्षण प्रगती:
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {currentStatus === 'COMPLETED' || currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'EVIDENCE_SUBMITTED' || currentStatus === 'SELF_EMPLOYED'
                ? '✓ कोर्स पूर्ण झाला असून NSQF प्रमाणपत्र जारी झाले आहे.'
                : 'प्रशिक्षण बॅच पूर्णता नोंदवा.'}
            </div>
          </div>

          {currentStatus === 'ENROLLED' || currentStatus === 'IN_TRAINING' || currentStatus === 'NOT_STARTED' ? (
            <button
              type="button"
              id="btn-simulate-completion"
              className="btn-secondary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={handleSimulateCompletion}
            >
              🎓 प्रशिक्षण पूर्णता नोंदवा →
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--field-deep)', fontWeight: 700 }}>
              ✓ प्रमाणित
            </span>
          )}
        </div>
      </div>

      {/* Submitted Evidence & Verification Section */}
      <div className="dash-card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>
              📑 सादर केलेले रुजू पुरावे
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              अपलोड केलेले पुरावे GIA समन्वयकाद्वारे तपासले जातात.
            </p>
          </div>

          <button
            type="button"
            id="btn-open-upload-evidence"
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setShowEvidenceModal(true)}
          >
            📄 + नवीन पुरावा सादर करा
          </button>
        </div>

        {localEvidenceList.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#F8F9FA', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            अद्याप कोणताही रुजू पुरावा सादर केलेला नाही. नोकरी मिळाल्यावर वरील बटणावर क्लिक करून ऑफर लेटर / रुजू पत्र अपलोड करा.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {localEvidenceList.map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '12px 14px',
                  background: '#F8FBF9',
                  border: '1px solid var(--stone)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)' }}>
                    🏢 {ev.employer_name} — <em>{ev.designation}</em>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                    दस्तऐवज: <strong>{ev.document_name}</strong> ({ev.evidence_type}) • वेतन: <strong>{ev.monthly_wage_inr}</strong> • रुजू दिनांक: {ev.joining_date}
                  </div>
                  {ev.coordinator_notes && (
                    <div style={{ fontSize: '0.8rem', color: '#165036', background: '#E8F3ED', padding: '4px 8px', borderRadius: '4px', marginTop: '6px' }}>
                      💬 समन्वयक शेरा: {ev.coordinator_notes} (सत्यापित: {ev.verified_by || 'GIA Nodal'})
                    </div>
                  )}
                </div>

                <span
                  className="meta-tag"
                  style={{
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opportunities & Employer List */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
          💼 स्थानिक रोजगार व सूक्ष्म-उद्यम संधी ({session.profile.district || 'जिल्हा'} - Verified Linkages)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
          पीएम-अजय प्रशिक्षित अनुसूचित जाती उमेदवारांना थेट स्थानिक नियोक्त्यांशी व NSFDC/Mudra योजनांशी जोडा.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {opportunities.map((opp) => {
            const isSelected = session.profile.selected_opportunity_id === opp.id;
            return (
              <div
                key={opp.id}
                className="rec-card"
                style={{
                  background: isSelected ? '#F2F8F4' : 'var(--paper-card)',
                  borderColor: isSelected ? 'var(--field)' : 'var(--stone)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>{opp.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--field-deep)', fontWeight: 600 }}>
                      🏢 {opp.company_or_agency}
                    </div>
                  </div>

                  <span
                    className="meta-tag"
                    style={{
                      background: opp.type === 'self_employment' ? '#E8F3ED' : '#EAF0F6',
                      color: opp.type === 'self_employment' ? '#1F6F4A' : '#205493'
                    }}
                  >
                    {opp.type === 'self_employment' ? '🏪 स्वरोजगार लिंकेज' : '💼 वेतन रोजगार'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', marginTop: '6px', color: 'var(--muted)' }}>
                  <div>📍 {opp.address}, {opp.district}</div>
                  <div>💵 <strong>{opp.wage_or_support_inr}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>(Indicative demo data)</span></div>
                  <div>👥 जागा/क्षमता: {opp.openings_or_capacity}</div>
                </div>

                <div style={{ background: '#F8F9FA', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', marginTop: '6px' }}>
                  📞 <strong>नोडल संपर्क:</strong> {opp.contact_person} ({opp.contact_phone})
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    id={`btn-select-opp-${opp.id}`}
                    className={isSelected ? 'btn-ctrl' : 'btn-primary'}
                    style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => handleSelectOpportunity(opp)}
                  >
                    {isSelected
                      ? '✓ लिंकेज नोंदवले (Linked)'
                      : opp.type === 'self_employment'
                      ? '🏪 स्वरोजगार सहाय्यासाठी निवडा →'
                      : '🤝 रोजगार रेफरल / मुलाखत नोंदवा →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
        {onNavigateToFollowUp && (
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={onNavigateToFollowUp}
          >
            📋 ७/३०/९० दिवसांचा पाठपुरावा (Follow-Up Tracker) →
          </button>
        )}
        <button
          type="button"
          id="btn-placement-to-card"
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={() => {
            if (onNavigateToCard) onNavigateToCard();
            else onEvent({ type: 'CHIP_CLICK', payload: { value: 'continue_to_card', label: 'View Aspiration Card' } });
          }}
        >
          🪪 आकांक्षा कार्ड व QR पहा (View Aspiration Card) →
        </button>
      </div>

      {/* Evidence Upload Modal */}
      {showEvidenceModal && (
        <EvidenceUploadModal
          beneficiaryId={session.id}
          onClose={() => setShowEvidenceModal(false)}
          onSuccess={handleEvidenceSuccess}
        />
      )}
    </div>
  );
};
