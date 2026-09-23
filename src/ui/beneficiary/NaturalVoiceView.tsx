// Disha Sarathi - Natural Conversational Voice Assistant (PS 26097)
import React, { useState, useEffect, useRef } from 'react';
import {
  ConversationEvent,
  LanguageCode,
  Session
} from '../../core/types';
import { getProgressPercentage } from '../../core/states';
import { getPromptForState } from '../../core/orchestrator';
import { extractAllProfileSlots } from '../../core/nlu';
import { speechRouter } from '../../engines/speech/SpeechRouter';
import { EngineBadge } from '../components/EngineBadge';
import { Chip } from '../components/Chip';
import { t } from '../../core/i18n';

interface NaturalVoiceViewProps {
  session: Session;
  onEvent: (event: ConversationEvent) => void;
  onSwitchLang: (lang: LanguageCode) => void;
  onEndCall?: () => void;
  onEndVoice?: () => void;
}

export type VoiceInteractionState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'WAITING_FOR_USER'
  | 'CONFIRMING'
  | 'PAUSED'
  | 'ERROR';

export const NaturalVoiceView: React.FC<NaturalVoiceViewProps> = ({
  session,
  onEvent,
  onSwitchLang,
  onEndCall,
  onEndVoice
}) => {
  const handleEnd = onEndVoice || onEndCall;
  const [voiceState, setVoiceState] = useState<VoiceInteractionState>('SPEAKING');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastUserUtterance, setLastUserUtterance] = useState<string>('');
  const [textInputFallback, setTextInputFallback] = useState<string>('');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [showFallbackChips, setShowFallbackChips] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const abortRetryCountRef = useRef<number>(0);

  const lang = session.lang || 'mr';
  const promptEntry = getPromptForState(session.state, lang, session.profile);
  const progressPercent = getProgressPercentage(session.state);
  const isListeningRef = useRef<boolean>(false);
  const profile = session.profile;
  const notProvidedText = t('notProvided', lang);

  // Monitor online/offline
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

  // Continuous Voice Loop: Speak Prompt -> Auto Start Listening -> Process -> Next
  useEffect(() => {
    if (isMuted) return;

    if (session.state === 'CONFIRM_SUMMARY') {
      setVoiceState('CONFIRMING');
    } else {
      setVoiceState('SPEAKING');
    }
    setLiveTranscript('');
    setMicPermissionError(null);

    speechRouter.speak(
      promptEntry.prompt,
      lang,
      // onEnd callback: immediately start listening to user
      () => {
        if (!isMuted) {
          startListeningAutomatically();
        }
      },
      // onStart callback
      () => {
        if (session.state === 'CONFIRM_SUMMARY') {
          setVoiceState('CONFIRMING');
        } else {
          setVoiceState('SPEAKING');
        }
      }
    );

    return () => {
      speechRouter.stopSpeaking();
      speechRouter.stopListening();
    };
  }, [session.state, session.lang, isMuted]);

  const startListeningAutomatically = async () => {
    setMicPermissionError(null);

    // Stop any previous listener first to avoid conflicts
    speechRouter.stopListening();
    isListeningRef.current = false;

    // Small delay to let browser release audio resources
    await new Promise(resolve => setTimeout(resolve, 120));

    setVoiceState('LISTENING');
    isListeningRef.current = true;

    // Explicitly check/request microphone permission in browser if available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        console.log('[VOICE] Permission requested');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so Web Speech API gets exclusive access
        stream.getTracks().forEach((track) => track.stop());
        console.log('[VOICE] Permission result: granted');
      } catch (permErr: any) {
        console.warn('[VOICE] Permission result: denied', permErr);
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setMicPermissionError(
            lang === 'en' ? 'Microphone permission denied. Please allow mic access in browser settings and tap the mic button again.' :
            lang === 'hi' ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। ब्राउज़र सेटिंग में अनुमति दें।' :
            'मायक्रोफोन परवानगी नाकारली. ब्राउझर सेटिंग्समध्ये परवानगी द्या.'
          );
          setVoiceState('PAUSED');
          isListeningRef.current = false;
          return;
        }
      }
    }

    speechRouter.startListening(
      lang,
      (res) => {
        if (res.transcript) {
          setLiveTranscript(res.transcript);
          if (res.isFinal) {
            abortRetryCountRef.current = 0;
            handleUserResponse(res.transcript);
          }
        }
      },
      (err: any) => {
        console.warn('[VOICE] ASR Listen error:', err);
        isListeningRef.current = false;
        const errCode = err?.error || err;
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setMicPermissionError(
            lang === 'en' ? 'Microphone access denied. Please enable it in browser settings.' :
            lang === 'hi' ? 'माइक्रोफ़ोन अनुमति नहीं मिली। ब्राउज़र सेटिंग में जाएं।' :
            'मायक्रोफोन परवानगी नाकारली.'
          );
          setVoiceState('PAUSED');
        } else if (errCode === 'aborted' && abortRetryCountRef.current < 2) {
          // Auto-retry once on aborted (common after navigation)
          abortRetryCountRef.current += 1;
          console.log('[VOICE] Aborted, auto-retrying... attempt', abortRetryCountRef.current);
          setTimeout(() => startListeningAutomatically(), 400);
        } else if (errCode === 'no-speech') {
          setVoiceState('PAUSED');
          setMicPermissionError(
            lang === 'en' ? "I didn't catch that. Tap the mic 🎙️ button below to try again." :
            lang === 'hi' ? 'कुछ सुनाई नहीं दिया। नीचे 🎙️ बटन दबाएं।' :
            'काही ऐकू आले नाही. खालील 🎙️ बटण दाबा.'
          );
        } else if (errCode === 'network') {
          setVoiceState('PAUSED');
          setMicPermissionError(
            lang === 'en' ? 'Network error. Use text input below.' :
            lang === 'hi' ? 'नेटवर्क त्रुटि। नीचे टेक्स्ट इनपुट का उपयोग करें।' :
            'नेटवर्क त्रुटी. खाली मजकूर इनपुट वापरा.'
          );
        } else {
          setVoiceState('PAUSED');
        }
      },
      () => {
        if (isListeningRef.current) {
          setVoiceState('PAUSED');
          isListeningRef.current = false;
        }
      }
    );
  };

  // Unified response handler for BOTH typed input and speech input
  const handleUserResponse = (userText: string) => {
    const cleanText = userText.trim();
    if (!cleanText) return;

    setVoiceState('PROCESSING');
    isListeningRef.current = false;
    speechRouter.stopListening();
    setLastUserUtterance(cleanText);

    console.log('[VOICE] handleUserResponse(', cleanText, ')');
    const slots = extractAllProfileSlots(cleanText, lang);
    console.log('[VOICE] fields extracted:', slots);

    setTimeout(() => {
      onEvent({
        type: 'USER_INPUT',
        payload: cleanText,
        engine: speechRouter.getActiveEngineId()
      });
    }, 150);
  };

  // Interruption / Barge-in: User taps orb while AI is speaking
  const handleOrbClick = () => {
    if (voiceState === 'SPEAKING' || voiceState === 'CONFIRMING') {
      speechRouter.stopSpeaking();
      startListeningAutomatically();
    } else if (voiceState === 'LISTENING') {
      speechRouter.stopListening();
      if (liveTranscript.trim()) {
        handleUserResponse(liveTranscript.trim());
      } else {
        setVoiceState('PAUSED');
      }
    } else {
      setIsMuted(false);
      startListeningAutomatically();
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInputFallback.trim()) return;
    const text = textInputFallback.trim();
    setTextInputFallback('');
    handleUserResponse(text);
  };

  const handleRepeat = () => {
    speechRouter.stopListening();
    setVoiceState('SPEAKING');
    speechRouter.speak(promptEntry.prompt, lang, () => {
      startListeningAutomatically();
    });
  };

  const handleSimplify = () => {
    speechRouter.stopListening();
    setVoiceState('SPEAKING');
    speechRouter.speak(promptEntry.simplified, lang, () => {
      startListeningAutomatically();
    });
  };

  const toggleMute = () => {
    if (!isMuted) {
      speechRouter.stopSpeaking();
      speechRouter.stopListening();
      setIsMuted(true);
      setVoiceState('PAUSED');
    } else {
      setIsMuted(false);
      startListeningAutomatically();
    }
  };

  const getStatusLabel = () => {
    switch (voiceState) {
      case 'SPEAKING':
        return t('voiceStatusSpeaking', lang);
      case 'LISTENING':
        return t('voiceStatusListening', lang);
      case 'PROCESSING':
        return t('voiceStatusProcessing', lang);
      case 'CONFIRMING':
        return t('voiceStatusConfirming', lang);
      default:
        return t('voiceStatusTapToSpeak', lang);
    }
  };

  return (
    <div className="natural-voice-container">
      {/* Top Header Bar */}
      <div className="natural-voice-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EngineBadge speechEngine={speechRouter.getActiveEngineId()} isOffline={isOffline} />
          <span className="live-call-badge">🔴 {t('appTitle', lang)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            id="select-voice-lang"
            value={session.lang}
            onChange={(e) => onSwitchLang(e.target.value as LanguageCode)}
            className="lang-pill-select"
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>

          {onEndCall && (
            <button
              type="button"
              className="btn-end-call"
              onClick={onEndCall}
              title="End Voice Session"
            >
              📞 {t('btnEndSession', lang)}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Extracted Slot Badges */}
      <div className="voice-progress-wrapper" style={{ padding: '12px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>
            {t('voiceProgressLabel', lang)}: {progressPercent}%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
            {session.state}
          </span>
        </div>
        <div className="flow-progress-bar">
          <div className="flow-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="profile-slots-preview" style={{ marginTop: '8px' }}>
          {profile.district && <span className="slot-tag">📍 {profile.district}</span>}
          {profile.education_level && <span className="slot-tag">🎓 {profile.education_level}</span>}
          {profile.family_occupation && <span className="slot-tag">🌾 {profile.family_occupation}</span>}
          {profile.current_livelihood && <span className="slot-tag">🔧 {profile.current_livelihood}</span>}
          {profile.skills_interests && profile.skills_interests.length > 0 && (
            <span className="slot-tag">⚡ {profile.skills_interests.join(', ')}</span>
          )}
          {profile.employment_preference && (
            <span className="slot-tag">💼 {profile.employment_preference === 'wage_employment' ? 'नोकरी' : 'व्यवसाय'}</span>
          )}
        </div>
      </div>

      {/* Spoken Prompt Bubble / Confirmation Summary Card */}
      {session.state === 'CONFIRM_SUMMARY' ? (
        <div className="summary-confirmation-card" style={{ background: '#F8FAFC', border: '2px solid #3B82F6', borderRadius: '12px', padding: '16px', margin: '10px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            <h4 style={{ margin: 0, color: '#1E3A8A', fontWeight: 700 }}>
              {t('confirmSummaryHeading', lang)}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.86rem', marginBottom: '14px' }}>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldLocation', lang)}</strong> {profile.district || notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldEducation', lang)}</strong> {profile.education_level || notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldFamilyOcc', lang)}</strong> {profile.family_occupation || notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldCurrentWork', lang)}</strong> {profile.current_livelihood || notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldSkills', lang)}</strong> {(profile.skills_interests && profile.skills_interests.length > 0) ? profile.skills_interests.join(', ') : notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldExperience', lang)}</strong> {profile.experience_years !== undefined ? `${profile.experience_years} ${t('yearsLabel', lang)}` : notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldTravel', lang)}</strong> {profile.travel_radius_km ? `${profile.travel_radius_km} ${t('kmLabel', lang)}` : notProvidedText}
            </div>
            <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong>{t('confirmFieldEmployPref', lang)}</strong> {profile.employment_preference === 'wage_employment' ? t('wageEmployment', lang) : profile.employment_preference === 'self_employment' ? t('selfEmployment', lang) : profile.employment_preference || notProvidedText}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>
            {t('confirmSummaryQuestion', lang)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#16A34A', padding: '10px 18px', fontWeight: 700 }}
              onClick={() => onEvent({ type: 'CHIP_CLICK', payload: 'confirm' })}
            >
              {t('confirmSummaryYes', lang)}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '10px 14px' }}
              onClick={() => onEvent({ type: 'CHIP_CLICK', payload: 'revise' })}
            >
              {t('confirmSummaryEdit', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="voice-prompt-bubble">
          <div className="voice-bot-avatar">👩‍💼</div>
          <div className="voice-prompt-text-wrap">
            <div className="voice-bot-name">{t('appTitle', lang)}</div>
            <p className="voice-spoken-prompt">{promptEntry.prompt}</p>
          </div>
        </div>
      )}

      {/* Center: Conversational Voice Orb + Waveform Visualizer */}
      <div className="orb-center-area">
        <div
          className={`conversational-orb orb-${voiceState.toLowerCase()}`}
          onClick={handleOrbClick}
          role="button"
          tabIndex={0}
          title={getStatusLabel()}
          id="btn-voice-orb"
        >
          <div className="orb-inner-wave wave-1" />
          <div className="orb-inner-wave wave-2" />
          <div className="orb-inner-wave wave-3" />
          <div className="orb-core">
            {voiceState === 'LISTENING' && <span className="orb-icon">🎙️</span>}
            {voiceState === 'SPEAKING' && <span className="orb-icon">🔊</span>}
            {voiceState === 'PROCESSING' && <span className="orb-icon">✨</span>}
            {voiceState === 'CONFIRMING' && <span className="orb-icon">📋</span>}
            {voiceState === 'PAUSED' && <span className="orb-icon">▶️</span>}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer Bars */}
        <div className={`audio-waveform-bars state-${voiceState.toLowerCase()}`}>
          <span className="wave-bar wb-1"></span>
          <span className="wave-bar wb-2"></span>
          <span className="wave-bar wb-3"></span>
          <span className="wave-bar wb-4"></span>
          <span className="wave-bar wb-5"></span>
          <span className="wave-bar wb-6"></span>
          <span className="wave-bar wb-7"></span>
          <span className="wave-bar wb-8"></span>
          <span className="wave-bar wb-9"></span>
        </div>

        {/* Live Status String */}
        <div className="orb-status-text">{getStatusLabel()}</div>

        {/* Permission Denied Notice */}
        {micPermissionError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', margin: '8px auto', maxWidth: '450px', textAlign: 'center' }}>
            ⚠️ {micPermissionError}
            <div style={{ marginTop: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => startListeningAutomatically()}
              >
                🔄 {t('voiceTryAgain', lang)}
              </button>
            </div>
          </div>
        )}

        {/* Live User Utterance Transcript */}
        {liveTranscript && (
          <div className="user-live-transcript" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 16px', borderRadius: '20px', color: '#1E40AF', fontWeight: 600, fontSize: '0.95rem', margin: '10px auto', maxWidth: '500px' }}>
            👤 "{liveTranscript}"
          </div>
        )}

        {/* Last Confirmed User Statement */}
        {!liveTranscript && lastUserUtterance && (
          <div style={{ fontSize: '0.85rem', color: '#64748B', margin: '6px auto', textAlign: 'center' }}>
            {t('voiceSaidLabel', lang)} <em>"{lastUserUtterance}"</em>
          </div>
        )}

        {/* Manual Mic Tap Button - always visible for reliable voice input */}
        {voiceState !== 'LISTENING' && voiceState !== 'SPEAKING' && voiceState !== 'PROCESSING' && (
          <button
            type="button"
            id="btn-tap-mic"
            onClick={() => {
              abortRetryCountRef.current = 0;
              setMicPermissionError(null);
              startListeningAutomatically();
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
              color: 'white', border: 'none', borderRadius: '28px',
              padding: '10px 24px', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', margin: '8px auto', boxShadow: '0 4px 14px rgba(30,64,175,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🎙️ {lang === 'en' ? 'Tap to Speak' : lang === 'hi' ? 'बोलने के लिए टैप करें' : 'बोलण्यासाठी टॅप करा'}
          </button>
        )}

        {/* Fallback Text Input Form */}
        <form onSubmit={handleManualTextSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '460px', margin: '8px auto 0', width: '90%' }}>
          <input
            type="text"
            className="input-field"
            value={textInputFallback}
            onChange={(e) => setTextInputFallback(e.target.value)}
            placeholder={t('voiceTypeFallbackPlaceholder', lang)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            {t('btnSubmitText', lang)}
          </button>
        </form>
      </div>

      {/* Optional Tap Choices */}
      {showFallbackChips && (
        <div className="voice-fallback-drawer">
          <div className="drawer-title">{t('voiceTapOptionsLabel', lang)}</div>
          <div className="chips-grid">
            {promptEntry.chips.map((opt) => (
              <Chip
                key={opt.value}
                option={opt}
                selected={false}
                onClick={() => {
                  onEvent({
                    type: 'CHIP_CLICK',
                    payload: { value: opt.value, label: opt.label }
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="voice-bottom-controls">
        <button
          type="button"
          id="btn-voice-repeat"
          className="voice-ctrl-btn"
          onClick={handleRepeat}
          title="Repeat Question"
        >
          {t('btnRepeat', lang)}
        </button>

        <button
          type="button"
          id="btn-voice-simplify"
          className="voice-ctrl-btn"
          onClick={handleSimplify}
          title="Simplify"
        >
          {t('btnSimplify', lang)}
        </button>

        <button
          type="button"
          id="btn-voice-mute"
          className={`voice-ctrl-btn ${isMuted ? 'active-mute' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? t('btnMuteOn', lang) : t('btnMuteOff', lang)}
        </button>

        <button
          type="button"
          id="btn-toggle-chips"
          className="voice-ctrl-btn"
          onClick={() => setShowFallbackChips(!showFallbackChips)}
        >
          {showFallbackChips ? t('btnHideOptions', lang) : t('btnShowOptions', lang)}
        </button>

        {handleEnd && (
          <button
            type="button"
            id="btn-voice-end"
            className="voice-ctrl-btn"
            onClick={handleEnd}
            style={{ color: '#DC2626' }}
          >
            {t('btnEndSession', lang)}
          </button>
        )}
      </div>
    </div>
  );
};
