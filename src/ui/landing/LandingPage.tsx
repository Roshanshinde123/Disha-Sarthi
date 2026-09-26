// Disha Sarathi - Public Government Portal Landing Page (PS 26097)
import React from 'react';
import { LanguageCode } from '../../core/types';
import { t } from '../../core/i18n';

interface LandingPageProps {
  onStartVoice: () => void;
  onNavigateLogin: () => void;
  onNavigateDashboard?: () => void;
  lang?: LanguageCode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartVoice,
  onNavigateLogin,
  lang = 'mr'
}) => {

  const services = [
    {
      id: 'voice',
      icon: '🎙️',
      title: t('serviceVoiceTitle', lang),
      desc: t('serviceVoiceDesc', lang),
      action: onStartVoice,
      cta: lang === 'mr' ? 'संवाद सुरू करा →' : lang === 'hi' ? 'बातचीत शुरू करें →' : 'Start Voice →'
    },
    {
      id: 'passport',
      icon: '🪪',
      title: t('serviceMappingTitle', lang),
      desc: t('serviceMappingDesc', lang),
      action: onNavigateLogin,
      cta: lang === 'mr' ? 'पासपोर्ट तपासा →' : lang === 'hi' ? 'पासपोर्ट देखें →' : 'View Passport →'
    },
    {
      id: 'recommendations',
      icon: '🎯',
      title: t('tabRecommendations', lang),
      desc: lang === 'mr'
        ? '६-घटक अल्गोरिदमद्वारे आपल्या आवडीनुसार, स्थानिक मागणीनुसार आणि वेतनानुसार सर्वोत्तम ३ NSQF ट्रेड्स.'
        : lang === 'hi'
        ? '६-घटक एल्गोरिदम द्वारा आपकी रुचि, स्थानीय मांग और आय के अनुसार शीर्ष ३ NSQF ट्रेड्स।'
        : '6-factor algorithmic matching for top 3 NSQF trades tailored to your aspirations and local demand.',
      action: onNavigateLogin,
      cta: lang === 'mr' ? 'शिफारसी पहा →' : lang === 'hi' ? 'सिफारिशें देखें →' : 'View Recommendations →'
    },
    {
      id: 'training',
      icon: '🏫',
      title: t('serviceTrainingTitle', lang),
      desc: t('serviceTrainingDesc', lang),
      action: onNavigateLogin,
      cta: lang === 'mr' ? 'केंद्रे शोधा →' : lang === 'hi' ? 'केंद्र खोजें →' : 'Find Centers →'
    },
    {
      id: 'placement',
      icon: '💼',
      title: t('servicePlacementTitle', lang),
      desc: t('servicePlacementDesc', lang),
      action: onNavigateLogin,
      cta: lang === 'mr' ? 'संधी पहा →' : lang === 'hi' ? 'अवसर देखें →' : 'View Opportunities →'
    },
    {
      id: 'verification',
      icon: '📄',
      title: t('tabFollowUp', lang),
      desc: t('serviceCounselDesc', lang),
      action: onNavigateLogin,
      cta: lang === 'mr' ? 'प्रक्रिया पहा →' : lang === 'hi' ? 'प्रक्रिया देखें →' : 'Learn More →'
    }
  ];

  const steps = [
    {
      num: '१',
      title: t('step1Title', lang),
      desc: t('step1Desc', lang)
    },
    {
      num: '२',
      title: t('step2Title', lang),
      desc: t('step2Desc', lang)
    },
    {
      num: '३',
      title: t('step3Title', lang),
      desc: t('step3Desc', lang)
    },
    {
      num: '४',
      title: t('step4Title', lang),
      desc: t('step4Desc', lang)
    }
  ];

  return (
    <div className="gov-landing-page">
      {/* Hero Section */}
      <section className="gov-hero-banner">
        <div className="gov-hero-container">
          {/* Left Column: Heading, Subheading & CTAs */}
          <div className="gov-hero-content">
            <div className="gov-scheme-tag">
              ✨ {lang === 'mr' ? 'कौशल्य व उपजीविका सहाय्य' : lang === 'hi' ? 'कौशल एवं आजीविका सहायता' : 'AI Skilling & Livelihood Platform'}
            </div>

            <h1 className="gov-hero-heading" style={{ whiteSpace: 'pre-line' }}>
              {t('heroHeading', lang)}
            </h1>

            <p className="gov-hero-subheading">
              {t('heroSubheading', lang)}
            </p>

            <div className="gov-hero-actions">
              <button
                type="button"
                className="gov-btn-primary"
                onClick={onStartVoice}
                id="btn-hero-start-voice"
              >
                {t('btnTalkToDisha', lang)}
              </button>

              <button
                type="button"
                className="gov-btn-secondary"
                onClick={onNavigateLogin}
                id="btn-hero-login"
              >
                {t('btnLoginCta', lang)}
              </button>
            </div>

            {/* Helpline Strip */}
            <div className="gov-helpline-strip" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="helpline-icon">📞</span>
                <div className="helpline-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="helpline-label">{t('helplineLabel', lang)}</span>
                  <strong className="helpline-number">+917965480255</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="helpline-icon">💬</span>
                <div className="helpline-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="helpline-label">WhatsApp:</span>
                  <a
                    href="https://wa.me/15551602253?text=Hello%2C%20I%20want%20to%20know%20more%20about%20Disha%20Sarathi."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="helpline-number"
                    style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 800 }}
                    aria-label="Message Disha Sarathi on WhatsApp"
                  >
                    +1 (555) 160-2253
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Visual Card */}
          <div className="gov-hero-visual">
            <div className="gov-visual-card">
              <div className="visual-card-header">
                <span className="visual-status-dot"></span>
                <span className="visual-status-text">
                  {lang === 'mr' ? 'AI व्हॉईस संवाद प्रणाली' : lang === 'hi' ? 'AI वॉयस संवाद प्रणाली' : 'AI Voice Assistance'}
                </span>
              </div>

              <div className="visual-sample-transcript">
                <p className="sample-spoken">
                  "{lang === 'mr'
                    ? 'मी १०वी पर्यंत शिकलो आहे, माझ्या वडिलांचा शेतीचा व्यवसाय आहे आणि मला इलेक्ट्रिकल काम शिकायचे आहे.'
                    : lang === 'hi'
                    ? 'मैं १०वीं पास हूँ, मेरे परिवार में खेती होती है और मुझे इलेक्ट्रिकल काम सीखना है।'
                    : 'I have studied up to 10th standard, my family does agriculture, and I want to learn electrical skills.'}"
                </p>
              </div>

              <div className="visual-extracted-slots" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div className="slot-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span className="slot-icon">🎓</span>
                  <span className="slot-key" style={{ color: '#64748B', fontWeight: 600 }}>{lang === 'mr' ? 'शिक्षण:' : lang === 'hi' ? 'शिक्षा:' : 'Education:'}</span>
                  <span className="slot-val" style={{ color: '#0F172A', fontWeight: 700 }}>10th Pass</span>
                </div>
                <div className="slot-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span className="slot-icon">🌾</span>
                  <span className="slot-key" style={{ color: '#64748B', fontWeight: 600 }}>{lang === 'mr' ? 'कौटुंबिक व्यवसाय:' : lang === 'hi' ? 'पारिवारिक व्यवसाय:' : 'Family Occupation:'}</span>
                  <span className="slot-val" style={{ color: '#0F172A', fontWeight: 700 }}>Agriculture</span>
                </div>
                <div className="slot-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span className="slot-icon">⚡</span>
                  <span className="slot-key" style={{ color: '#64748B', fontWeight: 600 }}>{lang === 'mr' ? 'आवड / कौशल्य:' : lang === 'hi' ? 'रुचि / कौशल:' : 'Interest / Skill:'}</span>
                  <span className="slot-val" style={{ color: '#0F172A', fontWeight: 700 }}>Electrical</span>
                </div>
                <div className="slot-item recommended" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span className="slot-icon">🎯</span>
                  <span className="slot-key" style={{ color: '#166534', fontWeight: 700 }}>{lang === 'mr' ? 'शिफारस:' : lang === 'hi' ? 'सिफारिश:' : 'Recommendation:'}</span>
                  <span className="slot-val highlight" style={{ color: '#15803D', fontWeight: 800 }}>Electrician (NSQF Level 4)</span>
                </div>
              </div>

              <button
                type="button"
                className="visual-cta-btn"
                onClick={onStartVoice}
              >
                {t('btnTalkToDisha', lang)} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Services Section */}
      <section className="gov-services-section" id="about">
        <div className="gov-section-container">
          <div className="gov-section-header">
            <span className="section-kicker">
              {lang === 'mr' ? 'नागरिक सेवा' : lang === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services'}
            </span>
            <h2 className="section-heading">{t('servicesHeading', lang)}</h2>
            <p className="section-lead">
              {lang === 'mr'
                ? 'अनुसूचित जाती घटकातील युवकांसाठी कौशल्य विकास, रोजगार जोडणी आणि स्वयंरोजगार सहाय्य.'
                : lang === 'hi'
                ? 'अनुसूचित जाति वर्ग के युवाओं के लिए कौशल विकास, रोजगार और स्वरोजगार सहायता।'
                : 'Dedicated skill development, job placement, and self-employment support for SC beneficiaries.'}
            </p>
          </div>

          <div className="gov-services-grid">
            {services.map((s) => (
              <div key={s.id} className="gov-service-card">
                <div className="service-card-icon">{s.icon}</div>
                <h3 className="service-card-title">{s.title}</h3>
                <p className="service-card-desc">{s.desc}</p>
                <button
                  type="button"
                  className="service-card-action"
                  onClick={s.action}
                >
                  {s.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="gov-process-section" id="how-it-works">
        <div className="gov-section-container">
          <div className="gov-section-header">
            <span className="section-kicker">
              {lang === 'mr' ? 'कार्यपद्धती' : lang === 'hi' ? 'कार्यप्रणाली' : 'How It Works'}
            </span>
            <h2 className="section-heading">{t('stepsHeading', lang)}</h2>
            <p className="section-lead">
              {lang === 'mr'
                ? 'कोणत्याही क्लिष्ट कागदपत्रांशिवाय फक्त बोलून आपला कौशल्य व रोजगार प्रवास सुरू करा.'
                : lang === 'hi'
                ? 'बिना किसी जटिल कागजी कार्रवाई के केवल बोलकर अपनी कौशल यात्रा शुरू करें।'
                : 'Begin your skilling and livelihood journey simply by speaking in your mother tongue.'}
            </p>
          </div>

          <div className="gov-steps-grid">
            {steps.map((st, i) => (
              <div key={i} className="gov-step-card">
                <div className="step-badge">{st.num}</div>
                <h3 className="step-card-title">{st.title}</h3>
                <p className="step-card-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
