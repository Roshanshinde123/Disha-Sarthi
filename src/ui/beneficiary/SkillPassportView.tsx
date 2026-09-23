// Disha Sarathi - Beneficiary Skill Passport (PS 26097)
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Session, NSQFTrade } from '../../core/types';
import { getPlacementStatusLabel, getVerificationLevelLabel } from '../../core/placement';
import { t } from '../../core/i18n';
import nsqfTradesData from '../../data/nsqf_trades.json';
import { SkillPassportPrintable } from './SkillPassportPrintable';

interface SkillPassportViewProps {
  session: Session;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export const SkillPassportView: React.FC<SkillPassportViewProps> = ({ session, onBack, onNavigate }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const lang = session.lang || 'mr';
  const profile = session.profile;

  const selectedTradeId = profile.selected_trade_id || session.recommendations?.[0]?.trade.id;
  const selectedTrade: NSQFTrade | undefined =
    session.recommendations?.find((r) => r.trade.id === selectedTradeId)?.trade ||
    (nsqfTradesData as NSQFTrade[]).find((t) => t.id === selectedTradeId) ||
    session.recommendations?.[0]?.trade;

  const recResult = session.recommendations?.find((r) => r.trade.id === selectedTradeId) || session.recommendations?.[0];
  const skillGap = recResult?.skill_gap;
  const nearestCenter = recResult?.nearest_center?.center;
  const notProvided = t('notProvided', lang);

  useEffect(() => {
    const resumeToken = session.ref_code || session.id;
    const passportUrl = `${window.location.origin}/resume/${resumeToken}`;
    QRCode.toDataURL(passportUrl, { width: 130, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Passport QR error:', err));
  }, [session.ref_code, session.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* SCREEN VIEW (Hidden during print) */}
      <div className="skill-passport-page screen-only" style={{ paddingBottom: '32px', maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        {/* Top Header Bar */}
        <div className="passport-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            {onBack && (
              <button type="button" className="btn-ctrl" onClick={onBack} style={{ marginBottom: '6px' }}>
                ← {t('tabOverview', lang)}
              </button>
            )}
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
              🪪 {t('tabSkillPassport', lang)}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              {t('passportSchemeTag', lang)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={handlePrint} id="btn-print-passport">
              {t('passportPrintBtn', lang)}
            </button>
          </div>
        </div>

        {/* Official Disclaimer Alert */}
        <div className="passport-disclaimer-banner" style={{ background: '#FFFDF0', border: '1px solid #E0A32E', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#8A5B00', marginBottom: '18px' }}>
          ℹ️ <strong>{t('passportNotice', lang)}</strong>
        </div>

        {/* Main Passport Document Container */}
        <div className="passport-document-card dash-card" style={{ background: '#FFFFFF', border: '2px solid #2563EB', borderRadius: '16px', padding: '24px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {/* Document Crest */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: '#1F6F4A', borderRadius: '12px', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800 }}>
                🌟
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('passportMinistryTag', lang)}
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                  {t('appTitle', lang)} • {t('passportHeading', lang)}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {t('passportSchemeTag', lang)}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{t('passportRefLabel', lang)}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF' }}>{session.ref_code || session.id}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{t('passportDateLabel', lang)} {new Date(session.created_at).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* 1. PERSONAL CONTEXT */}
          <div className="passport-section" style={{ marginBottom: '20px' }}>
            <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '10px' }}>
              {t('sectionPersonal', lang)}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelName', lang)}</span>
                <strong>{profile.name || profile.first_name || 'Beneficiary'}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelDistrict', lang)}</span>
                <strong>{profile.district ? `${profile.district}, ${profile.state || 'Maharashtra'}` : notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('labelPhone', lang)}:</span>
                <strong>{profile.phone_number || notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelComponent', lang)}</span>
                <strong style={{ color: '#166534' }}>PM-AJAY GIA (SC Livelihood)</strong>
              </div>
            </div>
          </div>

          {/* 2. EDUCATION & VOCATIONAL BACKGROUND */}
          <div className="passport-section" style={{ marginBottom: '20px' }}>
            <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '10px' }}>
              {t('sectionEducation', lang)}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelEducation', lang)}</span>
                <strong>{profile.education_level || notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelFamilyOcc', lang)}</span>
                <strong>{profile.family_occupation || notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelCurrentWork', lang)}</span>
                <strong>{profile.current_livelihood || notProvided}</strong>
              </div>
            </div>
          </div>

          {/* 3. EXISTING & TRANSFERABLE SKILLS */}
          <div className="passport-section" style={{ marginBottom: '20px' }}>
            <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '10px' }}>
              {t('sectionSkills', lang)}
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {profile.skills_interests && profile.skills_interests.length > 0 ? (
                profile.skills_interests.map((skill, idx) => (
                  <span key={idx} className="meta-tag" style={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                    ⚡ {skill}
                  </span>
                ))
              ) : (
                <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{notProvided}</span>
              )}
            </div>
          </div>

          {/* 4. CONSTRAINTS & PREFERENCES */}
          <div className="passport-section" style={{ marginBottom: '20px' }}>
            <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '10px' }}>
              {t('sectionPreferences', lang)}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelExperience', lang)}</span>
                <strong>{profile.experience_years !== undefined ? `${profile.experience_years} ${t('yearsLabel', lang)}` : notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelTravel', lang)}</span>
                <strong>{profile.travel_radius_km ? `${profile.travel_radius_km} ${t('kmLabel', lang)}` : notProvided}</strong>
              </div>
              <div>
                <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelEmployPref', lang)}</span>
                <strong>
                  {profile.employment_preference === 'wage_employment'
                    ? t('wageEmployment', lang)
                    : profile.employment_preference === 'self_employment'
                    ? t('selfEmployment', lang)
                    : profile.employment_preference || notProvided}
                </strong>
              </div>
            </div>
          </div>

          {/* 5. IDENTIFIED SKILL GAPS */}
          {skillGap && (
            <div className="passport-section" style={{ marginBottom: '20px', background: '#FFFDF9', border: '1px solid #E0A32E', padding: '14px', borderRadius: '10px' }}>
              <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#8A5B00', marginBottom: '8px' }}>
                {t('sectionSkillGap', lang)}
              </h3>
              <div style={{ fontSize: '0.88rem' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>{t('ppLabelTrainingModules', lang)}</strong> {skillGap.training_required_skills.join(', ')}
                </div>
                <div style={{ color: '#64748B' }}>
                  <strong>{t('ppLabelComponent', lang)}</strong> {skillGap.recommended_intervention}
                </div>
              </div>
            </div>
          )}

          {/* 6. NSQF-ALIGNED PATHWAY */}
          {selectedTrade && (
            <div className="passport-section" style={{ marginBottom: '20px', background: '#F0FDF4', border: '1px solid #86EFAC', padding: '14px', borderRadius: '10px' }}>
              <h3 className="passport-section-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                {t('sectionPathway', lang)}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
                <div>
                  <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('ppLabelRecommendedTrade', lang)}</span>
                  <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>
                    {(lang === 'en' ? selectedTrade.name_en : selectedTrade.name_local?.[lang as 'mr' | 'hi']) || selectedTrade.name_en || ''}
                  </strong>
                </div>
                <div>
                  <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>QP Code & {t('ppLabelNsqfLevel', lang)}</span>
                  <strong>{selectedTrade.qp_code} (NSQF Level {selectedTrade.nsqf_level}) • {selectedTrade.duration_hours} {t('aspirationCardHours', lang)}</strong>
                </div>
                <div>
                  <span className="info-label" style={{ color: '#64748B', fontSize: '0.8rem', display: 'block' }}>{t('nearestSkillCenter', lang)}</span>
                  <strong>{nearestCenter?.name || `District PM-AJAY Kaushal Kendra, ${profile.district || 'Pune'}`}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 7. PLACEMENT & VERIFICATION STATUS */}
          <div className="passport-section" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  {t('sectionPlacement', lang)}
                </h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className="meta-tag" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, padding: '6px 12px', borderRadius: '6px' }}>
                    {t('ppLabelProgress', lang)} {getPlacementStatusLabel(profile.placement_status || 'ENROLLED', lang)}
                  </span>
                  <span className="meta-tag" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700, padding: '6px 12px', borderRadius: '6px' }}>
                    {t('ppLabelVerification', lang)} {getVerificationLevelLabel(profile.verification_level || 'SELF_REPORTED', lang)}
                  </span>
                </div>
              </div>

              {/* Offline Verifiable QR */}
              {qrDataUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img src={qrDataUrl} alt="Passport QR" style={{ width: '90px', height: '90px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px' }}>{t('scanToVerify', lang)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions to continue journey */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate ? onNavigate('/beneficiary/recommendations') : null}
            >
              🎯 {t('tabRecommendations', lang)} →
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate ? onNavigate('/beneficiary/journey') : null}
            >
              🗺️ {t('tabJourney', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY STANDALONE PASSPORT DOCUMENT */}
      <div className="print-document-container print-only">
        <SkillPassportPrintable session={session} />
      </div>
    </>
  );
};
