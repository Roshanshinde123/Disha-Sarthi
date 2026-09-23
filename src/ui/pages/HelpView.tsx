// Disha Sarathi - Comprehensive Help & FAQ View (PS 26097)
import React, { useState } from 'react';
import { LanguageCode } from '../../core/types';
import { t } from '../../core/i18n';

interface HelpViewProps {
  onStartVoice: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
  lang?: LanguageCode;
}

interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

export const HelpView: React.FC<HelpViewProps> = ({
  onStartVoice,
  onNavigateHome,
  lang = 'mr'
}) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const isEn = lang === 'en';
  const isHi = lang === 'hi';

  const faqs: FaqItem[] = isEn ? [
    {
      tag: 'VOICE',
      q: 'How do I speak to Disha Sarathi via voice?',
      a: 'Click on "🎙️ Talk to Disha Sarathi" button. Allow microphone access when prompted. Speak naturally in your mother tongue (e.g., English, Hindi, Marathi) about your education, work experience, and interests. The AI system will listen and guide you in real time.'
    },
    {
      tag: 'PASSPORT',
      q: 'What is a Digital Skill Passport and how does it help me?',
      a: 'A Skill Passport is your verified digital livelihood and skilling credential. It records your education, practical skills, NSQF level mapping, skill gap analysis, and training/placement milestones. You can download it as a PDF or share it with employers via QR code.'
    },
    {
      tag: 'RECOMMENDATION',
      q: 'How are the NSQF skill recommendations calculated?',
      a: 'Disha Sarathi uses a 6-factor deterministic matching algorithm: Aspirations/Interests (32%), Past Experience (20%), Education Qualification (16%), District Employer Demand (16%), Employment Preference (10%), and Travel Radius (6%) to recommend the top 3 best-fit NSQF courses.'
    },
    {
      tag: 'TRAINING',
      q: 'How do I find accredited training centers and enroll?',
      a: 'Once you select a recommended trade, nearby accredited PM-AJAY training centers in your district will be displayed along with batch start dates, course duration, stipend support, and tool-kit grants. You can enroll with one click.'
    },
    {
      tag: 'VERIFICATION',
      q: 'How do I submit job placement proof?',
      a: 'After securing wage employment or starting a self-employment enterprise, visit the Placement tab and upload your offer letter, salary slip, or employee ID. GIA District Coordinators verify the evidence for official PM-AJAY certification.'
    },
    {
      tag: 'RETENTION',
      q: 'What is the 7/30/90-Day Post-Placement Follow-up?',
      a: 'To ensure sustainable livelihood, GIA Coordinators contact placed beneficiaries after 7 days (workplace adaptation), 30 days (first salary receipt), and 90 days (long-term job retention).'
    },
    {
      tag: 'PRIVACY',
      q: 'How is my personal data secured? (DPDP Act 2023)',
      a: 'All data is encrypted in compliance with the Digital Personal Data Protection (DPDP) Act 2023. Aadhaar numbers are masked (e.g. XXXX XXXX 1234). You can permanently delete your data at any time using the "Delete My Data" feature.'
    },
    {
      tag: 'PHONE',
      q: 'Can I use Disha Sarathi without internet or smartphone? (PSTN Helpline)',
      a: 'Yes! You can call our toll-free helpline at 09513886363 from any basic phone. The voicebot will interact in your language and record your profile via automated telephone call.'
    }
  ] : isHi ? [
    {
      tag: 'VOICE',
      q: 'दिशा सारथी से आवाज़ के माध्यम से कैसे बात करें?',
      a: 'ऊपर दिए गए "🎙️ दिशा सारथी से बात करें" बटन पर क्लिक करें। माइक की अनुमति दें। अपनी मातृभाषा में शिक्षा, अनुभव और रुचि के बारे में बोलें। सिस्टम सुनकर तुरंत मार्गदर्शन करेगा।'
    },
    {
      tag: 'PASSPORT',
      q: 'डिजिटल स्किल पासपोर्ट क्या है और इसका क्या लाभ है?',
      a: 'स्किल पासपोर्ट आपका आधिकारिक डिजिटल कौशल पहचान पत्र है। इसमें शिक्षा, पारंपरिक हुनर, NSQF मैपिंग, कौशल अंतर और रोजगार प्रगति दर्ज होती है। इसे PDF या QR कोड द्वारा साझा किया जा सकता है।'
    },
    {
      tag: 'RECOMMENDATION',
      q: 'कौशल सिफारिशें कैसे तैयार की जाती हैं?',
      a: 'दिशा सारथी ६-घटक एल्गोरिदम द्वारा आपकी रुचि (32%), अनुभव (20%), शिक्षा (16%), स्थानीय मांग (16%), रोजगार वरीयता (10%) और यात्रा सीमा (6%) का संतुलन बनाकर ३ सर्वोत्तम कोर्स सुझाता है।'
    },
    {
      tag: 'TRAINING',
      q: 'प्रशिक्षण केंद्र कैसे खोजें और आवेदन कैसे करें?',
      a: 'सिफारिश चुनने के बाद आपके जिले के निकटतम PM-AJAY कौशल केंद्र, बैच समय सारणी, वजीफा और टूलकिट अनुदान की जानकारी दिखाई देगी। आप सीधे प्रवेश के लिए आवेदन कर सकते हैं।'
    },
    {
      tag: 'VERIFICATION',
      q: 'रोजगार प्रमाण पत्र (Placement Proof) कैसे अपलोड करें?',
      a: 'नौकरी मिलने के बाद रोजगार टैब में जाकर नियुक्ति पत्र या कर्मचारी आईडी की प्रति अपलोड करें। GIA जिला समन्वयक द्वारा सत्यापन किया जाता है।'
    },
    {
      tag: 'RETENTION',
      q: '७, ३० और ९० दिनों का फॉलो-अप क्या है?',
      a: 'नौकरी में कार्यभार ग्रहण करने के ७ दिन बाद कार्य वातावरण, ३० दिन बाद पहला वेतन और ९० दिन बाद स्थायी रोजगार की पुष्टि के लिए समन्वयक संपर्क करते हैं।'
    },
    {
      tag: 'PRIVACY',
      q: 'मेरा व्यक्तिगत डेटा कैसे सुरक्षित रखा जाता है? (DPDP Act)',
      a: 'आपका डेटा DPDP अधिनियम २०२३ के अनुसार एन्क्रिप्टेड है। आधार कभी भी सार्वजनिक नहीं किया जाता है। आप कभी भी "डेटा हटाएं" बटन से अपना रिकॉर्ड नष्ट कर सकते हैं।'
    },
    {
      tag: 'PHONE',
      q: 'बिना इंटरनेट या स्मार्टफोन के कैसे उपयोग करें? (PSTN Helpline)',
      a: 'आप किसी भी साधारण फोन से 09513886363 टोल-फ्री नंबर पर कॉल कर सकते हैं। दिशा सारथी फोन पर आपकी भाषा में बात करके पूरी जानकारी दर्ज करेगी।'
    }
  ] : [
    {
      tag: 'VOICE',
      q: 'दिशा सारथीशी व्हॉईसद्वारे कसे बोलावे?',
      a: 'वर दिलेल्या "🎙️ दिशा सारथीशी बोला" बटणावर क्लिक करा. मायक्रोफोनची परवानगी द्या. आपल्या मातृभाषेत (उदा. मराठी, हिंदी, इंग्रजी) शिक्षण, अनुभव, आणि आवडीविषयी बोला. सिस्टिम आपले बोलणे ऐकून लगेच समुपदेशन करेल.'
    },
    {
      tag: 'PASSPORT',
      q: 'स्किल पासपोर्ट म्हणजे काय आणि त्याचा काय उपयोग आहे?',
      a: 'स्किल पासपोर्ट हे आपले डिजिटल कौशल्य प्रमाणपत्र आहे. यामध्ये आपले शिक्षण, पारंपारिक कौशल्ये, NSQF मॅपिंग, कौशल्य अंतर (Skill Gap), आणि रोजगार प्रगती नोंदवली जाते. आपण हा पासपोर्ट PDF स्वरूपात डाऊनलोड किंवा QR कोडद्वारे शेअर करू शकता.'
    },
    {
      tag: 'RECOMMENDATION',
      q: 'कौशल्य शिफारसी कशा तयार केल्या जातात?',
      a: 'दिशा सारथीमध्ये ६-घटक डिटरमिनिस्टिक अल्गोरिदम (deterministic 6-factor model) वापरला जातो. यामध्ये आपली आवड (32%), पूर्वानुभव (20%), शिक्षण (16%), स्थानिक मागणी (16%), रोजगाराचे प्राधान्य (10%), आणि प्रवास अंतर (6%) यांचा समतोल साधून सर्वोत्तम ३ कोर्सेस सुचवले जातात.'
    },
    {
      tag: 'TRAINING',
      q: 'प्रशिक्षण केंद्र कसे शोधायचे व अर्ज कसा करायचा?',
      a: 'शिफारस निवडल्यानंतर आपल्या जिल्ह्यातील जवळचे PM-AJAY कौशल्य केंद्र, बॅचचे वेळापत्रक, स्टायपेंड, आणि टूलकिट अनुदानाची माहिती दिसेल. "केंद्राची निवड करा" वर क्लिक करून आपण थेट नोंदणी करू शकता.'
    },
    {
      tag: 'VERIFICATION',
      q: 'रोजगार पुरावा (Placement Evidence) कसा अपलोड करावा?',
      a: 'नोकरी मिळाल्यानंतर रोजगार टॅबमध्ये जाऊन नियुक्ती पत्र (Offer/Joining Letter) किंवा कर्मचारी ओळखपत्राची प्रत अपलोड करा. ही माहिती GIA जिल्हा समन्वयकांकडे पडताळणीसाठी (Verification) पाठवली जाते.'
    },
    {
      tag: 'RETENTION',
      q: '७, ३० आणि ९० दिवसांचा पाठपुरावा (Follow-up) काय आहे?',
      a: 'नोकरीमध्ये रुजू झाल्यानंतर ७ दिवसांनी कामाचे वातावरण, ३० दिवसांनी पहिल्या महिन्याचा पगार, आणि ९० दिवसांनी शाश्वत रोजगाराची खात्री करण्यासाठी समन्वयक संपर्क साधतात.'
    },
    {
      tag: 'PRIVACY',
      q: 'माझा वैयक्तिक डेटा कसा सुरक्षित ठेवला जातो? (Data Privacy & DPDP Act)',
      a: 'आपला डेटा DPDP कायदा २०२३ नुसार कूटबद्ध (encrypted) केला जातो. आधार क्रमांक कधीही सार्वजनिक केला जात नाही (XXXX XXXX 1234 मास्क केला जातो). आपण कधीही "माझा डेटा हटवा" बटणाद्वारे आपले सर्व रेकॉर्ड नष्ट करू शकता.'
    },
    {
      tag: 'PHONE',
      q: 'इंटरनेट किंवा स्मार्टफोन नसेल तर कसे वापरावे? (PSTN Helpline)',
      a: 'आपण कोणत्याही साध्या फोनवरून 09513886363 या टोल-फ्री क्रमांकावर कॉल करू शकता. दिशा सारथी फोनवर मराठी, हिंदी किंवा स्थानिक भाषेत बोलून संपूर्ण माहिती नोंदवून घेईल.'
    }
  ];

  const categories = isEn ? [
    { id: 'ALL', label: 'All Questions' },
    { id: 'VOICE', label: '🎙️ Voice Counselling' },
    { id: 'PASSPORT', label: '📄 Skill Passport' },
    { id: 'RECOMMENDATION', label: '🎯 Recommendations & NSQF' },
    { id: 'TRAINING', label: '🏫 Training Centers' },
    { id: 'VERIFICATION', label: '✅ Placement & Verification' },
    { id: 'PRIVACY', label: '🔒 Privacy & Security' }
  ] : isHi ? [
    { id: 'ALL', label: 'सभी प्रश्न' },
    { id: 'VOICE', label: '🎙️ वॉयस परामर्श' },
    { id: 'PASSPORT', label: '📄 स्किल पासपोर्ट' },
    { id: 'RECOMMENDATION', label: '🎯 सिफारिशें एवं NSQF' },
    { id: 'TRAINING', label: '🏫 प्रशिक्षण केंद्र' },
    { id: 'VERIFICATION', label: '✅ रोजगार एवं सत्यापन' },
    { id: 'PRIVACY', label: '🔒 गोपनीयता एवं सुरक्षा' }
  ] : [
    { id: 'ALL', label: 'सर्व प्रश्न' },
    { id: 'VOICE', label: '🎙️ व्हॉईस समुपदेशन' },
    { id: 'PASSPORT', label: '📄 स्किल पासपोर्ट' },
    { id: 'RECOMMENDATION', label: '🎯 शिफारसी व NSQF' },
    { id: 'TRAINING', label: '🏫 प्रशिक्षण केंद्र' },
    { id: 'VERIFICATION', label: '✅ रोजगार व पडताळणी' },
    { id: 'PRIVACY', label: '🔒 गोपनीयता व सुरक्षा' }
  ];

  const filteredFaqs = activeCategory === 'ALL'
    ? faqs
    : faqs.filter((f) => f.tag === activeCategory);

  return (
    <div className="help-page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Back to Voice Assistant Navigation Bar */}
      <div className="page-back-voice-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onNavigateHome && (
            <button type="button" className="btn-back-secondary" onClick={onNavigateHome}>
              ← {t('navHome', lang)}
            </button>
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>
            {isEn ? 'Have questions about skilling?' : isHi ? 'कौशल के बारे में प्रश्न हैं?' : 'कौशल्याबद्दल काही प्रश्न आहेत का?'}
          </span>
        </div>
        <button type="button" className="btn-back-voice" onClick={onStartVoice}>
          🎙️ {t('btnTalkToDisha', lang)}
        </button>
      </div>

      {/* Hero Header */}
      <div className="help-hero-card" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', borderRadius: '16px', padding: '36px', marginBottom: '32px', textAlign: 'center' }}>
        <span className="demo-pill" style={{ background: 'rgba(255,255,255,0.15)', color: '#93C5FD', marginBottom: '12px' }}>
          PM-AJAY GIA Component • Help & Knowledge Base
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0', color: '#FFFFFF' }}>
          {isEn ? 'Help Center & Frequently Asked Questions' : isHi ? 'सहायता केंद्र एवं अक्सर पूछे जाने वाले प्रश्न' : 'मदत केंद्र व वारंवार विचारले जाणारे प्रश्न'}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '680px', margin: '0 auto 24px' }}>
          {isEn
            ? 'Complete guidance on using Disha Sarathi, voice-first skill profiling, digital skill passport, and placement verification.'
            : isHi
            ? 'दिशा सारथी का उपयोग, वॉयस कौशल प्रोफाइलिंग, स्किल पासपोर्ट और रोजगार सत्यापन के बारे में संपूर्ण मार्गदर्शन।'
            : 'दिशा सारथी प्लॅटफॉर्मचा वापर कसा करावा, व्हॉईसद्वारे कौशल्य नोंदणी, स्किल पासपोर्ट, आणि रोजगार पडताळणीविषयी संपूर्ण मार्गदर्शन.'}
        </p>
        <button type="button" className="gov-btn-primary" onClick={onStartVoice}>
          {t('btnTalkToDisha', lang)}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="help-cat-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn-ctrl ${activeCategory === c.id ? 'active-cat-btn' : ''}`}
            onClick={() => setActiveCategory(c.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: activeCategory === c.id ? '#166534' : '#FFFFFF',
              color: activeCategory === c.id ? '#FFFFFF' : '#334155',
              border: '1px solid #CBD5E1',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* FAQs List Accordion */}
      <div className="faqs-accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredFaqs.map((faq, index) => {
          const isOpen = expandedFaq === index;
          return (
            <div
              key={faq.q}
              className="faq-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(isOpen ? null : index)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '18px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#0F172A'
                }}
              >
                <span>{faq.q}</span>
                <span style={{ fontSize: '1.2rem', color: '#64748B', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 20px 18px', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Help Box */}
      <div style={{ marginTop: '36px', background: '#F8FAFC', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px', color: '#0F172A' }}>
            {isEn ? 'Still have unanswered questions?' : isHi ? 'क्या अभी भी कोई प्रश्न हैं?' : 'अजूनही काही प्रश्न आहेत का?'}
          </h4>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            {isEn ? 'Our support desk and toll-free helpline are always ready to assist you.' : isHi ? 'हमारा सहायता प्रकोष्ठ और टोल-फ्री हेल्पलाइन आपकी मदद के लिए सदैव उपलब्ध है।' : 'आमचा सहाय्यता कक्ष व हेल्पलाइन आपल्या मदतीसाठी सदैव उपलब्ध आहे.'}
          </p>
        </div>
        <a href="tel:09513886363" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
          📞 {isEn ? 'Call 09513886363' : isHi ? '09513886363 पर कॉल करें' : '09513886363 वर कॉल करा'}
        </a>
      </div>
    </div>
  );
};

