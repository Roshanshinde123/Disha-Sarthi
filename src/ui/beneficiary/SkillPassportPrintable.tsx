// Disha Sarathi - Standalone Skill Passport Printable Document (PS 26097)
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Session, NSQFTrade } from '../../core/types';
import { t } from '../../core/i18n';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface SkillPassportPrintableProps {
  session: Session;
}

export const SkillPassportPrintable: React.FC<SkillPassportPrintableProps> = ({ session }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const profile = session.profile;
  const lang = session.lang || 'mr';

  const selectedTradeId = profile.selected_trade_id || session.recommendations?.[0]?.trade.id;
  const selectedTrade: NSQFTrade | undefined =
    session.recommendations?.find((r) => r.trade.id === selectedTradeId)?.trade ||
    (nsqfTradesData as NSQFTrade[]).find((t) => t.id === selectedTradeId) ||
    session.recommendations?.[0]?.trade;

  const recResult = session.recommendations?.find((r) => r.trade.id === selectedTradeId) || session.recommendations?.[0];
  const skillGap = recResult?.skill_gap;
  const notProvidedText = t('notProvided', lang);

  useEffect(() => {
    const resumeToken = session.ref_code || session.id;
    const passportUrl = `${window.location.origin}/resume/${resumeToken}`;
    QRCode.toDataURL(passportUrl, {
      width: 130,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Passport Print QR error:', err));
  }, [session.ref_code, session.id]);

  return (
    <div className="skill-passport-print-document" style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0F172A',
      background: '#FFFFFF',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px 28px',
      boxSizing: 'border-box'
    }}>
      {/* Official Header */}
      <div style={{
        borderBottom: '2px solid #0F172A',
        paddingBottom: '14px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#1F6F4A',
            color: '#FFF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            🌟
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('passportMinistryTag', lang)}
            </div>
            <h1 style={{ margin: '2px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {t('appTitle', lang)} • {t('passportHeading', lang)}
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              {t('passportSchemeTag', lang)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '160px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{t('passportRefLabel', lang)}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.05em' }}>
            {session.ref_code || session.id}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            {t('passportDateLabel', lang)} {new Date(session.created_at).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      {/* Official PM-AJAY GIA Sub-header Notice */}
      <div style={{
        background: '#F1F5F9',
        border: '1px solid #CBD5E1',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '0.75rem',
        color: '#475569',
        marginBottom: '16px'
      }}>
        ℹ️ <strong>{t('ppNoticeLabel', lang)}</strong> {t('passportNotice', lang)}
      </div>

      {/* Two Column Grid for Sections 1 to 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* 1. Personal Details */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
            {t('sectionPersonal', lang)}
          </h2>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0', width: '45%' }}>{t('ppLabelName', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.name || profile.first_name || t('dashboardCitizen', lang)}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelDistrict', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.district || notProvidedText}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelState', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.state || 'Maharashtra'}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelComponent', lang)}</td>
                <td style={{ fontWeight: 600 }}>PM-AJAY GIA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Education & Background */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
            {t('sectionEducation', lang)}
          </h2>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0', width: '45%' }}>{t('ppLabelEducation', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.education_level || notProvidedText}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelFamilyOcc', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.family_occupation || notProvidedText}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelCurrentWork', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.current_livelihood || notProvidedText}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelExperience', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.experience_years !== undefined ? `${profile.experience_years} ${t('yearsLabel', lang)}` : notProvidedText}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 & 4. Skills & Preferences */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* 3. Skills */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
            {t('sectionSkills', lang)}
          </h2>
          <div style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
            <strong>{t('ppLabelRecordedSkills', lang)}</strong>
            <div style={{ marginTop: '4px', color: '#334155' }}>
              {(profile.skills_interests && profile.skills_interests.length > 0)
                ? profile.skills_interests.join(', ')
                : notProvidedText}
            </div>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            <strong>{t('ppLabelTraditionalSkills', lang)}</strong>
            <div style={{ marginTop: '2px', color: '#334155' }}>
              {profile.family_occupation ? `${profile.family_occupation}` : notProvidedText}
            </div>
          </div>
        </div>

        {/* 4. Preferences */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
            {t('sectionPreferences', lang)}
          </h2>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0', width: '50%' }}>{t('ppLabelEmployPref', lang)}</td>
                <td style={{ fontWeight: 600 }}>
                  {profile.employment_preference === 'wage_employment' ? t('wageEmployment', lang) :
                   profile.employment_preference === 'self_employment' ? t('selfEmployment', lang) :
                   profile.employment_preference || notProvidedText}
                </td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelTravel', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.travel_radius_km ? `${profile.travel_radius_km} ${t('kmLabel', lang)}` : notProvidedText}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B', padding: '2px 0' }}>{t('ppLabelConstraints', lang)}</td>
                <td style={{ fontWeight: 600 }}>{(profile.constraints && profile.constraints.length > 0) ? profile.constraints.join(', ') : t('ppNoConstraints', lang)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Indicative NSQF Pathway */}
      <div style={{ border: '1.5px solid #1E40AF', borderRadius: '8px', padding: '12px', marginBottom: '14px', background: '#F8FAFC' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 800, color: '#1E40AF', borderBottom: '1px solid #CBD5E1', paddingBottom: '4px' }}>
          {t('sectionPathway', lang)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
          <div>
            <div style={{ color: '#64748B' }}>{t('ppLabelRecommendedTrade', lang)}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {selectedTrade ? (lang === 'en' ? selectedTrade.name_en : (selectedTrade.name_local?.[lang] || selectedTrade.name_local?.mr || selectedTrade.name_en)) : notProvidedText}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {t('ppLabelSector', lang)} {selectedTrade?.sector || 'General Skilling'}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B' }}>{t('ppLabelNsqfLevel', lang)}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
              NSQF Level {selectedTrade?.nsqf_level || 4}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {t('ppLabelDuration', lang)} {selectedTrade?.duration_hours ? `${selectedTrade.duration_hours} ${t('aspirationCardHours', lang)}` : '300 hrs'}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B' }}>{t('ppLabelWageBand', lang)}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
              {selectedTrade?.typical_wage_band_inr || '₹14,000 - ₹20,000'}
            </div>
          </div>
        </div>
      </div>

      {/* 6 & 7. Skill Gap & Verification with QR */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '14px', alignItems: 'center' }}>
        {/* Skill Gap & Status */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>
            {t('sectionSkillGap', lang)}
          </h2>
          <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '8px' }}>
            <strong>{t('ppLabelTrainingModules', lang)}</strong> {skillGap?.missing_skills?.join(', ') || t('ppDefaultTrainingModules', lang)}
          </div>

          <h2 style={{ margin: '8px 0 4px', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>
            {t('sectionPlacement', lang)}
          </h2>
          <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748B', width: '45%' }}>{t('ppLabelTrainingStatus', lang)}</td>
                <td style={{ fontWeight: 700, color: '#166534' }}>{profile.training_status || 'RECOMMENDED'}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B' }}>{t('ppLabelPlacementStatus', lang)}</td>
                <td style={{ fontWeight: 700, color: '#1E40AF' }}>{profile.placement_status || 'NOT_STARTED'}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748B' }}>{t('ppLabelVerification', lang)}</td>
                <td style={{ fontWeight: 600 }}>{profile.verification_level || 'SELF_REPORTED'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Official Verification QR Box */}
        <div style={{
          border: '1.5px dashed #0F172A',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          background: '#FAFAFA'
        }}>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Passport Verification QR"
              style={{ width: '105px', height: '105px', margin: '0 auto', display: 'block' }}
            />
          ) : (
            <div style={{ width: '105px', height: '105px', margin: '0 auto', background: '#E2E8F0' }} />
          )}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            {t('scanToVerify', lang)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
            Scan to Verify Credential
          </div>
        </div>
      </div>

      {/* Document Footer / Authority Signoff */}
      <div style={{
        marginTop: '16px',
        borderTop: '1px solid #E2E8F0',
        paddingTop: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.68rem',
        color: '#64748B'
      }}>
        <div>
          PM-AJAY GIA Component • Government of India Livelihood Initiative
        </div>
        <div>
          Auth Ref: DS-{session.ref_code || session.id.slice(0, 8).toUpperCase()}
        </div>
      </div>
    </div>
  );
};
