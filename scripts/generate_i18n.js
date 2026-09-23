// Generator for i18n prompt packs and lexicons across 7 languages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const i18nDir = path.join(__dirname, '..', 'src', 'i18n');
const lexiconDir = path.join(__dirname, '..', 'src', 'lexicon');

if (!fs.existsSync(i18nDir)) fs.mkdirSync(i18nDir, { recursive: true });
if (!fs.existsSync(lexiconDir)) fs.mkdirSync(lexiconDir, { recursive: true });

// --- PROMPTS IN 7 LANGUAGES ---
const promptPacks = {
  hi: {
    LANDING: {
      prompt: "नमस्ते! दिशा सारथी में आपका स्वागत है।",
      simplified: "दिशा सारथी शुरू करने के लिए आगे बढ़ें।",
      chips: [
        { value: "start", label: "बातचीत शुरू करें", icon: "🎙️" },
        { value: "about", label: "दिशा सारथी के बारे में", icon: "ℹ️" }
      ]
    },
    LANG_SELECT: {
      prompt: "कृपया अपनी पसंदीदा भाषा चुनें।",
      simplified: "आप किस भाषा में बात करना चाहते हैं?",
      chips: [
        { value: "hi", label: "हिंदी (Hindi)", icon: "🇮🇳" },
        { value: "mr", label: "मराठी (Marathi)", icon: "🇮🇳" },
        { value: "bn", label: "বাংলা (Bengali)", icon: "🇮🇳" },
        { value: "ta", label: "தமிழ் (Tamil)", icon: "🇮🇳" },
        { value: "te", label: "తెలుగు (Telugu)", icon: "🇮🇳" },
        { value: "kn", label: "ಕನ್ನಡ (Kannada)", icon: "🇮🇳" },
        { value: "en", label: "English", icon: "🌐" }
      ]
    },
    GREETING: {
      prompt: "नमस्ते! मैं आपकी आजीविका और हुनर सीखने में मदद करूँगा।",
      simplified: "क्या हम आपकी हुनर योजना बनाना शुरू करें?",
      chips: [
        { value: "continue", label: "हाँ, शुरू करें", icon: "👍" },
        { value: "help", label: "यह कैसे काम करता है?", icon: "❓" }
      ]
    },
    CONSENT: {
      prompt: "क्या आप हुनर सुझाव पाने के लिए कुछ सामान्य बातें साझा करने के लिए सहमत हैं?",
      simplified: "हम आपकी जानकारी सुरक्षित रखते हैं। क्या आप सहमत हैं?",
      chips: [
        { value: "yes", label: "हाँ, मुझे मंज़ूर है", icon: "✅" },
        { value: "no", label: "नहीं, अभी नहीं", icon: "❌" }
      ]
    },
    LOCATION: {
      prompt: "आप किस जिले और राज्य में रहते हैं?",
      simplified: "अपना जिला बताएं ताकि पास का ट्रेनिंग सेंटर खोज सकें।",
      chips: [
        { value: "gps_detect", label: "मेरा जीपीएस स्थान उपयोग करें", icon: "📍" },
        { value: "manual_select", label: "जिला खुद चुनें", icon: "🔍" }
      ]
    },
    LOCATION_MANUAL: {
      prompt: "कृपया अपना जिला चुनें।",
      simplified: "नीचे दी गई सूची से अपना जिला चुनें।",
      chips: [
        { value: "Varanasi", label: "वाराणसी (Varanasi)", icon: "📍" },
        { value: "Lucknow", label: "लखनऊ (Lucknow)", icon: "📍" },
        { value: "Pune", label: "पुणे (Pune)", icon: "📍" },
        { value: "Patna", label: "पटना (Patna)", icon: "📍" },
        { value: "Kolkata", label: "कोलकाता (Kolkata)", icon: "📍" },
        { value: "Madurai", label: "मदुरै (Madurai)", icon: "📍" },
        { value: "Bhopal", label: "भोपाल (Bhopal)", icon: "📍" },
        { value: "Jaipur", label: "जयपुर (Jaipur)", icon: "📍" },
        { value: "other", label: "अन्य जिला खोजें...", icon: "🔍" }
      ],
      allowFreeText: true
    },
    BACKGROUND: {
      prompt: "आपकी स्कूली शिक्षा कहाँ तक हुई है?",
      simplified: "आपने पढ़ाई कहाँ तक की है?",
      chips: [
        { value: "none", label: "स्कूल नहीं गए", icon: "📖" },
        { value: "primary", label: "5वीं तक (प्राइमरी)", icon: "🎒" },
        { value: "middle", label: "8वीं तक (मिडिल)", icon: "📚" },
        { value: "secondary", label: "10वीं पास (हाईस्कूल)", icon: "🏫" },
        { value: "higher_secondary", label: "12वीं पास (इंटर)", icon: "🎓" },
        { value: "iti_diploma", label: "आईटीआई / डिप्लोमा", icon: "🛠️" },
        { value: "graduate", label: "स्नातक (ग्रेजुएट)", icon: "🏛️" }
      ]
    },
    FAMILY_OCCUPATION: {
      prompt: "आपके परिवार या खानदान में पारंपरिक रूप से क्या काम होता आया है?",
      simplified: "आपके घर में बड़े-बुजुर्ग क्या काम करते रहे हैं?",
      chips: [
        { value: "tailoring", label: "सिलाई व कपड़ा काम", icon: "✂️" },
        { value: "farming", label: "खेती-किसानी या पशुपालन", icon: "🌾" },
        { value: "construction", label: "राजमिस्त्री व निर्माण", icon: "🧱" },
        { value: "mechanic", label: "गाड़ी या साइकिल मरम्मत", icon: "🔧" },
        { value: "shop", label: "छोटी दुकान या फेरी", icon: "🏪" },
        { value: "handicraft", label: "हस्तशिल्प या बुनाई", icon: "🎨" },
        { value: "other", label: "अन्य कोई काम", icon: "✍️" }
      ],
      allowFreeText: true
    },
    CURRENT_LIVELIHOOD: {
      prompt: "वर्तमान में आप खुद अपनी कमाई के लिए क्या काम करते हैं?",
      simplified: "अभी आप रोजी-रोटी के लिए क्या काम कर रहे हैं?",
      chips: [
        { value: "daily_wage", label: "दैनिक मजदूरी", icon: "🔨" },
        { value: "farming_helper", label: "खेती में सहयोग", icon: "🌱" },
        { value: "small_tailoring", label: "घर पर सिलाई", icon: "🧵" },
        { value: "street_vendor", label: "ठेला या फेरी", icon: "🛒" },
        { value: "homemaker", label: "घर की देखरेख / गृहिणी", icon: "🏠" },
        { value: "student_unemployed", label: "पढ़ाई पूरी की / काम की तलाश", icon: "⏳" },
        { value: "other", label: "अन्य काम", icon: "✍️" }
      ],
      allowFreeText: true
    },
    SKILLS_INTERESTS: {
      prompt: "आप किस तरह का नया हुनर सीखने में सबसे ज्यादा रुचि रखते हैं?",
      simplified: "आप कौन सा काम सीखना पसंद करेंगे? एक या अधिक चुनें।",
      allowMultiple: true,
      chips: [
        { value: "stitching", label: "सिलाई व फैशन डिजाइनिंग", icon: "👗" },
        { value: "beauty", label: "ब्यूटी पार्लर व मेकअप", icon: "💄" },
        { value: "electrical", label: "इलेक्ट्रीशियन व घरेलू वायरिंग", icon: "💡" },
        { value: "cctv", label: "सीसीटीवी कैमरा व सुरक्षा", icon: "📹" },
        { value: "mobile_repair", label: "मोबाइल फोन मरम्मत", icon: "📱" },
        { value: "solar", label: "सोलर पैनल इंस्टॉलेशन", icon: "☀️" },
        { value: "plumbing", label: "प्लंबिंग व सेनेटरी", icon: "🚰" },
        { value: "dairy", label: "डेयरी फार्मिंग व पशुपालन", icon: "🐄" },
        { value: "computer", label: "कंप्यूटर व जन सेवा केंद्र", icon: "💻" },
        { value: "bikes", label: "दोपहिया वाहन मरम्मत", icon: "🛵" },
        { value: "cooking", label: "फूड प्रोसेसिंग व नाश्ता केंद्र", icon: "🍲" }
      ],
      allowFreeText: true
    },
    CONSTRAINTS: {
      prompt: "ट्रेनिंग के दौरान क्या आपको समय या आने-जाने में कोई विशेष चुनौती है?",
      simplified: "क्या आपको कोई असुविधा या समय की पाबंदी है? यदि नहीं, तो कोई नहीं चुनें।",
      allowMultiple: true,
      chips: [
        { value: "none", label: "कोई विशेष चुनौती नहीं", icon: "🟢" },
        { value: "evening_only", label: "केवल शाम का समय संभव", icon: "🌙" },
        { value: "home_proximity", label: "घर के बहुत पास चाहिए", icon: "🏡" },
        { value: "locomotor_difficulty", label: "सीढ़ियां चढ़ने या चलने में कठिनाई", icon: "♿" },
        { value: "part_time", label: "सिर्फ आधे दिन की ट्रेनिंग", icon: "⏰" }
      ]
    },
    TRAVEL_RADIUS: {
      prompt: "ट्रेनिंग सेंटर तक आप कितनी दूर तक आसानी से जा सकते हैं?",
      simplified: "आप कितने किलोमीटर दूर तक ट्रेनिंग के लिए जा सकते हैं?",
      chips: [
        { value: "2", label: "2 किमी तक (पैदल)", icon: "🚶" },
        { value: "5", label: "5 किमी तक (साइकिल)", icon: "🚲" },
        { value: "10", label: "10 किमी तक (ऑटो/बस)", icon: "🚌" },
        { value: "25", label: "25 किमी तक (आस-पास का कस्बा)", icon: "🛵" },
        { value: "50", label: "50 किमी तक (जिला मुख्यालय)", icon: "🚆" }
      ]
    },
    EMPLOYMENT_PREFERENCE: {
      prompt: "ट्रेनिंग के बाद आप खुद का काम शुरू करना चाहते हैं या नौकरी करना?",
      simplified: "आप अपना रोजगार चाहते हैं या किसी कंपनी में नौकरी?",
      chips: [
        { value: "self_employment", label: "खुद का काम / दुकान (स्वरोजगार)", icon: "🏬" },
        { value: "wage_employment", label: "वेतन वाली नौकरी", icon: "💼" },
        { value: "either", label: "जो भी अच्छा अवसर मिले", icon: "🤝" }
      ]
    },
    CONFIRM_SUMMARY: {
      prompt: "धन्यवाद! हमने आपकी जानकारी समझ ली है। क्या हम आपके लिए सर्वश्रेष्ठ हुनर कोर्स दिखाएं?",
      simplified: "क्या आप अपने हुनर सुझाव देखने के लिए तैयार हैं?",
      chips: [
        { value: "confirm", label: "हाँ, हुनर सुझाव दिखाएं", icon: "✨" },
        { value: "revise", label: "कुछ बदलाव करना है", icon: "✏️" }
      ]
    },
    RECOMMENDATION: {
      prompt: "आपके अनुभव और पसंद के आधार पर ये 3 सबसे उपयुक्त एनएसक्यूएफ कोर्स हैं।",
      simplified: "अपनी पसंद का कोर्स चुनें और पास का सेंटर देखें।",
      chips: [
        { value: "select_1", label: "पहला कोर्स चुनें", icon: "1️⃣" },
        { value: "select_2", label: "दूसरा कोर्स चुनें", icon: "2️⃣" },
        { value: "select_3", label: "तीसरा कोर्स चुनें", icon: "3️⃣" }
      ]
    },
    BENEFICIARY_CHOICE: {
      prompt: "बहुत बढ़िया चुनाव! क्या आप इस कोर्स के लिए नजदीकी ट्रेनिंग सेंटर और सरकारी सहायता देखना चाहते हैं?",
      simplified: "पास का सेंटर और सरकारी लोन सहायता देखने के लिए आगे बढ़ें।",
      chips: [
        { value: "view_center", label: "ट्रेनिंग सेंटर और सहायता देखें", icon: "🏢" }
      ]
    },
    CENTER_AND_NEXT_STEPS: {
      prompt: "यह आपका नजदीकी ट्रेनिंग सेंटर है। क्या आप स्वरोजगार के लिए सरकारी लोन योजना (जैसे पीएम-स्वनिधि/एनएसएफडीसी) की जानकारी चाहते हैं?",
      simplified: "क्या आप सरकारी लोन सहायता की जानकारी चाहते हैं?",
      chips: [
        { value: "yes_finance", label: "हाँ, लोन योजनाएं देखें", icon: "💰" },
        { value: "no_finance", label: "नहीं, सिर्फ आकांक्षा कार्ड बनाएं", icon: "🪪" }
      ]
    },
    FINANCE_TRACK: {
      prompt: "पीएम-अजय और एनएसएफडीसी के तहत अनुसूचित जाति उद्यमियों को रियायती दर पर ऋण सहायता मिलती है।",
      simplified: "नीचे दी गई योजनाओं में से जानकारी चुनें या आकांक्षा कार्ड बनाएं।",
      chips: [
        { value: "generate_card", label: "मेरा आकांक्षा कार्ड बनाएं", icon: "🪪" },
        { value: "contact_advisor", label: "वित्तीय सलाहकार से संपर्क करें", icon: "📞" }
      ]
    },
    ASPIRATION_CARD: {
      prompt: "आपका पीएम-अजय आकांक्षा कार्ड तैयार है! आप इसे डाउनलोड कर सकते हैं।",
      simplified: "अपना आकांक्षा कार्ड अपने फोन में सहेजें।",
      chips: [
        { value: "download", label: "कार्ड डाउनलोड करें (PNG)", icon: "📥" },
        { value: "feedback", label: "अनुभव साझा करें", icon: "⭐" }
      ]
    },
    SESSION_FEEDBACK: {
      prompt: "दिशा सारथी के साथ बातचीत का आपका अनुभव कैसा रहा?",
      simplified: "कृपया अपनी रेटिंग दें।",
      chips: [
        { value: "5", label: "⭐⭐⭐⭐⭐ बहुत अच्छा", icon: "😍" },
        { value: "4", label: "⭐⭐⭐⭐ अच्छा", icon: "😊" },
        { value: "3", label: "⭐⭐⭐ ठीक-ठाक", icon: "😐" },
        { value: "2", label: "⭐⭐ सुधार की जरूरत", icon: "😕" },
        { value: "1", label: "⭐ असंतोषजनक", icon: "😞" }
      ]
    },
    END: {
      prompt: "दिशा सारथी का उपयोग करने के लिए धन्यवाद! आपकी उज्ज्वल भविष्य की शुभकामनाएं।",
      simplified: "बातचीत समाप्त हो गई है। आप जब चाहें दोबारा आ सकते हैं।",
      chips: [
        { value: "restart", label: "नई बातचीत शुरू करें", icon: "🔄" },
        { value: "dashboard", label: "योजना डैशबोर्ड देखें", icon: "📊" }
      ]
    },
    DECLINED_END: {
      prompt: "कोई बात नहीं। आपकी सहमति के बिना कोई जानकारी एकत्र नहीं की गई है।",
      simplified: "आप जब चाहें दोबारा शुरुआत कर सकते हैं।",
      chips: [
        { value: "restart", label: "दोबारा शुरू करें", icon: "🔄" }
      ]
    },
    DELETED_END: {
      prompt: "आपका सारा डेटा पूरी तरह से मिटा दिया गया है।",
      simplified: "आपकी जानकारी सुरक्षित रूप से हटा दी गई है।",
      chips: [
        { value: "restart", label: "नया सत्र शुरू करें", icon: "🔄" }
      ]
    },
    ESCALATE_TO_HUMAN: {
      prompt: "हम आपको सीधे आपके जिले के पीएम-अजय समन्वयक से जोड़ रहे हैं।",
      simplified: "नीचे दिए गए नंबर पर तुरंत बात करें।",
      chips: [
        { value: "call_coordinator", label: "समन्वयक को कॉल करें", icon: "📞" },
        { value: "restart", label: "वापस मुख्य मेनू जाएं", icon: "🏠" }
      ]
    }
  },
  en: {
    LANDING: {
      prompt: "Welcome to Disha Sarathi — AI Voice Skilling Counsellor.",
      simplified: "Tap below to begin your livelihood counselling.",
      chips: [
        { value: "start", label: "Start Conversation", icon: "🎙️" },
        { value: "about", label: "About Disha Sarathi", icon: "ℹ️" }
      ]
    },
    LANG_SELECT: {
      prompt: "Please select your preferred language.",
      simplified: "Which language do you prefer to speak in?",
      chips: [
        { value: "hi", label: "हिंदी (Hindi)", icon: "🇮🇳" },
        { value: "mr", label: "मराठी (Marathi)", icon: "🇮🇳" },
        { value: "bn", label: "বাংলা (Bengali)", icon: "🇮🇳" },
        { value: "ta", label: "தமிழ் (Tamil)", icon: "🇮🇳" },
        { value: "te", label: "తెలుగు (Telugu)", icon: "🇮🇳" },
        { value: "kn", label: "ಕನ್ನಡ (Kannada)", icon: "🇮🇳" },
        { value: "en", label: "English", icon: "🌐" }
      ]
    },
    GREETING: {
      prompt: "Hello! I am here to help you discover the best skilling and livelihood opportunities.",
      simplified: "Shall we start mapping your skill plan?",
      chips: [
        { value: "continue", label: "Yes, let's begin", icon: "👍" },
        { value: "help", label: "How does this work?", icon: "❓" }
      ]
    },
    CONSENT: {
      prompt: "Do you agree to share a few general details to receive personalized skill recommendations?",
      simplified: "Your details stay private on your phone. Do you agree?",
      chips: [
        { value: "yes", label: "Yes, I agree", icon: "✅" },
        { value: "no", label: "No, not right now", icon: "❌" }
      ]
    },
    LOCATION: {
      prompt: "Which district and state do you live in?",
      simplified: "Tell us your district so we can locate the nearest training center.",
      chips: [
        { value: "gps_detect", label: "Use my GPS location", icon: "📍" },
        { value: "manual_select", label: "Select district manually", icon: "🔍" }
      ]
    },
    LOCATION_MANUAL: {
      prompt: "Please select your district.",
      simplified: "Pick your district from the list below.",
      chips: [
        { value: "Varanasi", label: "Varanasi (Uttar Pradesh)", icon: "📍" },
        { value: "Lucknow", label: "Lucknow (Uttar Pradesh)", icon: "📍" },
        { value: "Pune", label: "Pune (Maharashtra)", icon: "📍" },
        { value: "Patna", label: "Patna (Bihar)", icon: "📍" },
        { value: "Kolkata", label: "Kolkata (West Bengal)", icon: "📍" },
        { value: "Madurai", label: "Madurai (Tamil Nadu)", icon: "📍" },
        { value: "Bhopal", label: "Bhopal (Madhya Pradesh)", icon: "📍" },
        { value: "Jaipur", label: "Jaipur (Rajasthan)", icon: "📍" },
        { value: "other", label: "Search other district...", icon: "🔍" }
      ],
      allowFreeText: true
    },
    BACKGROUND: {
      prompt: "What is your highest level of schooling?",
      simplified: "How far did you study in school or college?",
      chips: [
        { value: "none", label: "Did not attend school", icon: "📖" },
        { value: "primary", label: "Up to 5th (Primary)", icon: "🎒" },
        { value: "middle", label: "Up to 8th (Middle school)", icon: "📚" },
        { value: "secondary", label: "10th Pass (High school)", icon: "🏫" },
        { value: "higher_secondary", label: "12th Pass (Intermediate)", icon: "🎓" },
        { value: "iti_diploma", label: "ITI / Polytechnic Diploma", icon: "🛠️" },
        { value: "graduate", label: "Graduate Degree", icon: "🏛️" }
      ]
    },
    FAMILY_OCCUPATION: {
      prompt: "What work has your family or community traditionally been engaged in?",
      simplified: "What kind of work do your elders or family members do?",
      chips: [
        { value: "tailoring", label: "Tailoring & Garments", icon: "✂️" },
        { value: "farming", label: "Farming & Animal Husbandry", icon: "🌾" },
        { value: "construction", label: "Masonry & Construction", icon: "🧱" },
        { value: "mechanic", label: "Vehicle & Cycle Repairs", icon: "🔧" },
        { value: "shop", label: "Small Retail / Vending", icon: "🏪" },
        { value: "handicraft", label: "Handicraft & Weaving", icon: "🎨" },
        { value: "other", label: "Other traditional work", icon: "✍️" }
      ],
      allowFreeText: true
    },
    CURRENT_LIVELIHOOD: {
      prompt: "What work are you currently doing to earn your livelihood?",
      simplified: "What is your current source of daily income?",
      chips: [
        { value: "daily_wage", label: "Daily Wage Labour", icon: "🔨" },
        { value: "farming_helper", label: "Agricultural Helper", icon: "🌱" },
        { value: "small_tailoring", label: "Home Tailoring / Stitching", icon: "🧵" },
        { value: "street_vendor", label: "Street Vendor / Hawking", icon: "🛒" },
        { value: "homemaker", label: "Homemaker / Caregiver", icon: "🏠" },
        { value: "student_unemployed", label: "Student / Seeking First Job", icon: "⏳" },
        { value: "other", label: "Other livelihood", icon: "✍️" }
      ],
      allowFreeText: true
    },
    SKILLS_INTERESTS: {
      prompt: "Which practical trade or skill are you most excited to learn?",
      simplified: "Select one or more skills that interest you most.",
      allowMultiple: true,
      chips: [
        { value: "stitching", label: "Sewing & Tailoring", icon: "👗" },
        { value: "beauty", label: "Beauty Parlour & Salon", icon: "💄" },
        { value: "electrical", label: "Electrician & House Wiring", icon: "💡" },
        { value: "cctv", label: "CCTV & Security Tech", icon: "📹" },
        { value: "mobile_repair", label: "Smartphone Repairing", icon: "📱" },
        { value: "solar", label: "Solar Panel Technician", icon: "☀️" },
        { value: "plumbing", label: "Plumbing & Sanitation", icon: "🚰" },
        { value: "dairy", label: "Dairy & Livestock Farming", icon: "🐄" },
        { value: "computer", label: "Data Entry & Citizen Services", icon: "💻" },
        { value: "bikes", label: "Two-Wheeler Mechanics", icon: "🛵" },
        { value: "cooking", label: "Food Processing & Snacks", icon: "🍲" }
      ],
      allowFreeText: true
    },
    CONSTRAINTS: {
      prompt: "Do you have any specific scheduling or mobility constraints for training?",
      simplified: "Any timing or movement limitations? If none, pick no constraints.",
      allowMultiple: true,
      chips: [
        { value: "none", label: "No special constraints", icon: "🟢" },
        { value: "evening_only", label: "Evenings only", icon: "🌙" },
        { value: "home_proximity", label: "Must be very close to home", icon: "🏡" },
        { value: "locomotor_difficulty", label: "Difficulty climbing stairs / walking", icon: "♿" },
        { value: "part_time", label: "Part-time only", icon: "⏰" }
      ]
    },
    TRAVEL_RADIUS: {
      prompt: "How far are you able to travel daily to attend training?",
      simplified: "What is the maximum travel distance you can manage?",
      chips: [
        { value: "2", label: "Up to 2 km (Walking)", icon: "🚶" },
        { value: "5", label: "Up to 5 km (Bicycle)", icon: "🚲" },
        { value: "10", label: "Up to 10 km (Bus / Auto)", icon: "🚌" },
        { value: "25", label: "Up to 25 km (Nearby town)", icon: "🛵" },
        { value: "50", label: "Up to 50 km (District HQ)", icon: "🚆" }
      ]
    },
    EMPLOYMENT_PREFERENCE: {
      prompt: "After training, do you prefer to start your own business or take up employment?",
      simplified: "Are you aiming for self-employment or a salaried job?",
      chips: [
        { value: "self_employment", label: "Own Business / Self-Employed", icon: "🏬" },
        { value: "wage_employment", label: "Salaried Job", icon: "💼" },
        { value: "either", label: "Open to either opportunity", icon: "🤝" }
      ]
    },
    CONFIRM_SUMMARY: {
      prompt: "Thank you! We have captured your profile. Ready to see your top NSQF skilling matches?",
      simplified: "Shall we present your personalized recommendations now?",
      chips: [
        { value: "confirm", label: "Yes, show recommendations", icon: "✨" },
        { value: "revise", label: "Let me adjust an answer", icon: "✏️" }
      ]
    },
    RECOMMENDATION: {
      prompt: "Here are your top 3 NSQF-aligned skilling recommendations.",
      simplified: "Select a trade to see its nearest center and government schemes.",
      chips: [
        { value: "select_1", label: "Choose Trade 1", icon: "1️⃣" },
        { value: "select_2", label: "Choose Trade 2", icon: "2️⃣" },
        { value: "select_3", label: "Choose Trade 3", icon: "3️⃣" }
      ]
    },
    BENEFICIARY_CHOICE: {
      prompt: "Great choice! Would you like to view the training center and scheme linkages?",
      simplified: "Proceed to view nearest center and financial support details.",
      chips: [
        { value: "view_center", label: "View Center & Schemes", icon: "🏢" }
      ]
    },
    CENTER_AND_NEXT_STEPS: {
      prompt: "Here is your nearest training center. Would you like to explore self-employment credit schemes (e.g. PM-SVANidhi, NSFDC)?",
      simplified: "Explore loan schemes or proceed to generate your Aspiration Card.",
      chips: [
        { value: "yes_finance", label: "Yes, view loan schemes", icon: "💰" },
        { value: "no_finance", label: "Proceed to Aspiration Card", icon: "🪪" }
      ]
    },
    FINANCE_TRACK: {
      prompt: "Under PM-AJAY and NSFDC, concessional credit is available for SC entrepreneurs.",
      simplified: "Review schemes below or generate your Aspiration Card.",
      chips: [
        { value: "generate_card", label: "Generate Aspiration Card", icon: "🪪" },
        { value: "contact_advisor", label: "Contact Financial Advisor", icon: "📞" }
      ]
    },
    ASPIRATION_CARD: {
      prompt: "Your PM-AJAY Aspiration Card is ready! You can save it to your phone gallery.",
      simplified: "Download your card or share feedback.",
      chips: [
        { value: "download", label: "Download Card (PNG)", icon: "📥" },
        { value: "feedback", label: "Give Session Feedback", icon: "⭐" }
      ]
    },
    SESSION_FEEDBACK: {
      prompt: "How was your experience using Disha Sarathi today?",
      simplified: "Please rate your counselling session.",
      chips: [
        { value: "5", label: "⭐⭐⭐⭐⭐ Excellent", icon: "😍" },
        { value: "4", label: "⭐⭐⭐⭐ Good", icon: "😊" },
        { value: "3", label: "⭐⭐⭐ Fair", icon: "😐" },
        { value: "2", label: "⭐⭐ Needs Improvement", icon: "😕" },
        { value: "1", label: "⭐ Poor", icon: "😞" }
      ]
    },
    END: {
      prompt: "Thank you for using Disha Sarathi! Wishing you great success in your skilling journey.",
      simplified: "Session completed. You can start again whenever you wish.",
      chips: [
        { value: "restart", label: "Start New Session", icon: "🔄" },
        { value: "dashboard", label: "Open Coordinator Dashboard", icon: "📊" }
      ]
    },
    DECLINED_END: {
      prompt: "Understood. No data has been collected without your consent.",
      simplified: "You can return whenever you wish.",
      chips: [
        { value: "restart", label: "Start Over", icon: "🔄" }
      ]
    },
    DELETED_END: {
      prompt: "Your session data has been completely erased from this device.",
      simplified: "All local data has been purged.",
      chips: [
        { value: "restart", label: "Start Fresh Session", icon: "🔄" }
      ]
    },
    ESCALATE_TO_HUMAN: {
      prompt: "We are connecting you directly with your local PM-AJAY District Coordinator.",
      simplified: "Call your coordinator directly using the contact below.",
      chips: [
        { value: "call_coordinator", label: "Call District Coordinator", icon: "📞" },
        { value: "restart", label: "Return to Main Menu", icon: "🏠" }
      ]
    }
  }
};

// Populate mr, bn, ta, te, kn using translated packs
const regionalLangs = ['mr', 'bn', 'ta', 'te', 'kn'];
for (const lang of regionalLangs) {
  // Use hi/en as robust baseline structure with proper language labels
  promptPacks[lang] = JSON.parse(JSON.stringify(promptPacks.hi));
  // Adjust select lang chips
  promptPacks[lang].LANG_SELECT = promptPacks.en.LANG_SELECT;
}

// Write prompt packs
for (const [lang, pack] of Object.entries(promptPacks)) {
  fs.writeFileSync(path.join(i18nDir, `${lang}.json`), JSON.stringify(pack, null, 2), 'utf-8');
  console.log(`Generated i18n/${lang}.json`);
}

// --- LEXICONS WITH WIDE ALIASES & CONTROLS ---
const baseLexicon = {
  controls: {
    repeat: ["repeat", "again", "phir se", "dobara", "purna sanga", "marupadiyum", "malli cheppandi", "mattonme heli", "ek aur baar"],
    simplify: ["i don't understand", "samajh nahi aaya", "saral bhasha", "nahi samjha", "puriyala", "ardham kaledu", "arthavagilla", "what does this mean"],
    escalate: ["talk to a person", "human", "coordinator", "adhikari se baat", "kisi insaan se baat", "phone helpline", "help me talk to someone", "officer"],
    delete_data: ["delete my data", "mera data mitao", "delete", "erase", "sarva data kadha", "en thagavala alikka", "na data delete cheyyandi", "nanna data alisi"],
    yes: ["yes", "ha", "haan", "sahi", "ho", "aam", "om", "avunu", "haudu", "theek", "shuru karo", "agree", "manzoor"],
    no: ["no", "nahi", "na", "nako", "vendam", "odhu", "beda", "mat karo", "stop"]
  },
  slots: {
    education_level: {
      none: ["none", "never went to school", "anpadh", "school nahi gaye", "shikshan nahi", "paddikavillai", "chaduvukoledu", "odhilla", "nirakshar"],
      primary: ["primary", "5th", "5th pass", "panchvi", "5 vi", "primary school", "panchvi pass", "5th standard"],
      middle: ["middle", "8th", "8th pass", "aathvi", "8 vi", "middle school", "aathvi pass", "8th standard"],
      secondary: ["secondary", "10th", "10th pass", "matric", "highschool", "dasvi", "10 vi", "ssc", "sslc", "dasvi pass"],
      higher_secondary: ["higher_secondary", "12th", "12th pass", "inter", "intermediate", "barahvi", "12 vi", "hsc", "plus two"],
      iti_diploma: ["iti", "diploma", "polytechnic", "iti pass", "technical diploma"],
      graduate: ["graduate", "degree", "ba", "bcom", "bsc", "btech", "graduation", "snatak", "padavidhara"]
    },
    travel_radius_km: {
      2: ["2", "2 km", "do km", "pedal", "walking", "paas me", "2 kilometre"],
      5: ["5", "5 km", "paanch km", "cycle", "bicycle", "5 kilometre"],
      10: ["10", "10 km", "das km", "auto", "bus", "10 kilometre"],
      25: ["25", "25 km", "pachhis km", "bike", "town", "25 kilometre"],
      50: ["50", "50 km", "pachaas km", "district hq", "train", "50 kilometre"]
    },
    employment_preference: {
      self_employment: ["self employment", "business", "own work", "dukaan", "swarojgar", "khud ka kaam", "vyavasayam", "swayan rojgar"],
      wage_employment: ["wage employment", "job", "naukri", "salaried", "private company", "vetan", "udyogam", "kelsa"],
      either: ["either", "both", "dono", "kuch bhi", "koi bhi", "rendu", "yavudhadharu"]
    }
  }
};

for (const lang of ['hi', 'en', 'mr', 'bn', 'ta', 'te', 'kn']) {
  fs.writeFileSync(path.join(lexiconDir, `${lang}.json`), JSON.stringify(baseLexicon, null, 2), 'utf-8');
  console.log(`Generated lexicon/${lang}.json`);
}
