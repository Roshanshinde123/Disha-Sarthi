import React from 'react';
import { ConversationEvent, LanguageCode, Session } from '../../core/types';
import { NaturalVoiceView } from './NaturalVoiceView';
import { SkillCard } from '../components/SkillCard';
import { OpportunityMap } from '../components/OpportunityMap';
import { t } from '../../core/i18n';

interface VoiceConversationViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
  onSwitchLang: (lang: LanguageCode) => void;
  onNavigate: (path: string) => void;
  onEndVoice?: () => void;
}

export const VoiceConversationView: React.FC<VoiceConversationViewProps> = ({
  session,
  onEvent,
  onSwitchLang,
  onNavigate,
  onEndVoice
}) => {
  const lang = session.lang;
  const profile = session.profile;
  const state = session.state;
  const isComplete = state === 'RECOMMENDATION' || state === 'BENEFICIARY_CHOICE' || state === 'END' || Boolean(session.recommendations && session.recommendations.length > 0);

  // 7-Stage Roadmap Steps
  const ROADMAP_STEPS = [
    { id: 1, name: t('stepProfile', lang), active: true, done: Boolean(profile.district && (profile.name || profile.first_name)) },
    { id: 2, name: t('stepSkills', lang), active: true, done: Boolean(profile.skills_interests && profile.skills_interests.length > 0) },
    { id: 3, name: t('stepSkillGap', lang), active: isComplete, done: isComplete },
    { id: 4, name: t('stepPathway', lang), active: isComplete, done: isComplete },
    { id: 5, name: t('stepLocalOpps', lang), active: isComplete, done: Boolean(profile.selected_trade_id) },
    { id: 6, name: t('stepTraining', lang), active: Boolean(profile.selected_trade_id), done: profile.placement_status === 'IN_TRAINING' || profile.placement_status === 'PLACED' },
    { id: 7, name: t('stepPlacement', lang), active: Boolean(profile.placement_status), done: profile.placement_status === 'PLACED' }
  ];

  if (state === 'ENDED') {
    return (
      <div className="voice-conversation-viewport" style={{ maxWidth: '600px', margin: '40px auto', padding: '16px 20px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '36px 24px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛑</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            {lang === 'en' ? 'Conversation Ended' : lang === 'hi' ? 'बातचीत समाप्त हो गई' : 'संभाषण समाप्त झाले'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '24px' }}>
            {lang === 'en' ? 'Your information has been saved.' : lang === 'hi' ? 'आपकी जानकारी सहेज ली गई है।' : 'आपली माहिती जतन केली गेली आहे.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '12px 20px', fontWeight: 700 }}
              onClick={() => onEvent({ type: 'RESTART' })}
            >
              🔄 {lang === 'en' ? 'Start Again' : lang === 'hi' ? 'पुनः प्रारंभ करें' : 'पुन्हा सुरू करा'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '10px 16px' }}
              onClick={() => onNavigate('/beneficiary')}
            >
              {lang === 'en' ? 'Go to Dashboard' : lang === 'hi' ? 'डैशबोर्ड पर जाएं' : 'डॅशबोर्डवर जा'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userLocation = profile.lat && profile.lng ? { lat: profile.lat, lng: profile.lng, label: profile.district || 'Location' } : null;

  return (
    <div className="voice-conversation-viewport" style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 20px', minHeight: '85vh' }}>
      {/* 7-Stage Visual Roadmap Header */}
      <div className="voice-roadmap-card" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 18px', border: '1px solid #E2E8F0', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            {t('roadmapTitle', lang)}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
            {t('roadmapState', lang)} <strong>{state}</strong>
          </span>
        </div>

        <div className="roadmap-steps-strip" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {ROADMAP_STEPS.map((step) => (
            <div
              key={step.id}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: step.done ? '#DCFCE7' : step.active ? '#EFF6FF' : '#F8FAFC',
                border: step.done ? '1px solid #86EFAC' : step.active ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                color: step.done ? '#166534' : step.active ? '#1E40AF' : '#94A3B8',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              {step.name} {step.done ? '✓' : ''}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Main Natural Voice Interface View */}
        <div className="voice-main-stage">
          <NaturalVoiceView
            session={session}
            onEvent={onEvent}
            onSwitchLang={onSwitchLang}
            onEndVoice={onEndVoice}
          />
        </div>

        {/* Right Sidebar: Real-time Profile Intelligence */}
        <div className="voice-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live Skill Card */}
          <SkillCard profile={profile} lang={lang} isCompact />

          {/* Regional Map Preview */}
          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#0F172A' }}>
              🗺️ {lang === 'mr' ? 'स्थानिक नकाशा' : lang === 'hi' ? 'स्थानीय नक्शा' : 'Regional Map'}
            </h4>
            <OpportunityMap
              userLocation={userLocation}
              radiusKm={profile.travel_radius_km || 25}
              height={200}
              lang={lang}
            />
          </div>

          {/* Quick Action Buttons to Next Stages */}
          <div className="dash-card" style={{ background: '#FFFFFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', color: '#0F172A' }}>
              {t('nextStepsTitle', lang)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.88rem' }}
                onClick={() => onNavigate('/beneficiary/skill-passport')}
              >
                {t('btnViewSkillPassport', lang)}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.88rem' }}
                onClick={() => onNavigate('/beneficiary/recommendations')}
              >
                {t('btnViewRecommendations', lang)}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.88rem' }}
                onClick={() => onNavigate('/beneficiary/journey')}
              >
                {t('btnViewJourney', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

