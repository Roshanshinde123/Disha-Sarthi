import React from 'react';
import { Session } from '../../core/types';
import { getPlacementStatusLabel } from '../../core/placement';

interface MyJourneyViewProps {
  session: Session;
  onNavigate: (path: string) => void;
  onStartVoice: () => void;
}

export const MyJourneyView: React.FC<MyJourneyViewProps> = ({
  session,
  onNavigate,
  onStartVoice
}) => {
  const lang = session.lang || 'en';
  const profile = session.profile;
  const placementStatus = profile.placement_status || 'NOT_STARTED';
  const verificationLevel = profile.verification_level || 'SELF_REPORTED';

  // Calculate state booleans
  const isProfileDone = Boolean(profile.name || profile.first_name);
  const isPassportDone = Boolean(profile.skills_interests && profile.skills_interests.length > 0);
  const isGapDone = (session.recommendations && session.recommendations.length > 0) || false;
  const isPathwaySelected = Boolean(profile.selected_trade_id);
  const isTrainingActive = profile.training_status === 'IN_TRAINING' || profile.training_status === 'COMPLETED' || placementStatus === 'PLACED';
  const isApplied = ['APPLIED', 'INTERVIEW', 'SELECTED', 'JOINED', 'EVIDENCE_SUBMITTED', 'PLACED'].includes(placementStatus);
  const isInterview = ['INTERVIEW', 'SELECTED', 'JOINED', 'EVIDENCE_SUBMITTED', 'PLACED'].includes(placementStatus);
  const isSelected = ['SELECTED', 'JOINED', 'EVIDENCE_SUBMITTED', 'PLACED'].includes(placementStatus);
  const isJoined = ['JOINED', 'EVIDENCE_SUBMITTED', 'PLACED'].includes(placementStatus);
  const isEvidenceUploaded = Boolean(profile.evidence_list && profile.evidence_list.length > 0);
  const isVerified = verificationLevel === 'COORDINATOR_VERIFIED' || verificationLevel === 'EMPLOYER_VERIFIED';

  const day7FollowUp = (profile.follow_ups || []).find((f) => f.period_days === 7);
  const day30FollowUp = (profile.follow_ups || []).find((f) => f.period_days === 30);
  const day90FollowUp = (profile.follow_ups || []).find((f) => f.period_days === 90);

  const is7DDone = day7FollowUp?.status === 'RETAINED' || day7FollowUp?.status === 'WAGE_RECEIVED';
  const is30DDone = day30FollowUp?.status === 'WAGE_RECEIVED' || day30FollowUp?.status === 'RETAINED';
  const is90DDone = day90FollowUp?.status === 'RETAINED' || day90FollowUp?.status === 'WAGE_RECEIVED';

  const getMilestoneData = () => {
    if (lang === 'mr') {
      return [
        { id: 1, title: '१. व्हॉईस समुपदेशन व प्रोफाईल (Voice Profile)', desc: 'दिशा सारथीशी बोलून शिक्षण, अनुभव, व आवडीची नोंदणी.', done: isProfileDone, active: true, path: '/beneficiary/profile', actionText: 'प्रोफाईल पहा / संपादित करा →' },
        { id: 2, title: '२. डिजिटल स्किल पासपोर्ट (Skill Passport)', desc: '१५+ विभागांचा प्रमाणित डिजिटल कौशल्य पासपोर्ट तयार झाला.', done: isPassportDone, active: isProfileDone, path: '/beneficiary/skill-passport', actionText: 'स्किल पासपोर्ट पहा / डाऊनलोड →' },
        { id: 3, title: '३. कौशल्य अंतर विश्लेषण (Skill Gap Analysis)', desc: 'सध्याची कौशल्ये आणि निवडलेल्या NSQF कोर्समधील अंतर ओळखले.', done: isGapDone, active: isPassportDone, path: '/beneficiary/skill-gap', actionText: 'कौशल्य अंतर पहा →' },
        { id: 4, title: '४. NSQF-संरेखित शिफारस (Recommended Pathway)', desc: '६-घटक नियमांवर आधारित जिल्ह्यातील सर्वोत्तम कोर्सेस.', done: isPathwaySelected, active: isGapDone, path: '/beneficiary/recommendations', actionText: 'शिफारसी पहा व कोर्स निवडा →' },
        { id: 5, title: '५. कौशल्य प्रशिक्षण केंद्र (Training Centre)', desc: 'PM-AJAY GIA अंतर्गत जवळच्या केंद्रात प्रवेश व टूलकिट सहाय्य.', done: isTrainingActive, active: isPathwaySelected, path: '/beneficiary/training', actionText: 'प्रशिक्षण केंद्र व बॅच तपशील →' },
        { id: 6, title: '६. स्थानिक रोजगार अर्ज (Application)', desc: 'जिल्ह्यातील स्थानिक उद्योगांमध्ये रोजगार किंवा स्वयंरोजगार अर्ज.', done: isApplied, active: isTrainingActive, path: '/beneficiary/placement', actionText: 'रोजगार संधी पहा →' },
        { id: 7, title: '७. मुलाखत प्रक्रिया (Interview)', desc: 'नियोक्त्यासोबत मुलाखत किंवा चाचणी सत्र.', done: isInterview, active: isApplied, path: '/beneficiary/placement', actionText: 'मुलाखत स्थिती तपासा →' },
        { id: 8, title: '८. निवड व ऑफर लेटर (Selected)', desc: 'उमेदवाराची निवड होऊन नियुक्ती पत्र प्राप्त झाले.', done: isSelected, active: isInterview, path: '/beneficiary/placement', actionText: 'निवड तपशील पहा →' },
        { id: 9, title: '९. नोकरीत रुजू (Joined Employment)', desc: 'कामाच्या ठिकाणी प्रत्यक्ष रुजू होऊन काम सुरू केले.', done: isJoined, active: isSelected, path: '/beneficiary/placement', actionText: 'रुजू स्थिती नोंदवा →' },
        { id: 10, title: '१०. रोजगार पुरावा सादर (Evidence Submitted)', desc: 'नियुक्ती पत्र, ओळखपत्र, किंवा जॉइनिंग लेटर पुरावा अपलोड केला.', done: isEvidenceUploaded, active: isJoined, path: '/beneficiary/placement', actionText: 'पुरावा अपलोड करा / पहा →' },
        { id: 11, title: '११. समन्वयक पडताळणी (Coordinator Verified)', desc: 'GIA जिल्हा समन्वयकांद्वारे नियुक्तीची सत्यता पडताळली गेली.', done: isVerified, active: isEvidenceUploaded, path: '/beneficiary/placement', actionText: 'पडताळणी स्थिती पहा →' },
        { id: 12, title: '१२. ७ दिवसांचा पाठपुरावा (7-Day Follow-Up)', desc: 'पहिल्या आठवड्यातील कामाचे वातावरण व वाहतूक अनुकूलता तपासली.', done: is7DDone, active: isVerified, path: '/beneficiary/follow-up', actionText: '७ दिवसांचा अहवाल पहा →' },
        { id: 13, title: '१३. ३० दिवसांचा वेतन पाठपुरावा (30-Day Follow-Up)', desc: 'पहिल्या महिन्याचा पगार किंवा स्टायपेंड बँकेत जमा झाल्याची पुष्टी.', done: is30DDone, active: is7DDone, path: '/beneficiary/follow-up', actionText: '३० दिवसांचा अहवाल पहा →' },
        { id: 14, title: '१४. ९० दिवसांचे शाश्वत उपजीविका प्रमाणीकरण (90-Day Retention & Outcome)', desc: '३ महिने अखंडित शाश्वत रोजगार व आर्थिक स्थैर्य पुष्टी.', done: is90DDone, active: is30DDone, path: '/beneficiary/follow-up', actionText: '९० दिवसांचे शाश्वत आकडेवारी →' }
      ];
    } else if (lang === 'hi') {
      return [
        { id: 1, title: '1. वॉयस काउंसलिंग व प्रोफाइल (Voice Profile)', desc: 'दिशा सारथी से बोलकर शिक्षा, अनुभव व रुचि दर्ज करें।', done: isProfileDone, active: true, path: '/beneficiary/profile', actionText: 'प्रोफाइल देखें / संपादित करें →' },
        { id: 2, title: '2. डिजिटल स्किल पासपोर्ट (Skill Passport)', desc: '15+ सेक्शन का सत्यापित डिजिटल स्किल पासपोर्ट तैयार हुआ।', done: isPassportDone, active: isProfileDone, path: '/beneficiary/skill-passport', actionText: 'स्किल पासपोर्ट देखें / डाउनलोड करें →' },
        { id: 3, title: '3. कौशल अंतर विश्लेषण (Skill Gap Analysis)', desc: 'वर्तमान कौशल और चयनित NSQF कोर्स के बीच अंतर पहचाना गया।', done: isGapDone, active: isPassportDone, path: '/beneficiary/skill-gap', actionText: 'कौशल अंतर देखें →' },
        { id: 4, title: '4. NSQF-संरेखित सिफारिश (Recommended Pathway)', desc: '6-कारक नियमों पर आधारित जिले के सर्वश्रेष्ठ कोर्स।', done: isPathwaySelected, active: isGapDone, path: '/beneficiary/recommendations', actionText: 'सिफारिशें देखें व कोर्स चुनें →' },
        { id: 5, title: '5. कौशल प्रशिक्षण केंद्र (Training Centre)', desc: 'PM-AJAY GIA के तहत नजदीकी केंद्र में दाखिला व टूलकिट सहायता।', done: isTrainingActive, active: isPathwaySelected, path: '/beneficiary/training', actionText: 'प्रशिक्षण केंद्र व बैच विवरण →' },
        { id: 6, title: '6. स्थानीय रोजगार आवेदन (Application)', desc: 'जिले के स्थानीय उद्योगों में रोजगार या स्वरोजगार हेतु आवेदन।', done: isApplied, active: isTrainingActive, path: '/beneficiary/placement', actionText: 'रोजगार के अवसर देखें →' },
        { id: 7, title: '7. साक्षात्कार प्रक्रिया (Interview)', desc: 'नियोक्ता के साथ साक्षात्कार या परीक्षण सत्र।', done: isInterview, active: isApplied, path: '/beneficiary/placement', actionText: 'साक्षात्कार स्थिति जांचें →' },
        { id: 8, title: '8. चयन व ऑफर लेटर (Selected)', desc: 'उम्मीदवार का चयन होकर नियुक्ति पत्र प्राप्त हुआ।', done: isSelected, active: isInterview, path: '/beneficiary/placement', actionText: 'चयन विवरण देखें →' },
        { id: 9, title: '9. नौकरी में कार्यग्रहण (Joined Employment)', desc: 'कार्यस्थल पर प्रत्यक्ष उपस्थित होकर कार्य प्रारंभ किया।', done: isJoined, active: isSelected, path: '/beneficiary/placement', actionText: 'कार्यग्रहण स्थिति दर्ज करें →' },
        { id: 10, title: '10. रोजगार प्रमाण प्रस्तुत (Evidence Submitted)', desc: 'नियुक्ति पत्र, पहचान पत्र या जॉइनिंग लेटर प्रमाण अपलोड किया गया।', done: isEvidenceUploaded, active: isJoined, path: '/beneficiary/placement', actionText: 'प्रमाण अपलोड / देखें →' },
        { id: 11, title: '11. समन्वयक सत्यापन (Coordinator Verified)', desc: 'GIA जिला समन्वयकों द्वारा नियुक्ति की सत्यता सत्यापित की गई।', done: isVerified, active: isEvidenceUploaded, path: '/beneficiary/placement', actionText: 'सत्यापन स्थिति देखें →' },
        { id: 12, title: '12. 7 दिन का अनुवर्ती (7-Day Follow-Up)', desc: 'पहले सप्ताह के कार्य वातावरण व परिवहन की अनुकूलता की जांच।', done: is7DDone, active: isVerified, path: '/beneficiary/follow-up', actionText: '7 दिवसीय रिपोर्ट देखें →' },
        { id: 13, title: '13. 30 दिन का वेतन अनुवर्ती (30-Day Follow-Up)', desc: 'पहले माह का वेतन या मानदेय बैंक खाते में जमा होने की पुष्टि।', done: is30DDone, active: is7DDone, path: '/beneficiary/follow-up', actionText: '30 दिवसीय रिपोर्ट देखें →' },
        { id: 14, title: '14. 90 दिवसीय सतत आजीविका प्रमाणीकरण (90-Day Retention)', desc: '3 महीने निरंतर सतत रोजगार व आर्थिक स्थिरता की पुष्टि।', done: is90DDone, active: is30DDone, path: '/beneficiary/follow-up', actionText: '90 दिवसीय प्रतिधारण आंकड़े →' }
      ];
    }
    return [
      { id: 1, title: '1. Voice Counseling & Profile Creation', desc: 'Mother-tongue speech counseling mapping education, experience, and aspirations.', done: isProfileDone, active: true, path: '/beneficiary/profile', actionText: 'View / Edit Profile →' },
      { id: 2, title: '2. Digital Skill Passport', desc: '15+ section verifiable digital credential ready for employers and coordinators.', done: isPassportDone, active: isProfileDone, path: '/beneficiary/skill-passport', actionText: 'View / Download Skill Passport →' },
      { id: 3, title: '3. Skill Gap Analysis', desc: 'AI-driven diagnostic identifying gaps against NSQF job role standards.', done: isGapDone, active: isPassportDone, path: '/beneficiary/skill-gap', actionText: 'View Skill Gap Analysis →' },
      { id: 4, title: '4. Recommended NSQF Pathway', desc: 'Deterministic 6-factor model matched top 3 local trades & job roles.', done: isPathwaySelected, active: isGapDone, path: '/beneficiary/recommendations', actionText: 'View Recommendations & Select Course →' },
      { id: 5, title: '5. PM-AJAY GIA Training Centre', desc: 'Enrolled in nearby accredited training center with toolkit grant support.', done: isTrainingActive, active: isPathwaySelected, path: '/beneficiary/training', actionText: 'View Centre & Batch Details →' },
      { id: 6, title: '6. Local Opportunity Application', desc: 'Applied to local micro-enterprise or industrial partner in the district.', done: isApplied, active: isTrainingActive, path: '/beneficiary/placement', actionText: 'View Livelihood Opportunities →' },
      { id: 7, title: '7. Interview & Assessment', desc: 'Scheduled and completed employer interaction / practical assessment.', done: isInterview, active: isApplied, path: '/beneficiary/placement', actionText: 'Check Interview Status →' },
      { id: 8, title: '8. Selected & Offer Issued', desc: 'Candidate received formal job offer / self-employment approval.', done: isSelected, active: isInterview, path: '/beneficiary/placement', actionText: 'View Selection Details →' },
      { id: 9, title: '9. Joined Employment', desc: 'Candidate joined the workplace or commenced micro-enterprise.', done: isJoined, active: isSelected, path: '/beneficiary/placement', actionText: 'Log Joining Status →' },
      { id: 10, title: '10. Livelihood Evidence Upload', desc: 'Uploaded offer letter, employee badge, or bank stipend confirmation.', done: isEvidenceUploaded, active: isJoined, path: '/beneficiary/placement', actionText: 'Upload / View Evidence →' },
      { id: 11, title: '11. Coordinator Verification', desc: 'District GIA coordinator verified genuine placement & records.', done: isVerified, active: isEvidenceUploaded, path: '/beneficiary/placement', actionText: 'View Verification Status →' },
      { id: 12, title: '12. 7-Day Follow-Up', desc: 'Initial workplace adaptation, travel feasibility, and safety review.', done: is7DDone, active: isVerified, path: '/beneficiary/follow-up', actionText: 'View 7-Day Report →' },
      { id: 13, title: '13. 30-Day Wage Follow-Up', desc: 'Confirmation of first month wage/stipend disbursement directly to bank.', done: is30DDone, active: is7DDone, path: '/beneficiary/follow-up', actionText: 'View 30-Day Report →' },
      { id: 14, title: '14. 90-Day Retention & Sustainability', desc: 'Achieved sustainable 3-month livelihood retention and economic stability.', done: is90DDone, active: is30DDone, path: '/beneficiary/follow-up', actionText: 'View 90-Day Milestone →' }
    ];
  };

  const MILESTONES = getMilestoneData();

  const completedCount = MILESTONES.filter((m) => m.done).length;
  const progressPercent = Math.round((completedCount / MILESTONES.length) * 100);

  const tLabels = {
    backVoice: lang === 'mr' ? '← मुख्य व्हॉईस स्क्रीनवर परत जा' : lang === 'hi' ? '← मुख्य वॉयस स्क्रीन पर वापस जाएं' : '← Back to Voice Assistant',
    backOverview: lang === 'mr' ? 'डॅशबोर्ड' : lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard Overview',
    title: lang === 'mr' ? '🗺️ माझा उपजीविका व कौशल्य प्रवास (My Journey)' : lang === 'hi' ? '🗺️ मेरी आजीविका व कौशल यात्रा (My Journey)' : '🗺️ My Skilling & Livelihood Journey',
    beneficiary: lang === 'mr' ? 'लाभार्थी' : lang === 'hi' ? 'लाभार्थी' : 'Beneficiary',
    citizen: lang === 'mr' ? 'नागरिक' : lang === 'hi' ? 'नागरिक' : 'Citizen',
    district: lang === 'mr' ? 'जिल्हा' : lang === 'hi' ? 'जिला' : 'District',
    status: lang === 'mr' ? 'स्थिती' : lang === 'hi' ? 'स्थिति' : 'Status',
    voiceBtn: lang === 'mr' ? '🎙️ व्हॉईस असिस्टंट सुरू करा' : lang === 'hi' ? '🎙️ वॉयस असिस्टेंट शुरू करें' : '🎙️ Start Voice Assistant',
    progress: lang === 'mr' ? `एकूण प्रगती: ${completedCount} / ${MILESTONES.length} टप्पे पूर्ण` : lang === 'hi' ? `कुल प्रगति: ${completedCount} / ${MILESTONES.length} चरण पूर्ण` : `Overall Progress: ${completedCount} of ${MILESTONES.length} stages completed`
  };

  return (
    <div className="my-journey-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Top Back Navigation Bar */}
      <div className="page-back-voice-bar" style={{ marginBottom: '16px' }}>
        <button type="button" className="btn-back-voice" onClick={onStartVoice}>
          {tLabels.backVoice}
        </button>
        <button type="button" className="btn-back-secondary" onClick={() => onNavigate('/beneficiary')}>
          ← {tLabels.backOverview}
        </button>
      </div>

      {/* Top Banner Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="demo-pill" style={{ marginBottom: '8px' }}>
              PM-AJAY GIA Component • End-to-End Progress Tracker
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '6px 0' }}>
              {tLabels.title}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              {tLabels.beneficiary}: <strong>{profile.name || profile.first_name || tLabels.citizen}</strong> • {tLabels.district}: <strong>{profile.district || (lang === 'mr' ? 'पुणे' : 'Pune')}</strong> • {tLabels.status}: <strong>{getPlacementStatusLabel(placementStatus, lang)}</strong>
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onStartVoice}
            style={{ padding: '10px 18px', fontWeight: 700, fontSize: '0.9rem' }}
          >
            {tLabels.voiceBtn}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>{tLabels.progress}</span>
            <span style={{ color: '#2563EB' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #2563EB, #10B981)', borderRadius: '999px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* 14-Stage Connected Timeline */}
      <div className="journey-timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MILESTONES.map((m) => (
          <div
            key={m.id}
            className="journey-milestone-card"
            style={{
              borderRadius: '12px',
              border: m.done ? '1px solid #86EFAC' : m.active ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: m.done ? '0 1px 3px rgba(16, 185, 129, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
              background: m.done ? '#F0FDF4' : m.active ? '#FFFFFF' : '#FAFAFA'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: m.done ? '#10B981' : m.active ? '#2563EB' : '#CBD5E1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {m.done ? '✓' : m.id}
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: m.done ? '#166534' : m.active ? '#0F172A' : '#94A3B8', fontWeight: 700 }}>
                  {m.title}
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                  {m.desc}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: m.done ? '#DCFCE7' : m.active ? '#EFF6FF' : '#F1F5F9',
                  color: m.done ? '#166534' : m.active ? '#1E40AF' : '#64748B'
                }}
              >
                {m.done ? 'पूर्ण (Completed)' : m.active ? 'सक्रिय (In Progress)' : 'प्रलंबित (Upcoming)'}
              </span>

              <button
                type="button"
                className="btn-ctrl"
                onClick={() => onNavigate(m.path)}
                style={{ fontSize: '0.82rem', padding: '6px 12px', fontWeight: 600 }}
              >
                {m.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
