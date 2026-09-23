// Disha Sarathi - Privacy-Safe Resume & QR Scanned Aspiration Card View (PS 26097)
import React, { useState, useEffect } from 'react';
import { Session } from '../../core/types';
import { getAllSessions, getSessionById } from '../../core/store';
import { getPlacementStatusLabel } from '../../core/placement';
import { t } from '../../core/i18n';

interface ResumeCardViewProps {
  token?: string;
  onNavigateHome: () => void;
  onStartVoice: () => void;
}

export const ResumeCardView: React.FC<ResumeCardViewProps> = ({
  token,
  onNavigateHome,
  onStartVoice
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from prop or URL pathname
    const activeToken = token || window.location.pathname.split('/').pop() || '';
    if (!activeToken || activeToken === 'resume') {
      setError(t('qrInvalidToken', 'mr'));
      setLoading(false);
      return;
    }

    // Lookup session by ID or matching token
    const fetchSession = async () => {
      try {
        // Direct ID lookup
        let found = await getSessionById(activeToken);
        if (!found) {
          // Check all sessions for matching ID prefix or ref code
          const all = await getAllSessions();
          found = all.find((s) => s.id === activeToken || s.ref_code === activeToken || s.id.includes(activeToken)) || null;
        }

        if (found) {
          setSession(found);
        } else {
          setError(t('qrInvalidToken', 'mr'));
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  const lang = session?.lang || 'mr';

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '32px' }}>
        <div className="spinner" style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <h3>{t('loadingCard', 'mr')}</h3>
        <p style={{ color: '#64748B' }}>{t('verifyingToken', 'mr')}</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ maxWidth: '520px', margin: '60px auto', background: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
        <h2 style={{ color: '#B91C1C', margin: '0 0 8px', fontSize: '1.3rem' }}>{t('qrValidationFailed', lang)}</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '24px' }}>
          {error || t('qrInvalidToken', lang)}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onNavigateHome}>
            🏠 {t('navHome', lang)}
          </button>
          <button type="button" className="btn-primary" onClick={onStartVoice}>
            {t('btnTalkToDisha', lang)}
          </button>
        </div>
      </div>
    );
  }

  const profile = session.profile;
  const activeRec = session.recommendations?.[0];
  const tradeName = activeRec?.trade
    ? (lang === 'en' ? activeRec.trade.name_en : (activeRec.trade.name_local?.[lang] || activeRec.trade.name_en))
    : null;

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px' }}>
      {/* Verified Aspiration Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '2px solid #2563EB', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌟</span>
            <span className="demo-pill" style={{ background: '#DCFCE7', color: '#166534' }}>
              {t('qrVerifiedCandidate', lang)}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 800 }}>
            {t('resumeCardHeading', lang)}
          </h2>
          <small style={{ color: '#94A3B8' }}>{t('resumeCardSub', lang)}</small>
        </div>

        {/* Body Details (Strict Privacy: No Aadhaar / Passwords / Private Numbers) */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('candidateRefId', lang)}</span>
            <strong style={{ fontFamily: 'monospace' }}>DS-{session.id.slice(-6).toUpperCase()}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('candidateName', lang)}</span>
            <strong>{profile.name || profile.first_name || t('aspirationCardCandidateLabel', lang)}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('districtAndState', lang)}</span>
            <strong>{profile.district || 'Pune'}, {profile.state || 'Maharashtra'}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('recommendedNsqfPathway', lang)}:</span>
            <strong style={{ color: '#2563EB' }}>{tradeName || 'Solar / Electrical Technician'}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('nearestSkillCenter', lang)}</span>
            <strong>{activeRec?.nearest_center?.center?.name || 'District Skill Training Center'}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('aspirationCardStatus', lang)}</span>
            <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
              {getPlacementStatusLabel(profile.placement_status || 'NOT_STARTED', lang)}
            </span>
          </div>

          <div style={{ marginTop: '8px', padding: '10px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
            {t('resumeCardNotice', lang)}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div style={{ background: '#F8FAFC', padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onNavigateHome} style={{ fontSize: '0.85rem' }}>
            🏠 {t('navHome', lang)}
          </button>
          <button type="button" className="btn-primary" onClick={onStartVoice} style={{ fontSize: '0.85rem' }}>
            {t('btnTalkToDisha', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
