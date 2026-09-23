// Disha Sarathi - Beneficiary Profile View & Editor (PS 26097)
import React, { useState } from 'react';
import { BeneficiaryProfile, EducationLevel, EmploymentPreference, Session, TravelRadiusKm } from '../../core/types';
import { extractAllProfileSlots } from '../../core/nlu';
import { t } from '../../core/i18n';

interface BeneficiaryProfileViewProps {
  session: Session;
  onSaveProfile: (updatedProfile: BeneficiaryProfile) => void;
  onStartVoice: () => void;
}

export const BeneficiaryProfileView: React.FC<BeneficiaryProfileViewProps> = ({
  session,
  onSaveProfile,
  onStartVoice
}) => {
  const lang = session.lang;
  const [profile, setProfile] = useState<BeneficiaryProfile>({ ...session.profile });
  const [voiceUtterance, setVoiceUtterance] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof BeneficiaryProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSlotVoiceParse = () => {
    if (!voiceUtterance.trim()) return;
    const multi = extractAllProfileSlots(voiceUtterance, session.lang);
    if (multi.slotsCount > 0) {
      const updated: BeneficiaryProfile = { ...profile };
      if (multi.slotsFound.district) updated.district = multi.slotsFound.district;
      if (multi.slotsFound.education_level) updated.education_level = multi.slotsFound.education_level;
      if (multi.slotsFound.family_occupation) updated.family_occupation = multi.slotsFound.family_occupation;
      if (multi.slotsFound.current_livelihood) updated.current_livelihood = multi.slotsFound.current_livelihood;
      if (multi.slotsFound.skills_interests && multi.slotsFound.skills_interests.length > 0) {
        updated.skills_interests = Array.from(new Set([...updated.skills_interests, ...multi.slotsFound.skills_interests]));
      }
      if (multi.slotsFound.travel_radius_km) updated.travel_radius_km = multi.slotsFound.travel_radius_km;
      if (multi.slotsFound.employment_preference) updated.employment_preference = multi.slotsFound.employment_preference;

      setProfile(updated);
      setSaveMessage(`✅ ${multi.slotsCount} ${t('liveExtractedTitle', lang)}`);
    } else {
      setSaveMessage('⚠️ ' + t('voiceMicErrorNoSpeech', lang));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSaveMessage('✅ ' + t('dashboardGreetingHello', lang) + ' ' + (profile.name || profile.first_name || '') + ' - Profile Saved!');
  };

  return (
    <div className="beneficiary-profile-page" style={{ paddingBottom: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span className="demo-pill" style={{ marginBottom: '8px' }}>
          PM-AJAY GIA • Multi-Slot Conversational Profile
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
          👤 {t('profileTitle', lang)}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          {t('profileSub', lang)}
        </p>
      </div>

      {saveMessage && (
        <div style={{ padding: '12px 16px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700, marginBottom: '16px' }}>
          {saveMessage}
        </div>
      )}

      {/* Voice Multi-Slot Quick Update Box */}
      <div className="dash-card" style={{ background: '#F2F8F4', border: '1px solid var(--field)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--field-deep)', marginBottom: '8px' }}>
          {t('naturalVoiceProfileTitle', lang)}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
          {t('naturalVoiceProfileSub', lang)}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="app-input"
            style={{ flex: 1, minWidth: '240px' }}
            placeholder={t('voiceTypeFallbackPlaceholder', lang)}
            value={voiceUtterance}
            onChange={(e) => setVoiceUtterance(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={handleMultiSlotVoiceParse}
          >
            ⚡ {t('btnSubmitText', lang)}
          </button>
          <button
            type="button"
            className="btn-ctrl"
            style={{ width: 'auto' }}
            onClick={onStartVoice}
          >
            🎙️ {t('btnTalkToDisha', lang)}
          </button>
        </div>
      </div>

      {/* Standard Profile Form */}
      <form onSubmit={handleSubmit} className="dash-card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">{t('labelFullName', lang)}:</label>
            <input
              type="text"
              className="app-input"
              value={profile.name || profile.first_name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Ramesh Sonawane"
            />
          </div>

          {/* District & State */}
          <div className="form-group">
            <label className="form-label">{t('labelDistrict', lang)}:</label>
            <input
              type="text"
              className="app-input"
              value={profile.district || 'Pune'}
              onChange={(e) => handleInputChange('district', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">{t('labelPhone', lang)}:</label>
            <input
              type="text"
              className="app-input"
              value={profile.phone_number || '+91 98765 43210'}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
            />
          </div>

          {/* Education Level */}
          <div className="form-group">
            <label className="form-label">{t('labelEducation', lang)}:</label>
            <select
              className="app-input"
              value={profile.education_level || 'secondary'}
              onChange={(e) => handleInputChange('education_level', e.target.value as EducationLevel)}
            >
              <option value="none">{lang === 'en' ? 'None / Non-Formal' : lang === 'hi' ? 'निरक्षर / अनौपचारिक' : 'साक्षर / अनौपचारिक'}</option>
              <option value="primary">{lang === 'en' ? 'Class 5 Primary' : lang === 'hi' ? '5वीं प्राथमिक' : '५ वी प्राथमिक'}</option>
              <option value="middle">{lang === 'en' ? 'Class 8 Middle' : lang === 'hi' ? '8वीं मध्य' : '८ वी पूर्व माध्यमिक'}</option>
              <option value="secondary">{lang === 'en' ? 'Class 10 Secondary' : lang === 'hi' ? '10वीं माध्यमिक' : '१० वी माध्यमिक'}</option>
              <option value="higher_secondary">{lang === 'en' ? 'Class 12 Higher Secondary' : lang === 'hi' ? '12वीं उच्च माध्यमिक' : '१२ वी उच्च माध्यमिक'}</option>
              <option value="iti_diploma">{lang === 'en' ? 'ITI / Diploma' : lang === 'hi' ? 'आईटीआई / डिप्लोमा' : 'आयटीआय / डिप्लोमा'}</option>
              <option value="graduate">{lang === 'en' ? 'Graduate or Above' : lang === 'hi' ? 'स्नातक या अधिक' : 'पदवीधर'}</option>
            </select>
          </div>

          {/* Family / Traditional Occupation */}
          <div className="form-group">
            <label className="form-label">{t('labelFamilyOcc', lang)}:</label>
            <input
              type="text"
              className="app-input"
              value={profile.family_occupation || ''}
              onChange={(e) => handleInputChange('family_occupation', e.target.value)}
              placeholder="e.g. Handloom weaving, pottery, tailoring"
            />
          </div>

          {/* Current Livelihood */}
          <div className="form-group">
            <label className="form-label">{t('labelCurrentWork', lang)}:</label>
            <input
              type="text"
              className="app-input"
              value={profile.current_livelihood || ''}
              onChange={(e) => handleInputChange('current_livelihood', e.target.value)}
              placeholder="e.g. Daily agricultural wage, local workshop"
            />
          </div>

          {/* Travel Radius */}
          <div className="form-group">
            <label className="form-label">{t('labelTravelRadius', lang)}:</label>
            <select
              className="app-input"
              value={profile.travel_radius_km || 10}
              onChange={(e) => handleInputChange('travel_radius_km', parseInt(e.target.value, 10) as TravelRadiusKm)}
            >
              <option value={2}>2 {t('kmLabel', lang)}</option>
              <option value={5}>5 {t('kmLabel', lang)}</option>
              <option value={10}>10 {t('kmLabel', lang)}</option>
              <option value={25}>25 {t('kmLabel', lang)}</option>
              <option value={50}>50 {t('kmLabel', lang)}</option>
            </select>
          </div>

          {/* Employment Preference */}
          <div className="form-group">
            <label className="form-label">{t('labelEmployPref', lang)}:</label>
            <select
              className="app-input"
              value={profile.employment_preference || 'either'}
              onChange={(e) => handleInputChange('employment_preference', e.target.value as EmploymentPreference)}
            >
              <option value="wage_employment">{t('wageEmployment', lang)}</option>
              <option value="self_employment">{t('selfEmployment', lang)}</option>
              <option value="either">{lang === 'en' ? 'Open to Both' : lang === 'hi' ? 'दोनों के लिए खुला' : 'कोणताही योग्य मार्ग'}</option>
            </select>
          </div>
        </div>

        {/* Existing Skills Chips */}
        <div style={{ marginTop: '16px' }}>
          <label className="form-label">{t('labelSkillsInterests', lang)}:</label>
          <input
            type="text"
            className="app-input"
            value={profile.skills_interests.join(', ')}
            onChange={(e) =>
              handleInputChange(
                'skills_interests',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="e.g. electrical, stitching, motor repair, solar"
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '20px', width: '100%' }}
        >
          {t('btnSaveProfile', lang)}
        </button>
      </form>
    </div>
  );
};

