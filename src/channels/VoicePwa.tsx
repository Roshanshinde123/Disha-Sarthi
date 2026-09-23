import React, { useState, useEffect } from 'react';
import { ConversationEvent, LanguageCode, Session } from '../core/types';
import { createInitialSession, step } from '../core/orchestrator';
import { deleteSessionById, loadActiveSession, saveCurrentSession } from '../core/store';
import { NaturalVoiceView } from '../ui/beneficiary/NaturalVoiceView';
import { ConversationView } from '../ui/beneficiary/ConversationView';
import { RecommendationView } from '../ui/beneficiary/RecommendationView';
import { SkillPassportView } from '../ui/beneficiary/SkillPassportView';
import { SkillGapView } from '../ui/beneficiary/SkillGapView';
import { CenterDetailsView } from '../ui/beneficiary/CenterDetailsView';
import { FinanceTrackView } from '../ui/beneficiary/FinanceTrackView';
import { PlacementView } from '../ui/beneficiary/PlacementView';
import { AspirationCardView } from '../ui/beneficiary/AspirationCardView';
import { FeedbackView } from '../ui/beneficiary/FeedbackView';
import { EscalationView } from '../ui/beneficiary/EscalationView';
import { t } from '../core/i18n';

export const VoicePwa: React.FC<{
  onNavigate?: (path: string) => void;
  selectedLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}> = ({ onNavigate, selectedLanguage, onLanguageChange }) => {
  const [session, setSession] = useState<Session>(() => createInitialSession(selectedLanguage || 'mr'));
  const [isLoading, setIsLoading] = useState(true);
  const [useConversationalVoice, setUseConversationalVoice] = useState(true);

  const lang = session.lang || selectedLanguage || 'mr';

  // Resume session on load if active in IndexedDB within 7 days
  useEffect(() => {
    loadActiveSession().then((stored) => {
      if (stored) {
        if (selectedLanguage && stored.lang !== selectedLanguage) {
          const updated = { ...stored, lang: selectedLanguage };
          setSession(updated);
          saveCurrentSession(updated);
        } else {
          setSession(stored);
          if (stored.lang && onLanguageChange && stored.lang !== selectedLanguage) {
            onLanguageChange(stored.lang);
          }
        }
      } else if (selectedLanguage && session.lang !== selectedLanguage) {
        setSession(createInitialSession(selectedLanguage));
      }
      setIsLoading(false);
    });
  }, []);

  // Synchronize when selectedLanguage prop changes from outside (e.g. Header dropdown)
  useEffect(() => {
    if (!isLoading && selectedLanguage && session.lang !== selectedLanguage) {
      handleEvent({ type: 'SWITCH_LANG', payload: selectedLanguage });
    }
  }, [selectedLanguage]);

  const handleEvent = (event: ConversationEvent) => {
    const { session: nextSession, actions } = step(session, event);
    setSession(nextSession);

    // Check if persist action is present
    if (actions.some((a) => a.type === 'persist')) {
      if (nextSession.state === 'DELETED_END') {
        deleteSessionById(session.id);
      } else {
        saveCurrentSession(nextSession);
      }
    }
  };

  const handleSwitchLang = (newLang: LanguageCode) => {
    handleEvent({ type: 'SWITCH_LANG', payload: newLang });
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleDeleteData = () => {
    const confirmMsg =
      lang === 'en'
        ? 'Do you want to delete all your recorded data?'
        : lang === 'hi'
        ? 'क्या आप अपना सारा दर्ज डेटा हटाना चाहते हैं?'
        : 'आपली सर्व नोंदवलेली माहिती हटवायची आहे का?';
    if (window.confirm(confirmMsg)) {
      handleEvent({ type: 'DELETE_DATA' });
    }
  };

  if (isLoading) {
    return (
      <div className="beneficiary-shell" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>{lang === 'en' ? 'Starting Disha Sarathi...' : lang === 'hi' ? 'दिशा सारथी शुरू हो रहा है...' : 'दिशा सारथी सुरू होत आहे...'}</div>
      </div>
    );
  }

  const toggleModeLabel = useConversationalVoice
    ? (lang === 'en' ? '📋 Switch to Tap Mode' : lang === 'hi' ? '📋 टैप मोड का उपयोग करें' : '📋 बटण मोड वापरा')
    : (lang === 'en' ? '🎙️ Switch to Voice Mode' : lang === 'hi' ? '🎙️ वॉयस मोड का उपयोग करें' : '🎙️ व्हॉईस मोड वापरा');

  return (
    <div className="beneficiary-shell" style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onNavigate && (
            <button
              type="button"
              className="btn-ctrl"
              onClick={() => onNavigate('/beneficiary')}
              title="Go to Dashboard"
              style={{ fontWeight: 700 }}
            >
              ← {lang === 'en' ? 'Dashboard' : lang === 'hi' ? 'डैशबोर्ड' : 'डॅशबोर्ड'}
            </button>
          )}
          <button
            type="button"
            className="btn-ctrl"
            onClick={() => setUseConversationalVoice(!useConversationalVoice)}
            title="Toggle between Voice Mode and Tap Mode"
          >
            {toggleModeLabel}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-ctrl"
            style={{ color: 'var(--madder)' }}
            onClick={handleDeleteData}
            title="Delete my data"
          >
            🗑️ {t('btnDeleteData', lang)}
          </button>
        </div>
      </div>

      {/* Main Dynamic View based on FSM state */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {session.state === 'ESCALATE_TO_HUMAN' ? (
          <EscalationView session={session} onEvent={handleEvent} />
        ) : session.state === 'SKILL_PASSPORT' ? (
          <SkillPassportView
            session={session}
            onBack={() => handleEvent({ type: 'REVISE_SLOT' })}
            onNavigate={(p) => {
              if (p.includes('recommendations')) handleEvent({ type: 'CHIP_CLICK', payload: 'view_recommendations' });
              else handleEvent({ type: 'CHIP_CLICK', payload: 'view_gap' });
            }}
          />
        ) : session.state === 'SKILL_GAP' ? (
          <SkillGapView
            session={session}
            onNavigateToTraining={() => handleEvent({ type: 'CHIP_CLICK', payload: 'show_recommendations' })}
            onStartVoice={() => handleEvent({ type: 'REVISE_SLOT' })}
          />
        ) : session.state === 'RECOMMENDATION' ? (
          <RecommendationView
            session={session}
            onEvent={handleEvent}
            onStartVoice={() => handleEvent({ type: 'REVISE_SLOT' })}
          />
        ) : session.state === 'BENEFICIARY_CHOICE' || session.state === 'LOCAL_OPPORTUNITY' || session.state === 'CENTER_AND_NEXT_STEPS' ? (
          <CenterDetailsView session={session} onEvent={handleEvent} />
        ) : session.state === 'TRAINING_PATHWAY' || session.state === 'PLACEMENT_LINKAGE' ? (
          <PlacementView session={session} onEvent={handleEvent} />
        ) : session.state === 'FINANCE_TRACK' ? (
          <FinanceTrackView session={session} onEvent={handleEvent} />
        ) : session.state === 'ASPIRATION_CARD' ? (
          <AspirationCardView session={session} onEvent={handleEvent} />
        ) : session.state === 'SESSION_FEEDBACK' ? (
          <FeedbackView session={session} onEvent={handleEvent} />
        ) : session.state === 'DELETED_END' ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h2>🗑️ {lang === 'en' ? 'Your data has been securely deleted.' : lang === 'hi' ? 'आपका डेटा सुरक्षित रूप से हटा दिया गया है।' : 'आपला डेटा सुरक्षितपणे हटवला आहे.'}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              {lang === 'en' ? 'Your privacy is protected. No session records remain.' : lang === 'hi' ? 'आपकी गोपनीयता सुरक्षित है। कोई डेटा शेष नहीं है।' : 'आपली गोपनीयता संरक्षित आहे. या सत्राचा कोणताही डेटा शिल्लक नाही.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => handleEvent({ type: 'RESTART' })}
            >
              🔄 {lang === 'en' ? 'Start New Session' : lang === 'hi' ? 'नया सत्र प्रारंभ करें' : 'नवीन सत्र सुरू करा'}
            </button>
          </div>
        ) : session.state === 'DECLINED_END' ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h2>{lang === 'en' ? 'Thank You!' : lang === 'hi' ? 'धन्यवाद!' : 'धन्यवाद!'}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              {lang === 'en' ? 'No information was collected without your consent.' : lang === 'hi' ? 'आपकी सहमति के बिना कोई जानकारी एकत्र नहीं की गई।' : 'आपल्या संमतीशिवाय कोणतीही माहिती गोळा केली गेलेली नाही.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => handleEvent({ type: 'RESTART' })}
            >
              🔄 {lang === 'en' ? 'Start Again' : lang === 'hi' ? 'पुनः प्रारंभ करें' : 'पुन्हा सुरू करा'}
            </button>
          </div>
        ) : session.state === 'END' ? (
          <div style={{ textAlign: 'center', padding: '30px 16px', background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h2>🎉 {lang === 'en' ? 'Counselling Session Completed Successfully!' : lang === 'hi' ? 'परामर्श सत्र सफलतापूर्वक पूरा हुआ!' : 'समुपदेशन सत्र यशस्वीरित्या पूर्ण झाले!'}</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              {lang === 'en' ? 'Your Aspiration Card is ready. Best wishes for your future!' : lang === 'hi' ? 'आपका आकांक्षा कार्ड तैयार है। आपके उज्ज्वल भविष्य की शुभकामनाएं!' : 'आपले आकांक्षा कार्ड तयार झाले आहे. आपल्या उज्ज्वल भविष्यासाठी शुभेच्छा!'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', maxWidth: '300px', margin: '24px auto 0' }}>
              <a href="/beneficiary" className="btn-primary">
                🪪 {lang === 'en' ? 'View My Dashboard & Card' : lang === 'hi' ? 'मेरा डैशबोर्ड और कार्ड देखें' : 'माझा डॅशबोर्ड व आकांक्षा कार्ड पहा'}
              </a>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleEvent({ type: 'RESTART' })}
              >
                🔄 {lang === 'en' ? 'Start New Beneficiary Session' : lang === 'hi' ? 'नया लाभार्थी सत्र शुरू करें' : 'नवीन लाभार्थी सत्र सुरू करा'}
              </button>
            </div>
          </div>
        ) : useConversationalVoice ? (
          <NaturalVoiceView
            session={session}
            onEvent={handleEvent}
            onSwitchLang={handleSwitchLang}
            onEndCall={() => handleEvent({ type: 'REVISE_SLOT' })}
          />
        ) : (
          <ConversationView
            session={session}
            onEvent={handleEvent}
            onSwitchLang={handleSwitchLang}
          />
        )}
      </main>
    </div>
  );
};

