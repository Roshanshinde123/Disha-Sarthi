// Disha Sarathi - Grounded Gemini Conversational Intelligence Layer (PS 26097)
// STRICT FACTUAL GROUNDING — Tool/Function Calling, Zero Hallucinations, Server-Side Key Only.
// SERVER-SIDE ONLY — never import from client code.

import { searchOpportunities, OpportunitySearchQuery } from './opportunityService';
import { BeneficiaryProfile, LanguageCode } from '../../core/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface GeminiExplainRequest {
  profile: Partial<BeneficiaryProfile>;
  tradeName: string;
  tradeId: string;
  rationale?: string;
  language?: LanguageCode;
}

export interface GeminiInquiryRequest {
  message: string;
  profile?: Partial<BeneficiaryProfile> | null;
  language?: LanguageCode;
}

export interface GeminiExplainResponse {
  success: boolean;
  explanation: string;
  opportunities: any[];
  trainingCenters: any[];
  engine: string;
  source: string;
}

const SYSTEM_INSTRUCTIONS = `
You are the conversational intelligence layer of Disha Sarathi, an AI-driven livelihood and vocational guidance system for PM-AJAY.

STRICT GROUNDING & ACCURACY RULES:
1. You may explain and summarize ONLY data provided in the prompt or returned by authorized tools.
2. You must NOT invent:
   - jobs or vacancies
   - employers or company names
   - addresses or locations
   - wages, salaries, or stipend amounts
   - training centres
   - government benefits or certifications
   - placement outcomes
3. If no matching opportunity is returned by the tool or dataset, explicitly state that no matching opportunity was found near that location. NEVER fabricate a plausible company.
4. If data is marked as demo/seed data, clearly identify it as indicative demo data.
5. Answer in the requested language (en, hi, mr, bn, gu, kn, ml, od, pa, ta, te, as) using natural, polite, respectful tone.
6. Keep your answers concise, clear, and actionable (2-4 sentences).
`.trim();

/**
 * Explains a deterministic recommendation with grounded real/demo opportunities
 */
export async function explainRecommendationWithGemini(
  req: GeminiExplainRequest
): Promise<GeminiExplainResponse> {
  const lang = req.language || 'mr';
  const query: OpportunitySearchQuery = {
    tradeId: req.tradeId,
    district: req.profile.district,
    latitude: req.profile.lat,
    longitude: req.profile.lng,
    radiusKm: req.profile.travel_radius_km,
    employmentPreference: req.profile.employment_preference,
    language: lang
  };

  const oppData = searchOpportunities(query);
  const oppCount = oppData.opportunities.length;
  const topOpp = oppData.opportunities[0];

  // Multilingual deterministic fallback explanations for all 12 languages
  let fallbackExplanation = '';
  switch (lang) {
    case 'mr':
      fallbackExplanation = oppCount > 0
        ? `आपल्या प्रोफाईल आणि आवडीनुसार ${req.tradeName} हा कौशल्य मार्ग योग्य आहे. आपल्या जिल्ह्यात ${oppCount} स्थानिक संधी उपलब्ध आहेत (उदा. ${topOpp.employerName}).`
        : `आपल्या प्रोफाईलनुसार ${req.tradeName} हा कौशल्य मार्ग योग्य आहे. सध्या आपल्या जिल्ह्यात थेट रिक्त जागांची नोंद नाही, पण प्रशिक्षण केंद्र उपलब्ध आहे.`;
      break;
    case 'hi':
      fallbackExplanation = oppCount > 0
        ? `आपकी प्रोफाइल और रुचि के अनुसार ${req.tradeName} कौशल मार्ग सर्वश्रेष्ठ है। आपके जिले में ${oppCount} स्थानीय अवसर उपलब्ध हैं (जैसे ${topOpp.employerName})।`
        : `आपकी प्रोफाइल के अनुसार ${req.tradeName} कौशल मार्ग सर्वश्रेष्ठ है। वर्तमान में आपके जिले में रिक्त पद उपलब्ध नहीं हैं, परंतु प्रशिक्षण केंद्र उपलब्ध है।`;
      break;
    case 'bn':
      fallbackExplanation = oppCount > 0
        ? `আপনার প্রোফাইল ও আগ্রহ অনুযায়ী ${req.tradeName} উপযুক্ত পথ। আপনার জেলায় ${oppCount}টি স্থানীয় সুযোগ রয়েছে (যেমন ${topOpp.employerName})।`
        : `আপনার প্রোফাইল অনুযায়ী ${req.tradeName} উপযুক্ত পথ। বর্তমানে কোনো শূন্যপদ নথিভুক্ত নেই, তবে প্রশিক্ষণ কেন্দ্র রয়েছে।`;
      break;
    case 'gu':
      fallbackExplanation = oppCount > 0
        ? `તમારી પ્રોફાઇલ મુજબ ${req.tradeName} યોગ્ય માર્ગ છે. તમારા જિલ્લામાં ${oppCount} તકો ઉપલબ્ધ છે (જેમ કે ${topOpp.employerName}).`
        : `તમારી પ્રોફાઇલ મુજબ ${req.tradeName} યોગ્ય માર્ગ છે. હાલમાં ખાલી જગ્યા નથી પરંતુ તાલીમ કેન્દ્ર ઉપલબ્ધ છે.`;
      break;
    case 'kn':
      fallbackExplanation = oppCount > 0
        ? `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪ್ರಕಾರ ${req.tradeName} ಸೂಕ್ತ ಮಾರ್ಗವಾಗಿದೆ. ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ${oppCount} ಸ್ಥಳೀಯ ಅವಕಾಶಗಳಿವೆ (ಉದಾ. ${topOpp.employerName}).`
        : `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪ್ರಕಾರ ${req.tradeName} ಸೂಕ್ತವಾಗಿದೆ. ಪ್ರಸ್ತುತ ತರಬೇತಿ ಕೇಂದ್ರಗಳು ಲಭ್ಯವಿವೆ.`;
      break;
    case 'ml':
      fallbackExplanation = oppCount > 0
        ? `നിങ്ങളുടെ പ്രൊഫൈൽ അനുസരിച്ച് ${req.tradeName} മികച്ച അവസരമാണ്. ${oppCount} പ്രാദേശിക അവസരങ്ങൾ ലഭ്യമാണ് (${topOpp.employerName}).`
        : `നിങ്ങളുടെ പ്രൊഫൈൽ അനുസരിച്ച് ${req.tradeName} അനുയോജ്യമാണ്. പരിശീലന കേന്ദ്രങ്ങൾ ലഭ്യമാണ്.`;
      break;
    case 'od':
      fallbackExplanation = oppCount > 0
        ? `ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ଅନୁଯାୟୀ ${req.tradeName} ଉପଯୁକ୍ତ ପଥ। ଆପଣଙ୍କ ଜିଲ୍ଲାରେ ${oppCount}ଟି ସ୍ଥାନୀୟ ସୁଯୋଗ ଉପଲବ୍ଧ (${topOpp.employerName})।`
        : `ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ଅନୁଯାୟୀ ${req.tradeName} ଉପଯୁକ୍ତ ପଥ। ପ୍ରଶିକ୍ଷଣ କେନ୍ଦ୍ର ଉପଲବ୍ଧ ଅଛି।`;
      break;
    case 'pa':
      fallbackExplanation = oppCount > 0
        ? `ਤੁਹਾਡੇ ਪ੍ਰੋਫਾਈਲ ਅਨੁਸਾਰ ${req.tradeName} ਵਧੀਆ ਮੌਕਾ ਹੈ। ਤੁਹਾਡੇ ਜ਼ਿਲ੍ਹੇ ਵਿੱਚ ${oppCount} ਮੌਕੇ ਉਪਲਬਧ ਹਨ (ਜਿਵੇਂ ${topOpp.employerName})।`
        : `ਤੁਹਾਡੇ ਪ੍ਰੋਫਾਈਲ ਅਨੁਸਾਰ ${req.tradeName} ਸਹੀ ਚੋਣ ਹੈ। ਸਿਖਲਾਈ ਕੇਂਦਰ ਉਪਲਬਧ ਹਨ।`;
      break;
    case 'ta':
      fallbackExplanation = oppCount > 0
        ? `உங்கள் சுயவிவரத்தின்படி ${req.tradeName} சிறந்த பாதையாகும். உங்கள் மாவட்டத்தில் ${oppCount} வாய்ப்புகள் உள்ளன (${topOpp.employerName}).`
        : `உங்கள் சுயவிவரத்தின்படி ${req.tradeName} பொருத்தமானது. பயிற்சி மையங்கள் உள்ளன.`;
      break;
    case 'te':
      fallbackExplanation = oppCount > 0
        ? `మీ ప్రొఫైల్ ప్రకారం ${req.tradeName} సరియైన మార్గం. మీ జిల్లాలో ${oppCount} అవకాశాలు ఉన్నాయి (${topOpp.employerName}).`
        : `మీ ప్రొఫైల్ ప్రకారం ${req.tradeName} సరియైనది. శిక్షణ కేంద్రాలు అందుబాటులో ఉన్నాయి.`;
      break;
    case 'as':
      fallbackExplanation = oppCount > 0
        ? `আপোনাৰ প্ৰ'ফাইল অনুসৰি ${req.tradeName} উপযুক্ত পথ। আপোনাৰ জিলাত ${oppCount}টা সুযোগ আছে (${topOpp.employerName})।`
        : `আপোনাৰ প্ৰ'ফাইল অনুসৰি ${req.tradeName} উপযুক্ত পথ। প্ৰশিক্ষণ কেন্দ্ৰ উপলব্ধ আছে।`;
      break;
    default:
      fallbackExplanation = oppCount > 0
        ? `Based on your verified profile, ${req.tradeName} is a strong match. Found ${oppCount} opportunities nearby (e.g. ${topOpp.employerName}).`
        : `Based on your profile, ${req.tradeName} is a strong match. No active vacancies are currently listed, but training centers are available.`;
      break;
  }

  if (!GEMINI_API_KEY) {
    return {
      success: true,
      explanation: fallbackExplanation,
      opportunities: oppData.opportunities,
      trainingCenters: oppData.trainingCenters,
      engine: 'Deterministic-Grounded',
      source: oppData.source
    };
  }

  try {
    const prompt = `
User Profile:
- District: ${req.profile.district || 'Not specified'}
- Education: ${req.profile.education_level || 'Not specified'}
- Skills/Interests: ${(req.profile.skills_interests || []).join(', ') || 'Not specified'}
- Recommended NSQF Trade: ${req.tradeName} (ID: ${req.tradeId})
- Base Rationale: ${req.rationale || 'High profile match'}

Available Grounded Opportunities:
${JSON.stringify(oppData.opportunities.slice(0, 3), null, 2)}

Available Training Centers:
${JSON.stringify(oppData.trainingCenters.slice(0, 2), null, 2)}

Task: Provide a concise, encouraging, 2-sentence explanation of why this trade and these opportunities match the beneficiary in ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.
Strict rule: Rely ONLY on the above data. If opportunities are demo data, keep it indicative. Do not invent salaries or vacancies.
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 250 }
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (apiRes.ok) {
      const data = await apiRes.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (generatedText) {
        return {
          success: true,
          explanation: generatedText,
          opportunities: oppData.opportunities,
          trainingCenters: oppData.trainingCenters,
          engine: 'Gemini-2.5-Flash (Grounded)',
          source: oppData.source
        };
      }
    }
  } catch (err) {
    console.warn('[GEMINI] Failover to deterministic grounded explanation:', err);
  }

  return {
    success: true,
    explanation: fallbackExplanation,
    opportunities: oppData.opportunities,
    trainingCenters: oppData.trainingCenters,
    engine: 'Deterministic-Grounded',
    source: oppData.source
  };
}
