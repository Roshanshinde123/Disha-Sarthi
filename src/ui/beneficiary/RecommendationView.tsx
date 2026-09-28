import React, { useState } from 'react';
import { ConversationEvent, RecommendationResult, Session } from '../../core/types';
import { speechRouter } from '../../engines/speech/SpeechRouter';
import { canGenerateRecommendations } from '../../core/recommender';
import { getOpportunitiesForTradeAndDistrict } from '../../core/placement';
import { OpportunityMap } from '../components/OpportunityMap';
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
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const profile = session.profile;
  const lang = session.lang || 'mr';

  // Handle empty / locked state
  if (!isUnlocked || recommendations.length === 0) {
    return (
      <div className="recommendation-locked-wrapper" style={{ padding: '24px 16px', maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px 20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>
            {t('noRecommendationsYet', lang)}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            {lang === 'mr'
              ? 'आपल्याला वैयक्तिकृत पीएम-अजय कौशल्य शिफारसी मिळवण्यासाठी प्रथम आपला व्हॉईस संवाद पूर्ण करा आणि माहितीची खात्री करा.'
              : lang === 'hi'
              ? 'व्यक्तिगत पीएम-अजय हुनर सिफारिशें प्राप्त करने के लिए कृपया पहले अपनी वॉयस प्रोफाइल पूरी करें और जानकारी की पुष्टि करें।'
              : 'Complete your voice profiling interview and confirm your details to receive explainable NSQF recommendations.'}
          </p>

          {/* Checklist of what's completed vs missing */}
          <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
              {lang === 'mr' ? 'प्रोफाईल चेकलिस्ट स्थिती:' : lang === 'hi' ? 'प्रोफाइल चेकलिस्ट स्थिति:' : 'Profile Checklist Status:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ color: profile.district ? '#16A34A' : '#DC2626' }}>
                {profile.district ? '✓' : '○'} {lang === 'mr' ? 'स्थान' : 'Location'}: {profile.district || (lang === 'mr' ? 'अपूर्ण' : 'Pending')}
              </div>
              <div style={{ color: profile.education_level ? '#16A34A' : '#DC2626' }}>
                {profile.education_level ? '✓' : '○'} {lang === 'mr' ? 'शिक्षण' : 'Education'}: {profile.education_level || (lang === 'mr' ? 'अपूर्ण' : 'Pending')}
              </div>
              <div style={{ color: profile.family_occupation ? '#16A34A' : '#DC2626' }}>
                {profile.family_occupation ? '✓' : '○'} {lang === 'mr' ? 'कौटुंबिक व्यवसाय' : 'Family Occupation'}: {profile.family_occupation || (lang === 'mr' ? 'अपूर्ण' : 'Pending')}
              </div>
              <div style={{ color: profile.current_livelihood ? '#16A34A' : '#DC2626' }}>
                {profile.current_livelihood ? '✓' : '○'} {lang === 'mr' ? 'सध्याचे काम' : 'Current Work'}: {profile.current_livelihood || (lang === 'mr' ? 'अपूर्ण' : 'Pending')}
              </div>
              <div style={{ color: (profile.skills_interests && profile.skills_interests.length > 0) ? '#16A34A' : '#DC2626' }}>
                {(profile.skills_interests && profile.skills_interests.length > 0) ? '✓' : '○'} {lang === 'mr' ? 'कौशल्य/आवड' : 'Skills/Interests'}: {profile.skills_interests?.join(', ') || (lang === 'mr' ? 'अपूर्ण' : 'Pending')}
              </div>
              <div style={{ color: profile.summary_confirmed ? '#16A34A' : '#DC2626' }}>
                {profile.summary_confirmed ? '✓' : '○'} {lang === 'mr' ? 'माहिती खात्री' : 'Confirmed'}: {profile.summary_confirmed ? (lang === 'mr' ? 'पुष्टी केली' : 'Yes') : (lang === 'mr' ? 'बाकी आहे' : 'Pending')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="btn-locked-start-voice"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}
              onClick={() => {
                if (onStartVoice) onStartVoice();
                else if (onNavigate) onNavigate('/talk');
                else window.location.href = '/talk';
              }}
            >
              {lang === 'mr' ? 'व्हॉईस संवाद सुरू / पूर्ण करा' : lang === 'hi' ? 'वॉयस संवाद शुरू / पूरा करें' : 'Continue Voice Conversation'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topRec = recommendations[0];
  const matchedOpportunities = getOpportunitiesForTradeAndDistrict(
    topRec.trade.id,
    profile.district,
    profile.employment_preference
  );

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

    const tradeTitle = topRec.trade.name_local[lang] || topRec.trade.name_en;
    const spokenText =
      lang === 'mr'
        ? `आपल्यासाठी क्रमांक १ शिफारस आहे ${tradeTitle}. ${topRec.rationale}.`
        : lang === 'en'
        ? `Top recommendation for you is ${tradeTitle}. ${topRec.rationale}.`
        : `आपके लिए नंबर एक सुझाव है ${tradeTitle}। ${topRec.rationale}।`;

    setIsSpeaking(true);
    speechRouter.speak(spokenText, lang, () => setIsSpeaking(false));
  };

  // Map markers preparation
  const userCoords = profile.lat && profile.lng ? { lat: profile.lat, lng: profile.lng, label: `${profile.district || 'Pune'}` } : null;

  const trainingCenterItems = recommendations
    .map((r) => {
      const c = r.nearest_center?.center;
      if (!c) return null;
      return {
        id: c.id,
        name: c.name,
        district: c.district,
        lat: c.lat,
        lng: c.lng,
        distanceKm: r.nearest_center?.distance_km,
        address: c.address,
        contactPhone: c.contact_phone
      };
    })
    .filter(Boolean) as any[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px', maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px', background: '#DCFCE7', color: '#166534' }}>
            ✓ {lang === 'mr' ? 'सत्यापित प्रोफाईल • NSQF शिफारसी' : lang === 'hi' ? 'सत्यापित प्रोफाइल • NSQF सिफारिशें' : 'Verified Profile • NSQF Recommendations'}
          </span>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            {lang === 'mr'
              ? 'आपल्यासाठी ३ सर्वोत्तम कौशल्य मार्ग'
              : lang === 'hi'
              ? 'आपके लिए 3 सर्वश्रेष्ठ कौशल मार्ग'
              : 'Top 3 NSQF Recommendations'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '2px' }}>
            {lang === 'mr'
              ? `आपली आवड आणि ${profile.district || 'पुणे'} जिल्ह्यातील स्थानिक मागणीनुसार निवडलेले.`
              : `Based on your profile and local demand in ${profile.district || 'district'}.`}
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
            fontWeight: 700
          }}
          onClick={handleReadAloud}
        >
          {isSpeaking ? (lang === 'mr' ? 'थांबवा' : 'Stop') : (lang === 'mr' ? 'शिफारसी ऐका' : 'Read Aloud')}
        </button>
      </div>

      {/* Map Section: Nearby Opportunities & Training Centers */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {lang === 'mr' ? 'नजीकच्या संधी व प्रशिक्षण केंद्र' : lang === 'hi' ? 'निकटतम अवसर व प्रशिक्षण केंद्र' : 'Nearby Opportunities & Centers'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              {lang === 'mr' ? `${profile.district || 'पुणे'} व आसपासच्या अधिकृत जागा` : `Locations in & around ${profile.district || 'your area'}`}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
            (Indicative Demo Data)
          </span>
        </div>

        <OpportunityMap
          userLocation={userCoords}
          radiusKm={profile.travel_radius_km || 25}
          opportunities={matchedOpportunities}
          trainingCenters={trainingCenterItems}
          selectedId={selectedOppId}
          onSelectOpportunity={(opp) => setSelectedOppId(opp.id)}
          height="280px"
          lang={lang}
        />
      </div>

      {/* Recommendation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendations.map((rec, idx) => {
          const isTop = idx === 0;
          const isExpanded = expandedTraceId === rec.trade.id;

          return (
            <div
              key={rec.trade.id}
              className={`rec-card ${isTop ? 'top-choice' : ''}`}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: isTop ? '2px solid #22C55E' : '1px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              {/* Rank and Match score header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ background: isTop ? '#DCFCE7' : '#F1F5F9', color: isTop ? '#15803D' : '#475569', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem' }}>
                  {isTop
                    ? (lang === 'mr' ? '#1 सर्वोत्तम निवड' : lang === 'hi' ? '#1 सर्वश्रेष्ठ चयन' : '#1 Top Recommendation')
                    : `#${idx + 1} ${lang === 'mr' ? 'पर्यायी शिफारस' : 'Alternative'}`}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563EB' }}>
                  {lang === 'mr' ? 'सामंजस्य गुण' : 'Match'}: {Math.round(rec.score * 100)}%
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#0F172A' }}>
                  {rec.trade.name_local[lang] || rec.trade.name_en}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {rec.trade.sector} • NSQF Level {rec.trade.nsqf_level} • QP: <code>{rec.trade.qp_code}</code>
                </div>
              </div>

              {/* Concise Summary Info */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
                <span style={{ padding: '4px 8px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  NSQF Level {rec.trade.nsqf_level}
                </span>
                <span style={{ padding: '4px 8px', background: '#F8FAFC', color: '#475569', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {rec.trade.duration_hours} {lang === 'mr' ? 'तास' : lang === 'hi' ? 'घंटे' : 'Hours'}
                </span>
                {rec.nearest_center && (
                  <span style={{ padding: '4px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {rec.nearest_center.distance_km} km ({rec.nearest_center.center.name})
                  </span>
                )}
                {rec.trade.typical_wage_band_inr && (
                  <span style={{ padding: '4px 8px', background: '#ECFDF5', color: '#065F46', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {rec.trade.typical_wage_band_inr}
                  </span>
                )}
              </div>

              {/* Rationale explanation */}
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E2E8F0', marginBottom: '12px', fontSize: '0.84rem', color: '#1E293B', lineHeight: 1.4 }}>
                <strong>{lang === 'mr' ? 'कारण:' : lang === 'hi' ? 'कारण:' : 'Why:'}</strong> {rec.rationale}
              </div>

              {/* Expandable Technical Details */}
              <div style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563EB',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() => setExpandedTraceId(isExpanded ? null : rec.trade.id)}
                >
                  {isExpanded
                    ? (lang === 'mr' ? 'तपशील लपवा' : 'Hide technical breakdown')
                    : (lang === 'mr' ? 'तपशील व कौशल्य अंतर विश्लेषण पहा' : 'View match details & skill gap')}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '8px', padding: '10px', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.78rem', color: '#334155' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                      {lang === 'mr' ? '६-घटक जुळणी गुण:' : '6-Factor Score Breakdown:'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px' }}>
                      <div>• {lang === 'mr' ? 'आवड जुळणी' : 'Interest Match'}: {Math.round((rec.scoreBreakdown?.interestMatch ?? 0.8) * 100)}% (0.32)</div>
                      <div>• {lang === 'mr' ? 'शिक्षण पात्रता' : 'Education Fit'}: {Math.round((rec.scoreBreakdown?.educationFit ?? 0.9) * 100)}% (0.20)</div>
                      <div>• {lang === 'mr' ? 'स्थानिक मागणी' : 'Local Demand'}: {Math.round((rec.scoreBreakdown?.localDemand ?? 0.85) * 100)}% (0.16)</div>
                      <div>• {lang === 'mr' ? 'रोजगार पसंती' : 'Preference Fit'}: {Math.round((rec.scoreBreakdown?.preferenceFit ?? 0.85) * 100)}% (0.16)</div>
                      <div>• {lang === 'mr' ? 'सुलभता' : 'Accessibility'}: {Math.round((rec.scoreBreakdown?.accessibility ?? 0.75) * 100)}% (0.10)</div>
                      <div>• {lang === 'mr' ? 'कौशल्य ट्रान्सफर' : 'Skill Transfer'}: {Math.round((rec.scoreBreakdown?.skillTransfer ?? 0.8) * 100)}% (0.06)</div>
                    </div>

                    {rec.skill_gap && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #CBD5E1', paddingTop: '6px' }}>
                        <div><strong>{lang === 'mr' ? 'प्रशिक्षण आवश्यक कौशल्ये:' : 'Skills to be trained:'}</strong> {rec.skill_gap.training_required_skills.join(', ')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                id={`btn-select-trade-${idx + 1}`}
                className={isTop ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '10px 16px', fontSize: '0.92rem', fontWeight: 700 }}
                onClick={() => handleSelect(rec, idx)}
              >
                {lang === 'mr'
                  ? 'हा कौशल्य मार्ग निवडा'
                  : lang === 'hi'
                  ? 'यह कौशल मार्ग चुनें'
                  : 'Choose this pathway'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
