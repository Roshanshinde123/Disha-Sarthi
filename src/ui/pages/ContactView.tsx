// Disha Sarathi - Contact & Support Desk (PS 26097)
import React, { useState } from 'react';
import { LanguageCode } from '../../core/types';
import { t } from '../../core/i18n';

interface ContactViewProps {
  lang?: LanguageCode;
  onStartVoice?: () => void;
  onNavigateHome?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  lang = 'mr',
  onStartVoice,
  onNavigateHome
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const isEn = lang === 'en';
  const isHi = lang === 'hi';

  return (
    <div className="contact-page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Back to Voice Assistant Navigation Bar */}
      <div className="page-back-voice-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onNavigateHome && (
            <button type="button" className="btn-back-secondary" onClick={onNavigateHome}>
              ← {t('navHome', lang)}
            </button>
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>
            {isEn ? 'Need help right away?' : isHi ? 'क्या आपको तुरंत सहायता चाहिए?' : 'त्वरित मदत हवी आहे का?'}
          </span>
        </div>
        {onStartVoice && (
          <button type="button" className="btn-back-voice" onClick={onStartVoice}>
            🎙️ {t('btnTalkToDisha', lang)}
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          PM-AJAY GIA Component • Citizen Grievance & Technical Help Desk
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '8px 0' }}>
          📞 {isEn ? 'Contact & Support Desk' : isHi ? 'संपर्क एवं सहायता केंद्र' : 'संपर्क कक्ष व सहाय्यता केंद्र'}
        </h1>
        <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          {isEn
            ? 'Contact us for guidance regarding the PM-AJAY GIA Component, skill training centers, and the voice assistant system.'
            : isHi
            ? 'PM-AJAY GIA घटक, कौशल प्रशिक्षण केंद्र और वॉयसबॉट प्रणाली के संबंध में मार्गदर्शन के लिए हमसे संपर्क करें।'
            : 'PM-AJAY GIA घटक, कौशल्य प्रशिक्षण केंद्र, आणि व्हॉईसबॉट प्रणालीबाबत मार्गदर्शनासाठी आमच्याशी संपर्क साधा.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left: Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>📞</div>
            <h3 style={{ margin: '0 0 6px', color: '#0F172A' }}>
              {isEn ? 'Toll-Free Voice Helpline' : isHi ? 'टोल-फ्री वॉयस हेल्पलाइन' : 'टोल-फ्री व्हॉईस हेल्पलाइन'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 12px' }}>
              {isEn ? 'Call from any phone for instant AI counselling in your language.' : isHi ? 'किसी भी फोन से कॉल करके सीधे AI परामर्श प्राप्त करें।' : 'कोणत्याही फोनवरून कॉल करून थेट AI समुपदेशन मिळवा.'}
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563EB' }}>
              09513886363
            </div>
            <small style={{ color: '#94A3B8', display: 'block', marginTop: '4px' }}>
              {isEn ? '(24x7 Available • Free across all Indian mobile networks)' : isHi ? '(24x7 उपलब्ध • सभी भारतीय मोबाइल नेटवर्क से निःशुल्क)' : '(24x7 उपलब्ध • सर्व भारतीय मोबाईल नेटवर्कवरून मोफत)'}
            </small>
          </div>

          <div className="dash-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ margin: '0 0 6px', color: '#0F172A' }}>
              {isEn ? 'GIA District Coordinator Cell (Pilot Districts)' : isHi ? 'GIA जिला समन्वयक प्रकोष्ठ (पायलट जिले)' : 'GIA जिल्हा समन्वयक कक्ष (Pilot Districts)'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
              <strong>{isEn ? 'Maharashtra Pilot Districts:' : isHi ? 'महाराष्ट्र पायलट जिले:' : 'महाराष्ट्र पायलट जिल्हे:'}</strong> Pune, Nagpur, Amravati, Solapur, Nanded, Aurangabad, Nashik.
            </p>
            <div style={{ marginTop: '8px', padding: '6px 10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.78rem', color: '#64748B' }}>
              ℹ️ Demo contact information for SIH PS 26097 pilot implementation.
            </div>
          </div>

          <div className="dash-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>✉️</div>
            <h3 style={{ margin: '0 0 6px', color: '#0F172A' }}>
              {isEn ? 'Technical Support Email' : isHi ? 'तकनीकी सहायता ईमेल' : 'तांत्रिक सहाय्यता ईमेल'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 8px' }}>
              {isEn ? 'For software, verification and grievance queries:' : isHi ? 'सॉफ्टवेयर, सत्यापन और डेटा सुधार के प्रश्नों के लिए:' : 'सॉफ्टवेअर, पडताळणी व डेटा सुधारणांच्या चौकशीसाठी:'}
            </p>
            <strong style={{ color: '#0F172A' }}>support.disha@pmajay-gia.gov.in (Demo)</strong>
          </div>
        </div>

        {/* Right: Feedback & Query Submission Form */}
        <div className="dash-card" style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 8px', color: '#0F172A' }}>
            📝 {isEn ? 'Submit Your Message or Grievance' : isHi ? 'अपना संदेश या शिकायत दर्ज करें' : 'आपला संदेश किंवा तक्रार नोंदवा'}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '20px' }}>
            {isEn ? 'Your inquiry will be addressed by GIA Coordinators within 24 hours.' : isHi ? 'आपकी समस्या का समाधान २४ घंटे के भीतर GIA समन्वयकों द्वारा किया जाएगा।' : 'आपल्या समस्येचे २४ तासांच्या आत GIA समन्वयकांद्वारे निवारण केले जाईल.'}
          </p>

          {submitted ? (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '20px', borderRadius: '10px', textAlign: 'center', color: '#166534' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              <h4 style={{ margin: '0 0 6px' }}>
                {isEn ? 'Message Submitted Successfully!' : isHi ? 'संदेश सफलतापूर्वक भेजा गया!' : 'संदेश यशस्वीरित्या पाठवला गेला!'}
              </h4>
              <p style={{ fontSize: '0.88rem', margin: '0 0 16px' }}>
                {isEn ? 'Your grievance has been registered with reference ' : isHi ? 'आपकी शिकायत संदर्भ संख्या ' : 'आपली तक्रार संदर्भ क्रमांक '}
                <strong>#DS-{Math.floor(100000 + Math.random() * 900000)}</strong>
              </p>
              <button
                type="button"
                className="btn-ctrl"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setMessage('');
                }}
              >
                {isEn ? 'Send Another Message' : isHi ? 'नया संदेश भेजें' : 'नवीन संदेश पाठवा'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isEn ? 'Full Name:' : isHi ? 'पूरा नाम:' : 'आपले पूर्ण नाव:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. Rahul Kamble' : isHi ? 'उदा. राहुल कांबळे' : 'उदा. राहुल कांबळे'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isEn ? 'Phone Number:' : isHi ? 'मोबाइल नंबर:' : 'मोबाईल नंबर:'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isEn ? 'District:' : isHi ? 'ज़िला:' : 'जिल्हा:'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', background: '#FFF', boxSizing: 'border-box' }}
                >
                  {['Pune', 'Nagpur', 'Amravati', 'Solapur', 'Nanded', 'Aurangabad', 'Nashik'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isEn ? 'Message / Grievance:' : isHi ? 'संदेश / शिकायत विवरण:' : 'आपली अडचण किंवा प्रश्न:'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={isEn ? 'Please describe your query here...' : isHi ? 'कृपया अपनी समस्या का विवरण यहाँ लिखें...' : 'कृपया आपल्या समस्येचे संक्षिप्त वर्णन येथे लिहा...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px', fontWeight: 700, fontSize: '0.95rem', marginTop: '6px' }}
              >
                📩 {isEn ? 'Submit Query' : isHi ? 'संदेश भेजें' : 'संदेश सादर करा'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

