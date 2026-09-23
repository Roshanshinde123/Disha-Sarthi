// Disha Sarathi - Centralized Translation Dictionary & i18n System (PS 26097)
import { LanguageCode } from './types';

export interface Translations {
  [key: string]: {
    mr: string;
    hi: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand & Header
  appTitle: {
    mr: 'दिशा सारथी',
    hi: 'दिशा सारथी',
    en: 'Disha Sarathi'
  },
  appSubtitle: {
    mr: 'PM-AJAY GIA घटक • व्हॉईस-आधारित कौशल्य व रोजगार मंच',
    hi: 'PM-AJAY GIA घटक • वॉयस-आधारित कौशल व आजीविका मंच',
    en: 'PM-AJAY GIA Component • Voice-first Skilling & Livelihood Platform'
  },
  authorityBanner: {
    mr: 'PM-AJAY GIA घटक • AI व्हॉईस कौशल्य व उपजीविका सहाय्य',
    hi: 'PM-AJAY GIA घटक • AI वॉयस कौशल व आजीविका सहायता',
    en: 'PM-AJAY GIA Component • AI Voice Skilling & Livelihood Assistance'
  },
  prototypeBadge: {
    mr: 'दिशा सारथी • PM-AJAY GIA प्रोटोटाइप',
    hi: 'दिशा सारथी • PM-AJAY GIA प्रोटोटाइप',
    en: 'Disha Sarathi • PM-AJAY GIA Prototype'
  },
  navHome: {
    mr: 'मुख्य पृष्ठ',
    hi: 'मुख्य पृष्ठ',
    en: 'Home'
  },
  navAbout: {
    mr: 'दिशा सारथी विषयी',
    hi: 'दिशा सारथी के बारे में',
    en: 'About'
  },
  navHowItWorks: {
    mr: 'कसे कार्य करते',
    hi: 'कैसे कार्य करता है',
    en: 'How It Works'
  },
  navHelp: {
    mr: 'मदत व FAQ',
    hi: 'सहायता व FAQ',
    en: 'Help & FAQ'
  },
  navContact: {
    mr: 'संपर्क',
    hi: 'संपर्क',
    en: 'Contact'
  },
  navLogin: {
    mr: 'लॉगिन',
    hi: 'लॉगिन',
    en: 'Login'
  },
  navLogout: {
    mr: 'लॉगआउट',
    hi: 'लॉगआउट',
    en: 'Logout'
  },
  langSelector: {
    mr: '🌐 मराठी',
    hi: '🌐 हिन्दी',
    en: '🌐 English'
  },

  // Landing Page Hero
  heroHeading: {
    mr: 'आपल्या भाषेत बोला,\nआपली कौशल्ये ओळखा,\nआणि रोजगाराची पुढची संधी शोधा.',
    hi: 'अपनी भाषा में बोलें,\nअपना हुनर पहचानें,\nऔर आजीविका का अगला अवसर पाएं।',
    en: 'Speak in your language,\nDiscover your skills,\nAnd find your next livelihood opportunity.'
  },
  heroSubheading: {
    mr: 'मातृभाषेत बोलून आपली कौशल्ये, शिक्षण आणि पसंती सांगा. NSQF-संरेखित प्रशिक्षण आणि स्थानिक उपजीविकेच्या संधी मिळवा.',
    hi: 'अपनी मातृभाषा में बोलकर शिक्षा और अनुभव साझा करें। NSQF-संरेखित प्रशिक्षण और स्थानीय आजीविका के अवसर खोजें।',
    en: 'Speak in your language. Discover your skills. Find an NSQF-aligned pathway and local livelihood opportunities.'
  },
  btnTalkToDisha: {
    mr: '🎙️ दिशा सारथीशी बोला',
    hi: '🎙️ दिशा सारथी से बात करें',
    en: '🎙️ Talk to Disha Sarathi'
  },
  btnLoginCta: {
    mr: 'लॉगिन करा',
    hi: 'लॉगिन करें',
    en: 'Login'
  },
  helplineLabel: {
    mr: 'थेट फोन कॉलिंग सहाय्यता:',
    hi: 'सीधी फोन कॉलिंग सहायता:',
    en: 'Direct Telephony Helpline:'
  },
  helplinePill: {
    mr: 'डेमो टेलिफोनी गेटवे',
    hi: 'डेमो टेलीफोनी गेटवे',
    en: 'Demo Telephony Gateway'
  },

  // Services Grid
  servicesHeading: {
    mr: 'नागरिक सेवा व मुख्य वैशिष्ट्ये',
    hi: 'नागरिक सेवाएं व मुख्य विशेषताएं',
    en: 'Citizen Services & Key Features'
  },
  serviceVoiceTitle: {
    mr: 'व्हॉईस असिस्टंट',
    hi: 'वॉयस असिस्टेंट',
    en: 'Voice Assistant'
  },
  serviceVoiceDesc: {
    mr: 'मातृभाषेत बोलून शिक्षण, कामाचा अनुभव आणि आवडीची नोंद करा. कोणत्याही क्लिष्ट फॉर्मशिवाय प्रोफाइल तयार होते.',
    hi: 'मातृभाषा में बोलकर शिक्षा और अनुभव दर्ज करें। बिना किसी फॉर्म के प्रोफाइल तैयार होती है।',
    en: 'Record your education and skills in your mother tongue. Builds your profile without complex forms.'
  },
  serviceMappingTitle: {
    mr: 'कौशल्य मॅपिंग',
    hi: 'कौशल मैपिंग',
    en: 'Skill Mapping'
  },
  serviceMappingDesc: {
    mr: 'आपल्या पारंपारिक व कौटुंबिक कौशल्यांचे NSQF मानकांनुसार वैज्ञानिक मॅपिंग आणि डिजिटल स्किल पासपोर्ट.',
    hi: 'पारंपरिक व पारिवारिक हुनर का NSQF मानकों के अनुसार मैपिंग और डिजिटल स्किल पासपोर्ट।',
    en: 'Scientific mapping of traditional and practical skills to NSQF standards and digital skill passport.'
  },
  serviceTrainingTitle: {
    mr: 'NSQF प्रशिक्षण',
    hi: 'NSQF प्रशिक्षण',
    en: 'NSQF Training'
  },
  serviceTrainingDesc: {
    mr: 'जवळपासच्या मान्यताप्राप्त प्रशिक्षण केंद्रांची माहिती, प्रवासाचे अंतर, कालावधी आणि थेट प्रवेश सहाय्य.',
    hi: 'निकटतम प्रमाणित प्रशिक्षण केंद्रों की जानकारी, दूरी, अवधि और सीधे प्रवेश सहायता।',
    en: 'Nearby accredited training centers with travel radius, course duration, and direct enrollment support.'
  },
  servicePlacementTitle: {
    mr: 'स्थानिक रोजगार',
    hi: 'स्थानीय रोजगार',
    en: 'Local Opportunities'
  },
  servicePlacementDesc: {
    mr: 'जिल्ह्यातील स्थानिक उद्योगांमधील नोकऱ्या आणि स्वयंरोजगार प्रकल्पांसाठी थेट जोडणी.',
    hi: 'जिले के स्थानीय उद्योगों में नौकरियों और स्वरोजगार परियोजनाओं से सीधा जुड़ाव।',
    en: 'Direct linkages to verified district employer job openings and self-employment initiatives.'
  },
  serviceDbtTitle: {
    mr: 'थेट लाभ व टूलकिट',
    hi: 'प्रत्यक्ष लाभ व टूलकिट',
    en: 'Direct Benefits & Toolkit'
  },
  serviceDbtDesc: {
    mr: 'PM-AJAY योजनेअंतर्गत कौशल्य टूलकिट सहाय्य, वजीफा आणि सरकारी अनुदानाचे मार्गदर्शन.',
    hi: 'PM-AJAY योजना के तहत कौशल टूलकिट सहायता, वजीफा और सरकारी अनुदान मार्गदर्शन।',
    en: 'PM-AJAY scheme guidance for skilling toolkits, stipends, and government subsidies.'
  },
  serviceCounselTitle: {
    mr: 'सुलभ समुपदेशन',
    hi: 'सरल परामर्श',
    en: 'Accessible Counselling'
  },
  serviceCounselDesc: {
    mr: 'स्मार्टफोन नसल्यास साध्या फोनवरून १८०० टोल-फ्री किंवा मिस्ड कॉलद्वारे व्हॉईसबॉट सहाय्य उपलब्ध.',
    hi: 'स्मार्टफोन न होने पर साधारण फोन से टोल-फ्री या मिस्ड कॉल द्वारा वॉयसबॉट सहायता उपलब्ध।',
    en: 'Accessible via toll-free PSTN calls and missed call voicebot without requiring a smartphone.'
  },

  // Steps
  stepsHeading: {
    mr: '४ सोप्या टप्प्यांत आपला प्रवास',
    hi: '४ आसान चरणों में आपकी यात्रा',
    en: 'Your Journey in 4 Simple Steps'
  },
  step1Title: {
    mr: '१. मातृभाषेत बोला',
    hi: '१. मातृभाषा में बोलें',
    en: '1. Speak in Your Language'
  },
  step1Desc: {
    mr: 'शिक्षण, कौशल्य आणि आवडीबद्दल मोकळेपणाने सांगा.',
    hi: 'शिक्षा, हुनर और रुचि के बारे में सरलता से बताएं।',
    en: 'Share your background, skills, and aspirations freely.'
  },
  step2Title: {
    mr: '२. स्किल पासपोर्ट मिळवा',
    hi: '२. स्किल पासपोर्ट पाएं',
    en: '2. Get Your Skill Passport'
  },
  step2Desc: {
    mr: 'आपल्या कौशल्यांचे अधिकृत डिजिटल ओळखपत्र तयार होते.',
    hi: 'आपके हुनर का आधिकारिक डिजिटल पहचान पत्र तैयार होता है।',
    en: 'Your verified digital livelihood and skilling credential.'
  },
  step3Title: {
    mr: '३. प्रशिक्षण पूर्ण करा',
    hi: '३. प्रशिक्षण पूरा करें',
    en: '3. Complete NSQF Skilling'
  },
  step3Desc: {
    mr: 'कौशल्य अंतरावर आधारित अचूक कोर्समध्ये प्रवेश घ्या.',
    hi: 'कौशल अंतर के आधार पर सही कोर्स में प्रवेश लें।',
    en: 'Enroll in targeted courses based on your skill gap.'
  },
  step4Title: {
    mr: '४. रोजगार व प्रगती',
    hi: '४. रोजगार व प्रगति',
    en: '4. Placement & Progress'
  },
  step4Desc: {
    mr: 'स्थानिक नोकरी, वेतन पडताळणी आणि निरंतर पाठपुरावा.',
    hi: 'स्थानीय नौकरी, वेतन सत्यापन और निरंतर फॉलो-अप।',
    en: 'Verified job placement with 7/30/90 day post-placement support.'
  },

  // Login View
  loginHeadline: {
    mr: 'दिशा सारथी पोर्टल लॉगिन',
    hi: 'दिशा सारथी पोर्टल लॉगिन',
    en: 'Disha Sarathi Portal Login'
  },
  roleBeneficiary: {
    mr: 'नागरिक / लाभार्थी',
    hi: 'नागरिक / लाभार्थी',
    en: 'Beneficiary'
  },
  roleCoordinator: {
    mr: 'GIA समन्वयक',
    hi: 'GIA समन्वयक',
    en: 'GIA Coordinator'
  },
  roleAdmin: {
    mr: 'प्रशासक',
    hi: 'प्रशासक',
    en: 'Administrator'
  },
  inputMobileOrUser: {
    mr: 'मोबाईल क्रमांक किंवा वापरकर्ता नाव:',
    hi: 'मोबाइल नंबर या उपयोगकर्ता नाम:',
    en: 'Mobile Number or Username:'
  },
  inputMobilePlaceholder: {
    mr: 'उदा. 9876543210 किंवा demo.beneficiary',
    hi: 'उदा. 9876543210 या demo.beneficiary',
    en: 'e.g. 9876543210 or demo.beneficiary'
  },
  inputPassword: {
    mr: 'पासवर्ड:',
    hi: 'पासवर्ड:',
    en: 'Password:'
  },
  inputPasswordPlaceholder: {
    mr: 'आपला पासवर्ड प्रविष्ट करा',
    hi: 'अपना पासवर्ड दर्ज करें',
    en: 'Enter your password'
  },
  rememberMe: {
    mr: 'लॉगिन लक्षात ठेवा',
    hi: 'लॉगिन याद रखें',
    en: 'Remember me'
  },
  forgotPassword: {
    mr: 'पासवर्ड विसरलात?',
    hi: 'पासवर्ड भूल गए?',
    en: 'Forgot Password?'
  },
  loginButton: {
    mr: 'लॉगिन करा',
    hi: 'लॉगिन करें',
    en: 'Login'
  },
  demoAccountsTitle: {
    mr: 'चाचणी खाती (Developer Demo Accounts)',
    hi: 'डेमो खाते (Developer Demo Accounts)',
    en: 'Developer Demo Accounts'
  },
  loginVisualTitle: {
    mr: 'आपली कौशल्ये,\nआपली संधी,\nआपला पुढचा टप्पा.',
    hi: 'आपका हुनर,\nआपका अवसर,\nआपका अगला कदम।',
    en: 'Your Skills,\nYour Opportunity,\nYour Next Milestone.'
  },
  loginVisualSubtitle: {
    mr: 'व्हॉईस संवाद → अचूक NSQF मॅपिंग → शाश्वत उपजीविका व प्रगती',
    hi: 'वॉयस संवाद → सटीक NSQF मैपिंग → स्थायी आजीविका व प्रगति',
    en: 'Voice Interaction → NSQF Mapping → Sustainable Livelihood'
  },

  // Beneficiary Dashboard Sidebar & Tabs
  tabOverview: {
    mr: 'मुख्य डॅशबोर्ड',
    hi: 'मुख्य डैशबोर्ड',
    en: 'Overview'
  },
  tabJourney: {
    mr: 'माझा प्रवास',
    hi: 'मेरी यात्रा',
    en: 'My Journey'
  },
  tabProfile: {
    mr: 'माझे प्रोफाईल',
    hi: 'मेरी प्रोफ़ाइल',
    en: 'My Profile'
  },
  tabSkillPassport: {
    mr: 'कौशल्य पासपोर्ट',
    hi: 'स्किल पासपोर्ट',
    en: 'Skill Passport'
  },
  tabSkillGap: {
    mr: 'कौशल्य अंतर',
    hi: 'कौशल अंतर',
    en: 'Skill Gap'
  },
  tabRecommendations: {
    mr: 'रोजगार शिफारसी',
    hi: 'रोजगार सिफारिशें',
    en: 'Recommendations'
  },
  tabTraining: {
    mr: 'प्रशिक्षण केंद्रे',
    hi: 'प्रशिक्षण केंद्र',
    en: 'Training Centers'
  },
  tabPlacement: {
    mr: 'रोजगार व पुरावा',
    hi: 'रोजगार व प्रमाण',
    en: 'Placement & Proof'
  },
  tabFollowUp: {
    mr: 'पाठपुरावा (७/३०/९० दिवस)',
    hi: 'फॉलो-अप (७/३०/९० दिन)',
    en: 'Follow-up (7/30/90 Days)'
  },
  tabFinance: {
    mr: 'किती कमावणार?',
    hi: 'कितनी कमाई होगी?',
    en: 'Income Potential'
  },
  tabAspirationCard: {
    mr: 'आकांक्षा कार्ड',
    hi: 'आकांक्षा कार्ड',
    en: 'Aspiration Card'
  },

  // Beneficiary Onboarding Card
  onboardingBadge: {
    mr: 'नवीन लाभार्थी स्वागत',
    hi: 'नए लाभार्थी का स्वागत',
    en: 'Welcome Beneficiary'
  },
  onboardingHeading: {
    mr: 'आपली प्रोफाइल तयार करूया!',
    hi: 'आइए आपकी प्रोफ़ाइल बनाएं!',
    en: "Let's Build Your Profile!"
  },
  onboardingSubtext: {
    mr: 'कोणताही फॉर्म भरण्याची गरज नाही. आपल्या भाषेत बोलून फक्त २ मिनिटांत आपली कौशल्ये, शिक्षण आणि पसंती सांगा.',
    hi: 'कोई फॉर्म भरने की जरूरत नहीं है। अपनी भाषा में बोलकर सिर्फ २ मिनट में अपनी शिक्षा और हुनर बताएं।',
    en: 'No paperwork required. Simply speak in your language to share your skills and background.'
  },
  onboardingStep1: {
    mr: '१. मूलभूत माहिती',
    hi: '१. बुनियादी जानकारी',
    en: '1. Basic Information'
  },
  onboardingStep2: {
    mr: '२. कौशल्ये व अनुभव',
    hi: '२. कौशल व अनुभव',
    en: '2. Skills & Experience'
  },
  onboardingStep3: {
    mr: '३. आवडी व मर्यादा',
    hi: '३. रुचि व प्राथमिकताएं',
    en: '3. Preferences & Constraints'
  },
  onboardingStep4: {
    mr: '४. कौशल्य अंतर',
    hi: '४. कौशल अंतर',
    en: '4. Skill Gap'
  },
  onboardingStep5: {
    mr: '५. थेट रोजगार संधी',
    hi: '५. रोजगार के अवसर',
    en: '5. Opportunities'
  },
  btnStartVoiceInterview: {
    mr: '🎙️ बोलून सुरुवात करा',
    hi: '🎙️ बोलकर शुरुआत करें',
    en: '🎙️ Start with Voice'
  },
  recommendationsLockedNotice: {
    mr: 'शिफारसी लॉक आहेत. वैयक्तिकृत शिफारसी मिळवण्यासाठी प्रथम व्हॉईस संवाद पूर्ण करा.',
    hi: 'सिफारिशें लॉक हैं। व्यक्तिगत सिफारिशों के लिए पहले वॉयस संवाद पूरा करें।',
    en: 'Recommendations are locked. Complete your voice interview first to receive personalized pathways.'
  },

  // Voice Assistant UI
  voiceStatusSpeaking: {
    mr: 'दिशा सारथी बोलत आहे...',
    hi: 'दिशा सारथी बोल रही हैं...',
    en: 'Disha Sarathi is speaking...'
  },
  voiceStatusListening: {
    mr: 'मी ऐकत आहे... मोकळेपणाने बोला',
    hi: 'मैं सुन रही हूँ... बेझिझक बोलें',
    en: "I'm listening... Speak naturally"
  },
  voiceStatusProcessing: {
    mr: 'माहिती समजून घेत आहे...',
    hi: 'जानकारी समझ रही हूँ...',
    en: 'Understanding your response...'
  },
  voiceStatusConfirming: {
    mr: 'माहितीची खात्री करा',
    hi: 'जानकारी की पुष्टि करें',
    en: 'Please confirm your details'
  },
  voiceStatusTapToSpeak: {
    mr: 'बोलण्यासाठी मायक्रोफोनवर टॅप करा',
    hi: 'बोलने के लिए माइक पर टैप करें',
    en: 'Tap microphone to speak'
  },
  voiceMicPermissionNeeded: {
    mr: 'मायक्रोफोनची परवानगी आवश्यक आहे. कृपया ब्राउझरमध्ये परवानगी द्या.',
    hi: 'माइक की अनुमति आवश्यक है। कृपया ब्राउज़र में अनुमति दें।',
    en: 'Microphone permission required. Please allow access.'
  },
  voiceTypeFallbackPlaceholder: {
    mr: 'किंवा आपले उत्तर येथे टाईप करा...',
    hi: 'या अपना उत्तर यहाँ टाइप करें...',
    en: 'Or type your answer here...'
  },
  btnSubmitText: {
    mr: 'पाठवा',
    hi: 'भेजें',
    en: 'Submit'
  },
  btnRepeat: {
    mr: '🔁 पुन्हा सांगा',
    hi: '🔁 दोहराएं',
    en: '🔁 Repeat'
  },
  btnSimplify: {
    mr: '💡 सोपे करा',
    hi: '💡 सरल करें',
    en: '💡 Simplify'
  },
  btnDeleteData: {
    mr: '🗑️ डेटा हटवा',
    hi: '🗑️ डेटा हटाएं',
    en: '🗑️ Delete Data'
  },

  // Skill Passport & Print
  passportHeading: {
    mr: 'डिजिटल कौशल्य पासपोर्ट',
    hi: 'डिजिटल स्किल पासपोर्ट',
    en: 'Digital Skill Passport'
  },
  passportMinistryTag: {
    mr: 'सामाजिक न्याय व सक्षमीकरण मंत्रालय • भारत सरकार',
    hi: 'सामाजिक न्याय व अधिकारिता मंत्रालय • भारत सरकार',
    en: 'Ministry of Social Justice & Empowerment • Government of India'
  },
  passportSchemeTag: {
    mr: 'PM-AJAY (GIA घटक) राष्ट्रीय उपजीविका व कौशल्य ओळखपत्र',
    hi: 'PM-AJAY (GIA घटक) राष्ट्रीय आजीविका व कौशल पहचान पत्र',
    en: 'PM-AJAY (GIA Component) National Livelihood & Skilling Identifier'
  },
  passportRefLabel: {
    mr: 'पासपोर्ट संदर्भ क्रमांक:',
    hi: 'पासपोर्ट संदर्भ कोड:',
    en: 'Passport Ref Code:'
  },
  passportDateLabel: {
    mr: 'नोंदणी दिनांक:',
    hi: 'पंजीकरण तिथि:',
    en: 'Registration Date:'
  },
  passportPrintBtn: {
    mr: '🖨️ पासपोर्ट मुद्रित करा / PDF सेव्ह करा',
    hi: '🖨️ पासपोर्ट प्रिंट करें / PDF सहेजें',
    en: '🖨️ Print / Save PDF'
  },
  passportNotice: {
    mr: 'दिशा सारथी द्वारे दर्शवलेले NSQF स्तर हे पीएम-अजय योजनेअंतर्गत निर्देशात्मक कौशल्य मॅपिंग आहेत.',
    hi: 'दिशा सारथी द्वारा दर्शाए गए NSQF स्तर पीएम-अजय योजना के तहत निर्देशात्मक कौशल मैपिंग हैं।',
    en: 'NSQF levels displayed are indicative skill mappings under the PM-AJAY scheme.'
  },
  sectionPersonal: {
    mr: '१. वैयक्तिक व भौगोलिक माहिती',
    hi: '१. व्यक्तिगत व भौगोलिक विवरण',
    en: '1. Personal & Location Details'
  },
  sectionEducation: {
    mr: '२. शिक्षण व कौटुंबिक पार्श्वभूमी',
    hi: '२. शिक्षा व पारिवारिक पृष्ठभूमि',
    en: '2. Education & Family Background'
  },
  sectionSkills: {
    mr: '३. नोंदवलेली कौशल्ये व अनुभव',
    hi: '३. दर्ज कौशल व अनुभव',
    en: '3. Recorded Skills & Experience'
  },
  sectionPreferences: {
    mr: '४. आवडी, मर्यादा व प्रवास क्षमता',
    hi: '४. प्राथमिकताएं, सीमाएं व यात्रा क्षमता',
    en: '4. Preferences, Constraints & Travel Radius'
  },
  sectionPathway: {
    mr: '५. NSQF-संरेखित शिफारस मार्ग',
    hi: '५. NSQF-संरेखित अनुशंसित मार्ग',
    en: '5. NSQF-Aligned Pathway'
  },
  sectionSkillGap: {
    mr: '६. कौशल्य अंतर व आवश्यक प्रशिक्षण',
    hi: '६. कौशल अंतर व आवश्यक प्रशिक्षण',
    en: '6. Skill Gap & Training Required'
  },
  sectionPlacement: {
    mr: '७. रोजगार व पडताळणी स्थिती',
    hi: '७. रोजगार व सत्यापन स्थिति',
    en: '7. Placement & Verification Status'
  },
  notProvided: {
    mr: 'नोंदवले नाही',
    hi: 'दर्ज नहीं किया',
    en: 'Not provided'
  },
  
  // Aspiration & Livelihood Card
  aspirationCardTitle: {
    mr: 'आकांक्षा व उपजीविका कार्ड',
    hi: 'आकांक्षा एवं आजीविका कार्ड',
    en: 'Aspiration & Livelihood Card'
  },
  candidateRefId: {
    mr: 'उमेदवार संदर्भ ID:',
    hi: 'उम्मीदवार संदर्भ ID:',
    en: 'Candidate Ref ID:'
  },
  candidateName: {
    mr: 'उमेदवाराचे नाव:',
    hi: 'उम्मीदवार का नाम:',
    en: 'Candidate Name:'
  },
  districtAndState: {
    mr: 'जिल्हा व राज्य:',
    hi: 'ज़िला एवं राज्य:',
    en: 'District & State:'
  },
  employmentPreference: {
    mr: 'रोजगार प्राधान्य:',
    hi: 'रोज़गार प्राथमिकता:',
    en: 'Employment Preference:'
  },
  wageEmployment: {
    mr: 'वेतन नोकरी',
    hi: 'वेतन रोज़गार',
    en: 'Wage Employment'
  },
  selfEmployment: {
    mr: 'स्वरोजगार',
    hi: 'स्वरोज़गार',
    en: 'Self-Employment'
  },
  recommendedNsqfPathway: {
    mr: '🎯 अनुशंसित NSQF मार्ग',
    hi: '🎯 अनुशंसित NSQF मार्ग',
    en: '🎯 Recommended NSQF Pathway'
  },
  skillGapsIdentified: {
    mr: '⚠️ भरून काढायची कौशल्ये:',
    hi: '⚠️ आवश्यक कौशल कमियां:',
    en: '⚠️ Identified Skill Gaps:'
  },
  nearestSkillCenter: {
    mr: '🏫 जवळचे PM-AJAY कौशल्य केंद्र:',
    hi: '🏫 निकटतम PM-AJAY कौशल केंद्र:',
    en: '🏫 Nearest PM-AJAY Skill Center:'
  },
  scanToVerify: {
    mr: '📱 स्कॅन करून पडताळा',
    hi: '📱 स्कैन करके सत्यापित करें',
    en: '📱 Scan to verify candidate'
  },
  savePng: {
    mr: '📥 PNG सेव्ह करा',
    hi: '📥 PNG सहेजें',
    en: '📥 Save PNG'
  },
  shareCard: {
    mr: '🔗 शेअर करा',
    hi: '🔗 साझा करें',
    en: '🔗 Share'
  },
  testScannedView: {
    mr: '🔍 QR चाचणी',
    hi: '🔍 QR परीक्षण',
    en: '🔍 Test Scanned View'
  },

  // Voice Input & Error Handling
  voiceNotSupported: {
    mr: 'या ब्राउझरमध्ये आवाज ओळख उपलब्ध नाही.',
    hi: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।',
    en: 'Voice input is not supported in this browser.'
  },
  voiceTryAgain: {
    mr: 'पुन्हा प्रयत्न करा',
    hi: 'पुनः प्रयास करें',
    en: 'Try Again'
  },
  typeAnswerInstead: {
    mr: 'उत्तर टाइप करा',
    hi: 'उत्तर टाइप करें',
    en: 'Type Answer Instead'
  },
  voiceMicErrorNoSpeech: {
    mr: 'काही ऐकू आले नाही. कृपया पुन्हा बोला.',
    hi: 'कुछ सुनाई नहीं दिया। कृपया पुनः प्रयास करें।',
    en: "I couldn't hear anything. Please try again."
  },
  voiceMicErrorAudioCapture: {
    mr: 'मायक्रोफोन ॲक्सेस करता आला नाही.',
    hi: 'माइक्रोफ़ोन तक नहीं पहुंचा जा सका।',
    en: 'Microphone could not be accessed.'
  },
  voiceMicErrorNetwork: {
    mr: 'आवाज ओळख सेवा अनुपलब्ध आहे.',
    hi: 'वाक् पहचान सेवा अनुपलब्ध है।',
    en: 'Speech recognition service is unavailable.'
  },
  voiceMicErrorAborted: {
    mr: 'आवाज इनपुट थांबवले.',
    hi: 'वॉयस इनपुट रोक दिया गया।',
    en: 'Voice input stopped.'
  },

  // Voice bottom controls
  btnMuteOn: {
    mr: '▶️ चालू करा',
    hi: '▶️ चालू करें',
    en: '▶️ Resume'
  },
  btnMuteOff: {
    mr: '⏸️ विराम',
    hi: '⏸️ रुकें',
    en: '⏸️ Pause'
  },
  btnShowOptions: {
    mr: '📋 पर्याय पहा',
    hi: '📋 विकल्प देखें',
    en: '📋 Options'
  },
  btnHideOptions: {
    mr: '❌ बटणे लपवा',
    hi: '❌ विकल्प छुपाएं',
    en: '❌ Hide Options'
  },
  btnEndSession: {
    mr: '⏹️ थांबवा',
    hi: '⏹️ रोकें',
    en: '⏹️ End'
  },
  voiceProgressLabel: {
    mr: 'प्रगती',
    hi: 'प्रगति',
    en: 'Progress'
  },
  voiceSaidLabel: {
    mr: 'तुम्ही म्हणालात:',
    hi: 'आपने कहा:',
    en: 'You said:'
  },
  voiceTapOptionsLabel: {
    mr: 'पर्यायी पर्याय:',
    hi: 'वैकल्पिक विकल्प:',
    en: 'Tap Options:'
  },

  // Confirmation summary (voice confirm screen)
  confirmSummaryHeading: {
    mr: 'आम्ही तुमच्याबद्दल हे समजलो आहे:',
    hi: 'हमने आपके बारे में यह जानकारी समझी है:',
    en: 'We have recorded the following profile summary:'
  },
  confirmSummaryQuestion: {
    mr: 'ही माहिती बरोबर आहे का?',
    hi: 'क्या यह जानकारी सही है?',
    en: 'Is this information correct?'
  },
  confirmSummaryYes: {
    mr: '✓ होय, माहिती बरोबर आहे',
    hi: '✓ हाँ, जानकारी सही है',
    en: '✓ Yes, Information is Correct'
  },
  confirmSummaryEdit: {
    mr: '✏️ माहिती बदलायची आहे',
    hi: '✏️ जानकारी बदलनी है',
    en: '✏️ I want to edit'
  },
  confirmFieldLocation: {
    mr: '📍 स्थान:',
    hi: '📍 स्थान:',
    en: '📍 Location:'
  },
  confirmFieldEducation: {
    mr: '🎓 शिक्षण:',
    hi: '🎓 शिक्षा:',
    en: '🎓 Education:'
  },
  confirmFieldFamilyOcc: {
    mr: '🌾 कुटुंबाचा व्यवसाय:',
    hi: '🌾 परिवार का व्यवसाय:',
    en: '🌾 Family Occupation:'
  },
  confirmFieldCurrentWork: {
    mr: '🔧 सध्याचे काम:',
    hi: '🔧 वर्तमान कार्य:',
    en: '🔧 Current Work:'
  },
  confirmFieldSkills: {
    mr: '⚡ कौशल्य/आवड:',
    hi: '⚡ कौशल/रुचि:',
    en: '⚡ Skills/Interests:'
  },
  confirmFieldExperience: {
    mr: '💼 अनुभव:',
    hi: '💼 अनुभव:',
    en: '💼 Experience:'
  },
  confirmFieldTravel: {
    mr: '🚲 प्रवासाची मर्यादा:',
    hi: '🚲 यात्रा सीमा:',
    en: '🚲 Travel Limit:'
  },
  confirmFieldEmployPref: {
    mr: '💼 रोजगार पसंती:',
    hi: '💼 रोज़गार वरीयता:',
    en: '💼 Employment Preference:'
  },
  yearsLabel: {
    mr: 'वर्षे',
    hi: 'वर्ष',
    en: 'yrs'
  },
  kmLabel: {
    mr: 'किमी',
    hi: 'किमी',
    en: 'km'
  },

  // Aspiration card extra
  aspirationCardCandidateLabel: {
    mr: 'उमेदवार',
    hi: 'उम्मीदवार',
    en: 'Candidate'
  },
  aspirationCardDuration: {
    mr: 'कालावधी:',
    hi: 'अवधि:',
    en: 'Duration:'
  },
  aspirationCardWage: {
    mr: 'वेतन श्रेणी:',
    hi: 'वेतन श्रेणी:',
    en: 'Wage Band:'
  },
  aspirationCardHours: {
    mr: 'तास',
    hi: 'घंटे',
    en: 'hrs'
  },
  aspirationCardMonth: {
    mr: '/महिना',
    hi: '/महीना',
    en: '/month'
  },
  aspirationCardStatus: {
    mr: 'स्थिती:',
    hi: 'स्थिति:',
    en: 'Status:'
  },
  aspirationCardSaveSuccess: {
    mr: '✅ आकांक्षा कार्ड PNG डाऊनलोड पूर्ण झाले!',
    hi: '✅ आकांक्षा कार्ड PNG डाउनलोड पूर्ण हुआ!',
    en: '✅ Aspiration Card PNG downloaded!'
  },
  aspirationCardSaveError: {
    mr: '❌ PNG डाऊनलोड करताना त्रुटी आली.',
    hi: '❌ PNG डाउनलोड में त्रुटि।',
    en: '❌ Error downloading PNG.'
  },
  aspirationCardShareSuccess: {
    mr: '✅ कार्ड यशस्वीरित्या शेअर केले!',
    hi: '✅ कार्ड सफलतापूर्वक साझा किया!',
    en: '✅ Card shared successfully!'
  },
  aspirationCardCopySuccess: {
    mr: '📋 सुरक्षित QR पडताळणी लिंक क्लिपबोर्डवर कॉपी केली!',
    hi: '📋 सुरक्षित QR लिंक क्लिपबोर्ड पर कॉपी हुई!',
    en: '📋 Secure QR verification link copied to clipboard!'
  },

  // Dashboard greeting & profile status

  dashboardGreetingHello: {
    mr: 'नमस्कार',
    hi: 'नमस्ते',
    en: 'Hello'
  },
  dashboardCitizen: {
    mr: 'नागरिक',
    hi: 'नागरिक',
    en: 'Citizen'
  },
  dashboardProfileComplete: {
    mr: 'प्रोफाइल पूर्णता',
    hi: 'प्रोफ़ाइल पूर्णता',
    en: 'Profile Complete'
  },
  dashboardContinueVoice: {
    mr: '🎙️ संवाद सुरू ठेवा',
    hi: '🎙️ संवाद जारी रखें',
    en: '🎙️ Continue Voice'
  },
  dashboardVerified: {
    mr: '✓ सत्यापित',
    hi: '✓ सत्यापित',
    en: '✓ Verified'
  },
  dashboardPending: {
    mr: '● अपूर्ण',
    hi: '● अपूर्ण',
    en: '● Pending'
  },
  dashboardOptionsAvailable: {
    mr: 'पर्याय उपलब्ध',
    hi: 'उपलब्ध',
    en: 'Available'
  },
  dashboardLocked: {
    mr: '🔒 लॉक',
    hi: '🔒 लॉक',
    en: '🔒 Locked'
  },
  dashboardCallNow: {
    mr: 'कॉल करा',
    hi: 'कॉल करें',
    en: 'Call Now'
  },
  dashboardEditProfile: {
    mr: '✏️ माहिती बदला',
    hi: '✏️ जानकारी बदलें',
    en: '✏️ Edit Profile'
  },
  snapLabelDistrict: {
    mr: 'स्थान (जिल्हा):',
    hi: 'ज़िला:',
    en: 'District:'
  },
  snapLabelEducation: {
    mr: 'शिक्षण:',
    hi: 'शिक्षा:',
    en: 'Education:'
  },
  snapLabelFamilyOcc: {
    mr: 'कुटुंबाचा व्यवसाय:',
    hi: 'पारिवारिक व्यवसाय:',
    en: 'Family Occupation:'
  },
  snapLabelCurrentWork: {
    mr: 'सध्याचे काम:',
    hi: 'वर्तमान कार्य:',
    en: 'Current Livelihood:'
  },
  snapLabelSkills: {
    mr: 'नोंदवलेली कौशल्ये:',
    hi: 'दर्ज कौशल:',
    en: 'Skills:'
  },
  snapLabelExperience: {
    mr: 'अनुभव:',
    hi: 'अनुभव:',
    en: 'Experience:'
  },
  snapLabelTravel: {
    mr: 'प्रवास मर्यादा:',
    hi: 'यात्रा सीमा:',
    en: 'Travel Radius:'
  },
  snapLabelEmployPref: {
    mr: 'रोजगार प्राधान्य:',
    hi: 'रोज़गार प्राथमिकता:',
    en: 'Employment Preference:'
  },
  dashboardDataPurged: {
    mr: 'आपला डेटा यशस्वीरित्या हटवला गेला आहे.',
    hi: 'आपका डेटा सफलतापूर्वक हटा दिया गया।',
    en: 'Data purged successfully.'
  },

  // Passport printable field labels
  ppLabelName: {
    mr: 'नाव:',
    hi: 'नाम:',
    en: 'Name:'
  },
  ppLabelDistrict: {
    mr: 'जिल्हा:',
    hi: 'ज़िला:',
    en: 'District:'
  },
  ppLabelState: {
    mr: 'राज्य:',
    hi: 'राज्य:',
    en: 'State:'
  },
  ppLabelComponent: {
    mr: 'घटक:',
    hi: 'घटक:',
    en: 'Component:'
  },
  ppLabelEducation: {
    mr: 'शिक्षण:',
    hi: 'शिक्षा:',
    en: 'Education:'
  },
  ppLabelFamilyOcc: {
    mr: 'कुटुंबाचा व्यवसाय:',
    hi: 'पारिवारिक व्यवसाय:',
    en: 'Family Occupation:'
  },
  ppLabelCurrentWork: {
    mr: 'सध्याचे काम:',
    hi: 'वर्तमान कार्य:',
    en: 'Current Livelihood:'
  },
  ppLabelExperience: {
    mr: 'अनुभव:',
    hi: 'अनुभव:',
    en: 'Experience:'
  },
  ppLabelRecordedSkills: {
    mr: 'नोंदवलेली कौशल्ये:',
    hi: 'दर्ज कौशल:',
    en: 'Recorded Skills:'
  },
  ppLabelTraditionalSkills: {
    mr: 'पारंपारिक कौशल्य क्षमता:',
    hi: 'पारंपरिक कौशल:',
    en: 'Traditional Background:'
  },
  ppLabelEmployPref: {
    mr: 'रोजगार पसंती:',
    hi: 'रोज़गार पसंद:',
    en: 'Employment Preference:'
  },
  ppLabelTravel: {
    mr: 'प्रवासाची मर्यादा:',
    hi: 'यात्रा सीमा:',
    en: 'Travel Radius:'
  },
  ppLabelConstraints: {
    mr: 'मर्यादा:',
    hi: 'बाध्यताएं:',
    en: 'Constraints:'
  },
  ppNoConstraints: {
    mr: 'कोणतीही अडचण नाही',
    hi: 'कोई बाधा नहीं',
    en: 'None'
  },
  ppLabelRecommendedTrade: {
    mr: 'शिफारस केलेला ट्रेड:',
    hi: 'अनुशंसित ट्रेड:',
    en: 'Recommended Trade:'
  },
  ppLabelSector: {
    mr: 'क्षेत्र:',
    hi: 'क्षेत्र:',
    en: 'Sector:'
  },
  ppLabelNsqfLevel: {
    mr: 'NSQF स्तर:',
    hi: 'NSQF स्तर:',
    en: 'NSQF Level:'
  },
  ppLabelDuration: {
    mr: 'कालावधी:',
    hi: 'अवधि:',
    en: 'Duration:'
  },
  ppLabelWageBand: {
    mr: 'अनुमानित उत्पन्न:',
    hi: 'अनुमानित आय:',
    en: 'Typical Wage Band:'
  },
  ppLabelTrainingModules: {
    mr: 'आवश्यक प्रशिक्षण मॉड्यूल्स:',
    hi: 'आवश्यक प्रशिक्षण मॉड्यूल:',
    en: 'Required Training Modules:'
  },
  ppDefaultTrainingModules: {
    mr: 'NSQF मानक प्रात्यक्षिक प्रशिक्षण व सुरक्षा नियम',
    hi: 'NSQF मानक व्यावहारिक प्रशिक्षण एवं सुरक्षा',
    en: 'NSQF standard practical training and safety rules'
  },
  ppLabelTrainingStatus: {
    mr: 'प्रशिक्षण स्थिती:',
    hi: 'प्रशिक्षण स्थिति:',
    en: 'Training Status:'
  },
  ppLabelPlacementStatus: {
    mr: 'रोजगार स्थिती:',
    hi: 'रोज़गार स्थिति:',
    en: 'Placement Status:'
  },
  ppLabelVerification: {
    mr: 'पडताळणी पातळी:',
    hi: 'सत्यापन स्तर:',
    en: 'Verification Level:'
  },
  ppLabelProgress: {
    mr: '● प्रगती:',
    hi: '● प्रगति:',
    en: '● Progress:'
  },
  ppNoticeLabel: {
    mr: 'नोंद:',
    hi: 'सूचना:',
    en: 'Notice:'
  },

  // RecommendationView
  noRecommendationsYet: {
    mr: 'शिफारसी अद्याप उपलब्ध नाहीत',
    hi: 'सिफारिशें अभी उपलब्ध नहीं हैं',
    en: 'No Recommendations Yet'
  },
  heroProfileCompleteSubtext: {
    mr: 'आपला व्हॉईस संवाद पूर्ण झाला आहे. खाली आपले कौशल्य पासपोर्ट व शिफारस केलेले ट्रेड्स तपासा.',
    hi: 'आपका वॉयस संवाद पूर्ण हो चुका है। नीचे अपना स्किल पासपोर्ट और अनुशंसित ट्रेड्स देखें।',
    en: 'Your voice profiling is complete. View your Skill Passport and recommended trades below.'
  },

  // Profile & Verification Views
  profileTitle: {
    mr: 'लाभार्थी प्रोफाइल व प्राधान्ये',
    hi: 'लाभार्थी प्रोफ़ाइल व प्राथमिकताएं',
    en: 'Beneficiary Profile & Preferences'
  },
  profileSub: {
    mr: 'तुमची कौशल्ये, शिक्षण, कौटुंबिक व्यवसाय व कामाच्या प्राधान्यांची अचूक माहिती व्यवस्थापित करा.',
    hi: 'अपनी शिक्षा, कौशल, पारिवारिक व्यवसाय और कार्य प्राथमिकताओं का प्रबंधन करें।',
    en: 'Manage your skills, education, family background, and employment preferences.'
  },
  labelFullName: {
    mr: 'पूर्ण नाव',
    hi: 'पूरा नाम',
    en: 'Full Name'
  },
  labelDistrict: {
    mr: 'जिल्हा',
    hi: 'ज़िला',
    en: 'District'
  },
  labelPhone: {
    mr: 'मोबाईल नंबर',
    hi: 'मोबाइल नंबर',
    en: 'Mobile Number'
  },
  labelEducation: {
    mr: 'शिक्षण पात्रता',
    hi: 'शिक्षा योग्यता',
    en: 'Education Level'
  },
  labelFamilyOcc: {
    mr: 'कौटुंबिक / पारंपरिक व्यवसाय',
    hi: 'पारिवारिक / पारंपरिक व्यवसाय',
    en: 'Family / Traditional Occupation'
  },
  labelCurrentWork: {
    mr: 'सध्याचे काम व रोजंदारी',
    hi: 'वर्तमान कार्य व आजीविका',
    en: 'Current Livelihood'
  },
  labelTravelRadius: {
    mr: 'प्रवास मर्यादा',
    hi: 'यात्रा सीमा',
    en: 'Travel Radius'
  },
  labelEmployPref: {
    mr: 'कामाचे प्राधान्य',
    hi: 'कार्य प्राथमिकता',
    en: 'Employment Preference'
  },
  labelSkillsInterests: {
    mr: 'विद्यमान कौशल्ये व आवडी',
    hi: 'विद्यमान कौशल व रुचियां',
    en: 'Skills & Interests'
  },
  btnSaveProfile: {
    mr: '💾 प्रोफाइल जतन करा',
    hi: '💾 प्रोफ़ाइल सहेजें',
    en: '💾 Save Profile'
  },
  naturalVoiceProfileTitle: {
    mr: '🎙️ नैसर्गिक संभाषणातून प्रोफाइल भरा',
    hi: '🎙️ प्राकृतिक बातचीत से प्रोफ़ाइल भरें',
    en: '🎙️ Fill Profile via Natural Voice'
  },
  naturalVoiceProfileSub: {
    mr: 'उदा: "माझं शिक्षण १०वी आहे, मी शेती करतो, मला नोकरी हवी आहे."',
    hi: 'उदा: "मेरी शिक्षा १०वीं है, मैं खेती करता हूँ, मुझे नौकरी चाहिए।"',
    en: 'e.g. "I studied until 10th standard, work in agriculture, and want a job."'
  },
  submittedProofsHeading: {
    mr: '📑 सादर केलेले रुजू पुरावे',
    hi: '📑 प्रस्तुत सत्यापन दस्तावेज़',
    en: '📑 Submitted Placement Proofs'
  },
  submittedProofsSub: {
    mr: 'अपलोड केलेले पुरावे GIA समन्वयकाद्वारे तपासले जातात.',
    hi: 'अपलोड किए गए दस्तावेज़ GIA समन्वयक द्वारा सत्यापित किए जाते हैं।',
    en: 'Submitted proofs are verified by GIA Coordinators.'
  },
  newProofBtn: {
    mr: '📄 + नवीन पुरावा सादर करा',
    hi: '📄 + नया दस्तावेज़ जमा करें',
    en: '📄 + Submit New Proof'
  },
  noProofsYet: {
    mr: 'अद्याप कोणताही रुजू पुरावा सादर केलेला नाही.',
    hi: 'अभी तक कोई सत्यापन दस्तावेज़ जमा नहीं किया गया है।',
    en: 'No placement proof submitted yet.'
  },
  localOppsHeading: {
    mr: '💼 स्थानिक रोजगार व सूक्ष्म-उद्यम संधी',
    hi: '💼 स्थानीय रोज़गार एवं सूक्ष्म-उद्यम अवसर',
    en: '💼 Local Employment & Enterprise Opportunities'
  },
  localOppsSub: {
    mr: 'थेट स्थानिक नियोक्त्यांशी व NSFDC/Mudra योजनांशी जोडा.',
    hi: 'सीधे स्थानीय नियोक्ताओं एवं NSFDC/Mudra योजनाओं से जुड़ें।',
    en: 'Direct linkages to local employers and NSFDC/Mudra schemes.'
  },
  linkageRecorded: {
    mr: '✓ लिंकेज नोंदवले',
    hi: '✓ लिंकेज दर्ज किया गया',
    en: '✓ Linkage Recorded'
  },
  selectSelfEmp: {
    mr: '🏪 स्वरोजगार सहाय्यासाठी निवडा →',
    hi: '🏪 स्वरोज़गार सहायता हेतु चुनें →',
    en: '🏪 Select for Self-Employment →'
  },
  selectWageEmp: {
    mr: '🤝 रोजगार रेफरल / मुलाखत नोंदवा →',
    hi: '🤝 रोज़गार रेफरल / साक्षात्कार दर्ज करें →',
    en: '🤝 Register Employment Referral →'
  },
  followupTrackerBtn: {
    mr: '📋 ७/३०/९० दिवसांचा पाठपुरावा →',
    hi: '📋 ७/३०/९० दिनों का फॉलो-अप →',
    en: '📋 7/30/90-Day Follow-Up Tracker →'
  },
  viewAspirationCardBtn: {
    mr: '🪪 आकांक्षा कार्ड व QR पहा →',
    hi: '🪪 आकांक्षा कार्ड एवं QR देखें →',
    en: '🪪 View Aspiration Card & QR →'
  },
  resumeCardHeading: {
    mr: 'दिशा सारथी आकांक्षा कार्ड',
    hi: 'दिशा सारथी आकांक्षा कार्ड',
    en: 'Disha Sarathi Aspiration Card'
  },
  resumeCardSub: {
    mr: 'PM-AJAY GIA घटक • प्रमाणित उमेदवार सारांश',
    hi: 'PM-AJAY GIA घटक • सत्यापित उम्मीदवार सारांश',
    en: 'PM-AJAY GIA Component • Verified Candidate Summary'
  },
  resumeCardNotice: {
    mr: 'ℹ️ हे कार्ड PM-AJAY GIA अंतर्गत सूचक कौशल्य मॅपिंग दर्शवते.',
    hi: 'ℹ️ यह कार्ड PM-AJAY GIA के तहत निर्देशात्मक कौशल मैपिंग दर्शाता है।',
    en: 'ℹ️ This card represents indicative skill mapping under PM-AJAY GIA.'
  },
  qrVerifiedCandidate: {
    mr: '✓ QR द्वारे पडताळलेला उमेदवार',
    hi: '✓ QR द्वारा सत्यापित उम्मीदवार',
    en: '✓ QR Verified Candidate'
  },
  qrValidationFailed: {
    mr: 'QR कोड पडताळणी अयशस्वी',
    hi: 'QR कोड सत्यापन विफल',
    en: 'QR Code Verification Failed'
  },
  qrInvalidToken: {
    mr: '⚠️ अवैध किंवा गहाळ QR कोड टोकन.',
    hi: '⚠️ अवैध या अनुपलब्ध QR कोड टोकन।',
    en: '⚠️ Invalid or missing QR code token.'
  },
  loadingCard: {
    mr: 'प्रमाणित कार्ड लोड होत आहे...',
    hi: 'प्रमाणित कार्ड लोड हो रहा है...',
    en: 'Loading verified card...'
  },
  verifyingToken: {
    mr: 'QR कोड टोकन पडताळणी सुरू आहे.',
    hi: 'QR कोड टोकन सत्यापन जारी है।',
    en: 'Verifying QR code token...'
  },

  // VoiceConversationView
  roadmapTitle: {
    mr: '🚀 संभाषण प्रगती रोडमॅप',
    hi: '🚀 बातचीत प्रगति रोडमैप',
    en: '🚀 Conversation Roadmap'
  },
  roadmapState: {
    mr: 'स्थिती:',
    hi: 'स्थिति:',
    en: 'Status:'
  },
  stepProfile: {
    mr: '१. प्रोफाईल',
    hi: '१. प्रोफ़ाइल',
    en: '1. Profile'
  },
  stepSkills: {
    mr: '२. कौशल्य',
    hi: '२. कौशल',
    en: '2. Skills'
  },
  stepSkillGap: {
    mr: '३. कौशल्य अंतर',
    hi: '३. कौशल अंतर',
    en: '3. Skill Gap'
  },
  stepPathway: {
    mr: '४. NSQF मार्ग',
    hi: '४. NSQF मार्ग',
    en: '4. NSQF Pathway'
  },
  stepLocalOpps: {
    mr: '५. स्थानिक संधी',
    hi: '५. स्थानीय अवसर',
    en: '5. Local Opportunities'
  },
  stepTraining: {
    mr: '६. प्रशिक्षण केंद्र',
    hi: '६. प्रशिक्षण केंद्र',
    en: '6. Training Center'
  },
  stepPlacement: {
    mr: '७. रोजगार',
    hi: '७. रोज़गार',
    en: '7. Placement'
  },
  liveExtractedTitle: {
    mr: '🧠 लाइव्ह ओळखलेली माहिती',
    hi: '🧠 लाइव पहचान की गई जानकारी',
    en: '🧠 Live Extracted Information'
  },
  liveLabelName: {
    mr: 'नाव:',
    hi: 'नाम:',
    en: 'Name:'
  },
  liveLabelDistrict: {
    mr: 'जिल्हा व स्थान:',
    hi: 'ज़िला व स्थान:',
    en: 'District & Location:'
  },
  liveLabelEducation: {
    mr: 'शिक्षण:',
    hi: 'शिक्षा:',
    en: 'Education:'
  },
  liveLabelWork: {
    mr: 'पारंपारिक / सध्याचे काम:',
    hi: 'पारंपरिक / वर्तमान कार्य:',
    en: 'Work:'
  },
  liveLabelSkills: {
    mr: 'ओळखलेली कौशल्ये:',
    hi: 'पहचाने गए कौशल:',
    en: 'Identified Skills:'
  },
  liveLabelEmployPref: {
    mr: 'रोजगार प्राधान्य:',
    hi: 'रोज़गार प्राथमिकता:',
    en: 'Employment Preference:'
  },
  nextStepsTitle: {
    mr: 'पुढील टप्पे:',
    hi: 'अगले चरण:',
    en: 'Next Steps:'
  },
  btnViewSkillPassport: {
    mr: '📄 माझा स्किल पासपोर्ट पहा →',
    hi: '📄 मेरा स्किल पासपोर्ट देखें →',
    en: '📄 View My Skill Passport →'
  },
  btnViewRecommendations: {
    mr: '🎯 ३ सर्वोत्तम कौशल्य शिफारसी →',
    hi: '🎯 ३ सर्वोत्तम कौशल सिफारिशें →',
    en: '🎯 3 Top Skill Recommendations →'
  },
  btnViewJourney: {
    mr: '🗺️ माझा संपूर्ण प्रवास →',
    hi: '🗺️ मेरी पूरी यात्रा →',
    en: '🗺️ View Full Journey →'
  },

  // TrainingView
  trainingHeader: {
    mr: '🏫 कौशल्य प्रशिक्षण केंद्र व बॅच',
    hi: '🏫 कौशल प्रशिक्षण केंद्र व बैच',
    en: '🏫 Skill Training Center & Batches'
  },
  trainingSub: {
    mr: 'तुमच्या जिल्ह्यातील अधिकृत प्रशिक्षण केंद्र, बॅच वेळापत्रक व विद्यावेतन सहाय्य.',
    hi: 'आपके जिले का अधिकृत प्रशिक्षण केंद्र, बैच समय सारणी व वजीफा सहायता।',
    en: 'Accredited training centers, batch schedules, and stipend support in your district.'
  },
  trainingProgressTitle: {
    mr: '🚦 प्रशिक्षण प्रगती स्थिती',
    hi: '🚦 प्रशिक्षण प्रगति स्थिति',
    en: '🚦 Training Progress Tracker'
  },
  btnStartTraining: {
    mr: '▶ प्रशिक्षण सुरू नोंदवा',
    hi: '▶ प्रशिक्षण शुरू दर्ज करें',
    en: '▶ Register Training Start'
  },
  btnCompleteTraining: {
    mr: '🎓 प्रशिक्षण पूर्णता नोंदवा',
    hi: '🎓 प्रशिक्षण पूर्णता दर्ज करें',
    en: '🎓 Register Training Completion'
  },
  trainingCompletedSuccess: {
    mr: '✅ प्रशिक्षण यशस्वीरित्या पूर्ण झाले व NSQF प्रमाणपत्र जारी झाले!',
    hi: '✅ प्रशिक्षण सफलतापूर्वक पूरा हुआ और NSQF प्रमाण पत्र जारी हुआ!',
    en: '✅ Training successfully completed and NSQF Certificate issued!'
  },
  selectedTradeTitle: {
    mr: '🎯 निवडलेला NSQF कोर्स तपशील',
    hi: '🎯 चुना हुआ NSQF कोर्स विवरण',
    en: '🎯 Selected NSQF Course Details'
  },
  durationHoursLabel: {
    mr: 'कालावधी:',
    hi: 'अवधि:',
    en: 'Duration:'
  },
  expectedWageBandLabel: {
    mr: 'अपेक्षित वेतन श्रेणी:',
    hi: 'अपेक्षित वेतन श्रेणी:',
    en: 'Expected Wage Band:'
  },
  minEducationLabel: {
    mr: 'किमान पात्रता:',
    hi: 'न्यूनतम योग्यता:',
    en: 'Min Qualification:'
  },
  centerInfoTitle: {
    mr: '🏫 अधिकृत प्रशिक्षण केंद्र माहिती',
    hi: '🏫 अधिकृत प्रशिक्षण केंद्र जानकारी',
    en: '🏫 Official Training Center Information'
  },
  nodalContactLabel: {
    mr: 'नोडल संपर्क:',
    hi: 'नोडल संपर्क:',
    en: 'Nodal Contact:'
  },
  distanceLabel: {
    mr: 'अंतर:',
    hi: 'दूरी:',
    en: 'Distance:'
  },
  nextBatchLabel: {
    mr: 'पुढील बॅच सुरू:',
    hi: 'अगला बैच प्रारंभ:',
    en: 'Next Batch Starts:'
  },
  nextBatchValue: {
    mr: 'दर महिन्याच्या १ व १५ तारखेला',
    hi: 'हर महीने की १ और १५ तारीख को',
    en: '1st & 15th of every month'
  },
  giaBenefitsTitle: {
    mr: '🎁 पीएम-अजय जीआयए घटक लाभ',
    hi: '🎁 पीएम-अजय जीआईए घटक लाभ',
    en: '🎁 PM-AJAY GIA Component Benefits'
  },
  giaBenefit1Title: {
    mr: '1. १००% मोफत प्रशिक्षण:',
    hi: '1. १००% मुफ्त प्रशिक्षण:',
    en: '1. 100% Free Training:'
  },
  giaBenefit1Desc: {
    mr: 'कोणतेही नोंदणी शुल्क नाही. केंद्र सरकारकडून पूर्ण अर्थसहाय्य.',
    hi: 'कोई पंजीकरण शुल्क नहीं। केंद्र सरकार द्वारा पूर्ण सहायता।',
    en: 'Zero enrollment fee. Fully funded by Central Government.'
  },
  giaBenefit2Title: {
    mr: '2. मोफत टूल-किट अनुदान:',
    hi: '2. मुफ्त टूल-किट अनुदान:',
    en: '2. Free Tool-kit Grant:'
  },
  giaBenefit2Desc: {
    mr: 'कोर्स पूर्ण झाल्यावर ₹10,000 किमतीची व्यावसायिक अवजारे मोफत.',
    hi: 'कोर्स पूरा होने पर ₹10,000 मूल्य के उपकरण मुफ्त।',
    en: 'Free professional toolkit worth ₹10,000 upon course completion.'
  },
  giaBenefit3Title: {
    mr: '3. मासिक स्टाइपेंड:',
    hi: '3. मासिक वजीफा:',
    en: '3. Monthly Stipend:'
  },
  giaBenefit3Desc: {
    mr: 'हजेरीनुसार मासिक ₹2,000 थेट बँक खात्यात.',
    hi: 'उपस्थिति के आधार पर ₹2,000 प्रति माह सीधे बैंक खाते में।',
    en: 'Attendance-linked monthly stipend of ₹2,000 directly to bank account.'
  },
  btnGoToPlacement: {
    mr: '💼 स्थानिक रोजगार व पुरावा सादर करा →',
    hi: '💼 स्थानीय रोज़गार व प्रमाण जमा करें →',
    en: '💼 Local Placement & Proof Submission →'
  }
};



/**
 * Helper to get clean translated string for a given key and language.
 * Falls back to English if key or lang is missing.
 */
export function t(key: string, lang: LanguageCode = 'mr'): string {
  const item = DICTIONARY[key];
  if (!item) return key;
  const langKey = (lang === 'mr' || lang === 'hi' || lang === 'en') ? lang : 'mr';
  return item[langKey] || item.mr || item.en || key;
}

/**
 * Helper to get clean language label for selector dropdown
 */
export function getLanguageDisplay(lang: LanguageCode): string {
  switch (lang) {
    case 'mr':
      return '🌐 मराठी';
    case 'hi':
      return '🌐 हिन्दी';
    case 'en':
      return '🌐 English';
    default:
      return '🌐 मराठी';
  }
}
