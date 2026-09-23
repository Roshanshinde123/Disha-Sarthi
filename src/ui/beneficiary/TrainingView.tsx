// Disha Sarathi - Beneficiary Training Module (PS 26097)
import React, { useState } from 'react';
import { Session, NSQFTrade, TrainingCenter } from '../../core/types';
import nsqfTradesData from '../../data/nsqf_trades.json';
import trainingCentersData from '../../data/training_centers.json';
import { t } from '../../core/i18n';

interface TrainingViewProps {
  session: Session;
  onUpdateStatus: (newStatus: 'RECOMMENDED' | 'INTERESTED' | 'APPLIED' | 'ENROLLED' | 'IN_TRAINING' | 'COMPLETED') => void;
  onNavigateToPlacement?: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  session,
  onUpdateStatus,
  onNavigateToPlacement
}) => {
  const lang = session.lang;
  const profile = session.profile;
  const selectedTradeId = profile.selected_trade_id || session.recommendations?.[0]?.trade.id || 'app_sewing_machine_op';

  const trade: NSQFTrade | undefined =
    session.recommendations?.find((r) => r.trade.id === selectedTradeId)?.trade ||
    (nsqfTradesData as NSQFTrade[]).find((t) => t.id === selectedTradeId) ||
    session.recommendations?.[0]?.trade;

  const centerInfo = session.recommendations?.find((r) => r.trade.id === selectedTradeId)?.nearest_center;
  const defaultCenter: TrainingCenter =
    centerInfo?.center || (trainingCentersData as TrainingCenter[])[0];

  const [currentStatus, setCurrentStatus] = useState<string>(
    profile.training_status || (profile.placement_status === 'COMPLETED' || profile.placement_status === 'PLACED' ? 'COMPLETED' : 'ENROLLED')
  );

  const handleAdvanceStatus = (status: 'RECOMMENDED' | 'INTERESTED' | 'APPLIED' | 'ENROLLED' | 'IN_TRAINING' | 'COMPLETED') => {
    setCurrentStatus(status);
    onUpdateStatus(status);
  };

  const tradeName = (lang === 'en' ? trade?.name_en : trade?.name_local?.[lang as 'mr' | 'hi']) || trade?.name_en || '';

  return (
    <div className="training-page" style={{ paddingBottom: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
          {t('trainingHeader', lang)}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          {t('trainingSub', lang)}
        </p>
      </div>

      {/* Training Status Tracker */}
      <div className="dash-card" style={{ background: '#FFFFFF', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--field-deep)', marginBottom: '12px' }}>
          {t('trainingProgressTitle', lang)}
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {['RECOMMENDED', 'APPLIED', 'ENROLLED', 'IN_TRAINING', 'COMPLETED'].map((st, idx) => {
            const isPassed =
              ['RECOMMENDED', 'APPLIED', 'ENROLLED', 'IN_TRAINING', 'COMPLETED'].indexOf(currentStatus) >= idx;
            const isCurrent = currentStatus === st;
            return (
              <div
                key={st}
                style={{
                  flex: 1,
                  minWidth: '110px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: isCurrent ? 'var(--field)' : isPassed ? '#E8F3ED' : '#F8F9FA',
                  color: isCurrent ? '#FFFFFF' : isPassed ? '#1F6F4A' : 'var(--muted)',
                  border: isCurrent ? '2px solid var(--field-deep)' : '1px solid var(--stone-light)',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {idx + 1}. {st.replace('_', ' ')}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {currentStatus !== 'COMPLETED' ? (
            <>
              {currentStatus !== 'IN_TRAINING' && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: 'auto' }}
                  onClick={() => handleAdvanceStatus('IN_TRAINING')}
                >
                  {t('btnStartTraining', lang)}
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto' }}
                onClick={() => handleAdvanceStatus('COMPLETED')}
              >
                {t('btnCompleteTraining', lang)}
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--field-deep)', fontWeight: 700, fontSize: '0.9rem' }}>
              {t('trainingCompletedSuccess', lang)}
            </div>
          )}
        </div>
      </div>

      {/* Center & Trade Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Trade Summary */}
        <div className="dash-card" style={{ background: '#F8FBF9' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
            {t('selectedTradeTitle', lang)}
          </h3>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--field-deep)' }}>
            {tradeName}
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            QP Code: <strong>{trade?.qp_code}</strong> • NSQF Level: <strong>{trade?.nsqf_level}</strong>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>⏱️ <strong>{t('durationHoursLabel', lang)}</strong> {trade?.duration_hours} {t('aspirationCardHours', lang)}</div>
            <div>💰 <strong>{t('expectedWageBandLabel', lang)}</strong> {trade?.typical_wage_band_inr}</div>
            <div>📜 <strong>{t('minEducationLabel', lang)}</strong> {trade?.min_education}</div>
          </div>
        </div>

        {/* Center Details */}
        <div className="dash-card" style={{ background: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
            {t('centerInfoTitle', lang)}
          </h3>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>
            {defaultCenter.name}
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            📍 {defaultCenter.address}, {defaultCenter.district}
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>📞 <strong>{t('nodalContactLabel', lang)}</strong> {defaultCenter.contact_phone}</div>
            <div>🚗 <strong>{t('distanceLabel', lang)}</strong> ~{centerInfo?.distance_km || 12} {t('kmLabel', lang)}</div>
            <div>🗓️ <strong>{t('nextBatchLabel', lang)}</strong> {t('nextBatchValue', lang)}</div>
          </div>
        </div>
      </div>

      {/* PM-AJAY GIA Financial & Toolkit Support */}
      <div className="dash-card" style={{ background: '#FFFDF9', border: '1px solid #E0A32E', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#8A5B00', marginBottom: '10px' }}>
          {t('giaBenefitsTitle', lang)}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
          <div>
            <strong>{t('giaBenefit1Title', lang)}</strong>
            <div style={{ color: 'var(--muted)' }}>{t('giaBenefit1Desc', lang)}</div>
          </div>
          <div>
            <strong>{t('giaBenefit2Title', lang)}</strong>
            <div style={{ color: 'var(--muted)' }}>{t('giaBenefit2Desc', lang)}</div>
          </div>
          <div>
            <strong>{t('giaBenefit3Title', lang)}</strong>
            <div style={{ color: 'var(--muted)' }}>{t('giaBenefit3Desc', lang)}</div>
          </div>
        </div>
      </div>

      {/* Navigate to Placement Button */}
      {onNavigateToPlacement && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={onNavigateToPlacement}
        >
          {t('btnGoToPlacement', lang)}
        </button>
      )}
    </div>
  );
};

