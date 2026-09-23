// Disha Sarathi - "Mujh Jaisa" Inspiring Relatable Peer Personas (PS 26097)
import React from 'react';

interface StoriesViewProps {
  onBack?: () => void;
  onStartVoice?: () => void;
}

const STORIES = [
  {
    id: 'story_1',
    name: 'सुनिता कांबळे (Sunita Kamble)',
    district: 'पुणे (Pune, Maharashtra)',
    background: 'पारंपरिक घरगुती शिवणकाम व शेतमजुरी',
    selectedTrade: 'सोलर पॅनेल इन्स्टॉलर (Solar PV Installer - NSQF Level 4)',
    outcome: 'टाटा सोलर संलग्न आस्थापनेत ₹19,500 मासिक वेतन आणि मोफत टूल-किट प्राप्त.',
    quote: 'दिशा सारथी व्हॉईस असिस्टंटने माझ्या गावाजवळचे केंद्र दाखवले. ३ महिन्यांच्या मोफत प्रशिक्षणानंतर आज मी स्वतःच्या पायावर उभी आहे.',
    tag: 'वेतन रोजगार (Wage Employment)'
  },
  {
    id: 'story_2',
    name: 'आनंद गायकवाड (Anand Gaikwad)',
    district: 'सोलापूर (Solapur, Maharashtra)',
    background: 'हातमाग विणकाम व रोजंदारी मजूर',
    selectedTrade: 'स्वयंरोजगार टेलर व पॅटर्न मेकर (Self Employed Tailor - NSQF Level 4)',
    outcome: 'NSFDC महिला समृद्धी / मुद्रा योजनेतून ₹1.5 लाख अनुदान कर्ज मिळवून स्वतःचे बुटीक सुरू केले.',
    quote: 'पारंपरिक कामाला आधुनिक तंत्रज्ञानाची जोड मिळाली. आज माझ्याकडे २ इतर तरुणांना रोजगार देण्याची क्षमता आहे.',
    tag: 'स्वरोजगार (Self-Employment & NSFDC Credit)'
  },
  {
    id: 'story_3',
    name: 'विकास मेश्राम (Vikas Meshram)',
    district: 'नागपूर (Nagpur, Maharashtra)',
    background: '१० वी उत्तीर्ण, स्थानिक गॅरेजमध्ये मदतनीस',
    selectedTrade: 'ऑटोमोटिव्ह इलेक्ट्रिकल टेक्निशियन (Automotive Electrician - NSQF Level 4)',
    outcome: 'महिंद्रा अधिकृत सर्व्हिस सेंटरमध्ये थेट प्लेसमेंट व ₹18,000 वेतन.',
    quote: 'मला आधी फक्त बेसिक वायरिंग माहिती होती. दिशा सारथीच्या कौशल्य अंतर विश्लेषणाने मला योग्य कोर्स सुचवला.',
    tag: 'वेतन रोजगार (Wage Employment)'
  }
];

export const StoriesView: React.FC<StoriesViewProps> = ({ onBack, onStartVoice }) => {
  return (
    <div className="stories-page" style={{ paddingBottom: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        {onBack && (
          <button type="button" className="btn-ctrl" onClick={onBack} style={{ marginBottom: '6px' }}>
            ← मागे जा (Back)
          </button>
        )}
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          PM-AJAY GIA • Synthetic Demo Personas
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
          🌟 "मजसारखे इतर" प्रेरणादायी अनुभव ("Mujh Jaisa" Stories)
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          तुमच्यासारख्याच पार्श्वभूमीतून येऊन पीएम-अजय योजनेद्वारे स्वावलंबी झालेल्या लाभार्थ्यांचे अनुभव.
        </p>
      </div>

      {/* Mandatory Demo Label */}
      <div style={{ background: '#FFFDF0', border: '1px solid #E0A32E', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#8A5B00', marginBottom: '20px' }}>
        ℹ️ <strong>नोंद (Notice):</strong> खालील सर्व अनुभव हे प्रात्यक्षिक व प्रेरणेसाठी तयार केलेले <em>सिंथेटिक डेमो पर्सोना (Demo persona / Indicative demo data)</em> आहेत.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {STORIES.map((st) => (
          <div key={st.id} className="dash-card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--field)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>{st.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>📍 {st.district}</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="demo-pill">Demo persona</span>
                <span className="meta-tag" style={{ background: '#E8F3ED', color: '#1F6F4A', fontWeight: 700 }}>
                  {st.tag}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>पार्श्वभूमी:</strong> {st.background}</div>
              <div><strong>निवडलेला कोर्स:</strong> {st.selectedTrade}</div>
              <div style={{ color: 'var(--field-deep)', fontWeight: 700 }}><strong>उपजीविका प्रगती:</strong> {st.outcome}</div>
            </div>

            <blockquote style={{ marginTop: '12px', padding: '10px 14px', background: '#F8FBF9', borderLeft: '3px solid var(--field)', borderRadius: '6px', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--ink)' }}>
              "{st.quote}"
            </blockquote>
          </div>
        ))}
      </div>

      {onStartVoice && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button type="button" className="btn-primary" onClick={onStartVoice} style={{ maxWidth: '360px', margin: '0 auto' }}>
            🎙️ माझ्यासाठी योग्य कोर्स शोधा (Start My Voice Journey)
          </button>
        </div>
      )}
    </div>
  );
};
