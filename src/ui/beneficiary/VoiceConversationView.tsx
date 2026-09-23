import React from 'react';
import { ConversationEvent, LanguageCode, Session } from '../../core/types';
import { NaturalVoiceView } from './NaturalVoiceView';
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
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
          {/* Live Profile Slot Extraction Card */}
          <div className="dash-card" style={{ background: '#FFFFFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t('liveExtractedTitle', lang)}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelName', lang)}</span>
                <strong>{profile.name || profile.first_name || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelDistrict', lang)}</span>
                <strong>{profile.district ? `📍 ${profile.district}, ${profile.state || 'Maharashtra'}` : '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelEducation', lang)}</span>
                <strong>{profile.education_level ? `🎓 ${profile.education_level}` : '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelWork', lang)}</span>
                <strong>{profile.family_occupation || profile.current_livelihood || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelSkills', lang)}</span>
                <strong>
                  {profile.skills_interests && profile.skills_interests.length > 0
                    ? profile.skills_interests.join(', ')
                    : '—'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                <span style={{ color: '#64748B' }}>{t('liveLabelEmployPref', lang)}</span>
                <strong>{profile.employment_preference || '—'}</strong>
              </div>
            </div>
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

