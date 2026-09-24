// Disha Sarathi - Sarvam Voice Agent Grounded Integration Service (PS 26097)
// Connects Sarvam Voice Agent / Telephony to Disha Sarathi Backend Capabilities
// STRICT FACTUAL GROUNDING — No Hallucinations, No Unsupported Claims.
// SERVER-SIDE ONLY — never import from client code.

import { BeneficiaryProfile, DistrictCentroid, LanguageCode, NSQFTrade, TrainingCenter } from '../../core/types';
import { extractAllProfileSlots, normalizeIndicText } from '../../core/nlu';
import { recommendNSQFTrades } from '../../core/recommender';
import { findNearestCenterForTrade } from '../../core/geo';
import prisma from '../db/prisma';
import nsqfTradesData from '../../data/nsqf_trades.json';
import schemesData from '../../data/schemes.json';
import trainingCentersData from '../../data/training_centers.json';
import districtsData from '../../data/districts.json';

const allTrades = nsqfTradesData as NSQFTrade[];
const allSchemes = schemesData as any[];
const allCenters = trainingCentersData as TrainingCenter[];
const allDistricts = districtsData as DistrictCentroid[];

export interface SarvamVoiceRequest {
  phoneNumber?: string;
  message: string;
  language?: 'en' | 'hi' | 'mr' | string;
  conversationId?: string;
  profile?: Partial<BeneficiaryProfile> | null;
}

export interface GroundedTrainingCenter {
  id: string;
  name: string;
  district: string;
  address: string;
  distanceKm?: number;
  contactPhone?: string;
  isDemoSeed: boolean;
}

export interface GroundedRecommendation {
  tradeId: string;
  tradeName: string;
  sector: string;
  nsqfLevel: number;
  durationHours: number;
  reasons: string[];
  score: number;
  scoreBreakdown?: {
    interestMatch: number;
    educationFit: number;
    localDemand: number;
    preferenceFit: number;
    accessibility: number;
    skillTransfer: number;
    finalScore: number;
  };
  trainingPathway: string;
  indicativeWageBand: string | null;
  dataSource: string;
  trainingCenter: GroundedTrainingCenter | null;
}

export interface SarvamVoiceResponse {
  success: boolean;
  reply: string;
  language: 'en' | 'hi' | 'mr';
  intent: string | null;
  profileUpdates: Partial<BeneficiaryProfile>;
  recommendations: GroundedRecommendation[];
  nextStep: string | null;
  error?: string;
}

/**
 * Language switch detection triggers
 */
export function detectVoiceLanguageSwitch(text: string, currentLang: LanguageCode): { requestedLang: LanguageCode; isSwitch: boolean } {
  const norm = (text || '').toLowerCase().trim();

  // Explicit Marathi triggers
  const mrPatterns = [
    'मराठीत बोला', 'मराठी मध्ये बोला', 'मराठीत सांगा', 'मराठी बोला', 'मराठी',
    'marathi madhe', 'marathi madhe bola', 'marathit bola', 'speak in marathi', 'talk in marathi', 'switch to marathi'
  ];
  for (const p of mrPatterns) {
    if (norm === p || norm.includes(p)) {
      return { requestedLang: 'mr', isSwitch: currentLang !== 'mr' };
    }
  }

  // Explicit Hindi triggers
  const hiPatterns = [
    'हिंदी में बोलो', 'हिंदी में बात करो', 'हिंदी में बताओ', 'हिंदी बोलो', 'हिंदी',
    'hindi mein', 'hindi mein bolo', 'hindi me baat karo', 'speak in hindi', 'talk in hindi', 'switch to hindi'
  ];
  for (const p of hiPatterns) {
    if (norm === p || norm.includes(p)) {
      return { requestedLang: 'hi', isSwitch: currentLang !== 'hi' };
    }
  }

  // Explicit English triggers
  const enPatterns = [
    'speak in english', 'talk in english', 'switch to english', 'english please',
    'in english', 'इंग्लिश मध्ये बोला', 'अंग्रेजी में बात करो', 'इंग्रजीमध्ये सांगा', 'इंग्रजीत बोला'
  ];
  for (const p of enPatterns) {
    if (norm === p || norm.includes(p)) {
      return { requestedLang: 'en', isSwitch: currentLang !== 'en' };
    }
  }

  // Heuristic script detection
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (currentLang === 'en' && devanagariCount > 6 && devanagariCount > latinCount) {
    const marathiMarkers = /ाहे|आहे|माझ|तुमच|आपल|मला|नाही|आणि|किंवा|कारण|होय|नको|शिकायचे|सांगा/;
    return { requestedLang: marathiMarkers.test(text) ? 'mr' : 'hi', isSwitch: true };
  }

  if (currentLang !== 'en' && latinCount > 15 && devanagariCount === 0) {
    const isEnglishSentence = /\b(i am|my name|i live|want to|skills|training|job|looking for|hello|help|please|explain|how|what)\b/i.test(text);
    if (isEnglishSentence) {
      return { requestedLang: 'en', isSwitch: true };
    }
  }

  return { requestedLang: currentLang, isSwitch: false };
}

/**
 * Checks whether user message is asking specifically about training center locations
 */
function isTrainingCenterInquiry(text: string): boolean {
  const norm = (text || '').toLowerCase();
  return /\b(training centre|training center|सेंटर|केंद्राचा पत्ता|केंद्र कुठे|केंद्राची माहिती|प्रशिक्षण केंद्र|कहा है|center address|center location)\b/i.test(norm);
}

/**
 * Checks whether user message is requesting vocational livelihood guidance / skilling / job recommendations
 */
function isLivelihoodRequest(text: string, slotsCount: number, mergedProfile: Partial<BeneficiaryProfile>): boolean {
  const norm = (text || '').toLowerCase();
  
  // Exclude pure programming / academic queries (e.g., Java, Python, C++, Math, History) unless explicit vocational trade is present
  const isGeneralAcademicOrTech = /\b(java|python|c\+\+|golang|rust|react|javascript|typescript|coding|programming|algorithm|calculus|physics|chemistry|history|geography)\b/i.test(norm) ||
    /जावा|पायथन|प्रोग्रामिंग|कोडिंग/i.test(norm);
  if (isGeneralAcademicOrTech && (!mergedProfile.skills_interests || mergedProfile.skills_interests.length === 0)) {
    return false;
  }

  // If a recognized vocational skill/interest is present in profile
  if (mergedProfile.skills_interests && mergedProfile.skills_interests.length > 0) {
    return true;
  }

  const livelihoodKeywords = [
    'welding', 'वेल्डिंग', 'welder', 'वेल्डर', 'electrician', 'इलेक्ट्रिशियन', 'tailoring', 'शिलाई', 'दर्जी', 'शिवणकाम',
    'solar', 'सोलर', 'plumber', 'प्लंबर', 'driver', 'ड्रायव्हर', 'ड्राइविंग', 'fitter', 'फिटर',
    'नौकरी', 'नोकरी', 'रोजगार', 'काम हवं', 'काम चाहिए', 'कौशल्य प्रशिक्षण', 'व्यवसायिक प्रशिक्षण', 'ट्रेनिंग', 'प्रशिक्षण',
    'pm-ajay', 'pmajay', 'pmkvy', 'nsfdc', 'योजना', 'स्कीम',
    'संधी', 'अवसर', 'करिअर', 'career', 'job', 'vocational training', 'vocational'
  ];

  for (const kw of livelihoodKeywords) {
    if (norm.includes(kw)) return true;
  }

  if (slotsCount >= 2 && (mergedProfile.district || mergedProfile.education_level)) {
    return true;
  }

  return false;
}

/**
 * Checks whether user message is asking about government schemes or PM-AJAY
 */
function isSchemeRequest(text: string): boolean {
  const norm = (text || '').toLowerCase();
  return /\b(pm-ajay|pmajay|pm ajay|योजना|स्कीम|nsfdc|अनुदान|कर्ज|loan|subsidy|सरकारी मदत|योजनांची माहिती)\b/i.test(norm);
}

/**
 * Resolves verified training center strictly from verified application dataset
 */
function resolveVerifiedCenterForTradeAndDistrict(
  tradeId: string,
  district: string | undefined,
  lat?: number,
  lng?: number
): GroundedTrainingCenter | null {
  if (!tradeId) return null;

  // Search if any center in application dataset offers this trade
  const centersOfferingTrade = allCenters.filter(c => c.trades_offered && c.trades_offered.includes(tradeId));
  if (centersOfferingTrade.length === 0) {
    return null;
  }

  // If district provided, find in district
  if (district) {
    const districtCenter = centersOfferingTrade.find(c => c.district.toLowerCase() === district.toLowerCase());
    if (districtCenter) {
      return {
        id: districtCenter.id,
        name: districtCenter.name,
        district: districtCenter.district,
        address: districtCenter.address,
        contactPhone: districtCenter.contact_phone,
        isDemoSeed: !!districtCenter.is_demo_seed
      };
    }
  }

  // If coordinates provided, find nearest
  if (lat !== undefined && lng !== undefined) {
    const nearest = findNearestCenterForTrade(lat, lng, tradeId);
    if (nearest && nearest.center) {
      return {
        id: nearest.center.id,
        name: nearest.center.name,
        district: nearest.center.district,
        address: nearest.center.address,
        distanceKm: nearest.distanceKm,
        contactPhone: nearest.center.contact_phone,
        isDemoSeed: !!nearest.center.is_demo_seed
      };
    }
  }

  return null;
}

/**
 * Generates natural spoken response strictly grounded on verified application data
 */
async function generateVoiceReply(
  message: string,
  lang: 'en' | 'hi' | 'mr',
  intent: string,
  mergedProfile: Partial<BeneficiaryProfile>,
  recommendations: GroundedRecommendation[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  // Specific training center inquiry with no verified center
  if (intent === 'training_center_inquiry') {
    const topRec = recommendations[0];
    const center = topRec?.trainingCenter;
    const loc = mergedProfile.district || (lang === 'mr' ? 'या भागात' : lang === 'hi' ? 'इस क्षेत्र में' : 'this area');
    const tradeName = topRec?.tradeName || (lang === 'mr' ? 'या ट्रेड' : lang === 'hi' ? 'इस ट्रेड' : 'this trade');

    if (center) {
      if (lang === 'mr') {
        return `${loc} येथे ${tradeName} साठी ${center.name} उपलब्ध आहे. पत्ता: ${center.address}.`;
      } else if (lang === 'hi') {
        return `${loc} में ${tradeName} के लिए ${center.name} उपलब्ध है। पता: ${center.address}।`;
      } else {
        return `For ${tradeName} in ${loc}, ${center.name} is listed. Address: ${center.address}.`;
      }
    } else {
      // Strictly ground that no verified training center is found in database
      if (lang === 'mr') {
        return `माझ्याकडे सध्या ${loc} मधील ${tradeName} साठीच्या प्रशिक्षण केंद्रांची पडताळलेली माहिती उपलब्ध नाही.`;
      } else if (lang === 'hi') {
        return `मेरे पास अभी ${loc} में ${tradeName} के प्रशिक्षण केंद्र की सत्यापित जानकारी उपलब्ध नहीं है।`;
      } else {
        return `I do not currently have verified training center details for ${tradeName} in ${loc} in our database.`;
      }
    }
  }

  // Scheme inquiry strictly grounded in schemes.json
  if (intent === 'scheme_inquiry') {
    const nsfdcScheme = allSchemes.find(s => s.id === 'nsfdc');
    if (lang === 'mr') {
      const desc = nsfdcScheme?.short_desc?.mr || 'पीएम-अजय अंतर्गत अनुसूचित जातीच्या लाभार्थ्यांसाठी सवलतीच्या व्याजदरात व्यवसाय कर्ज आणि कौशल्य प्रशिक्षण सहाय्य दिले जाते.';
      return `${desc} अधिक माहितीसाठी आपण nsfdc.nic.in ला भेट देऊ शकता.`;
    } else if (lang === 'hi') {
      const desc = nsfdcScheme?.short_desc?.hi || 'पीएम-अजय के तहत अनुसूचित जाति लाभार्थियों के लिए रियायती ब्याज दर पर आसान व्यवसाय ऋण और कौशल प्रशिक्षण सहायता प्रदान की जाती है।';
      return `${desc} अधिक जानकारी हेतु nsfdc.nic.in पर संपर्क करें।`;
    } else {
      const desc = nsfdcScheme?.short_desc?.en || 'Under PM-AJAY (NSFDC), concessional credit and skill development support are provided to eligible beneficiaries.';
      return `${desc} For more details, visit nsfdc.nic.in.`;
    }
  }

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const models = ['gemini-flash-lite-latest', 'gemini-2.0-flash'];
      const langName = lang === 'mr' ? 'Marathi (मराठी)' : lang === 'hi' ? 'Hindi (हिंदी)' : 'English';

      let contextDetails = '';
      if (recommendations && recommendations.length > 0) {
        contextDetails += `\nINDICATIVE NSQF-ALIGNED PATHWAY DATA (FROM LOCAL CATALOG):\n` +
          recommendations.map(r =>
            `- Trade: ${r.tradeName}, NSQF Pathway: ${r.trainingPathway}, Duration: ${r.durationHours} hrs, Indicative Wage Band: ${r.indicativeWageBand || 'Market dependent'}, Center Available in Dataset: ${r.trainingCenter ? r.trainingCenter.name : 'None currently listed in database'}`
          ).join('\n');
      }

      const knownProfile = [];
      if (mergedProfile.district) knownProfile.push(`District: ${mergedProfile.district}`);
      if (mergedProfile.education_level) knownProfile.push(`Education: ${mergedProfile.education_level}`);
      if (mergedProfile.skills_interests && mergedProfile.skills_interests.length > 0) knownProfile.push(`Skills/Interests: ${mergedProfile.skills_interests.join(', ')}`);
      if (mergedProfile.employment_preference) knownProfile.push(`Preference: ${mergedProfile.employment_preference}`);
      if (knownProfile.length > 0) {
        contextDetails += `\nBENEFICIARY CONTEXT:\n` + knownProfile.map(k => `- ${k}`).join('\n');
      }

      const systemInstruction = `You are "Disha Sarathi", an intelligent voice assistant for vocational guidance and general queries.
LANGUAGE: Respond directly and fluently in ${langName}.

CRITICAL FACTUAL GROUNDING & ANTI-HALLUCINATION RULES:
1. Speak concisely in 2 to 3 natural sentences suitable for a phone call.
2. DO NOT output markdown asterisks, hashes, bullet points, or JSON.
3. NEVER claim that Disha Sarathi grants official certification, government certification, guaranteed employment, or guaranteed salary.
4. Always refer to trade mappings as "NSQF-aligned pathway (indicative mapping)" / "एनएसक्यूएफ-संरेखित मार्गदर्शक पर्याय".
5. NEVER invent training centres or addresses. If no centre exists in the provided context for the user's trade/location, state that verified centre details are not currently in the database.
6. If the user asks a general question (e.g. Java, Python, Math, Science, casual chat), answer accurately without forcing a livelihood questionnaire.
7. If verified information is not available, state:
   - Marathi: "माझ्याकडे त्याबद्दल सध्या पडताळलेली माहिती उपलब्ध नाही."
   - Hindi: "मेरे पास इसके बारे में अभी सत्यापित जानकारी उपलब्ध नहीं है।"
   - English: "I do not currently have verified information about that."

${contextDetails}`;

      for (const model of models) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ text: message }] }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 200 }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const json = await res.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return text.replace(/[*#_`]/g, '').trim();
            }
          }
        } catch {
          // Model fallback
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  // Deterministic spoken reply generator (Grounded fallback)
  if (intent === 'livelihood_recommendation' && recommendations.length > 0) {
    const topRec = recommendations[0];
    const tradeTitle = topRec.tradeName || 'व्यावसायिक कौशल्य';
    const loc = mergedProfile.district || (lang === 'mr' ? 'आपल्या भागात' : lang === 'hi' ? 'आपके क्षेत्र में' : 'your area');

    if (lang === 'mr') {
      return `${loc} ${tradeTitle} साठी एनएसक्यूएफ-संरेखित मार्गदर्शक पर्याय (पातळी ${topRec.nsqfLevel}) उपलब्ध आहे. या क्षेत्रातील संधींबद्दल अधिक माहिती हवी आहे का?`;
    } else if (lang === 'hi') {
      return `${loc} में ${tradeTitle} हेतु एनएसक्यूएफ-संरेखित मार्गदर्शन (लेवल ${topRec.nsqfLevel}) उपलब्ध है। क्या आप इस ट्रेड के बारे में और जानना चाहते हैं?`;
    } else {
      return `For ${tradeTitle} in ${loc}, an NSQF-aligned indicative pathway (Level ${topRec.nsqfLevel}) is available. Would you like to know more about this trade?`;
    }
  }

  if (intent === 'language_switch') {
    if (lang === 'mr') return 'नक्कीच, आपण आता मराठीत बोलूया! सांगा, मी तुम्हाला कशी मदत करू?';
    if (lang === 'hi') return 'ज़रूर, अब हम हिंदी में बात करेंगे! बताइए, मैं आपकी क्या सहायता करूँ?';
    return "Sure, let's converse in English! How can I help you today?";
  }

  // General conversation fallback
  if (lang === 'mr') {
    return 'मी समजलो. या विषयाबद्दल किंवा कौशल्याबद्दल तुम्हाला आणखी काय जाणून घ्यायचे आहे?';
  } else if (lang === 'hi') {
    return 'मैं समझ गया। इस विषय या कौशल के अवसरों के बारे में आप और क्या जानना चाहते हैं?';
  } else {
    return 'I understand. What else would you like to know regarding this topic or skill pathway?';
  }
}

/**
 * Main Handler for Sarvam Voice Agent integration: POST /api/voice/disha
 */
export async function handleDishaVoiceRequest(req: SarvamVoiceRequest): Promise<SarvamVoiceResponse> {
  // 1. Validation
  if (!req || typeof req.message !== 'string' || !req.message.trim()) {
    return {
      success: false,
      reply: 'Invalid request. Please provide a non-empty message.',
      language: (req?.language as any) || 'en',
      intent: null,
      profileUpdates: {},
      recommendations: [],
      nextStep: null,
      error: 'Missing or empty message parameter'
    };
  }

  const userMessage = req.message.trim();
  const rawLang: LanguageCode = (['mr', 'hi', 'en'].includes(req.language || ''))
    ? (req.language as LanguageCode)
    : 'mr';

  // 2. Language switch detection
  const { requestedLang, isSwitch } = detectVoiceLanguageSwitch(userMessage, rawLang);
  const targetLang: 'en' | 'hi' | 'mr' = (['en', 'hi', 'mr'].includes(requestedLang)) ? (requestedLang as 'en' | 'hi' | 'mr') : 'mr';

  // 3. Profile Slot Extraction via NLU
  const extracted = extractAllProfileSlots(userMessage, targetLang);
  const profileUpdates: Partial<BeneficiaryProfile> = { ...extracted.slotsFound };

  // Explicit trade keywords extraction fallback if not mapped in lexicons
  const normMsg = normalizeIndicText(userMessage);
  if (/welding|वेल्डिंग|वेल्डर|welder|वेल्डिंगचे काम|वेल्डिंग काम|arc welding|metal welding/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'welding']));
  }
  if (/electrician|इलेक्ट्रिशियन|इलेक्ट्रीशियन|वायरमन|wireman|electrical|इलेक्ट्रिकल|बिजली का काम|वायरिंग/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'electrical']));
  }
  if (/solar|सोलर|सौर|suryamitra|सूर्यमित्र|सौर पॅनेल|सोलर पॅनेल|solar panel/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'solar']));
  }
  if (/plumb|प्लंबर|प्लंबिंग|नलसाजी|नळ दुरुस्ती|pipe fitting/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'plumbing']));
  }
  if (/computer|संगणक|कॉम्प्यूटर|कंप्यूटर|digital|डिजिटल|data entry|डेटा एंट्री|डाटा एंट्री|typing|टायपिंग/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'computers']));
  }
  if (/tailor|दर्जी|शिंपी|सिलाई|शिवणकाम|stitching/i.test(normMsg)) {
    profileUpdates.skills_interests = Array.from(new Set([...(profileUpdates.skills_interests || []), 'stitching']));
  }

  // 4. Construct Merged Profile
  const mergedProfile: BeneficiaryProfile = {
    skills_interests: [],
    constraints: [],
    education_level: 'secondary',
    ...(req.profile || {}),
    ...profileUpdates,
    language: targetLang
  };

  // Resolve district centroid coordinates for accurate local geo matching
  if (mergedProfile.district && (mergedProfile.lat === undefined || mergedProfile.lng === undefined)) {
    const distMatch = allDistricts.find(d => d.name.toLowerCase() === (mergedProfile.district || '').toLowerCase());
    if (distMatch) {
      mergedProfile.lat = distMatch.lat;
      mergedProfile.lng = distMatch.lng;
    }
  }

  // 5. Database Persistence with Prisma (Graceful error handling)
  try {
    const phone = req.phoneNumber?.trim();
    if (phone && prisma && prisma.beneficiaryProfile) {
      let existing = await prisma.beneficiaryProfile.findFirst({
        where: { phone }
      }).catch(() => null);

      const dbData = {
        phone,
        language: targetLang,
        district: mergedProfile.district || existing?.district || null,
        educationLevel: mergedProfile.education_level || existing?.educationLevel || null,
        familyOccupation: mergedProfile.family_occupation || existing?.familyOccupation || null,
        currentLivelihood: mergedProfile.current_livelihood || existing?.currentLivelihood || null,
        skillsInterests: mergedProfile.skills_interests || existing?.skillsInterests || [],
        employmentPreference: mergedProfile.employment_preference || existing?.employmentPreference || null,
        travelRadiusKm: mergedProfile.travel_radius_km || existing?.travelRadiusKm || null,
        experienceYears: mergedProfile.experience_years !== undefined ? mergedProfile.experience_years : (existing?.experienceYears ?? null)
      };

      if (existing) {
        await prisma.beneficiaryProfile.update({
          where: { id: existing.id },
          data: dbData
        }).catch(() => null);
      } else {
        await prisma.beneficiaryProfile.create({
          data: {
            ...dbData,
            refCode: `SARVAM_${Date.now().toString(36).toUpperCase()}`
          }
        }).catch(() => null);
      }

      if (req.conversationId && prisma.session) {
        const convSession = await prisma.session.findFirst({
          where: { id: req.conversationId }
        }).catch(() => null);

        const newTurns = [
          { sender: 'user', text: userMessage, timestamp: new Date().toISOString() }
        ];

        if (convSession) {
          const currentTranscript = Array.isArray(convSession.transcript) ? convSession.transcript : [];
          await prisma.session.update({
            where: { id: convSession.id },
            data: {
              transcript: [...currentTranscript, ...newTurns],
              updatedAt: new Date()
            }
          }).catch(() => null);
        }
      }
    }
  } catch (dbErr) {
    console.warn('[DISHA_VOICE] Non-fatal DB persistence error:', dbErr);
  }

  // 6. Intent Classification & Deterministic Grounded Recommendation Triggering
  let intent: string | null = null;
  let recommendations: GroundedRecommendation[] = [];
  let nextStep: string | null = null;

  if (isSwitch) {
    intent = 'language_switch';
    nextStep = 'continue_chat';
  } else if (isTrainingCenterInquiry(userMessage)) {
    intent = 'training_center_inquiry';
    nextStep = 'center_details';

    // Search trade matching user's stated interests or utterance
    const requestedInterests = mergedProfile.skills_interests || [];
    let tradeId = '';
    let tradeName = '';
    let matchedTrade = allTrades.find(t => 
      requestedInterests.some(s => 
        t.name_en.toLowerCase().includes(s.toLowerCase()) || 
        (t.interest_tags || []).some((tag: string) => tag.toLowerCase().includes(s.toLowerCase()))
      ) ||
      userMessage.toLowerCase().includes(t.name_en.toLowerCase())
    );

    if (matchedTrade) {
      tradeId = matchedTrade.id;
      tradeName = matchedTrade.name_local[targetLang] || matchedTrade.name_en;
    } else if (requestedInterests.length > 0) {
      tradeName = requestedInterests[0];
      tradeId = requestedInterests[0].toLowerCase();
    } else if (/welding|वेल्डिंग/i.test(userMessage)) {
      tradeName = targetLang === 'mr' ? 'वेल्डिंग' : targetLang === 'hi' ? 'वेल्डिंग' : 'Welding';
      tradeId = 'trade_welder';
    }

    const verifiedCenter = tradeId ? resolveVerifiedCenterForTradeAndDistrict(
      tradeId,
      mergedProfile.district,
      mergedProfile.lat,
      mergedProfile.lng
    ) : null;

    recommendations = [{
      tradeId: tradeId || 'trade_general',
      tradeName: tradeName || (targetLang === 'mr' ? 'कौशल्य प्रशिक्षण' : targetLang === 'hi' ? 'कौशल प्रशिक्षण' : 'Skill Training'),
      sector: matchedTrade?.sector || 'General Vocational',
      nsqfLevel: matchedTrade?.nsqf_level || 3,
      durationHours: matchedTrade?.duration_hours || 200,
      reasons: ['Inquiry for local training center options'],
      score: 0.9,
      trainingPathway: `NSQF-aligned pathway (indicative mapping), Level ${matchedTrade?.nsqf_level || 3}`,
      indicativeWageBand: matchedTrade?.typical_wage_band_inr || null,
      dataSource: 'Indicative Demo Data (Seed Catalog)',
      trainingCenter: verifiedCenter
    }];
  } else if (isSchemeRequest(userMessage)) {
    intent = 'scheme_inquiry';
    nextStep = 'skill_assessment';
  } else if (isLivelihoodRequest(userMessage, extracted.slotsCount, mergedProfile)) {
    intent = 'livelihood_recommendation';
    nextStep = 'training_pathway_selection';

    // Run Deterministic Recommendation Engine
    try {
      const recResult = recommendNSQFTrades(mergedProfile, targetLang, req.conversationId || 'sarvam_voice');
      if (recResult && recResult.results && recResult.results.length > 0) {
        recommendations = recResult.results.slice(0, 3).map(r => {
          // Strictly verify if nearest center exists in training_centers.json within allowable radius or in same district
          const radiusKm = mergedProfile.travel_radius_km || 50;
          const centerObj = r.nearest_center?.center;
          const isWithinRadius = (r.nearest_center?.distance_km !== undefined && r.nearest_center.distance_km <= radiusKm);
          const isSameDistrict = centerObj?.district?.toLowerCase() === mergedProfile.district?.toLowerCase();

          const verifiedCenter: GroundedTrainingCenter | null = (centerObj && (isWithinRadius || isSameDistrict)) ? {
            id: centerObj.id,
            name: centerObj.name,
            district: centerObj.district,
            address: centerObj.address,
            distanceKm: r.nearest_center?.distance_km,
            contactPhone: centerObj.contact_phone,
            isDemoSeed: !!centerObj.is_demo_seed
          } : null;

          const traceMatch = recResult.trace.surviving_candidates.find(c => c.trade_id === r.trade.id);

          return {
            tradeId: r.trade.id,
            tradeName: r.trade.name_local[targetLang] || r.trade.name_en,
            sector: r.trade.sector,
            nsqfLevel: r.trade.nsqf_level,
            durationHours: r.trade.duration_hours,
            reasons: [r.rationale],
            score: r.score,
            scoreBreakdown: traceMatch ? {
              interestMatch: traceMatch.interest_match,
              educationFit: traceMatch.education_fit,
              localDemand: traceMatch.local_demand,
              preferenceFit: traceMatch.preference_fit,
              accessibility: traceMatch.accessibility,
              skillTransfer: traceMatch.skill_transfer,
              finalScore: traceMatch.final_score
            } : undefined,
            trainingPathway: `NSQF-aligned pathway (indicative mapping), Level ${r.trade.nsqf_level}`,
            indicativeWageBand: r.trade.typical_wage_band_inr || null,
            dataSource: 'Indicative Demo Data (Seed Catalog)',
            trainingCenter: verifiedCenter
          };
        });
      } else {
        // Fallback trade matching by keyword
        const matchedTrade = allTrades.find(t => 
          (mergedProfile.skills_interests || []).some(s => 
            t.name_en.toLowerCase().includes(s.toLowerCase()) || 
            (t.interest_tags || []).some((tag: string) => tag.toLowerCase().includes(s.toLowerCase()))
          )
        );
        if (matchedTrade) {
          const verifiedCenter = resolveVerifiedCenterForTradeAndDistrict(
            matchedTrade.id,
            mergedProfile.district,
            mergedProfile.lat,
            mergedProfile.lng
          );

          recommendations = [{
            tradeId: matchedTrade.id,
            tradeName: matchedTrade.name_local[targetLang] || matchedTrade.name_en,
            sector: matchedTrade.sector,
            nsqfLevel: matchedTrade.nsqf_level,
            durationHours: matchedTrade.duration_hours,
            reasons: ['Indicative alignment with stated skill interest'],
            score: 0.85,
            trainingPathway: `NSQF-aligned pathway (indicative mapping), Level ${matchedTrade.nsqf_level}`,
            indicativeWageBand: matchedTrade.typical_wage_band_inr || null,
            dataSource: 'Indicative Demo Data (Seed Catalog)',
            trainingCenter: verifiedCenter
          }];
        }
      }
    } catch (recErr) {
      console.warn('[DISHA_VOICE] Non-fatal recommendation engine error:', recErr);
    }
  } else {
    // General chat / Technical inquiry / Coding / Mathematics
    intent = 'general_chat';
    nextStep = 'continue_chat';
    recommendations = [];
  }

  // 7. Spoken Response Generation
  const reply = await generateVoiceReply(userMessage, targetLang, intent, mergedProfile, recommendations);

  return {
    success: true,
    reply,
    language: targetLang,
    intent,
    profileUpdates,
    recommendations,
    nextStep
  };
}
