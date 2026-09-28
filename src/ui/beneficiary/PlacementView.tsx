// Disha Sarathi - Post-Training Placement & Opportunity Linkage Engine (PS 26097)
import React, { useState } from 'react';
import { ConversationEvent, Opportunity, PlacementEvidence, PlacementStatus, Session } from '../../core/types';
import { getOpportunitiesForTradeAndDistrict, getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';
import { EvidenceUploadModal } from './EvidenceUploadModal';
import { OpportunityMap } from '../components/OpportunityMap';
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
  const lang = session.lang || 'mr';
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

  const userCoords = session.profile.lat && session.profile.lng
    ? { lat: session.profile.lat, lng: session.profile.lng, label: session.profile.district || 'Location' }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '28px', maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
          {lang === 'mr' ? 'रोजगार व उपजीविका जोडणी' : lang === 'hi' ? 'रोजगार व आजीविका लिंकेज' : 'Placement & Livelihood Linkage'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: '2px' }}>
          {lang === 'mr'
            ? `प्रशिक्षण पूर्ण झाल्यानंतर ${session.profile.district || 'स्थानिक'} आस्थापनांमध्ये रुजू व्हा व पुरावा सादर करा.`
            : `Connect to verified opportunities in ${session.profile.district || 'your area'} and submit proof.`}
        </p>
      </div>

      {/* Pipeline Status Card */}
      <div className="dash-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              {lang === 'mr' ? 'वर्तमान प्रगती' : lang === 'hi' ? 'वर्तमान प्रगति' : 'Current Progress'}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {trade?.name_local?.[lang] || trade?.name_en}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
              {lang === 'mr' ? 'केंद्र:' : 'Center:'} {nearestCenter?.name || 'District PM-AJAY Kaushal Kendra'} ({session.profile.district || 'Pune'})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.82rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background:
                  currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'SELF_EMPLOYED'
                    ? '#DCFCE7'
                    : currentStatus === 'COMPLETED' || currentStatus === 'EVIDENCE_SUBMITTED'
                    ? '#FEF3C7'
                    : '#EFF6FF',
                color:
                  currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'SELF_EMPLOYED'
                    ? '#15803D'
                    : currentStatus === 'COMPLETED' || currentStatus === 'EVIDENCE_SUBMITTED'
                    ? '#92400E'
                    : '#1D4ED8',
                fontWeight: 700
              }}
            >
              ● {getPlacementStatusLabel(currentStatus, lang)}
            </span>

            <span
              style={{
                fontSize: '0.82rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#F1F5F9',
                color: '#334155',
                fontWeight: 600
              }}
            >
              {lang === 'mr' ? 'पडताळणी:' : 'Verification:'} {getVerificationLevelLabel(session.profile.verification_level || 'SELF_REPORTED', lang)}
            </span>
          </div>
        </div>

        {/* Training Simulation Action Bar */}
        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            background: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
              {lang === 'mr' ? 'प्रशिक्षण प्रगती:' : 'Training Status:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {currentStatus === 'COMPLETED' || currentStatus === 'PLACED' || currentStatus === 'COORDINATOR_VERIFIED' || currentStatus === 'EVIDENCE_SUBMITTED' || currentStatus === 'SELF_EMPLOYED'
                ? (lang === 'mr' ? '✓ कोर्स पूर्ण झाला असून प्रमाणपत्र जारी झाले आहे.' : 'Training completed and certified.')
                : (lang === 'mr' ? 'प्रशिक्षण पूर्णता नोंदवा.' : 'Record training completion.')}
            </div>
          </div>

          {currentStatus === 'ENROLLED' || currentStatus === 'IN_TRAINING' || currentStatus === 'NOT_STARTED' ? (
            <button
              type="button"
              id="btn-simulate-completion"
              className="btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
              onClick={handleSimulateCompletion}
            >
              {lang === 'mr' ? 'प्रशिक्षण पूर्णता नोंदवा' : 'Record Completion'}
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 700 }}>
              ✓ {lang === 'mr' ? 'प्रमाणित' : 'Certified'}
            </span>
          )}
        </div>
      </div>

      {/* Opportunity Map Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {lang === 'mr' ? 'नकाशावर संधी व आस्थापना' : lang === 'hi' ? 'मानचित्र पर अवसर व प्रतिष्ठान' : 'Opportunities Map'}
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {session.profile.district || 'Pune'}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>(Indicative Demo Data)</span>
        </div>

        <OpportunityMap
          userLocation={userCoords}
          radiusKm={session.profile.travel_radius_km || 25}
          opportunities={opportunities}
          selectedId={session.profile.selected_opportunity_id}
          onSelectOpportunity={(opp) => handleSelectOpportunity(opp as any)}
          height="260px"
          lang={lang}
        />
      </div>

      {/* Opportunities & Employer List */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
          {lang === 'mr' ? 'स्थानिक संधींची यादी' : lang === 'hi' ? 'स्थानीय अवसरों की सूची' : 'Local Opportunities List'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {opportunities.map((opp) => {
            const isSelected = session.profile.selected_opportunity_id === opp.id;
            return (
              <div
                key={opp.id}
                className="rec-card"
                style={{
                  background: isSelected ? '#F0FDF4' : '#FFFFFF',
                  border: isSelected ? '2px solid #22C55E' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{opp.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#1D4ED8', fontWeight: 600, marginTop: '2px' }}>
                      {opp.company_or_agency}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: opp.type === 'self_employment' ? '#DCFCE7' : '#EFF6FF',
                      color: opp.type === 'self_employment' ? '#15803D' : '#1D4ED8'
                    }}
                  >
                    {opp.type === 'self_employment'
                      ? (lang === 'mr' ? 'स्वरोजगार' : 'Self Employment')
                      : (lang === 'mr' ? 'वेतन रोजगार' : 'Wage Employment')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.82rem', marginTop: '6px', color: '#475569' }}>
                  <div>📍 {opp.address}, {opp.district}</div>
                  <div>💵 <strong>{opp.wage_or_support_inr}</strong> <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>(Indicative demo)</span></div>
                  <div>👥 {lang === 'mr' ? 'जागा:' : 'Openings:'} {opp.openings_or_capacity}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', marginTop: '6px', border: '1px solid #E2E8F0' }}>
                  <strong>{lang === 'mr' ? 'नोडल संपर्क:' : 'Contact:'}</strong> {opp.contact_person} ({opp.contact_phone})
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    id={`btn-select-opp-${opp.id}`}
                    className={isSelected ? 'btn-ctrl' : 'btn-primary'}
                    style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                    onClick={() => handleSelectOpportunity(opp)}
                  >
                    {isSelected
                      ? (lang === 'mr' ? '✓ निवडले आहे' : 'Selected')
                      : opp.type === 'self_employment'
                      ? (lang === 'mr' ? 'स्वरोजगार सहाय्यासाठी निवडा' : 'Select for Self-Employment')
                      : (lang === 'mr' ? 'रोजगार रेफरल नोंदवा' : 'Select for Referral')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted Evidence & Verification Section */}
      <div className="dash-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {lang === 'mr' ? 'सादर केलेले रुजू पुरावे' : lang === 'hi' ? 'जमा किए गए साक्ष्य' : 'Submitted Evidence'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
              {lang === 'mr' ? 'अपलोड केलेले पुरावे GIA समन्वयकाद्वारे तपासले जातात.' : 'Uploaded evidence is verified by GIA coordinator.'}
            </p>
          </div>

          <button
            type="button"
            id="btn-open-upload-evidence"
            className="btn-primary"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => setShowEvidenceModal(true)}
          >
            {lang === 'mr' ? '+ नवीन पुरावा सादर करा' : '+ Submit Proof'}
          </button>
        </div>

        {localEvidenceList.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '0.85rem' }}>
            {lang === 'mr'
              ? 'अद्याप कोणताही रुजू पुरावा सादर केलेला नाही. नोकरी मिळाल्यावर वरील बटणावर क्लिक करून ऑफर लेटर / रुजू पत्र अपलोड करा.'
              : 'No employment evidence submitted yet. Click above to upload offer or joining letter.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {localEvidenceList.map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                    {ev.employer_name} — <em>{ev.designation}</em>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {ev.document_name} ({ev.evidence_type}) • {ev.monthly_wage_inr} • {ev.joining_date}
                  </div>
                </div>

                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background:
                      ev.status === 'COORDINATOR_VERIFIED' || ev.status === 'EMPLOYER_VERIFIED'
                        ? '#DCFCE7'
                        : ev.status === 'REJECTED'
                        ? '#FEE2E2'
                        : '#FEF3C7',
                    color:
                      ev.status === 'COORDINATOR_VERIFIED' || ev.status === 'EMPLOYER_VERIFIED'
                        ? '#15803D'
                        : ev.status === 'REJECTED'
                        ? '#B91C1C'
                        : '#92400E'
                  }}
                >
                  ● {getVerificationLevelLabel(ev.status, lang)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
        {onNavigateToFollowUp && (
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, padding: '10px', fontSize: '0.9rem', fontWeight: 700 }}
            onClick={onNavigateToFollowUp}
          >
            {lang === 'mr' ? 'पाठपुरावा ट्रॅकर' : 'Follow-Up Tracker'}
          </button>
        )}
        <button
          type="button"
          id="btn-placement-to-card"
          className="btn-primary"
          style={{ flex: 1, padding: '10px', fontSize: '0.9rem', fontWeight: 700 }}
          onClick={() => {
            if (onNavigateToCard) onNavigateToCard();
            else onEvent({ type: 'CHIP_CLICK', payload: { value: 'continue_to_card', label: 'View Aspiration Card' } });
          }}
        >
          {lang === 'mr' ? 'आकांक्षा कार्ड व QR पहा' : 'View Aspiration Card & QR'}
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
