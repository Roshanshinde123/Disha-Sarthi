// Disha Sarathi - Live Synchronized Skill Card Component (PS 26097)
import React from 'react';
import { BeneficiaryProfile, LanguageCode } from '../../core/types';

interface SkillCardProps {
  profile: Partial<BeneficiaryProfile>;
  lang?: LanguageCode;
  title?: string;
  isCompact?: boolean;
}

const LABELS: Record<string, {
  cardTitle: string;
  name: string;
  location: string;
  education: string;
  familyOccupation: string;
  skills: string;
  experience: string;
  preference: string;
  wage: string;
  self: string;
  years: string;
  notRecorded: string;
}> = {
  mr: {
    cardTitle: 'लाइव्ह कौशल्य कार्ड (Skill Card)',
    name: 'नाव',
    location: 'स्थान',
    education: 'शिक्षण',
    familyOccupation: 'कौटुंबिक व्यवसाय',
    skills: 'कौशल्ये / आवड',
    experience: 'अनुभव',
    preference: 'रोजगार पसंती',
    wage: 'नोकरी (वेतन रोजगार)',
    self: 'स्वतःचा व्यवसाय (स्वरोजगार)',
    years: 'वर्षे',
    notRecorded: 'नोंदवले नाही'
  },
  hi: {
    cardTitle: 'लाइव कौशल कार्ड (Skill Card)',
    name: 'नाम',
    location: 'स्थान',
    education: 'शिक्षा',
    familyOccupation: 'पारिवारिक व्यवसाय',
    skills: 'कौशल / रुचि',
    experience: 'अनुभव',
    preference: 'कार्य प्राथमिकता',
    wage: 'नौकरी (वेतन रोजगार)',
    self: 'स्वरोजगार (व्यवसाय)',
    years: 'वर्ष',
    notRecorded: 'दर्ज नहीं किया'
  },
  en: {
    cardTitle: 'Live Skill Card',
    name: 'Name',
    location: 'Location',
    education: 'Education',
    familyOccupation: 'Family Occupation',
    skills: 'Skills & Interests',
    experience: 'Experience',
    preference: 'Preference',
    wage: 'Wage Employment',
    self: 'Self Employment',
    years: 'Years',
    notRecorded: 'Not recorded'
  },
  bn: {
    cardTitle: 'লাইভ স্কিল কার্ড (Skill Card)',
    name: 'নাম',
    location: 'স্থান',
    education: 'শিক্ষা',
    familyOccupation: 'পারিবারিক পেশা',
    skills: 'দক্ষতা / আগ্রহ',
    experience: 'অভিজ্ঞতা',
    preference: 'পছন্দ',
    wage: 'চাকরি (মজুরি কর্মসংস্থান)',
    self: 'স্ব-উদ্যোগ (ব্যবসা)',
    years: 'বছর',
    notRecorded: 'নথিভুক্ত করা হয়নি'
  },
  gu: {
    cardTitle: 'લાઇવ કૌશલ્ય કાર્ડ (Skill Card)',
    name: 'નામ',
    location: 'સ્થળ',
    education: 'શિક્ષણ',
    familyOccupation: 'કૌટુંબિક વ્યવસાય',
    skills: 'કૌશલ્ય / રસ',
    experience: 'અનુભવ',
    preference: 'પસંદગી',
    wage: 'નોકરી (પગારદાર)',
    self: 'સ્વરોજગાર (ધંધો)',
    years: 'વર્ષ',
    notRecorded: 'નોંધાયેલ નથી'
  },
  kn: {
    cardTitle: 'ಲೈವ್ ಕೌಶಲ್ಯ ಕಾರ್ಡ್ (Skill Card)',
    name: 'ಹೆಸರು',
    location: 'ಸ್ಥಳ',
    education: 'ಶಿಕ್ಷಣ',
    familyOccupation: 'ಕುಟುಂಬದ ವೃತ್ತಿ',
    skills: 'ಕೌಶಲ್ಯಗಳು / ಆಸಕ್ತಿ',
    experience: 'ಅನುಭವ',
    preference: 'ಆದ್ಯತೆ',
    wage: 'ಉದ್ಯೋಗ (ವೇತನ)',
    self: 'ಸ್ವಯಂ ಉದ್ಯೋಗ',
    years: 'ವರ್ಷಗಳು',
    notRecorded: 'ದಾಖಲಾಗಿಲ್ಲ'
  },
  ml: {
    cardTitle: 'ലൈവ് സ്കിൽ കാർഡ് (Skill Card)',
    name: 'പേര്',
    location: 'സ്ഥലം',
    education: 'വിദ്യാഭ്യാസം',
    familyOccupation: 'കുടുംബ തൊഴിൽ',
    skills: 'നൈപുണ്യങ്ങൾ / താല്പര്യം',
    experience: 'പരിചയം',
    preference: 'മുൻഗണന',
    wage: 'ശമ്പള ജോലി (Wage Job)',
    self: 'സ്വയം തൊഴിൽ (Self Employed)',
    years: 'വർഷങ്ങൾ',
    notRecorded: 'രേഖപ്പെടുത്തിയിട്ടില്ല'
  },
  od: {
    cardTitle: 'ଲାଇଭ୍ ଦକ୍ଷତା କାର୍ଡ (Skill Card)',
    name: 'ନାମ',
    location: 'ସ୍ଥାନ',
    education: 'ଶିକ୍ଷା',
    familyOccupation: 'ପାରିବାରିକ ବୃତ୍ତି',
    skills: 'ଦକ୍ଷତା / ରୁଚି',
    experience: 'ଅଭିଜ୍ଞତା',
    preference: 'ପସନ୍ଦ',
    wage: 'ଚାକିରି (ଦରମା)',
    self: 'ସ୍ୱରୋଜଗାର (ବ୍ୟବସାୟ)',
    years: 'ବର୍ଷ',
    notRecorded: 'ରେକର୍ଡ ହୋଇନାହିଁ'
  },
  pa: {
    cardTitle: 'ਲਾਈਵ ਹੁਨਰ ਕਾਰਡ (Skill Card)',
    name: 'ਨਾਮ',
    location: 'ਸਥਾਨ',
    education: 'ਸਿੱਖਿਆ',
    familyOccupation: 'ਪਰਿਵਾਰਕ ਕੰਮ',
    skills: 'ਹੁਨਰ / ਰੁਚੀ',
    experience: 'ਤਜ਼ਰਬਾ',
    preference: 'ਪਸੰਦ',
    wage: 'ਨੌਕਰੀ (ਤਨਖਾਹ)',
    self: 'ਸਵੈ-ਰੋਜ਼ਗਾਰ (ਆਪਣਾ ਕੰਮ)',
    years: 'ਸਾਲ',
    notRecorded: 'ਦਰਜ ਨਹੀਂ ਕੀਤਾ'
  },
  ta: {
    cardTitle: 'நேரலை திறன் அட்டை (Skill Card)',
    name: 'பெயர்',
    location: 'இடம்',
    education: 'கல்வி',
    familyOccupation: 'குடும்பத் தொழில்',
    skills: 'திறன்கள் / ஆர்வம்',
    experience: 'அனுபவம்',
    preference: 'முன்னுரிமை',
    wage: 'ஊதிய வேலை (Wage Job)',
    self: 'சுயதொழில் (Self Employment)',
    years: 'ஆண்டுகள்',
    notRecorded: 'பதிவு செய்யப்படவில்லை'
  },
  te: {
    cardTitle: 'లైవ్ స్కిల్ కార్డ్ (Skill Card)',
    name: 'పేరు',
    location: 'ప్రాంతం',
    education: 'విద్య',
    familyOccupation: 'కుటుంబ వృత్తి',
    skills: 'నైపుణ్యాలు / ఆసక్తి',
    experience: 'అనుభవం',
    preference: 'ప్రాధాన్యత',
    wage: 'ఉద్యోగం (వేతనం)',
    self: 'స్వయం ఉపాధి (వ్యాపారం)',
    years: 'సంవత్సరాలు',
    notRecorded: 'నమోదు కాలేదు'
  },
  as: {
    cardTitle: 'লাইভ স্কিল কাৰ্ড (Skill Card)',
    name: 'নাম',
    location: 'স্থান',
    education: 'শিক্ষা',
    familyOccupation: 'পৰিয়ালৰ বৃত্তি',
    skills: 'দক্ষতা / ৰুচি',
    experience: 'অভিজ্ঞতা',
    preference: 'পছন্দ',
    wage: 'চাকৰি (মজুৰি)',
    self: 'স্ব-নিয়োজন (ব্যৱসায়)',
    years: 'বছৰ',
    notRecorded: 'নথিভুক্ত হোৱা নাই'
  }
};

export const SkillCard: React.FC<SkillCardProps> = ({
  profile,
  lang = 'mr',
  title,
  isCompact = false
}) => {
  const l = LABELS[lang] || LABELS.en || LABELS.hi;

  const nameVal = profile.name || profile.first_name;
  const locVal = profile.district ? `${profile.district}${profile.state ? ', ' + profile.state : ''}` : null;
  const eduVal = profile.education_level;
  const famVal = profile.family_occupation || profile.current_livelihood;
  const skillsVal = profile.skills_interests && profile.skills_interests.length > 0 ? profile.skills_interests.join(', ') : null;
  const expVal = profile.experience_years !== undefined && profile.experience_years !== null
    ? `${profile.experience_years} ${l.years}`
    : null;
  const prefVal = profile.employment_preference === 'wage_employment'
    ? l.wage
    : profile.employment_preference === 'self_employment'
    ? l.self
    : profile.employment_preference || null;

  return (
    <div
      className="skill-card-container"
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        padding: isCompact ? '14px' : '18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🪪</span>
          <span>{title || l.cardTitle}</span>
        </h4>
        {nameVal && (
          <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
            {nameVal}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.name}</span>
          <strong style={{ color: nameVal ? '#0F172A' : '#94A3B8' }}>{nameVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.location}</span>
          <strong style={{ color: locVal ? '#0F172A' : '#94A3B8' }}>{locVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.education}</span>
          <strong style={{ color: eduVal ? '#0F172A' : '#94A3B8' }}>{eduVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.familyOccupation}</span>
          <strong style={{ color: famVal ? '#0F172A' : '#94A3B8' }}>{famVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.skills}</span>
          <strong style={{ color: skillsVal ? '#0F172A' : '#94A3B8' }}>{skillsVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.experience}</span>
          <strong style={{ color: expVal ? '#0F172A' : '#94A3B8' }}>{expVal || '—'}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
          <span style={{ color: '#64748B' }}>{l.preference}</span>
          <strong style={{ color: prefVal ? '#0F172A' : '#94A3B8' }}>{prefVal || '—'}</strong>
        </div>
      </div>
    </div>
  );
};
