// Disha Sarathi - Explainable NSQF Recommendation View & Profile Gating (PS 26097)
import React, { useState } from 'react';
import { ConversationEvent, RecommendationResult, Session } from '../../core/types';
import { speechRouter } from '../../engines/speech/SpeechRouter';
import { canGenerateRecommendations } from '../../core/recommender';
import { t } from '../../core/i18n';

interface RecommendationViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
  onStartVoice?: () => void;
  onNavigate?: (path: string) => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  session,
  onEvent,
  onStartVoice,
  onNavigate
}) => {
  const isUnlocked = canGenerateRecommendations(session);
  const recommendations = session.recommendations || [];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const profile = session.profile;

  // Handle empty / locked state
  if (!isUnlocked || recommendations.length === 0) {
    return (
      <div className="recommendation-locked-wrapper" style={{ padding: '30px 16px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '36px 24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎯</div>
          <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>
            {t('noRecommendationsYet', session.lang || 'mr')}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            {session.lang === 'mr'
              ? 'आपल्याला वैयक्तिकृत पीएम-अजय कौशल्य शिफारसी मिळवण्यासाठी प्रथम आपला व्हॉईस संवाद पूर्ण करा आणि माहितीची खात्री करा.'
              : session.lang === 'hi'
              ? 'व्यक्तिगत पीएम-अजय हुनर सिफारिशें प्राप्त करने के लिए कृपया पहले अपनी वॉयस प्रोफाइल पूरी करें और जानकारी की पुष्टि करें।'
              : 'Complete your voice profiling interview and confirm your details to receive explainable NSQF recommendations.'}
          </p>

          {/* Checklist of what's completed vs missing */}
          <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px 20px', textAlign: 'left', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
              📋 प्रोफाईल चेकलिस्ट स्थिती (Checklist Status):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ color: profile.district ? '#16A34A' : '#DC2626' }}>
                {profile.district ? '✓' : '○'} 📍 स्थान: {profile.district || 'अपूर्ण'}
              </div>
              <div style={{ color: profile.education_level ? '#16A34A' : '#DC2626' }}>
                {profile.education_level ? '✓' : '○'} 🎓 शिक्षण: {profile.education_level || 'अपूर्ण'}
              </div>
              <div style={{ color: profile.family_occupation ? '#16A34A' : '#DC2626' }}>
                {profile.family_occupation ? '✓' : '○'} 🌾 कौटुंबिक व्यवसाय: {profile.family_occupation || 'अपूर्ण'}
              </div>
              <div style={{ color: profile.current_livelihood ? '#16A34A' : '#DC2626' }}>
                {profile.current_livelihood ? '✓' : '○'} 🔧 सध्याचे काम: {profile.current_livelihood || 'अपूर्ण'}
              </div>
              <div style={{ color: (profile.skills_interests && profile.skills_interests.length > 0) ? '#16A34A' : '#DC2626' }}>
                {(profile.skills_interests && profile.skills_interests.length > 0) ? '✓' : '○'} ⚡ कौशल्य/आवड: {profile.skills_interests?.join(', ') || 'अपूर्ण'}
              </div>
              <div style={{ color: profile.summary_confirmed ? '#16A34A' : '#DC2626' }}>
                {profile.summary_confirmed ? '✓' : '○'} 📋 माहिती खात्री: {profile.summary_confirmed ? 'पुष्टी केली' : 'बाकी आहे'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="btn-locked-start-voice"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
              onClick={() => {
                if (onStartVoice) onStartVoice();
                else if (onNavigate) onNavigate('/talk');
                else window.location.href = '/talk';
              }}
            >
              🎙️ व्हॉईस संवाद सुरू / पूर्ण करा (Continue Conversation)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelect = (rec: RecommendationResult, index: number) => {
    speechRouter.stopSpeaking();
    setIsSpeaking(false);
    onEvent({
      type: 'SELECT_TRADE',
      payload: {
        tradeId: rec.trade.id,
        rank: index + 1,
        value: `select_${index + 1}`
      }
    });
    if (onNavigate) {
      onNavigate('/beneficiary/training');
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      speechRouter.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (recommendations.length === 0) return;

    const top = recommendations[0];
    const tradeTitle = top.trade.name_local[session.lang] || top.trade.name_en;
    const spokenText =
      session.lang === 'mr'
        ? `आपल्यासाठी क्रमांक १ शिफारस आहे ${tradeTitle}. ${top.rationale}. आवश्यक कौशल्ये: ${top.skill_gap.training_required_skills.slice(0, 2).join(', ')}.`
        : session.lang === 'en'
        ? `Top recommendation for you is ${tradeTitle}. ${top.rationale}. Key skill gaps to be trained: ${top.skill_gap.training_required_skills.slice(0, 2).join(', ')}.`
        : `आपके लिए नंबर एक सुझाव है ${tradeTitle}। ${top.rationale}। आवश्यक प्रशिक्षण कौशल: ${top.skill_gap.training_required_skills.slice(0, 2).join(', ')}।`;

    setIsSpeaking(true);
    speechRouter.speak(spokenText, session.lang);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px', maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '8px', background: '#DCFCE7', color: '#166534' }}>
            ✓ Verified Profile • NSQF Mapped Livelihood Recommendations
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>
            {session.lang === 'mr'
              ? 'आपल्यासाठी ३ सर्वोत्तम कौशल्य मार्ग (Top 3 NSQF Courses)'
              : session.lang === 'hi'
              ? 'आपके लिए 3 सर्वश्रेष्ठ हुनर कोर्स (Top 3 NSQF Courses)'
              : 'Top 3 NSQF Recommendations'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            {session.lang === 'mr'
              ? `आपली आवड, पारंपारिक अनुभव आणि ${profile.district || 'पुणे'} जिल्ह्यातील स्थानिक रोजगाराच्या मागणीनुसार निवडलेले.`
              : `Based on your verified profile, background in ${profile.family_occupation || 'trade'}, and local demand in ${profile.district || 'district'}.`}
          </p>
        </div>

        <button
          type="button"
          id="btn-read-recommendations"
          className="btn-ctrl"
          style={{
            background: isSpeaking ? '#F7E9E8' : '#EFF6FF',
            color: isSpeaking ? '#DC2626' : '#1D4ED8',
            borderColor: isSpeaking ? '#DC2626' : '#93C5FD',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={handleReadAloud}
        >
          {isSpeaking ? '⏹️ बोलणे थांबवा (Stop)' : '🔊 शिफारसी ऐका (Read Aloud)'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {recommendations.map((rec, idx) => {
          const isTop = idx === 0;
          return (
            <div key={rec.trade.id} className={`rec-card ${isTop ? 'top-choice' : ''}`} style={{ background: '#FFFFFF', borderRadius: '16px', border: isTop ? '2px solid #22C55E' : '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="rec-rank-badge" style={{ background: isTop ? '#DCFCE7' : '#F1F5F9', color: isTop ? '#15803D' : '#475569', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {isTop ? '⭐ #1 सर्वोत्तम निवड (Top Recommendation)' : `#${idx + 1} पर्यायी शिफारस`}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563EB' }}>
                  सामंजस्य गुण (Match Score): {Math.round(rec.score * 100)}%
                </div>
              </div>

              <div className="rec-header" style={{ marginTop: '8px' }}>
                <div>
                  <h2 className="rec-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    {rec.trade.name_local[session.lang] || rec.trade.name_en}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                    QP Code: <code>{rec.trade.qp_code}</code> • {rec.trade.sector} • NSQF Level {rec.trade.nsqf_level}
                  </div>
                </div>
              </div>

              <div className="rec-meta" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
                <span className="meta-tag level" style={{ padding: '4px 8px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  NSQF स्तर {rec.trade.nsqf_level}
                </span>
                <span className="meta-tag" style={{ padding: '4px 8px', background: '#F8FAFC', color: '#475569', borderRadius: '4px', fontSize: '0.8rem' }}>
                  ⏱️ कालावधी: {rec.trade.duration_hours} तास
                </span>
                <span className="meta-tag distance" style={{ padding: '4px 8px', background: '#F8FAFC', color: '#475569', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {rec.nearest_center
                    ? `📍 नजीकचे केंद्र: ${rec.nearest_center.distance_km} किमी (${rec.nearest_center.center.name})`
                    : '📍 जिल्हा कौशल्य केंद्र'}
                </span>
                {rec.trade.typical_wage_band_inr && (
                  <span className="meta-tag" style={{ background: '#FCF4E4', color: '#8A5B00', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    💵 {rec.trade.typical_wage_band_inr}
                  </span>
                )}
                {rec.trade.self_employment_viable && (
                  <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    🏪 स्वयंरोजगार योग्य (Self-Employment)
                  </span>
                )}
              </div>

              {/* Explainable Matching Breakdown: 6 Dimensions */}
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  🎯 ६-घटक जुळणी स्पष्टीकरण (Why This Was Suggested):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px', fontSize: '0.8rem', color: '#334155' }}>
                  <div>✓ <strong>आवड सामंजस्य:</strong> उच्च पसंती जुळणी</div>
                  <div>✓ <strong>कौशल्य ट्रान्सफर:</strong> पूर्व अनुभवाचा लाभ</div>
                  <div>✓ <strong>शिक्षण पात्रता:</strong> NSQF स्तर सुसंगत</div>
                  <div>✓ <strong>स्थानिक मागणी:</strong> {profile.district || 'पुणे'} जिल्ह्यात उच्च मागणी</div>
                  <div>✓ <strong>रोजगार प्राधान्य:</strong> {profile.employment_preference || 'Wage/Self'} सुसंगत</div>
                  <div>✓ <strong>प्रवेश सुलभता:</strong> टूल-किट अनुदान व विद्यावेतन उपलब्ध</div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#1E3A8A' }}>
                  <strong>💡 सविस्तर कारण:</strong> {rec.rationale}
                </div>
              </div>

              {/* Skill Gap Analysis Box */}
              {rec.skill_gap && (
                <div
                  style={{
                    background: '#F9FAF8',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    🔍 कौशल्य अंतर विश्लेषण (Skill-Gap Analysis):
                  </div>

                  {rec.skill_gap.matched_skills.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#16A34A' }}>
                      ✓ <strong>जुळलेली कौशल्ये (Matched Skills):</strong> {rec.skill_gap.matched_skills.join(', ')}
                    </div>
                  )}

                  {rec.skill_gap.training_required_skills.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#DC2626' }}>
                      ⚠️ <strong>प्रशिक्षण आवश्यक कौशल्ये (Skills to be Trained):</strong>{' '}
                      {rec.skill_gap.training_required_skills.join(', ')}
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                    📋 <strong>हस्तक्षेप योजना:</strong> {rec.skill_gap.recommended_intervention}
                  </div>
                </div>
              )}

              {/* Beneficiary Action Button: Actively Choose Pathway */}
              <button
                type="button"
                id={`btn-select-trade-${idx + 1}`}
                className={isTop ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
                onClick={() => handleSelect(rec, idx)}
              >
                👉 हा कौशल्य मार्ग निवडा व स्थानिक संधी पहा (Choose this pathway) →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
