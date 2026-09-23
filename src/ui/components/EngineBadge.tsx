import React from 'react';
import { SpeechEngineType } from '../../engines/speech/SpeechRouter';

interface EngineBadgeProps {
  speechEngine: SpeechEngineType;
  isOffline?: boolean;
  isDemoData?: boolean;
}

export const EngineBadge: React.FC<EngineBadgeProps> = ({
  speechEngine,
  isOffline,
  isDemoData = true
}) => {
  const isLocal = speechEngine === 'WebSpeech' || speechEngine === 'SilentEngine';
  const label = speechEngine === 'WebSpeech' ? 'On-Device Speech'
    : speechEngine === 'SilentEngine' ? 'Tap & Text Mode'
    : speechEngine === 'SarvamSTT' ? 'Sarvam Indic STT'
    : speechEngine;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className={`engine-badge ${isLocal ? 'local' : 'cloud'}`} title="Active Speech Engine">
        <span className="badge-dot" />
        <span>{label}</span>
      </div>

      {isOffline && (
        <div className="engine-badge" style={{ background: '#F7E9E8', color: '#A8322D', borderColor: '#A8322D' }}>
          <span className="badge-dot" />
          <span>Working Offline</span>
        </div>
      )}

      {isDemoData && (
        <div className="demo-pill" title="Synthetic pilot dataset for evaluation">
          Demo data
        </div>
      )}
    </div>
  );
};
