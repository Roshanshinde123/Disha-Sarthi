import React, { useState, useEffect } from 'react';
import {
  ChipOption,
  ConversationEvent,
  LanguageCode,
  Session
} from '../../core/types';
import { getProgressPercentage } from '../../core/states';
import { getPromptForState } from '../../core/orchestrator';
import { resolveNearestDistrict } from '../../core/geo';
import { speechRouter, SpeechEngineType } from '../../engines/speech/SpeechRouter';
import { Chip } from '../components/Chip';
import { MicButton } from '../components/MicButton';
import { EngineBadge } from '../components/EngineBadge';

interface ConversationViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
  onSwitchLang: (lang: LanguageCode) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  session,
  onEvent,
  onSwitchLang
}) => {
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechEngine, setActiveSpeechEngine] = useState<SpeechEngineType>('WebSpeech');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [freeTextInput, setFreeTextInput] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [gpsLoading, setGpsLoading] = useState(false);

  const promptEntry = getPromptForState(session.state, session.lang);
  const progressPercent = getProgressPercentage(session.state);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update speech engine state
  useEffect(() => {
    speechRouter.selectBestEngine().then((engine) => {
      setActiveSpeechEngine(engine);
    });
  }, []);

  // Speak prompt on state change
  useEffect(() => {
    speechRouter.speak(promptEntry.prompt, session.lang);
    setSelectedChips([]);
    setFreeTextInput('');
    return () => {
      speechRouter.stopSpeaking();
    };
  }, [session.state, session.lang]);

  // Handle GPS location detection
  const handleGPSDetect = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setGpsLoading(false);
      onEvent({ type: 'LOCATION_FAILED' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const res = resolveNearestDistrict(latitude, longitude);
        onEvent({
          type: 'LOCATION_RESOLVED',
          payload: {
            district: res.district.name,
            state: res.district.state,
            lat: res.roundedLat,
            lng: res.roundedLng,
            accuracy: Math.round(accuracy)
          }
        });
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsLoading(false);
        onEvent({ type: 'LOCATION_FAILED' });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  // Toggle voice recognition
  const handleMicClick = () => {
    if (isListening) {
      speechRouter.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRouter.startListening(
        session.lang,
        (res) => {
          if (res.transcript) {
            setFreeTextInput(res.transcript);
            if (res.isFinal) {
              setIsListening(false);
              onEvent({
                type: 'USER_INPUT',
                payload: res.transcript,
                engine: speechRouter.getActiveEngineId()
              });
            }
          }
        },
        (err) => {
          console.warn('ASR Error:', err);
          setIsListening(false);
          setActiveSpeechEngine('SilentEngine');
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleChipClick = (option: ChipOption) => {
    if (option.value === 'gps_detect') {
      handleGPSDetect();
      return;
    }

    if (promptEntry.allowMultiple) {
      const isAlready = selectedChips.includes(option.value);
      const next = isAlready
        ? selectedChips.filter((v) => v !== option.value)
        : [...selectedChips, option.value];
      setSelectedChips(next);
    } else {
      onEvent({
        type: 'CHIP_CLICK',
        payload: { value: option.value, label: option.label }
      });
    }
  };

  const handleMultiSubmit = () => {
    if (selectedChips.length > 0) {
      onEvent({
        type: 'CHIP_CLICK',
        payload: { values: selectedChips, label: selectedChips.join(', ') }
      });
    }
  };

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (freeTextInput.trim()) {
      onEvent({
        type: 'USER_INPUT',
        payload: freeTextInput.trim(),
        engine: 'TextInput'
      });
      setFreeTextInput('');
    }
  };

  return (
    <div className="conversation-viewport">
      {/* Top Bar: Progress & Status */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <EngineBadge speechEngine={activeSpeechEngine} isOffline={isOffline} />
          {/* Language Switcher */}
          <select
            id="select-app-language"
            value={session.lang}
            onChange={(e) => onSwitchLang(e.target.value as LanguageCode)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--stone)',
              background: 'var(--paper-card)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <option value="hi">हिंदी (HI)</option>
            <option value="mr">मराठी (MR)</option>
            <option value="bn">বাংলা (BN)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="te">తెలుగు (TE)</option>
            <option value="kn">ಕನ್ನಡ (KN)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>

        <div className="flow-progress-bar">
          <div className="flow-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Upper Third: Question Prompt & Controls */}
      <div className="prompt-section">
        <h1 className="prompt-text">{promptEntry.prompt}</h1>
        <div className="prompt-controls">
          <button
            type="button"
            id="btn-repeat-prompt"
            className="btn-ctrl"
            onClick={() => onEvent({ type: 'REPEAT' })}
            title="Repeat Question"
          >
            🔊 फिर से सुनें (Repeat)
          </button>
          <button
            type="button"
            id="btn-simplify-prompt"
            className="btn-ctrl"
            onClick={() => onEvent({ type: 'SIMPLIFY' })}
            title="Simplify Question"
          >
            💡 सरल भाषा (Simplify)
          </button>
        </div>
      </div>

      {/* Middle: Chips & Optional Free Text */}
      <div className="answer-section">
        {gpsLoading && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--field-deep)', fontWeight: 'bold' }}>
            📍 जीपीएस स्थान की खोज की जा रही है... (Resolving GPS Location)
          </div>
        )}

        <div className="chips-grid">
          {promptEntry.chips.map((opt) => (
            <Chip
              key={opt.value}
              option={opt}
              selected={selectedChips.includes(opt.value)}
              onClick={handleChipClick}
            />
          ))}
        </div>

        {promptEntry.allowMultiple && selectedChips.length > 0 && (
          <button
            type="button"
            id="btn-submit-multiple"
            className="btn-primary"
            style={{ marginTop: '8px' }}
            onClick={handleMultiSubmit}
          >
            चुनें और आगे बढ़ें ({selectedChips.length} चयनित) →
          </button>
        )}

        {/* Free Text Input Option */}
        <form onSubmit={handleFreeTextSubmit} className="text-input-row" style={{ marginTop: '8px' }}>
          <input
            type="text"
            id="input-freetext-answer"
            className="app-input"
            placeholder="या यहाँ लिखकर जवाब दें... (or type your answer)"
            value={freeTextInput}
            onChange={(e) => setFreeTextInput(e.target.value)}
          />
          <button type="submit" id="btn-submit-text" className="app-btn-submit" disabled={!freeTextInput.trim()}>
            भेजें (Send)
          </button>
        </form>
      </div>

      {/* Lower Third: 96px Centered Mic Button */}
      <MicButton
        isListening={isListening}
        onClick={handleMicClick}
        statusLabel={
          isListening
            ? 'सुन रहे हैं... बोलिए (Listening...)'
            : 'माइक दबाकर बोलें, या ऊपर विकल्प चुनें'
        }
      />
    </div>
  );
};
