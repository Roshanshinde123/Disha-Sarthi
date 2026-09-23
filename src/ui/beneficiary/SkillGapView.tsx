// Disha Sarathi - Dedicated Skill Gap View (PS 26097)
import React from 'react';
import { Session, NSQFTrade } from '../../core/types';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface SkillGapViewProps {
  session: Session;
  onSelectTrade?: (tradeId: string) => void;
  onNavigateToTraining?: () => void;
  onStartVoice?: () => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  session,
  onNavigateToTraining,
  onStartVoice
}) => {
  const lang = session.lang || 'en';
  const profile = session.profile;
  const selectedTradeId = profile.selected_trade_id || session.recommendations?.[0]?.trade.id || 'app_sewing_machine_op';

  const recommendations = session.recommendations || [];
  const activeRec = recommendations.find((r) => r.trade.id === selectedTradeId) || recommendations[0];
  const trade: NSQFTrade | undefined =
    activeRec?.trade || (nsqfTradesData as NSQFTrade[]).find((t) => t.id === selectedTradeId);
  const skillGap = activeRec?.skill_gap;

  const tLabels = {
    backVoice: lang === 'mr' ? '← मुख्य व्हॉईस स्क्रीनवर परत जा' : lang === 'hi' ? '← मुख्य वॉयस स्क्रीन पर वापस जाएं' : '← Back to Voice Assistant',
    badge: 'PM-AJAY GIA • Skill Gap Diagnostic',
    title: lang === 'mr' ? '🔍 कौशल्य अंतर विश्लेषण (Skill Gap Engine)' : lang === 'hi' ? '🔍 कौशल अंतर विश्लेषण (Skill Gap Engine)' : '🔍 Skill Gap Analysis Engine',
    desc: lang === 'mr' ? 'तुमचे विद्यमान कौशल्य आणि निवडलेल्या NSQF कोर्ससाठी आवश्यक असलेल्या कौशल्यांमधील तफावत व उपाय.' : lang === 'hi' ? 'आपकी वर्तमान दक्षताओं और चुने गए NSQF कोर्स के बीच अंतर व समाधान।' : 'Comprehensive comparison between your current strengths and required competencies for the selected NSQF pathway.',
    targetPathway: lang === 'mr' ? 'लक्ष्यित NSQF कोर्स (Target NSQF Pathway)' : lang === 'hi' ? 'लक्षित NSQF कोर्स (Target NSQF Pathway)' : 'Target NSQF Pathway',
    duration: lang === 'mr' ? 'कालावधी' : lang === 'hi' ? 'अवधि' : 'Duration',
    hours: lang === 'mr' ? 'तास' : lang === 'hi' ? 'घंटे' : 'hours',
    existingSkills: lang === 'mr' ? '✅ विद्यमान कौशल्ये (Recognized Strengths)' : lang === 'hi' ? '✅ वर्तमान कौशल (Recognized Strengths)' : '✅ Recognized Existing Skills',
    missingSkills: lang === 'mr' ? '⚠️ भरून काढायचे कौशल्य अंतर (Missing Skills to Bridge)' : lang === 'hi' ? '⚠️ आवश्यक अतिरिक्त कौशल (Skills to Bridge)' : '⚠️ Identified Skills to Bridge',
    actionPlan: lang === 'mr' ? '🛠️ पीएम-अजय जीआयए कौशल्य उपाययोजना (Bridging Action Plan)' : lang === 'hi' ? '🛠️ पीएम-अजय जीआयए कार्ययोजना (Bridging Action Plan)' : '🛠️ PM-AJAY GIA Bridging Action Plan',
    proposedIntervention: lang === 'mr' ? 'प्रस्तावित प्रशिक्षण हस्तक्षेप:' : lang === 'hi' ? 'प्रस्तावित प्रशिक्षण योजना:' : 'Recommended Training Intervention:',
    viewCentres: lang === 'mr' ? '🏫 प्रशिक्षण केंद्र व उपलब्ध बॅचेस पहा →' : lang === 'hi' ? '🏫 प्रशिक्षण केंद्र व उपलब्ध बैच देखें →' : '🏫 View Training Centres & Batches →'
  };

  const getTradeName = () => {
    if (!trade) return '';
    if (lang === 'mr' && trade.name_local?.mr) return trade.name_local.mr;
    if (lang === 'hi' && trade.name_local?.hi) return trade.name_local.hi;
    return trade.name_en;
  };

  return (
    <div className="skill-gap-page" style={{ paddingBottom: '32px' }}>
      {/* Top Back Navigation Bar */}
      {onStartVoice && (
        <div className="page-back-voice-bar" style={{ marginBottom: '16px' }}>
          <button type="button" className="btn-back-voice" onClick={onStartVoice}>
            🎙️ {tLabels.backVoice}
          </button>
        </div>
      )}

      <div style={{ marginBottom: '18px' }}>
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          {tLabels.badge}
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
          {tLabels.title}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          {tLabels.desc}
        </p>
      </div>

      {/* Target Pathway Card */}
      {trade && (
        <div className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--field)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--field-deep)', textTransform: 'uppercase' }}>
                {tLabels.targetPathway}
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
                {getTradeName()}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
                QP Code: <strong>{trade.qp_code}</strong> • NSQF Level: <strong>{trade.nsqf_level}</strong> • {tLabels.duration}: <strong>{trade.duration_hours} {tLabels.hours}</strong>
              </div>
            </div>

            {skillGap && (
              <span
                className="meta-tag"
                style={{
                  fontSize: '0.85rem',
                  padding: '6px 14px',
                  fontWeight: 800,
                  background:
                    skillGap.severity === 'low'
                      ? '#E8F3ED'
                      : skillGap.severity === 'medium'
                      ? '#FCF4E4'
                      : '#F7E9E8',
                  color:
                    skillGap.severity === 'low'
                      ? '#1F6F4A'
                      : skillGap.severity === 'medium'
                      ? '#8A5B00'
                      : '#A8322D'
                }}
              >
                अंतर तीव्रता: {skillGap.severity.toUpperCase()} SEVERITY
              </span>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Left Column: Current Verified Skills */}
        <div className="dash-card" style={{ background: '#F8FBF9' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--field-deep)', marginBottom: '12px' }}>
            {tLabels.existingSkills}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
            {lang === 'mr' ? 'लाभार्थीच्या बोलण्यातून आणि कौटुंबिक पार्श्वभूमीतून ओळखलेली कौशल्ये:' : lang === 'hi' ? 'लाभार्थी की बातचीत व पारिवारिक पृष्ठभूमि से पहचाने गए कौशल:' : 'Identified strengths from spoken counseling and background:'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profile.skills_interests.map((skill, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--stone-light)', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--field)', fontWeight: 800 }}>✓</span>
                <span>{skill}</span>
              </div>
            ))}
            {profile.family_occupation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--stone-light)', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--field)', fontWeight: 800 }}>✓</span>
                <span>{lang === 'mr' ? 'पारंपरिक अनुभव:' : lang === 'hi' ? 'पारंपरिक अनुभव:' : 'Family background / experience:'} {profile.family_occupation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Missing Skills to be Bridged */}
        <div className="dash-card" style={{ background: '#FFFDF9', border: '1px solid #E0A32E' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#8A5B00', marginBottom: '12px' }}>
            {tLabels.missingSkills}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
            {lang === 'mr' ? 'प्रमाणित रोजगारासाठी खालील घटकांचे प्रशिक्षण आवश्यक आहे:' : lang === 'hi' ? 'प्रमाणित रोजगार हेतु निम्नलिखित घटकों का प्रशिक्षण आवश्यक है:' : 'Key competencies to acquire during training for formal placement:'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {skillGap?.training_required_skills.map((skill, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #F5DEB3', fontSize: '0.9rem' }}>
                <span style={{ color: '#8A5B00', fontWeight: 800 }}>⚡</span>
                <strong>{skill}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bridging Intervention & PM-AJAY Support Plan */}
      <div className="dash-card" style={{ background: '#FFFFFF', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
          {tLabels.actionPlan}
        </h3>

        <div style={{ background: '#F2F8F4', padding: '14px', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--field-deep)', lineHeight: 1.6, marginBottom: '14px' }}>
          <strong>{tLabels.proposedIntervention}</strong> {skillGap?.recommended_intervention || 'Standard NSQF Skilling under PM-AJAY GIA Component with Tool-Kit and Stipend Assistance.'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>💰 {lang === 'mr' ? 'विद्यावेतन:' : lang === 'hi' ? 'स्टाइपेंड:' : 'Direct Stipend (DBT):'}</div>
            <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{lang === 'mr' ? 'प्रशिक्षण काळात मासिक ₹1,500 - ₹2,500 थेट बँक खात्यात.' : lang === 'hi' ? 'प्रशिक्षण अवधि में मासिक ₹1,500 - ₹2,500 सीधे बैंक खाते में।' : 'Monthly stipend ₹1,500 - ₹2,500 directly disbursed via DBT.'}</div>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>🧰 {lang === 'mr' ? 'टूल-किट अनुदान:' : lang === 'hi' ? 'टूलकिट अनुदान:' : 'Toolkit Grant:'}</div>
            <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{lang === 'mr' ? 'कोर्स पूर्ण झाल्यावर मोफत आधुनिक अवजारे किट.' : lang === 'hi' ? 'कोर्स पूर्ण होने पर निःशुल्क आधुनिक उपकरण किट।' : 'Free professional tool-kit upon course completion.'}</div>
          </div>
          <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>📜 {lang === 'mr' ? 'NSQF प्रमाणपत्र:' : lang === 'hi' ? 'NSQF प्रमाण पत्र:' : 'NSQF Certificate:'}</div>
            <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{lang === 'mr' ? 'शासकीय मान्यताप्राप्त डिजिटल प्रमाणपत्र व नोकरी लिंकेज.' : lang === 'hi' ? 'सरकारी मान्यता प्राप्त डिजिटल प्रमाण पत्र व रोजगार लिंकेज।' : 'Govt-recognized digital certificate & verified job linkage.'}</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {onNavigateToTraining && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={onNavigateToTraining}
        >
          {tLabels.viewCentres}
        </button>
      )}
    </div>
  );
};
