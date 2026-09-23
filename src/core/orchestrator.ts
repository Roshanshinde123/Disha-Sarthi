// Disha Sarathi - Core State Machine & Conversation Orchestrator (PS 26097)
import {
  Action,
  BeneficiaryProfile,
  ConversationEvent,
  ConversationState,
  LanguageCode,
  PlacementStatus,
  PromptPackEntry,
  Session
} from './types';
import { matchNLUIntent, extractAllProfileSlots } from './nlu';
import { recommendNSQFTrades } from './recommender';
import { updatePlacementRecord } from './placement';

export const PROFILING_STATE_ORDER: ConversationState[] = [
  'LOCATION',
  'BACKGROUND',
  'FAMILY_OCCUPATION',
  'CURRENT_LIVELIHOOD',
  'SKILLS_INPUT',
  'EXPERIENCE',
  'INTERESTS',
  'ASPIRATIONS',
  'CONSTRAINTS',
  'TRAVEL_RADIUS',
  'EMPLOYMENT_PREFERENCE'
];

/**
 * Returns the first missing required profiling stage according to the checklist.
 */
export function getNextUnfilledProfilingState(
  profile: BeneficiaryProfile,
  fromState?: ConversationState
): ConversationState {
  const isFilled = (state: ConversationState): boolean => {
    switch (state) {
      case 'LOCATION':
        return !!profile.district;
      case 'BACKGROUND':
        return !!profile.education_level;
      case 'FAMILY_OCCUPATION':
        return !!profile.family_occupation;
      case 'CURRENT_LIVELIHOOD':
        return !!profile.current_livelihood;
      case 'SKILLS_INPUT':
      case 'SKILLS_INTERESTS':
        return !!profile.skills_interests && profile.skills_interests.length > 0;
      case 'EXPERIENCE':
        return profile.experience_years !== undefined && profile.experience_years !== null;
      case 'INTERESTS':
      case 'ASPIRATIONS':
        return !!profile.aspirations || (!!profile.skills_interests && profile.skills_interests.length > 0);
      case 'CONSTRAINTS':
        return profile.constraints_recorded === true;
      case 'TRAVEL_RADIUS':
        return profile.travel_radius_km !== undefined && profile.travel_radius_km !== null;
      case 'EMPLOYMENT_PREFERENCE':
        return !!profile.employment_preference;
      default:
        return true;
    }
  };

  let startIndex = 0;
  if (fromState) {
    const idx = PROFILING_STATE_ORDER.indexOf(fromState);
    if (idx !== -1) startIndex = idx + 1;
  }

  for (let i = startIndex; i < PROFILING_STATE_ORDER.length; i++) {
    const st = PROFILING_STATE_ORDER[i];
    if (!isFilled(st)) {
      return st;
    }
  }

  // Check from beginning in case prior states were skipped
  for (let i = 0; i < startIndex; i++) {
    const st = PROFILING_STATE_ORDER[i];
    if (!isFilled(st)) {
      return st;
    }
  }

  return 'CONFIRM_SUMMARY';
}

import promptHi from '../i18n/hi.json';
import promptEn from '../i18n/en.json';
import promptMr from '../i18n/mr.json';
import promptBn from '../i18n/bn.json';
import promptTa from '../i18n/ta.json';
import promptTe from '../i18n/te.json';
import promptKn from '../i18n/kn.json';

const promptPacks: Record<LanguageCode, Record<string, PromptPackEntry>> = {
  hi: promptHi as any,
  en: promptEn as any,
  mr: promptMr as any,
  bn: promptBn as any,
  ta: promptTa as any,
  te: promptTe as any,
  kn: promptKn as any
};

/**
 * Generates dynamic summary text for confirmation state
 */
export function getSummaryConfirmationPrompt(profile: BeneficiaryProfile, lang: LanguageCode): string {
  const notRecorded = lang === 'mr' ? 'नोंदवले नाही' : lang === 'hi' ? 'दर्ज नहीं किया' : 'Not recorded';
  const loc = profile.district ? `${profile.district}${profile.state ? ', ' + profile.state : ''}` : notRecorded;
  const edu = profile.education_level || notRecorded;
  const fam = profile.family_occupation || notRecorded;
  const live = profile.current_livelihood || notRecorded;
  const sk = (profile.skills_interests && profile.skills_interests.length > 0) ? profile.skills_interests.join(', ') : notRecorded;
  const exp = profile.experience_years !== undefined ? `${profile.experience_years} वर्षे (Years)` : notRecorded;
  const rad = profile.travel_radius_km ? `${profile.travel_radius_km} किमी (km)` : notRecorded;
  const pref = profile.employment_preference === 'wage_employment' ? (lang === 'mr' ? 'नोकरी' : lang === 'hi' ? 'नौकरी' : 'Wage Job') :
               profile.employment_preference === 'self_employment' ? (lang === 'mr' ? 'स्वतःचा व्यवसाय' : lang === 'hi' ? 'स्वरोजगार' : 'Self Employment') :
               profile.employment_preference ? (lang === 'mr' ? 'नोकरी किंवा व्यवसाय' : lang === 'hi' ? 'दोनों' : 'Open to Both') : notRecorded;

  if (lang === 'mr') {
    return `आम्ही तुमच्याबद्दल हे समजलो आहे:\n📍 स्थान: ${loc}\n🎓 शिक्षण: ${edu}\n🌾 कुटुंबाचा व्यवसाय: ${fam}\n🔧 सध्याचे काम: ${live}\n⚡ कौशल्य/आवड: ${sk}\n💼 अनुभव: ${exp}\n🚲 प्रवासाची मर्यादा: ${rad}\n💼 रोजगार पसंती: ${pref}\n\nही माहिती बरोबर आहे का?`;
  }
  if (lang === 'hi') {
    return `हमने आपके बारे में यह जानकारी समझी है:\n📍 स्थान: ${loc}\n🎓 शिक्षा: ${edu}\n🌾 पारिवारिक व्यवसाय: ${fam}\n🔧 वर्तमान कार्य: ${live}\n⚡ हुनर/रुचि: ${sk}\n💼 अनुभव: ${exp}\n🚲 यात्रा दायरा: ${rad}\n💼 रोजगार पसंद: ${pref}\n\nक्या यह जानकारी सही है?`;
  }
  return `We have recorded the following profile summary:\n📍 Location: ${loc}\n🎓 Education: ${edu}\n🌾 Family Occupation: ${fam}\n🔧 Current Livelihood: ${live}\n⚡ Skills/Interests: ${sk}\n💼 Experience: ${exp}\n🚲 Travel Radius: ${rad}\n💼 Preference: ${pref}\n\nIs this information correct?`;
}

export function getPromptForState(
  state: ConversationState,
  lang: LanguageCode = 'hi',
  profile?: BeneficiaryProfile
): PromptPackEntry {
  if (state === 'CONFIRM_SUMMARY' && profile) {
    const dynamicPrompt = getSummaryConfirmationPrompt(profile, lang);
    if (lang === 'mr') {
      return {
        prompt: dynamicPrompt,
        simplified: 'दिलेली माहिती तपासा आणि पुढे जाण्यासाठी होय म्हणा.',
        chips: [
          { value: 'confirm', label: '✓ होय, माहिती बरोबर आहे', icon: '✅' },
          { value: 'revise', label: '✏️ माहिती बदलायची आहे', icon: '✏️' },
          { value: 'repeat', label: '🎙️ पुन्हा सांगा', icon: '🔊' }
        ]
      };
    }
    if (lang === 'hi') {
      return {
        prompt: dynamicPrompt,
        simplified: 'जानकारी की पुष्टि करें और आगे बढ़ें।',
        chips: [
          { value: 'confirm', label: '✓ हाँ, जानकारी सही है', icon: '✅' },
          { value: 'revise', label: '✏️ जानकारी बदलनी है', icon: '✏️' },
          { value: 'repeat', label: '🎙️ दोबारा बताएं', icon: '🔊' }
        ]
      };
    }
    return {
      prompt: dynamicPrompt,
      simplified: 'Confirm your profile details to view your Skill Passport.',
      chips: [
        { value: 'confirm', label: '✓ Yes, Information is Correct', icon: '✅' },
        { value: 'revise', label: '✏️ Change Information', icon: '✏️' },
        { value: 'repeat', label: '🎙️ Repeat Summary', icon: '🔊' }
      ]
    };
  }

  const pack = promptPacks[lang] || promptPacks.hi;
  if (pack[state]) return pack[state];

  // Fallback defaults for newly defined states
  if (state === 'SKILLS_INPUT') {
    if (lang === 'mr') {
      return {
        prompt: 'आपल्याकडे सध्या कोणती कौशल्ये किंवा कामाचा अनुभव आहे? (उदा. सिलाई, वायरिंग, शेती, दुरुस्ती)',
        simplified: 'आपल्याकडे असलेली कौशल्ये सांगा किंवा निवडा.',
        chips: [
          { value: 'stitching', label: '✂️ शिलाई व टेलरिंग', icon: '✂️' },
          { value: 'electrical', label: '⚡ इलेक्ट्रिकल व वायरिंग', icon: '⚡' },
          { value: 'farming', label: '🌾 शेती व कृषी', icon: '🌾' },
          { value: 'auto_repair', label: '🔧 मेकॅनिक / गॅरेज', icon: '🔧' },
          { value: 'computers', label: '💻 कॉम्प्यूटर / डेटा एंट्री', icon: '💻' }
        ]
      };
    }
    return {
      prompt: 'What existing skills or prior work experience do you have?',
      simplified: 'Select or speak your existing skills.',
      chips: [
        { value: 'stitching', label: '✂️ Stitching & Tailoring', icon: '✂️' },
        { value: 'electrical', label: '⚡ Electrical & Wiring', icon: '⚡' },
        { value: 'farming', label: '🌾 Agriculture & Farming', icon: '🌾' },
        { value: 'auto_repair', label: '🔧 Auto Mechanics', icon: '🔧' },
        { value: 'computers', label: '💻 Basic Computers', icon: '💻' }
      ]
    };
  }

  if (state === 'EXPERIENCE') {
    if (lang === 'mr') {
      return {
        prompt: 'आपल्याला कामाचा किंवा कौशल्याचा किती वर्षांचा अनुभव आहे?',
        simplified: 'आपला कामाचा अनुभव वर्षांमध्ये सांगा.',
        chips: [
          { value: '0', label: 'अनुभव नाही (फ्रेशर)', icon: '🌱' },
          { value: '1', label: '१ वर्ष', icon: '⭐' },
          { value: '2', label: '२ वर्षे', icon: '⭐⭐' },
          { value: '3', label: '३ ते ५ वर्षे', icon: '⭐⭐⭐' },
          { value: '5', label: '५ वर्षांपेक्षा जास्त', icon: '🏆' }
        ]
      };
    }
    return {
      prompt: 'How many years of work or practical experience do you have?',
      simplified: 'Select or speak your experience in years.',
      chips: [
        { value: '0', label: 'No Experience (Fresher)', icon: '🌱' },
        { value: '1', label: '1 Year', icon: '⭐' },
        { value: '2', label: '2 Years', icon: '⭐⭐' },
        { value: '3', label: '3-5 Years', icon: '⭐⭐⭐' },
        { value: '5', label: '5+ Years', icon: '🏆' }
      ]
    };
  }

  if (state === 'INTERESTS' || state === 'ASPIRATIONS') {
    if (lang === 'mr') {
      return {
        prompt: 'भविष्यात आपल्याला कोणते नवीन कौशल्य शिकून प्रगती करायची आहे? (आपली आकांक्षा)',
        simplified: 'आपल्याला शिकायला आवडणारे क्षेत्र सांगा.',
        chips: [
          { value: 'electrical', label: '💡 इलेक्ट्रिकल टेक्निशियन', icon: '💡' },
          { value: 'solar', label: '☀️ सोलर पॅनेल इन्स्टॉलर', icon: '☀️' },
          { value: 'stitching', label: '👗 फॅशन डिझायनिंग', icon: '👗' },
          { value: 'mobile_repair', label: '📱 मोबाईल रिपेअरिंग', icon: '📱' },
          { value: 'computers', label: '💻 जन सेवा केंद्र / IT', icon: '💻' }
        ]
      };
    }
    return {
      prompt: 'Which new trade or skilling pathway are you most interested to learn?',
      simplified: 'Tell us your aspirations.',
      chips: [
        { value: 'electrical', label: '💡 Electrical Technician', icon: '💡' },
        { value: 'solar', label: '☀️ Solar Installer', icon: '☀️' },
        { value: 'stitching', label: '👗 Fashion Designing', icon: '👗' },
        { value: 'mobile_repair', label: '📱 Mobile Repair', icon: '📱' },
        { value: 'computers', label: '💻 IT & CSC Center', icon: '💻' }
      ]
    };
  }

  if (state === 'SKILL_PASSPORT') {
    if (lang === 'mr') {
      return {
        prompt: 'अभिनंदन! आपला अधिकृत पीएम-अजय स्किल पासपोर्ट तयार झाला आहे. कौशल्य अंतर तपासण्यासाठी पुढे चला.',
        simplified: 'आपला स्किल पासपोर्ट पहा आणि कौशल्य अंतर तपासा.',
        chips: [
          { value: 'view_gap', label: '🔎 कौशल्य अंतर पहा (Skill Gap)', icon: '🔎' },
          { value: 'view_recommendations', label: '🎯 शिफारसी पहा (Recommendations)', icon: '🎯' }
        ]
      };
    }
    return {
      prompt: 'Your PM-AJAY Skill Passport is generated based on your profile! Proceed to inspect your Skill Gap.',
      simplified: 'View Skill Passport and analyze Skill Gap.',
      chips: [
        { value: 'view_gap', label: '🔎 View Skill Gap Analysis', icon: '🔎' },
        { value: 'view_recommendations', label: '🎯 View NSQF Recommendations', icon: '🎯' }
      ]
    };
  }

  if (state === 'SKILL_GAP') {
    if (lang === 'mr') {
      return {
        prompt: 'कौशल्य अंतर विश्लेषण: आपल्या सध्याच्या कौशल्यांची तुलना एनएसक्यूएफ मानकांशी केली आहे. आता शिफारसी पहा.',
        simplified: 'आपल्यासाठी सर्वोत्तम शिफारस केलेले ३ मार्ग पहा.',
        chips: [
          { value: 'show_recommendations', label: '🎯 ३ सर्वोत्तम शिफारसी पहा', icon: '🎯' },
          { value: 'back_passport', label: '🪪 स्किल पासपोर्टवर परत जा', icon: '🪪' }
        ]
      };
    }
    return {
      prompt: 'Skill Gap Analyzed: We have mapped your existing skills against NSQF QP benchmarks. View top recommendations.',
      simplified: 'View your 3 explainable recommendations.',
      chips: [
        { value: 'show_recommendations', label: '🎯 View Top 3 Recommendations', icon: '🎯' },
        { value: 'back_passport', label: '🪪 Back to Skill Passport', icon: '🪪' }
      ]
    };
  }

  if (state === 'LOCAL_OPPORTUNITY') {
    if (lang === 'mr') {
      return {
        prompt: 'आपण निवडलेल्या कौशल्यानुसार आपल्या जिल्ह्यातील स्थानिक रोजगार व स्वयंरोजगार संधी उपलब्ध आहेत.',
        simplified: 'स्थानिक आस्थापना व सरकारी कर्ज योजना पहा.',
        chips: [
          { value: 'view_training', label: '🏫 प्रशिक्षण केंद्र पहा', icon: '🏫' },
          { value: 'view_placement', label: '💼 स्थानिक रोजगार संधी पहा', icon: '💼' }
        ]
      };
    }
    return {
      prompt: 'Local Opportunity Match: Verified local employers and PM-AJAY/NSFDC credit linkages in your district.',
      simplified: 'Explore training batches and placement openings.',
      chips: [
        { value: 'view_training', label: '🏫 View Training Center', icon: '🏫' },
        { value: 'view_placement', label: '💼 View Placement Opportunities', icon: '💼' }
      ]
    };
  }

  return (
    promptPacks.en[state] || {
      prompt: 'कृपया पुढे चला.',
      simplified: 'पुढे चला.',
      chips: [{ value: 'continue', label: 'पुढे चला', icon: '👉' }]
    }
  );
}

export function createInitialSession(lang: LanguageCode = 'mr'): Session {
  const now = new Date().toISOString();
  const idNum = Math.floor(100000 + Math.random() * 900000);
  return {
    id: `session_${idNum}`,
    ref_code: `PMAJAY-${lang.toUpperCase()}-${idNum}`,
    created_at: now,
    updated_at: now,
    lang,
    state: 'LANDING',
    profile: {
      skills_interests: [],
      constraints: [],
      placement_status: 'NOT_STARTED',
      summary_confirmed: false,
      skill_gap_generated: false,
      profile_completed: false
    },
    transcript: []
  };
}

/**
 * Pure state machine step function with strict gating and zero fake values.
 * step(session, event) -> { session, actions }
 */
export function step(
  session: Session,
  event: ConversationEvent
): { session: Session; actions: Action[] } {
  const actions: Action[] = [];
  let updatedProfile: BeneficiaryProfile = { ...session.profile };
  const updatedTranscript = [...session.transcript];
  let nextState: ConversationState = session.state;
  let currentLang: LanguageCode = session.lang;

  const now = new Date().toISOString();

  // Helper to record user utterance in transcript
  const logUserTurn = (text: string) => {
    updatedTranscript.push({
      sender: 'user',
      text,
      timestamp: now,
      state: session.state
    });
  };

  // Helper to record bot utterance & schedule speak action
  const queueBotSpeak = (text: string, stateForChips: ConversationState) => {
    updatedTranscript.push({
      sender: 'bot',
      text,
      timestamp: now,
      engine: event.engine || 'WebSpeech',
      state: stateForChips
    });
    actions.push({ type: 'speak', payload: { text, lang: currentLang } });
    const promptEntry = getPromptForState(stateForChips, currentLang, updatedProfile);
    actions.push({ type: 'render_chips', payload: promptEntry.chips });
  };

  // 1. Cross-Cutting Event: Explicit Language Switch
  if (event.type === 'SWITCH_LANG') {
    const newLang = (event.payload as LanguageCode) || 'mr';
    currentLang = newLang;
    updatedProfile.language = newLang;
    const promptEntry = getPromptForState(session.state, newLang, updatedProfile);
    queueBotSpeak(promptEntry.prompt, session.state);
    actions.push({ type: 'persist' });
    return {
      session: {
        ...session,
        lang: newLang,
        profile: updatedProfile,
        updated_at: now,
        transcript: updatedTranscript
      },
      actions
    };
  }

  // 2. Cross-Cutting Event: Delete Data
  if (event.type === 'DELETE_DATA') {
    logUserTurn('Delete my data');
    const promptEntry = getPromptForState('DELETED_END', currentLang, updatedProfile);
    queueBotSpeak(promptEntry.prompt, 'DELETED_END');
    actions.push({ type: 'persist' });
    return {
      session: {
        ...session,
        state: 'DELETED_END',
        previous_state: session.state,
        profile: {
          skills_interests: [],
          constraints: [],
          placement_status: 'NOT_STARTED',
          summary_confirmed: false,
          skill_gap_generated: false,
          profile_completed: false
        },
        recommendations: undefined,
        trace: undefined,
        updated_at: now,
        transcript: updatedTranscript
      },
      actions
    };
  }

  // 3. Cross-Cutting Event: Escalate to Human
  if (event.type === 'ESCALATE') {
    logUserTurn('Talk to a coordinator');
    const promptEntry = getPromptForState('ESCALATE_TO_HUMAN', currentLang, updatedProfile);
    queueBotSpeak(promptEntry.prompt, 'ESCALATE_TO_HUMAN');
    actions.push({ type: 'escalate', payload: { district: updatedProfile.district } });
    actions.push({ type: 'persist' });
    return {
      session: {
        ...session,
        state: 'ESCALATE_TO_HUMAN',
        previous_state: session.state,
        updated_at: now,
        transcript: updatedTranscript
      },
      actions
    };
  }

  // 4. Cross-Cutting Event: Repeat Current Prompt
  if (event.type === 'REPEAT') {
    const promptEntry = getPromptForState(session.state, currentLang, updatedProfile);
    queueBotSpeak(promptEntry.prompt, session.state);
    return { session, actions };
  }

  // 5. Cross-Cutting Event: Simplify Current Prompt
  if (event.type === 'SIMPLIFY') {
    const promptEntry = getPromptForState(session.state, currentLang, updatedProfile);
    queueBotSpeak(promptEntry.simplified, session.state);
    return { session, actions };
  }

  // 6. Cross-Cutting Event: Restart
  if (event.type === 'RESTART') {
    const initial = createInitialSession(currentLang);
    const promptEntry = getPromptForState('LANDING', currentLang, initial.profile);
    queueBotSpeak(promptEntry.prompt, 'LANDING');
    actions.push({ type: 'persist' });
    return { session: initial, actions };
  }

  // 7. Update Placement Event (Direct trigger from UI)
  if (event.type === 'UPDATE_PLACEMENT' && event.payload) {
    const { status, opportunityId, notes } = event.payload as {
      status: PlacementStatus;
      opportunityId?: string;
      notes?: string;
    };
    updatedProfile = updatePlacementRecord(updatedProfile, status, opportunityId, notes);
    logUserTurn(`Updated placement status: ${status}`);
    actions.push({ type: 'persist' });
    return {
      session: {
        ...session,
        profile: updatedProfile,
        updated_at: now,
        transcript: updatedTranscript
      },
      actions
    };
  }

  // 8. Check raw input for NLU Intents & Crisis Keywords
  let rawText = '';
  let chosenValue = '';

  if (event.type === 'USER_INPUT') {
    rawText = typeof event.payload === 'string' ? event.payload : event.payload?.text || '';
    logUserTurn(rawText);

    // Run NLU
    const nluResult = matchNLUIntent(rawText, getSlotNameForState(session.state), currentLang);

    // Safety crisis check
    if (nluResult.isDistressCrisis) {
      const promptEntry = getPromptForState('ESCALATE_TO_HUMAN', currentLang, updatedProfile);
      queueBotSpeak(promptEntry.prompt, 'ESCALATE_TO_HUMAN');
      actions.push({ type: 'escalate', payload: { district: updatedProfile.district } });
      actions.push({ type: 'persist' });
      return {
        session: {
          ...session,
          state: 'ESCALATE_TO_HUMAN',
          previous_state: session.state,
          updated_at: now,
          transcript: updatedTranscript
        },
        actions
      };
    }

    // Control intents from speech
    if (nluResult.controlIntent === 'repeat') {
      const promptEntry = getPromptForState(session.state, currentLang, updatedProfile);
      queueBotSpeak(promptEntry.prompt, session.state);
      return { session: { ...session, transcript: updatedTranscript }, actions };
    }
    if (nluResult.controlIntent === 'simplify') {
      const promptEntry = getPromptForState(session.state, currentLang, updatedProfile);
      queueBotSpeak(promptEntry.simplified, session.state);
      return { session: { ...session, transcript: updatedTranscript }, actions };
    }
    if (nluResult.controlIntent === 'escalate') {
      const promptEntry = getPromptForState('ESCALATE_TO_HUMAN', currentLang, updatedProfile);
      queueBotSpeak(promptEntry.prompt, 'ESCALATE_TO_HUMAN');
      actions.push({ type: 'escalate', payload: { district: updatedProfile.district } });
      actions.push({ type: 'persist' });
      return {
        session: {
          ...session,
          state: 'ESCALATE_TO_HUMAN',
          previous_state: session.state,
          updated_at: now,
          transcript: updatedTranscript
        },
        actions
      };
    }
    if (nluResult.controlIntent === 'delete_data') {
      const promptEntry = getPromptForState('DELETED_END', currentLang, updatedProfile);
      queueBotSpeak(promptEntry.prompt, 'DELETED_END');
      actions.push({ type: 'persist' });
      return {
        session: {
          ...session,
          state: 'DELETED_END',
          previous_state: session.state,
          profile: {
            skills_interests: [],
            constraints: [],
            placement_status: 'NOT_STARTED',
            summary_confirmed: false,
            skill_gap_generated: false,
            profile_completed: false
          },
          updated_at: now,
          transcript: updatedTranscript
        },
        actions
      };
    }

    chosenValue = nluResult.matchedSlotValue || rawText;

    // Multi-slot extraction for natural conversational voice utterances
    const isProfilingState = [
      'LOCATION',
      'LOCATION_MANUAL',
      'BACKGROUND',
      'FAMILY_OCCUPATION',
      'CURRENT_LIVELIHOOD',
      'SKILLS_INPUT',
      'SKILLS_INTERESTS',
      'EXPERIENCE',
      'INTERESTS',
      'ASPIRATIONS',
      'CONSTRAINTS',
      'TRAVEL_RADIUS',
      'EMPLOYMENT_PREFERENCE'
    ].includes(session.state);

    if (isProfilingState) {
      const multi = extractAllProfileSlots(rawText, currentLang);
      if (multi.slotsCount > 1) {
        if (multi.slotsFound.district) {
          updatedProfile.district = multi.slotsFound.district;
          updatedProfile.district_name_local = multi.slotsFound.district;
          updatedProfile.state = multi.slotsFound.state || updatedProfile.state || 'Maharashtra';
        }
        if (multi.slotsFound.education_level) updatedProfile.education_level = multi.slotsFound.education_level;
        if (multi.slotsFound.family_occupation) updatedProfile.family_occupation = multi.slotsFound.family_occupation;
        if (multi.slotsFound.current_livelihood) updatedProfile.current_livelihood = multi.slotsFound.current_livelihood;
        if (multi.slotsFound.skills_interests && multi.slotsFound.skills_interests.length > 0) {
          updatedProfile.skills_interests = Array.from(new Set([...updatedProfile.skills_interests, ...multi.slotsFound.skills_interests]));
        }
        if (multi.slotsFound.experience_years !== undefined) updatedProfile.experience_years = multi.slotsFound.experience_years;
        if (multi.slotsFound.constraints) updatedProfile.constraints = multi.slotsFound.constraints;
        if (multi.slotsFound.travel_radius_km) updatedProfile.travel_radius_km = multi.slotsFound.travel_radius_km;
        if (multi.slotsFound.employment_preference) updatedProfile.employment_preference = multi.slotsFound.employment_preference;

        const nextTarget = getNextUnfilledProfilingState(updatedProfile, session.state);
        nextState = nextTarget;

        const nextPrompt = getPromptForState(nextState, currentLang, updatedProfile);
        queueBotSpeak(nextPrompt.prompt, nextState);
        actions.push({ type: 'persist' });

        return {
          session: {
            ...session,
            lang: currentLang,
            state: nextState,
            previous_state: session.state,
            profile: updatedProfile,
            updated_at: now,
            transcript: updatedTranscript
          },
          actions
        };
      }
    }
  } else if (event.type === 'CHIP_CLICK') {
    chosenValue = typeof event.payload === 'string' ? event.payload : event.payload?.value || '';
    const label = event.payload?.label || chosenValue;
    logUserTurn(label);
  }

  // --- STATE TRANSITION LOGIC ---

  switch (session.state) {
    case 'LANDING': {
      nextState = 'LANG_SELECT';
      break;
    }

    case 'LANG_SELECT': {
      if (['hi', 'mr', 'bn', 'ta', 'te', 'kn', 'en'].includes(chosenValue)) {
        currentLang = chosenValue as LanguageCode;
        updatedProfile.language = currentLang;
      }
      nextState = 'GREETING';
      break;
    }

    case 'GREETING': {
      nextState = 'CONSENT';
      break;
    }

    case 'CONSENT': {
      if (chosenValue === 'no' || chosenValue.toLowerCase() === 'nahi' || chosenValue.toLowerCase() === 'nako') {
        updatedProfile.consent_given = false;
        nextState = 'DECLINED_END';
      } else {
        updatedProfile.consent_given = true;
        nextState = getNextUnfilledProfilingState(updatedProfile);
      }
      break;
    }

    case 'LOCATION': {
      if (event.type === 'LOCATION_RESOLVED' && event.payload) {
        updatedProfile.district = event.payload.district;
        updatedProfile.district_name_local = event.payload.district;
        updatedProfile.state = event.payload.state;
        updatedProfile.lat = event.payload.lat;
        updatedProfile.lng = event.payload.lng;
        updatedProfile.gps_accuracy_m = event.payload.accuracy;
        nextState = getNextUnfilledProfilingState(updatedProfile, 'LOCATION');
      } else if (chosenValue === 'manual_select' || event.type === 'LOCATION_FAILED') {
        nextState = 'LOCATION_MANUAL';
      } else if (chosenValue === 'gps_detect') {
        actions.push({ type: 'navigate', payload: { action: 'request_gps' } });
        return { session, actions };
      } else {
        updatedProfile.district = chosenValue || 'Pune';
        updatedProfile.district_name_local = chosenValue || 'पुणे';
        updatedProfile.state = 'Maharashtra';
        nextState = getNextUnfilledProfilingState(updatedProfile, 'LOCATION');
      }
      break;
    }

    case 'LOCATION_MANUAL': {
      updatedProfile.district = chosenValue || 'Pune';
      updatedProfile.district_name_local = chosenValue || 'पुणे';
      updatedProfile.state = 'Maharashtra';
      nextState = getNextUnfilledProfilingState(updatedProfile, 'LOCATION');
      break;
    }

    case 'BACKGROUND': {
      const validEdu = ['none', 'primary', 'middle', 'secondary', 'higher_secondary', 'iti_diploma', 'graduate'];
      if (validEdu.includes(chosenValue)) {
        updatedProfile.education_level = chosenValue as any;
      } else {
        updatedProfile.education_level = 'secondary';
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'BACKGROUND');
      break;
    }

    case 'FAMILY_OCCUPATION': {
      updatedProfile.family_occupation = chosenValue || 'Agriculture';
      nextState = getNextUnfilledProfilingState(updatedProfile, 'FAMILY_OCCUPATION');
      break;
    }

    case 'CURRENT_LIVELIHOOD': {
      updatedProfile.current_livelihood = chosenValue || 'Farming';
      nextState = getNextUnfilledProfilingState(updatedProfile, 'CURRENT_LIVELIHOOD');
      break;
    }

    case 'SKILLS_INPUT':
    case 'SKILLS_INTERESTS': {
      if (Array.isArray(event.payload?.values)) {
        updatedProfile.skills_interests = event.payload.values;
      } else if (chosenValue) {
        if (!updatedProfile.skills_interests.includes(chosenValue)) {
          updatedProfile.skills_interests.push(chosenValue);
        }
      }
      if (updatedProfile.skills_interests.length === 0) {
        updatedProfile.skills_interests = ['electrical'];
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'SKILLS_INPUT');
      break;
    }

    case 'EXPERIENCE': {
      const expNum = parseInt(chosenValue, 10);
      if (!isNaN(expNum)) {
        updatedProfile.experience_years = expNum;
      } else {
        updatedProfile.experience_years = 2;
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'EXPERIENCE');
      break;
    }

    case 'INTERESTS':
    case 'ASPIRATIONS': {
      updatedProfile.aspirations = chosenValue || 'Electrical Technician';
      if (!updatedProfile.skills_interests.includes(chosenValue) && chosenValue) {
        updatedProfile.skills_interests.push(chosenValue);
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'ASPIRATIONS');
      break;
    }

    case 'CONSTRAINTS': {
      updatedProfile.constraints_recorded = true;
      if (Array.isArray(event.payload?.values)) {
        updatedProfile.constraints = event.payload.values;
      } else if (chosenValue && chosenValue !== 'none') {
        updatedProfile.constraints = [chosenValue];
      } else {
        updatedProfile.constraints = [];
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'CONSTRAINTS');
      break;
    }

    case 'TRAVEL_RADIUS': {
      const radNum = parseInt(chosenValue, 10);
      if ([2, 5, 10, 25, 50].includes(radNum)) {
        updatedProfile.travel_radius_km = radNum as any;
      } else {
        updatedProfile.travel_radius_km = 10;
      }
      nextState = getNextUnfilledProfilingState(updatedProfile, 'TRAVEL_RADIUS');
      break;
    }

    case 'EMPLOYMENT_PREFERENCE': {
      if (['self_employment', 'wage_employment', 'either'].includes(chosenValue)) {
        updatedProfile.employment_preference = chosenValue as any;
      } else {
        updatedProfile.employment_preference = 'wage_employment';
      }
      nextState = 'CONFIRM_SUMMARY';
      break;
    }

    case 'CONFIRM_SUMMARY': {
      const normVal = (chosenValue || '').toLowerCase();
      if (normVal === 'revise' || normVal.includes('बदल') || event.type === 'REVISE_SLOT') {
        nextState = 'BACKGROUND'; // Allow modifying profile
      } else if (normVal === 'repeat' || normVal.includes('सांगा') || (event.type as string) === 'REPEAT') {
        nextState = 'CONFIRM_SUMMARY';
      } else {
        // User confirmed summary!
        updatedProfile.summary_confirmed = true;
        updatedProfile.profile_completed = true;
        updatedProfile.skill_gap_generated = true;

        // Run deterministic recommendation engine
        const { results, trace } = recommendNSQFTrades(updatedProfile, currentLang, session.id);
        session.recommendations = results;
        session.trace = trace;

        // Transition directly to RECOMMENDATION so beneficiary sees top NSQF recommendations first
        nextState = 'RECOMMENDATION';
      }
      break;
    }

    case 'SKILL_PASSPORT': {
      if (chosenValue === 'view_recommendations') {
        nextState = 'RECOMMENDATION';
      } else {
        nextState = 'SKILL_GAP';
      }
      break;
    }

    case 'SKILL_GAP': {
      if (chosenValue === 'back_passport') {
        nextState = 'SKILL_PASSPORT';
      } else {
        nextState = 'RECOMMENDATION';
      }
      break;
    }

    case 'RECOMMENDATION': {
      if (event.type === 'SELECT_TRADE' || chosenValue.startsWith('select_') || event.payload?.tradeId) {
        const tradeId = event.payload?.tradeId;
        if (tradeId) {
          updatedProfile.selected_trade_id = tradeId;
        } else {
          const idx = chosenValue === 'select_2' ? 1 : chosenValue === 'select_3' ? 2 : 0;
          if (session.recommendations && session.recommendations[idx]) {
            updatedProfile.selected_trade_id = session.recommendations[idx].trade.id;
          }
        }
        nextState = 'BENEFICIARY_CHOICE';
      } else {
        nextState = 'RECOMMENDATION';
      }
      break;
    }

    case 'BENEFICIARY_CHOICE': {
      nextState = 'LOCAL_OPPORTUNITY';
      break;
    }

    case 'LOCAL_OPPORTUNITY': {
      nextState = 'CENTER_AND_NEXT_STEPS';
      break;
    }

    case 'CENTER_AND_NEXT_STEPS': {
      if (chosenValue === 'yes_finance' || updatedProfile.employment_preference === 'self_employment') {
        updatedProfile.wants_finance_assistance = true;
        nextState = 'FINANCE_TRACK';
      } else {
        updatedProfile.placement_status = 'ENROLLED';
        nextState = 'TRAINING_PATHWAY';
      }
      break;
    }

    case 'FINANCE_TRACK': {
      updatedProfile.placement_status = 'SELF_EMPLOYED';
      nextState = 'PLACEMENT_LINKAGE';
      break;
    }

    case 'TRAINING_PATHWAY': {
      if (chosenValue === 'simulate_complete') {
        updatedProfile.placement_status = 'COMPLETED';
        nextState = 'PLACEMENT_LINKAGE';
      } else if (chosenValue === 'view_opportunities') {
        nextState = 'PLACEMENT_LINKAGE';
      } else {
        nextState = 'ASPIRATION_CARD';
      }
      break;
    }

    case 'PLACEMENT_LINKAGE': {
      if (chosenValue === 'apply_placement') {
        updatedProfile.placement_status = 'REFERRED';
      } else if (chosenValue === 'self_employment_credit') {
        updatedProfile.placement_status = 'SELF_EMPLOYED';
      }
      nextState = 'ASPIRATION_CARD';
      break;
    }

    case 'ASPIRATION_CARD': {
      actions.push({ type: 'emit_card', payload: { profile: updatedProfile, recommendations: session.recommendations } });
      nextState = 'SESSION_FEEDBACK';
      break;
    }

    case 'SESSION_FEEDBACK': {
      const rating = parseInt(chosenValue, 10) || 5;
      session.feedback = { rating, comment: rawText || 'Beneficiary consultation completed' };
      nextState = 'END';
      break;
    }

    case 'END':
    case 'DECLINED_END':
    case 'DELETED_END':
    case 'ESCALATE_TO_HUMAN': {
      if (chosenValue === 'restart') {
        return step(session, { type: 'RESTART' });
      }
      break;
    }

    default:
      nextState = 'LANDING';
  }

  // Queue next prompt and chips
  const nextPrompt = getPromptForState(nextState, currentLang, updatedProfile);
  queueBotSpeak(nextPrompt.prompt, nextState);
  actions.push({ type: 'persist' });

  return {
    session: {
      ...session,
      lang: currentLang,
      state: nextState,
      previous_state: session.state,
      profile: updatedProfile,
      updated_at: now,
      transcript: updatedTranscript,
      recommendations: session.recommendations,
      trace: session.trace
    },
    actions
  };
}

function getSlotNameForState(state: ConversationState): string | undefined {
  switch (state) {
    case 'BACKGROUND':
      return 'education_level';
    case 'FAMILY_OCCUPATION':
      return 'family_occupation';
    case 'CURRENT_LIVELIHOOD':
      return 'current_livelihood';
    case 'SKILLS_INPUT':
    case 'SKILLS_INTERESTS':
      return 'skills_interests';
    case 'EXPERIENCE':
      return 'experience_years';
    case 'INTERESTS':
    case 'ASPIRATIONS':
      return 'skills_interests';
    case 'CONSTRAINTS':
      return 'constraints';
    case 'TRAVEL_RADIUS':
      return 'travel_radius_km';
    case 'EMPLOYMENT_PREFERENCE':
      return 'employment_preference';
    default:
      return undefined;
  }
}
