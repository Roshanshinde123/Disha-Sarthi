// Disha Sarathi - Verified Aspiration Card & Real QR Generator (PS 26097)
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ConversationEvent, Session } from '../../core/types';
import { getPlacementStatusLabel } from '../../core/placement';
import { t } from '../../core/i18n';
import nsqfTradesData from '../../data/nsqf_trades.json';

interface AspirationCardViewProps {
  session: Session;
  onEvent?: (event: ConversationEvent) => void;
  onNavigate?: (path: string) => void;
}

export const AspirationCardView: React.FC<AspirationCardViewProps> = ({ session, onNavigate }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const lang = session.lang || 'mr';

  const selectedTradeId =
    session.profile.selected_trade_id || session.recommendations?.[0]?.trade.id;
  const trade =
    (nsqfTradesData as any[]).find((tr) => tr.id === selectedTradeId) ||
    session.recommendations?.[0]?.trade;

  const recResult = session.recommendations?.find((r) => r.trade.id === selectedTradeId) || session.recommendations?.[0];
  const nearestCenter = recResult?.nearest_center?.center;
  const skillGaps = recResult?.skill_gap?.training_required_skills || ['NSQF Practical Certification', 'Workplace Safety Compliance'];
  const placementStatus = session.profile.placement_status || 'NOT_STARTED';

  const resumeToken = session.ref_code || session.id;
  const resumeUrl = `${window.location.origin}/resume/${resumeToken}`;

  // Trade name: prefer language-local name, then English
  const tradeName = trade
    ? (lang === 'en' ? trade.name_en : (trade.name_local?.[lang] || trade.name_local?.mr || trade.name_en))
    : null;

  // Generate client-side QR Code encoding real, privacy-safe resume URL
  useEffect(() => {
    QRCode.toDataURL(resumeUrl, { width: 160, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [resumeUrl]);

  // Real Canvas-based PNG download
  const handleDownloadCardPng = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 840;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 640, 840);

      // Header Banner
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, 640, 110);

      // Header Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('PM-AJAY ASPIRATION & LIVELIHOOD CARD', 30, 48);
      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(t('aspirationCardTitle', lang), 30, 80);

      // Card Details
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${t('candidateRefId', lang)} DS-${session.id.slice(-6).toUpperCase()}`, 30, 145);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`${new Date().toLocaleDateString('en-IN')}`, 30, 172);
      ctx.fillText(`${t('districtAndState', lang)} ${session.profile.district || 'Pune'}, ${session.profile.state || 'Maharashtra'}`, 30, 195);
      ctx.fillText(`${t('employmentPreference', lang)} ${session.profile.employment_preference === 'self_employment' ? t('selfEmployment', lang) : t('wageEmployment', lang)}`, 30, 218);

      // Divider
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 235);
      ctx.lineTo(610, 235);
      ctx.stroke();

      // Selected Course Box
      ctx.fillStyle = '#EFF6FF';
      ctx.fillRect(30, 250, 580, 140);
      ctx.fillStyle = '#1E40AF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${t('recommendedNsqfPathway', lang)}:`, 50, 282);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText(tradeName || 'Solar Panel Installation Technician', 50, 315);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`QP Code: ${trade?.qp_code || 'SGJ/Q0101'} • ${t('aspirationCardDuration', lang)} ${trade?.duration_hours || 300} ${t('aspirationCardHours', lang)}`, 50, 345);
      ctx.fillText(`${t('aspirationCardWage', lang)} ${trade?.typical_wage_band_inr || '₹15,000 - ₹22,000'}${t('aspirationCardMonth', lang)} (Indicative demo data)`, 50, 370);

      // Skill Gaps Box
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(30, 405, 580, 85);
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${t('skillGapsIdentified', lang)}`, 50, 430);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(skillGaps.join(', '), 50, 460);

      // Training Center Box
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(30, 505, 580, 85);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${t('nearestSkillCenter', lang)}`, 50, 530);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`${nearestCenter?.name || 'District Skill Training Center'} (${recResult?.nearest_center?.distance_km || 10} km)`, 50, 555);

      // Footer QR note
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${t('scanToVerify', lang)}: ${resumeUrl}`, 30, 620);

      // Draw QR image onto canvas if available
      if (qrDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 450, 640, 160, 160);
          finishDownload(canvas);
        };
        img.src = qrDataUrl;
      } else {
        finishDownload(canvas);
      }
    } catch (err) {
      console.error('PNG generation error:', err);
      setShareMsg(t('aspirationCardSaveError', lang));
    }
  };

  const finishDownload = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `disha_aspiration_card_${session.ref_code || session.id.slice(-6)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setShareMsg(t('aspirationCardSaveSuccess', lang));
    setTimeout(() => setShareMsg(null), 3000);
  };

  const handleShareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('appTitle', lang)} - ${t('aspirationCardTitle', lang)}`,
          text: `${trade?.name_en || 'Skilling Pathway'}`,
          url: resumeUrl
        });
        setShareMsg(t('aspirationCardShareSuccess', lang));
      } catch (e) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(resumeUrl);
      setShareMsg(t('aspirationCardCopySuccess', lang));
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  return (
    <div className="aspiration-card-wrapper" style={{ maxWidth: '720px', margin: '0 auto', padding: '16px' }}>
      {/* Physical Card Container */}
      <div
        ref={cardRef}
        className="physical-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #2563EB',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}
      >
        {/* Top Government / PM-AJAY Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '2px' }}>
                {t('appTitle', lang)} • PM-AJAY GIA
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800 }}>
                {t('aspirationCardTitle', lang)}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{t('candidateRefId', lang)}</span>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#38BDF8', fontSize: '1rem' }}>
                DS-{session.id.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Candidate Bio Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '10px' }}>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block' }}>{t('candidateName', lang)}</span>
              <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>
                {session.profile.name || session.profile.first_name || t('aspirationCardCandidateLabel', lang)}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block' }}>{t('districtAndState', lang)}</span>
              <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>
                📍 {session.profile.district || 'Pune'}, {session.profile.state || 'Maharashtra'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block' }}>{t('employmentPreference', lang)}</span>
              <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>
                {session.profile.employment_preference === 'self_employment' ? t('selfEmployment', lang) : t('wageEmployment', lang)}
              </strong>
            </div>
          </div>

          {/* Selected NSQF Pathway Box */}
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                {t('recommendedNsqfPathway', lang)}
              </span>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                NSQF Level {trade?.nsqf_level || 4}
              </span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#1E3A8A', fontWeight: 800 }}>
              {tradeName || 'Solar Panel Installation Technician'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#3B82F6' }}>
              QP Code: <strong>{trade?.qp_code || 'SGJ/Q0101'}</strong>{' '}
              • {t('aspirationCardDuration', lang)} <strong>{trade?.duration_hours || 300} {t('aspirationCardHours', lang)}</strong>{' '}
              • {t('aspirationCardWage', lang)} <strong>{trade?.typical_wage_band_inr || '₹15,000 - ₹22,000'}{t('aspirationCardMonth', lang)}</strong>
            </p>
          </div>

          {/* Skill Gaps Box */}
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '4px' }}>
              {t('skillGapsIdentified', lang)}
            </span>
            <div style={{ color: '#78350F', fontSize: '0.85rem' }}>
              {skillGaps.join(' • ')}
            </div>
          </div>

          {/* Center & QR Code Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                {t('nearestSkillCenter', lang)}
              </span>
              <strong style={{ color: '#0F172A', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                {nearestCenter?.name || 'District Skill Training Center'}
              </strong>
              <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {t('aspirationCardStatus', lang)} {getPlacementStatusLabel(placementStatus, lang)}
              </span>
            </div>

            {/* Real QR Code */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              {qrDataUrl ? (
                <div>
                  <img src={qrDataUrl} alt="Candidate Verification QR" style={{ width: '110px', height: '110px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                  <small style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', marginTop: '2px' }}>
                    {t('scanToVerify', lang)}
                  </small>
                </div>
              ) : (
                <div style={{ width: '110px', height: '110px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  QR Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ background: '#F1F5F9', padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownloadCardPng}
              style={{ fontSize: '0.88rem', padding: '8px 16px', fontWeight: 700 }}
            >
              {t('savePng', lang)}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleShareCard}
              style={{ fontSize: '0.88rem', padding: '8px 14px' }}
            >
              {t('shareCard', lang)}
            </button>
          </div>

          <button
            type="button"
            className="btn-ctrl"
            onClick={() => {
              if (onNavigate) {
                onNavigate(`/resume/${resumeToken}`);
              } else {
                window.open(resumeUrl, '_blank');
              }
            }}
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
          >
            {t('testScannedView', lang)}
          </button>
        </div>

        {shareMsg && (
          <div style={{ padding: '8px 16px', background: '#DCFCE7', color: '#166534', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
            {shareMsg}
          </div>
        )}
      </div>
    </div>
  );
};
