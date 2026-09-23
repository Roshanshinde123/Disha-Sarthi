// Disha Sarathi - GIA Coordinator Dashboard & District Planning Cockpit (PS 26097)
import React, { useState, useEffect } from 'react';
import { Session } from '../../core/types';
import { getAllSessions } from '../../core/store';
import { PlanningMap } from './PlanningMap';
import { MatrixTable } from './MatrixTable';
import { PipelineView } from './PipelineView';
import { FairnessRadar } from './FairnessRadar';
import { FeedbackTrend } from './FeedbackTrend';
import { CorrectionQueue } from './CorrectionQueue';
import { BeneficiaryDetailModal } from './BeneficiaryDetailModal';
import { BeneficiariesRegistryView } from './BeneficiariesRegistryView';
import { VerificationQueueView } from './VerificationQueueView';
import { TrainingCapacityView } from './TrainingCapacityView';
import { OpportunitiesListView } from './OpportunitiesListView';
import { FollowUpQueueView } from './FollowUpQueueView';

export type CoordinatorTab =
  | 'map'
  | 'beneficiaries'
  | 'verification'
  | 'training'
  | 'placements'
  | 'follow_up'
  | 'matrix'
  | 'pipeline'
  | 'analytics';

interface CoordinatorDashboardProps {
  initialTab?: CoordinatorTab;
  onLogout?: () => void;
  onNavigateToBeneficiary?: () => void;
  onNavigateToAdmin?: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  initialTab = 'map',
  onLogout,
  onNavigateToBeneficiary,
  onNavigateToAdmin
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<CoordinatorTab>(initialTab);

  const refreshSessions = () => {
    setLoading(true);
    getAllSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const filteredSessions = selectedDistrict
    ? sessions.filter((s) => s.profile.district?.toLowerCase() === selectedDistrict.toLowerCase())
    : sessions;

  // KPI Calculations
  const totalBeneficiaries = sessions.length;
  const inTrainingCount = sessions.filter(
    (s) => s.profile.placement_status === 'IN_TRAINING' || s.profile.placement_status === 'ENROLLED'
  ).length;
  const verifiedPlacementCount = sessions.filter(
    (s) => s.profile.placement_status === 'PLACED' || s.profile.verification_level === 'COORDINATOR_VERIFIED' || s.profile.verification_level === 'EMPLOYER_VERIFIED'
  ).length;
  const pendingVerificationCount = sessions.filter(
    (s) => s.profile.verification_level === 'EVIDENCE_SUBMITTED' || s.profile.placement_status === 'EVIDENCE_SUBMITTED'
  ).length;
  const pendingFollowUpCount = sessions.filter((s) =>
    (s.profile.follow_ups || []).some((f) => f.status === 'PENDING')
  ).length;

  return (
    <div className="dashboard-shell" style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <header className="app-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="brand-badge">
          <div className="brand-logo">📊</div>
          <div>
            <div className="brand-title">दिशा सारथी • GIA जिल्हा समन्वयक कॉकपिट</div>
            <span className="brand-sub">
              PM-AJAY (GIA Component) District Skilling Planning, Verification & Placement Tracking
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="demo-pill">Pilot Cohort Mode</span>
          {onNavigateToBeneficiary && (
            <button type="button" className="btn-ctrl" onClick={onNavigateToBeneficiary}>
              🎙️ लाभार्थी व्हॉईस मोड (Beneficiary View)
            </button>
          )}
          {onNavigateToAdmin && (
            <button type="button" className="btn-ctrl" onClick={onNavigateToAdmin}>
              🛡️ प्रशासक पॅनेल (Admin)
            </button>
          )}
          {onLogout && (
            <button type="button" className="btn-logout" onClick={onLogout}>
              लॉगआउट
            </button>
          )}
        </div>
      </header>

      {/* Top KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--field)', padding: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            एकूण लाभार्थी (Total)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--field-deep)', marginTop: '2px' }}>
            {totalBeneficiaries}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>अनुसूचित जाती उमेदवार</div>
        </div>

        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid #E0A32E', padding: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            प्रशिक्षणात सक्रिय (Training)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8A5B00', marginTop: '2px' }}>
            {inTrainingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>नोंदणीकृत / प्रशिक्षण सुरू</div>
        </div>

        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid #A8322D', padding: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            पुरावा तपासणी प्रलंबित (Pending)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A8322D', marginTop: '2px' }}>
            {pendingVerificationCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>समीक्षा आवश्यक</div>
        </div>

        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid #205493', padding: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            सत्यापित रोजगार (Verified Placed)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#205493', marginTop: '2px' }}>
            {verifiedPlacementCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>नोकरी व स्वयंरोजगार रुजू</div>
        </div>

        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid #6B4E71', padding: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            पाठपुरावा प्रलंबित (Follow-up)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6B4E71', marginTop: '2px' }}>
            {pendingFollowUpCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>७/३०/९० दिवस तपासणी</div>
        </div>
      </div>

      {/* Coordinator Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '2px solid var(--stone)', paddingBottom: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          id="tab-btn-map"
          className={`btn-ctrl ${activeTab === 'map' ? 'active' : ''}`}
          style={{ background: activeTab === 'map' ? 'var(--field-light)' : 'transparent', color: activeTab === 'map' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('map')}
        >
          🗺️ नियोजन नकाशा (Map)
        </button>

        <button
          type="button"
          id="tab-btn-beneficiaries"
          className={`btn-ctrl ${activeTab === 'beneficiaries' ? 'active' : ''}`}
          style={{ background: activeTab === 'beneficiaries' ? 'var(--field-light)' : 'transparent', color: activeTab === 'beneficiaries' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('beneficiaries')}
        >
          👥 लाभार्थी नोंदणी (Beneficiaries)
        </button>

        <button
          type="button"
          id="tab-btn-verification"
          className={`btn-ctrl ${activeTab === 'verification' ? 'active' : ''}`}
          style={{ background: activeTab === 'verification' ? 'var(--field-light)' : 'transparent', color: activeTab === 'verification' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('verification')}
        >
          📑 पुरावा पडताळणी कतार ({pendingVerificationCount})
        </button>

        <button
          type="button"
          id="tab-btn-training"
          className={`btn-ctrl ${activeTab === 'training' ? 'active' : ''}`}
          style={{ background: activeTab === 'training' ? 'var(--field-light)' : 'transparent', color: activeTab === 'training' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('training')}
        >
          🏫 प्रशिक्षण केंद्रे (Centers)
        </button>

        <button
          type="button"
          id="tab-btn-placements"
          className={`btn-ctrl ${activeTab === 'placements' ? 'active' : ''}`}
          style={{ background: activeTab === 'placements' ? 'var(--field-light)' : 'transparent', color: activeTab === 'placements' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('placements')}
        >
          💼 स्थानिक रोजगार संधी (Opportunities)
        </button>

        <button
          type="button"
          id="tab-btn-follow-up"
          className={`btn-ctrl ${activeTab === 'follow_up' ? 'active' : ''}`}
          style={{ background: activeTab === 'follow_up' ? 'var(--field-light)' : 'transparent', color: activeTab === 'follow_up' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('follow_up')}
        >
          📋 पाठपुरावा कतार (Follow-Up)
        </button>

        <button
          type="button"
          id="tab-btn-matrix"
          className={`btn-ctrl ${activeTab === 'matrix' ? 'active' : ''}`}
          style={{ background: activeTab === 'matrix' ? 'var(--field-light)' : 'transparent', color: activeTab === 'matrix' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('matrix')}
        >
          📊 जिल्हा × ट्रेड मॅट्रिक्स (Matrix)
        </button>

        <button
          type="button"
          id="tab-btn-pipeline"
          className={`btn-ctrl ${activeTab === 'pipeline' ? 'active' : ''}`}
          style={{ background: activeTab === 'pipeline' ? 'var(--field-light)' : 'transparent', color: activeTab === 'pipeline' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('pipeline')}
        >
          📈 प्रगती पाइपलाइन (Pipeline)
        </button>

        <button
          type="button"
          id="tab-btn-analytics"
          className={`btn-ctrl ${activeTab === 'analytics' ? 'active' : ''}`}
          style={{ background: activeTab === 'analytics' ? 'var(--field-light)' : 'transparent', color: activeTab === 'analytics' ? 'var(--field-deep)' : 'var(--muted)', fontWeight: 700 }}
          onClick={() => setActiveTab('analytics')}
        >
          🎯 निष्पक्षता व NLU (Fairness & ASR)
        </button>

        {selectedDistrict && (
          <button
            type="button"
            className="btn-ctrl"
            style={{ marginLeft: 'auto', background: '#F7E9E8', color: '#A8322D', borderColor: '#A8322D' }}
            onClick={() => setSelectedDistrict(null)}
          >
            फ़िल्टर हटाएं: {selectedDistrict} ✕
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>डॅशबोर्ड लोड होत आहे...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TAB 1: MAP */}
          {activeTab === 'map' && (
            <PlanningMap
              sessions={sessions}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(d) => setSelectedDistrict(d)}
            />
          )}

          {/* TAB 2: BENEFICIARIES */}
          {activeTab === 'beneficiaries' && (
            <BeneficiariesRegistryView
              sessions={filteredSessions}
              onSelectSession={(s) => setSelectedSessionForModal(s)}
            />
          )}

          {/* TAB 3: VERIFICATION QUEUE */}
          {activeTab === 'verification' && (
            <VerificationQueueView
              onSelectBeneficiary={(id) => {
                const matched = sessions.find((s) => s.id === id);
                if (matched) setSelectedSessionForModal(matched);
              }}
            />
          )}

          {/* TAB 4: TRAINING CENTERS */}
          {activeTab === 'training' && <TrainingCapacityView />}

          {/* TAB 5: OPPORTUNITIES */}
          {activeTab === 'placements' && <OpportunitiesListView />}

          {/* TAB 6: FOLLOW UP QUEUE */}
          {activeTab === 'follow_up' && (
            <FollowUpQueueView
              sessions={filteredSessions}
              onSelectBeneficiary={(s) => setSelectedSessionForModal(s)}
              onRefresh={refreshSessions}
            />
          )}

          {/* TAB 7: MATRIX */}
          {activeTab === 'matrix' && <MatrixTable sessions={filteredSessions} />}

          {/* TAB 8: PIPELINE */}
          {activeTab === 'pipeline' && (
            <PipelineView
              sessions={filteredSessions}
              onSelectSession={(s) => setSelectedSessionForModal(s)}
            />
          )}

          {/* TAB 9: ANALYTICS & FAIRNESS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <FairnessRadar sessions={sessions} />
              <FeedbackTrend sessions={sessions} />
              <div style={{ gridColumn: '1 / -1' }}>
                <CorrectionQueue />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 360° Beneficiary Detail Modal */}
      <BeneficiaryDetailModal
        session={selectedSessionForModal}
        onClose={() => setSelectedSessionForModal(null)}
        onSessionUpdated={() => refreshSessions()}
      />
    </div>
  );
};
