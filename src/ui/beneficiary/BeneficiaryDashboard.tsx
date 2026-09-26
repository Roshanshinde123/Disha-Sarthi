// Disha Sarathi - Beneficiary Personalized Cockpit & Dashboard (PS 26097)
import React, { useState } from 'react';
import { Session, RecommendationResult } from '../../core/types';
import { getExotelConfig } from '../../server/telephonyServer';
import { getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';
import { canGenerateRecommendations } from '../../core/recommender';
import { t } from '../../core/i18n';
import { AspirationCardView } from './AspirationCardView';
import { PlacementView } from './PlacementView';
import { SkillPassportView } from './SkillPassportView';
import { SkillGapView } from './SkillGapView';
import { BeneficiaryProfileView } from './BeneficiaryProfileView';
import { TrainingView } from './TrainingView';
import { FollowUpView } from './FollowUpView';
import { FinanceTrackView } from './FinanceTrackView';
import { MyJourneyView } from './MyJourneyView';
import { RecommendationView } from './RecommendationView';
import { deleteSessionById } from '../../core/store';

export type BeneficiaryTab =
  | 'OVERVIEW'
  | 'JOURNEY'
  | 'PROFILE'
  | 'PASSPORT'
  | 'SKILL_GAP'
  | 'RECOMMENDATIONS'
  | 'TRAINING'
  | 'PLACEMENT'
  | 'FOLLOW_UP'
  | 'FINANCE'
  | 'CARD';

interface BeneficiaryDashboardProps {
  session: Session;
  initialTab?: BeneficiaryTab;
  onStartVoice: () => void;
  onLogout: () => void;
  onUpdateSession: (updated: Session) => void;
  onNavigateTab?: (tab: BeneficiaryTab) => void;
}

export const BeneficiaryDashboard: React.FC<BeneficiaryDashboardProps> = ({
  session,
  initialTab = 'OVERVIEW',
  onStartVoice,
  onLogout,
  onUpdateSession,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<BeneficiaryTab>(initialTab);

  const lang = session.lang || 'mr';
  const config = getExotelConfig();
  const profile = session.profile;
  const isRecUnlocked = canGenerateRecommendations(session);
  const recommendations: RecommendationResult[] = isRecUnlocked ? (session.recommendations || []) : [];

  // Calculate profile completion %
  const calculateProfileCompletion = (): number => {
    let score = 0;
    if (profile.district) score += 20;
    if (profile.education_level) score += 20;
    if (profile.family_occupation || profile.current_livelihood) score += 20;
    if (profile.skills_interests && profile.skills_interests.length > 0) score += 20;
    if (profile.employment_preference || profile.travel_radius_km) score += 20;
    return Math.min(100, score);
  };

  const profilePct = calculateProfileCompletion();
  const isProfileEmpty = !profile.education_level && (!profile.skills_interests || profile.skills_interests.length === 0) && !profile.district;

  const handleTabChange = (tab: BeneficiaryTab) => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };

  const handleDeleteData = async () => {
    if (
      window.confirm(
        lang === 'mr'
          ? 'आपली सर्व नोंदवलेली वैयक्तिक माहिती, व्हॉईस डेटा व सत्र कायमस्वरूपी हटवायचे आहे का?'
          : lang === 'hi'
          ? 'क्या आप अपना सारा व्यक्तिगत डेटा हमेशा के लिए हटाना चाहते हैं?'
          : 'Do you want to permanently delete all your personal data and session?'
      )
    ) {
      await deleteSessionById(session.id);
      alert(t('dashboardDataPurged', lang));
      onLogout();
    }
  };

  const notRecorded = t('notProvided', lang);

  const navMenuItems: { id: BeneficiaryTab; label: string; icon: string; badge?: string }[] = [
    { id: 'OVERVIEW', label: t('tabOverview', lang), icon: '🏠' },
    { id: 'JOURNEY', label: t('tabJourney', lang), icon: '🗺️' },
    { id: 'PROFILE', label: t('tabProfile', lang), icon: '👤' },
    { id: 'PASSPORT', label: t('tabSkillPassport', lang), icon: '🪪', badge: profile.summary_confirmed ? '✓' : undefined },
    { id: 'SKILL_GAP', label: t('tabSkillGap', lang), icon: '🔍' },
    { id: 'RECOMMENDATIONS', label: t('tabRecommendations', lang), icon: '🎯', badge: isRecUnlocked ? '3' : '🔒' },
    { id: 'TRAINING', label: t('tabTraining', lang), icon: '🏫' },
    { id: 'PLACEMENT', label: t('tabPlacement', lang), icon: '💼' },
    { id: 'FOLLOW_UP', label: t('tabFollowUp', lang), icon: '🔄' },
    { id: 'FINANCE', label: t('tabFinance', lang), icon: '💰' },
    { id: 'CARD', label: t('tabAspirationCard', lang), icon: '🎫' }
  ];

  return (
    <div className="ben-dashboard-layout">
      {/* Desktop Sidebar Navigation */}
      <aside className="ben-sidebar" aria-label="Beneficiary Navigation">
        <div className="sidebar-user-block">
          <div className="sidebar-avatar">👤</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {profile.name || profile.first_name || (session.ref_code ? `Beneficiary (${session.ref_code})` : 'नागरिक')}
            </span>
            <span className="sidebar-scheme-tag">PM-AJAY GIA Component</span>
          </div>
        </div>

        {/* Voice Quick Launch in Sidebar */}
        <button
          type="button"
          className="sidebar-voice-btn"
          onClick={onStartVoice}
          id="btn-sidebar-start-voice"
        >
          {t('btnTalkToDisha', lang)}
        </button>

        <nav className="sidebar-menu">
          {navMenuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom-actions">
          <button
            type="button"
            className="sidebar-delete-data-btn"
            onClick={handleDeleteData}
          >
            {t('btnDeleteData', lang)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ben-main-display">
        {/* TAB 1: OVERVIEW COCKPIT */}
        {activeTab === 'OVERVIEW' && (
          <div className="ben-overview-wrapper">
            {/* Telephony Helpline Strip */}
            <div className="gov-telephony-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tel-icon">📞</span>
                <div className="tel-text">
                  <strong>{t('helplineLabel', lang)}</strong> {config.virtualPhoneNumber} (24x7)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <a href={`tel:${config.virtualPhoneNumber.replace(/\s+/g, '')}`} className="btn-tel-call">
                  {t('dashboardCallNow', lang)}
                </a>
                <a
                  href="https://wa.me/15551602253?text=Hello%2C%20I%20want%20to%20know%20more%20about%20Disha%20Sarathi."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tel-call"
                  aria-label="Message Disha Sarathi on WhatsApp"
                  style={{
                    background: '#16a34a',
                    borderColor: '#15803d',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  💬 WhatsApp: +1 (555) 160-2253
                </a>
              </div>
            </div>

            {/* NEW USER ONBOARDING BANNER (If Profile is Empty) */}
            {isProfileEmpty ? (
              <div className="ben-new-user-onboarding-card">
                <div className="onboarding-badge">🚀 {t('onboardingBadge', lang)}</div>
                <h2 className="onboarding-title">{t('onboardingHeading', lang)}</h2>
                <p className="onboarding-sub">
                  {t('onboardingSubtext', lang)}
                </p>

                <div className="onboarding-steps-list">
                  <div className="onb-step"><span className="onb-dot">1</span> {t('onboardingStep1', lang)}</div>
                  <div className="onb-step"><span className="onb-dot">2</span> {t('onboardingStep2', lang)}</div>
                  <div className="onb-step"><span className="onb-dot">3</span> {t('onboardingStep3', lang)}</div>
                  <div className="onb-step"><span className="onb-dot">4</span> {t('onboardingStep4', lang)}</div>
                  <div className="onb-step"><span className="onb-dot">5</span> {t('onboardingStep5', lang)}</div>
                </div>

                <button
                  type="button"
                  className="btn-onboarding-start-voice"
                  onClick={onStartVoice}
                  id="btn-onboard-voice"
                >
                  {t('btnStartVoiceInterview', lang)}
                </button>
              </div>
            ) : (
              /* EXISTING USER SUMMARY HERO */
              <div className="ben-summary-hero-card">
                <div className="hero-summary-left">
                  <span className="hero-scheme-pill">PM-AJAY GIA Component • Beneficiary Dashboard</span>
                  <h2 className="hero-greeting">
                    {t('dashboardGreetingHello', lang)}, {profile.name || profile.first_name || t('dashboardCitizen', lang)}!
                  </h2>
                  <p className="hero-subtext">
                    {t('heroProfileCompleteSubtext', lang)}
                  </p>
                </div>

                <div className="hero-summary-right">
                  <div className="profile-gauge-box">
                    <div className="gauge-val">{profilePct}%</div>
                    <div className="gauge-label">{t('dashboardProfileComplete', lang)}</div>
                  </div>
                  <button
                    type="button"
                    className="hero-voice-resume-btn"
                    onClick={onStartVoice}
                  >
                    {t('dashboardContinueVoice', lang)}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Metrics / Status Cards Grid */}
            <div className="ben-metrics-grid">
              {/* Card 1: Skill Passport Card */}
              <div className="metric-card passport-card">
                <div className="card-top-icon">🪪</div>
                <h3 className="card-title">{t('tabSkillPassport', lang)}</h3>
                <div className="card-status-pill verified">
                  {profile.summary_confirmed ? t('dashboardVerified', lang) : t('dashboardPending', lang)}
                </div>
                <p className="card-desc">
                  {profile.education_level ? `${t('snapLabelEducation', lang)} ${profile.education_level}` : notRecorded}
                </p>
                <button
                  type="button"
                  className="card-action-link"
                  onClick={() => handleTabChange('PASSPORT')}
                >
                  {t('tabSkillPassport', lang)} →
                </button>
              </div>

              {/* Card 2: Recommendations Card */}
              <div className={`metric-card recs-card ${!isRecUnlocked ? 'locked' : ''}`}>
                <div className="card-top-icon">🎯</div>
                <h3 className="card-title">{t('tabRecommendations', lang)}</h3>
                <div className={`card-status-pill ${isRecUnlocked ? 'active' : 'locked-pill'}`}>
                  {isRecUnlocked ? `3 ${t('dashboardOptionsAvailable', lang)}` : t('dashboardLocked', lang)}
                </div>
                <p className="card-desc">
                  {isRecUnlocked
                    ? `${recommendations[0]?.trade?.name_local?.[lang] || recommendations[0]?.trade?.name_en || 'Electrician'} (NSQF Level ${recommendations[0]?.trade?.nsqf_level || 4})`
                    : t('recommendationsLockedNotice', lang)}
                </p>
                {isRecUnlocked ? (
                  <button
                    type="button"
                    className="card-action-link"
                    onClick={() => handleTabChange('RECOMMENDATIONS')}
                  >
                    {t('tabRecommendations', lang)} →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="card-action-link-voice"
                    onClick={onStartVoice}
                  >
                    {t('btnStartVoiceInterview', lang)}
                  </button>
                )}
              </div>

              {/* Card 3: Training Center Card */}
              <div className="metric-card training-card">
                <div className="card-top-icon">🏫</div>
                <h3 className="card-title">{t('tabTraining', lang)}</h3>
                <div className="card-status-pill training-status">
                  {profile.training_status || (lang === 'mr' ? 'शिफारस केलेले' : lang === 'hi' ? 'सिफारिश की गई' : 'RECOMMENDED')}
                </div>
                <p className="card-desc">
                  {profile.selected_trade_id
                    ? `${lang === 'mr' ? 'निवडलेला ट्रेड:' : lang === 'hi' ? 'चयनित ट्रेड:' : 'Selected Trade:'} ${profile.selected_trade_id.replace(/_/g, ' ').toUpperCase()}`
                    : (lang === 'mr' ? 'जवळपासचे PMKK केंद्र' : lang === 'hi' ? 'निकटतम PMKK केंद्र' : 'Nearby PMKK Training Center')}
                </p>
                <button
                  type="button"
                  className="card-action-link"
                  onClick={() => handleTabChange('TRAINING')}
                >
                  {t('tabTraining', lang)} →
                </button>
              </div>

              {/* Card 4: Placement & Verification */}
              <div className="metric-card placement-card">
                <div className="card-top-icon">💼</div>
                <h3 className="card-title">{t('tabPlacement', lang)}</h3>
                <div className="card-status-pill placement-status">
                  {getPlacementStatusLabel(profile.placement_status || 'NOT_STARTED', lang)}
                </div>
                <p className="card-desc">
                  {getVerificationLevelLabel(profile.verification_level || 'SELF_REPORTED', lang)}
                </p>
                <button
                  type="button"
                  className="card-action-link"
                  onClick={() => handleTabChange('PLACEMENT')}
                >
                  {t('tabPlacement', lang)} →
                </button>
              </div>
            </div>

            {/* Profile Overview Details Card */}
            <div className="ben-profile-snapshot-card">
              <div className="snapshot-header">
                <h3 className="snapshot-title">
                  👤 {t('tabProfile', lang)}
                </h3>
                <button
                  type="button"
                  className="btn-edit-profile-link"
                  onClick={() => handleTabChange('PROFILE')}
                >
                  {t('dashboardEditProfile', lang)}
                </button>
              </div>

              <div className="snapshot-grid">
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelDistrict', lang)}</span>
                  <span className="snap-value">{profile.district ? `${profile.district}, ${profile.state || 'Maharashtra'}` : notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelEducation', lang)}</span>
                  <span className="snap-value">{profile.education_level || notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelFamilyOcc', lang)}</span>
                  <span className="snap-value">{profile.family_occupation || notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelCurrentWork', lang)}</span>
                  <span className="snap-value">{profile.current_livelihood || notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelSkills', lang)}</span>
                  <span className="snap-value">{(profile.skills_interests && profile.skills_interests.length > 0) ? profile.skills_interests.join(', ') : notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelExperience', lang)}</span>
                  <span className="snap-value">{profile.experience_years !== undefined ? `${profile.experience_years} ${t('yearsLabel', lang)}` : notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelTravel', lang)}</span>
                  <span className="snap-value">{profile.travel_radius_km ? `${profile.travel_radius_km} ${t('kmLabel', lang)}` : notRecorded}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">{t('snapLabelEmployPref', lang)}</span>
                  <span className="snap-value">{profile.employment_preference === 'wage_employment' ? t('wageEmployment', lang) : profile.employment_preference === 'self_employment' ? t('selfEmployment', lang) : profile.employment_preference || notRecorded}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY JOURNEY */}
        {activeTab === 'JOURNEY' && (
          <MyJourneyView
            session={session}
            onNavigate={(p) => {
              if (p.includes('profile')) handleTabChange('PROFILE');
              else if (p.includes('passport')) handleTabChange('PASSPORT');
              else if (p.includes('gap')) handleTabChange('SKILL_GAP');
              else if (p.includes('recommendations')) handleTabChange('RECOMMENDATIONS');
              else if (p.includes('training')) handleTabChange('TRAINING');
              else if (p.includes('placement')) handleTabChange('PLACEMENT');
              else if (p.includes('follow-up')) handleTabChange('FOLLOW_UP');
            }}
            onStartVoice={onStartVoice}
          />
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'PROFILE' && (
          <BeneficiaryProfileView
            session={session}
            onStartVoice={onStartVoice}
            onSaveProfile={(updatedProfile) => onUpdateSession({ ...session, profile: updatedProfile })}
          />
        )}

        {/* TAB 4: SKILL PASSPORT */}
        {activeTab === 'PASSPORT' && (
          <SkillPassportView
            session={session}
            onBack={() => handleTabChange('OVERVIEW')}
            onNavigate={(p) => {
              if (p.includes('recommendations')) handleTabChange('RECOMMENDATIONS');
              else handleTabChange('SKILL_GAP');
            }}
          />
        )}

        {/* TAB 5: SKILL GAP */}
        {activeTab === 'SKILL_GAP' && (
          <SkillGapView
            session={session}
            onNavigateToTraining={() => handleTabChange('RECOMMENDATIONS')}
          />
        )}

        {/* TAB 6: RECOMMENDATIONS */}
        {activeTab === 'RECOMMENDATIONS' && (
          <RecommendationView
            session={session}
            onEvent={(e) => {
              if (e.type === 'SELECT_TRADE' && e.payload) {
                const updated = {
                  ...session,
                  profile: {
                    ...session.profile,
                    selected_trade_id: e.payload.tradeId
                  }
                };
                onUpdateSession(updated);
                handleTabChange('TRAINING');
              }
            }}
            onStartVoice={onStartVoice}
            onNavigate={(p) => {
              if (p.includes('training')) handleTabChange('TRAINING');
              else if (p.includes('journey')) handleTabChange('JOURNEY');
            }}
          />
        )}

        {/* TAB 7: TRAINING */}
        {activeTab === 'TRAINING' && (
          <TrainingView
            session={session}
            onUpdateStatus={(newStatus) => onUpdateSession({ ...session, profile: { ...session.profile, training_status: newStatus } })}
            onNavigateToPlacement={() => handleTabChange('PLACEMENT')}
          />
        )}

        {/* TAB 8: PLACEMENT & EVIDENCE */}
        {activeTab === 'PLACEMENT' && (
          <PlacementView
            session={session}
            onEvent={() => {}}
          />
        )}

        {/* TAB 9: FOLLOW-UP */}
        {activeTab === 'FOLLOW_UP' && (
          <FollowUpView
            session={session}
            onBack={() => handleTabChange('OVERVIEW')}
          />
        )}

        {/* TAB 10: FINANCE / KITNA KAMAUNGA */}
        {activeTab === 'FINANCE' && (
          <FinanceTrackView
            session={session}
            onEvent={() => {}}
          />
        )}

        {/* TAB 11: ASPIRATION CARD */}
        {activeTab === 'CARD' && (
          <AspirationCardView
            session={session}
            onEvent={() => {}}
          />
        )}
      </main>
    </div>
  );
};
