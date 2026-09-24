import { LanguageCode, BeneficiaryProfile } from './types';

import lexiconHi from '../lexicon/hi.json';
import lexiconEn from '../lexicon/en.json';
import lexiconMr from '../lexicon/mr.json';
import lexiconBn from '../lexicon/bn.json';
import lexiconTa from '../lexicon/ta.json';
import lexiconTe from '../lexicon/te.json';
import lexiconKn from '../lexicon/kn.json';

const lexicons: Record<LanguageCode, any> = {
  hi: lexiconHi,
  en: lexiconEn,
  mr: lexiconMr,
  bn: lexiconBn,
  ta: lexiconTa,
  te: lexiconTe,
  kn: lexiconKn
};

/**
 * NFC Unicode normalisation and strip nuktas / common diacritical marks
 */
export function normalizeIndicText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFC')
    // Remove Devanagari nukta (\u093C) and Bengali nukta (\u09BC)
    .replace(/[\u093C\u09BC]/g, '')
    // Lowercase and trim punctuation
    .toLowerCase()
    .replace(/[.,!?;:"'(){}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Numeral parser across Indic digits, Latin digits and spoken word numbers
 */
export function parseSpokenNumeral(input: string): number | null {
  const norm = normalizeIndicText(input);

  // Multi-script digit maps
  const indicDigitMap: Record<string, number> = {
    // Devanagari ०-९
    '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9,
    // Bengali ০-৯
    '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
    // Tamil ௦-௯
    '௦': 0, '௧': 1, '௨': 2, '௩': 3, '௪': 4, '௫': 5, '௬': 6, '௭': 7, '௮': 8, '௯': 9,
    // Telugu ౦-౯
    '౦': 0, '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9,
    // Kannada ೦-೯
    '೦': 0, '೧': 1, '೨': 2, '೩': 3, '೪': 4, '೫': 5, '೬': 6, '೭': 7, '೮': 8, '೯': 9
  };

  // Check if string contains Indic digits
  let convertedDigits = '';
  let foundIndic = false;
  for (const char of norm) {
    if (indicDigitMap[char] !== undefined) {
      convertedDigits += indicDigitMap[char];
      foundIndic = true;
    } else if (/[0-9]/.test(char)) {
      convertedDigits += char;
    }
  }

  if (convertedDigits.length > 0 && (foundIndic || /[0-9]/.test(norm))) {
    const num = parseInt(convertedDigits, 10);
    if (!isNaN(num)) return num;
  }

  // Word-based number parsing
  const wordNumberMap: Record<string, number> = {
    // English
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'twenty five': 25, 'twentyfive': 25, 'fifty': 50,
    // Hindi / Marathi / Urdu
    'ek': 1, 'do': 2, 'don': 2, 'दोन': 2, 'दो': 2, 'teen': 3, 'तीन': 3,
    'char': 4, 'chaar': 4, 'चार': 4,
    'panch': 5, 'paanch': 5, 'paach': 5, 'पांच': 5, 'पाच': 5,
    'chhah': 6, 'che': 6, 'सहा': 6, 'छह': 6,
    'saat': 7, 'सात': 7, 'aath': 8, 'आठ': 8, 'nau': 9, 'nav': 9, 'नौ': 9, 'नऊ': 9,
    'das': 10, 'daha': 10, 'दस': 10, 'दहा': 10,
    'gyarah': 11, 'barah': 12, 'ग्यारह': 11, 'बारह': 12,
    'pachis': 25, 'pachhees': 25, 'panchvis': 25, 'पच्चीस': 25, 'पंचवीस': 25,
    'pachhas': 50, 'pachaas': 50, 'pannas': 50, 'पचास': 50, 'पन्नास': 50,
    // Tamil / Telugu / Kannada basic numbers
    'onru': 1, 'irandu': 2, 'moondru': 3, 'naangu': 4, 'aindhu': 5, 'patthu': 10,
    'okati': 1, 'rendu': 2, 'moodu': 3, 'nalugu': 4, 'aidu': 5, 'padi': 10,
    'ondu': 1, 'eradu': 2, 'mooru': 3, 'naalku': 4, 'aidu_kn': 5, 'hatthu': 10
  };

  for (const [word, val] of Object.entries(wordNumberMap)) {
    if (norm.includes(word)) return val;
  }

  return null;
}

/**
 * Standard Levenshtein distance
 */
export function calculateLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Trigram similarity for fuzzy match
 */
export function calculateTrigramSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 3 || b.length < 3) {
    return 1 - calculateLevenshtein(a, b) / Math.max(a.length, b.length, 1);
  }

  const getTrigrams = (str: string) => {
    const set = new Set<string>();
    for (let i = 0; i < str.length - 2; i++) {
      set.add(str.slice(i, i + 3));
    }
    return set;
  };

  const triA = getTrigrams(a);
  const triB = getTrigrams(b);
  let intersection = 0;
  for (const t of triA) {
    if (triB.has(t)) intersection++;
  }

  const union = triA.size + triB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface NLUIntentResult {
  controlIntent?: 'repeat' | 'simplify' | 'escalate' | 'delete_data' | 'yes' | 'no';
  isDistressCrisis?: boolean;
  matchedSlotValue?: string;
  confidence: number;
}

const CRISIS_KEYWORDS = [
  'suicide', 'kill', 'emergency', 'police', 'threat', 'danger', 'abuse',
  'aatmahatya', 'mar jana', 'khatra', 'bachao', 'madad karo emergency',
  'आत्महत्या', 'मदद करो', 'खतरा', 'बचाओ', 'इमरजेंसी', 'पोलीस',
  'maripovalani', 'tharkolai', 'saavu', 'aatmahatya karin'
];

/**
 * Robust matcher against control commands and slot values
 */
export function matchNLUIntent(
  rawInput: string,
  slotName?: string,
  lang: LanguageCode = 'hi'
): NLUIntentResult {
  const norm = normalizeIndicText(rawInput);
  if (!norm) return { confidence: 0 };

  // 1. Safety Interlock: Crisis / Distress check
  for (const kw of CRISIS_KEYWORDS) {
    if (norm.includes(kw)) {
      return {
        isDistressCrisis: true,
        controlIntent: 'escalate',
        confidence: 1.0
      };
    }
  }

  const lex = lexicons[lang] || lexicons.hi;

  // 2. Control Intent Check (repeat, simplify, escalate, delete_data, yes, no)
  if (lex && lex.controls) {
    for (const [intentKey, aliases] of Object.entries(lex.controls)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm === normAlias || norm.includes(normAlias)) {
          return {
            controlIntent: intentKey as any,
            confidence: 0.95
          };
        }
      }
    }
  }

  // 3. Slot Match if slotName is provided
  if (slotName && lex && lex.slots && lex.slots[slotName]) {
    const slotDict = lex.slots[slotName];

    // Exact alias check or substring inclusion
    for (const [canonicalVal, aliases] of Object.entries(slotDict)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm === normAlias || norm.includes(normAlias) || (normAlias.length >= 4 && normAlias.includes(norm))) {
          return {
            matchedSlotValue: canonicalVal,
            confidence: 0.95
          };
        }
      }
    }

    // Levenshtein & Trigram fuzzy check
    let bestCanonical = '';
    let bestScore = 0;

    for (const [canonicalVal, aliases] of Object.entries(slotDict)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (normAlias.length >= 4 && norm.length >= 4) {
          const lev = calculateLevenshtein(norm, normAlias);
          if (lev <= 2) {
            const score = 1.0 - lev * 0.15;
            if (score > bestScore) {
              bestScore = score;
              bestCanonical = canonicalVal;
            }
          }
        }
        const trigram = calculateTrigramSimilarity(norm, normAlias);
        if (trigram >= 0.6 && trigram > bestScore) {
          bestScore = trigram;
          bestCanonical = canonicalVal;
        }
      }
    }

    if (bestScore >= 0.45) {
      return {
        matchedSlotValue: bestCanonical,
        confidence: Number(bestScore.toFixed(2))
      };
    }
  }

  // 4. Numeral parsing for travel radius
  if (slotName === 'travel_radius_km') {
    const num = parseSpokenNumeral(norm);
    if (num !== null) {
      const validRadii = [2, 5, 10, 25, 50];
      const closest = validRadii.reduce((prev, curr) =>
        Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
      );
      return {
        matchedSlotValue: String(closest),
        confidence: 0.9
      };
    }
  }

  return {
    matchedSlotValue: norm,
    confidence: 0.4 // Fallback for open free text
  };
}

export interface MultiSlotExtractionResult {
  slotsFound: Partial<BeneficiaryProfile>;
  slotsCount: number;
  matchedDetails: string[];
}

/**
 * Extracts multiple profile slots from a single natural spoken utterance
 * e.g., "मी पुण्यात राहतो, 10वी पास आहे आणि मला इलेक्ट्रिकल काम आवडतं, नोकरी हवी आहे"
 */
export function extractAllProfileSlots(
  rawInput: string,
  lang: LanguageCode = 'hi'
): MultiSlotExtractionResult {
  const norm = normalizeIndicText(rawInput);
  if (!norm) return { slotsFound: {}, slotsCount: 0, matchedDetails: [] };

  const slotsFound: Partial<BeneficiaryProfile> = {};
  const matchedDetails: string[] = [];

  const lex = lexicons[lang] || lexicons.hi;
  if (!lex || !lex.slots) return { slotsFound, slotsCount: 0, matchedDetails };

  // 1. Education Level
  if (lex.slots.education_level) {
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.education_level)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          slotsFound.education_level = canonicalVal as any;
          matchedDetails.push(`Education: ${canonicalVal}`);
          break;
        }
      }
      if (slotsFound.education_level) break;
    }
  }

  // 2. Employment Preference
  if (lex.slots.employment_preference) {
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.employment_preference)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          slotsFound.employment_preference = canonicalVal as any;
          matchedDetails.push(`Preference: ${canonicalVal}`);
          break;
        }
      }
      if (slotsFound.employment_preference) break;
    }
  }

  // 3. Family Occupation
  if (lex.slots.family_occupation) {
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.family_occupation)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          slotsFound.family_occupation = canonicalVal;
          matchedDetails.push(`Family Occupation: ${canonicalVal}`);
          break;
        }
      }
      if (slotsFound.family_occupation) break;
    }
  }

  // 4. Current Livelihood
  if (lex.slots.current_livelihood) {
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.current_livelihood)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          slotsFound.current_livelihood = canonicalVal;
          matchedDetails.push(`Current Livelihood: ${canonicalVal}`);
          break;
        }
      }
      if (slotsFound.current_livelihood) break;
    }
  }

  // 5. Skills & Interests
  if (lex.slots.skills_interests) {
    const matchedSkills: string[] = [];
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.skills_interests)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          if (!matchedSkills.includes(canonicalVal)) {
            matchedSkills.push(canonicalVal);
            matchedDetails.push(`Skill/Interest: ${canonicalVal}`);
          }
          break;
        }
      }
    }
    if (matchedSkills.length > 0) {
      slotsFound.skills_interests = matchedSkills;
    }
  }

  // 6. Constraints
  if (lex.slots.constraints) {
    const matchedConstraints: string[] = [];
    for (const [canonicalVal, aliases] of Object.entries(lex.slots.constraints)) {
      for (const alias of aliases as string[]) {
        const normAlias = normalizeIndicText(alias);
        if (norm.includes(normAlias)) {
          if (canonicalVal !== 'none' && !matchedConstraints.includes(canonicalVal)) {
            matchedConstraints.push(canonicalVal);
            matchedDetails.push(`Constraint: ${canonicalVal}`);
          }
          break;
        }
      }
    }
    if (matchedConstraints.length > 0) {
      slotsFound.constraints = matchedConstraints;
    }
  }

  // 7. Travel Radius
  const numRadius = parseSpokenNumeral(norm);
  if (numRadius !== null && (norm.includes('km') || norm.includes('किमी') || norm.includes('किलोमीटर') || norm.includes('radius') || norm.includes('मर्यादा') || norm.includes('दूरी'))) {
    const validRadii = [2, 5, 10, 25, 50];
    const closest = validRadii.reduce((prev, curr) =>
      Math.abs(curr - numRadius) < Math.abs(prev - numRadius) ? curr : prev
    );
    slotsFound.travel_radius_km = closest as any;
    matchedDetails.push(`Travel Radius: ${closest} km`);
  }

  // 8. Experience Years
  if (norm.includes('वर्षे') || norm.includes('वर्ष') || norm.includes('साल') || norm.includes('years') || norm.includes('year') || norm.includes('anubhav') || norm.includes('अनुभव')) {
    if (norm.includes('अनुभव नाही') || norm.includes('nahi') || norm.includes('fresher') || norm.includes('navin') || norm.includes('नवीन')) {
      slotsFound.experience_years = 0;
      matchedDetails.push('Experience: 0 years (Fresher)');
    } else {
      const expNum = parseSpokenNumeral(norm);
      if (expNum !== null) {
        slotsFound.experience_years = expNum;
        matchedDetails.push(`Experience: ${expNum} years`);
      }
    }
  }

  // 8. District (Matches base, locative and transliterated forms)
  const districtKeywords: Record<string, { name: string; state: string }> = {
    // Pune
    'pune': { name: 'Pune', state: 'Maharashtra' },
    'पुणे': { name: 'Pune', state: 'Maharashtra' },
    'पुण्यात': { name: 'Pune', state: 'Maharashtra' },
    'पुण्यामध्ये': { name: 'Pune', state: 'Maharashtra' },
    'punya': { name: 'Pune', state: 'Maharashtra' },
    'punyat': { name: 'Pune', state: 'Maharashtra' },
    // Solapur
    'solapur': { name: 'Solapur', state: 'Maharashtra' },
    'सोलापूर': { name: 'Solapur', state: 'Maharashtra' },
    'सोलापुरात': { name: 'Solapur', state: 'Maharashtra' },
    'सोलापूरमध्ये': { name: 'Solapur', state: 'Maharashtra' },
    // Kolhapur
    'kolhapur': { name: 'Kolhapur', state: 'Maharashtra' },
    'कोल्हापूर': { name: 'Kolhapur', state: 'Maharashtra' },
    'कोल्हापुरात': { name: 'Kolhapur', state: 'Maharashtra' },
    'कोल्हापूरमध्ये': { name: 'Kolhapur', state: 'Maharashtra' },
    // Mumbai
    'mumbai': { name: 'Mumbai', state: 'Maharashtra' },
    'मुंबई': { name: 'Mumbai', state: 'Maharashtra' },
    'मुंबईत': { name: 'Mumbai', state: 'Maharashtra' },
    'मुंबईमध्ये': { name: 'Mumbai', state: 'Maharashtra' },
    // Nagpur
    'nagpur': { name: 'Nagpur', state: 'Maharashtra' },
    'नागपूर': { name: 'Nagpur', state: 'Maharashtra' },
    'नागपुर': { name: 'Nagpur', state: 'Maharashtra' },
    'नागपुरात': { name: 'Nagpur', state: 'Maharashtra' },
    'नागपुरमध्ये': { name: 'Nagpur', state: 'Maharashtra' },
    // Nashik
    'nashik': { name: 'Nashik', state: 'Maharashtra' },
    'नाशिक': { name: 'Nashik', state: 'Maharashtra' },
    'नाशिकमध्ये': { name: 'Nashik', state: 'Maharashtra' },
    // Varanasi
    'varanasi': { name: 'Varanasi', state: 'Uttar Pradesh' },
    'वाराणसी': { name: 'Varanasi', state: 'Uttar Pradesh' },
    'बनारस': { name: 'Varanasi', state: 'Uttar Pradesh' },
    'banaras': { name: 'Varanasi', state: 'Uttar Pradesh' },
    'kashi': { name: 'Varanasi', state: 'Uttar Pradesh' },
    'काशी': { name: 'Varanasi', state: 'Uttar Pradesh' },
    // Lucknow
    'lucknow': { name: 'Lucknow', state: 'Uttar Pradesh' },
    'लखनऊ': { name: 'Lucknow', state: 'Uttar Pradesh' },
    'लखनौ': { name: 'Lucknow', state: 'Uttar Pradesh' },
    // Kanpur
    'kanpur': { name: 'Kanpur Nagar', state: 'Uttar Pradesh' },
    'कानपुर': { name: 'Kanpur Nagar', state: 'Uttar Pradesh' },
    'कानपूर': { name: 'Kanpur Nagar', state: 'Uttar Pradesh' }
  };

  for (const [kw, info] of Object.entries(districtKeywords)) {
    const normKw = normalizeIndicText(kw);
    if (norm.includes(normKw)) {
      slotsFound.district = info.name;
      slotsFound.district_name_local = info.name;
      slotsFound.state = info.state;
      matchedDetails.push(`District: ${info.name}`);
      break;
    }
  }


  const slotsCount = Object.keys(slotsFound).length;
  return { slotsFound, slotsCount, matchedDetails };
}

