// Disha Sarathi - Post-Training Placement & Opportunity Linkage Engine (PS 26097)
import {
  BeneficiaryProfile,
  EmploymentPreference,
  LanguageCode,
  Opportunity,
  PlacementEvidence,
  PlacementStatus,
  VerificationLevel
} from './types';
import opportunitiesData from '../data/opportunities.json';

const opportunities = opportunitiesData as Opportunity[];

export const PLACEMENT_STATUS_ORDER: PlacementStatus[] = [
  'NOT_STARTED',
  'INTERESTED',
  'APPLIED',
  'ENROLLED',
  'IN_TRAINING',
  'COMPLETED',
  'REFERRED',
  'INTERVIEW',
  'SELECTED',
  'JOINED',
  'EVIDENCE_SUBMITTED',
  'COORDINATOR_VERIFIED',
  'EMPLOYER_VERIFIED',
  'PLACED',
  'SELF_EMPLOYED',
  'FOLLOW_UP',
  'DROPPED'
];

/**
 * Matches relevant local employers or enterprise credit linkages for the recommended NSQF trade
 */
export function getOpportunitiesForTradeAndDistrict(
  tradeId: string,
  district?: string,
  preference?: EmploymentPreference
): Opportunity[] {
  const normDistrict = (district || '').toLowerCase().trim();

  // Match by trade_id and district
  let matched = opportunities.filter((opp) => {
    const tradeMatch = opp.trade_id === tradeId || opp.trade_id === 'generic';
    const districtMatch =
      !normDistrict ||
      opp.district.toLowerCase() === normDistrict ||
      opp.district === 'default';

    if (preference === 'self_employment') {
      return tradeMatch && districtMatch && opp.type === 'self_employment';
    } else if (preference === 'wage_employment') {
      return tradeMatch && districtMatch && opp.type === 'wage_employment';
    }
    return tradeMatch && districtMatch;
  });

  // Fallback if none matched
  if (matched.length === 0) {
    matched = opportunities.filter(
      (opp) => opp.trade_id === tradeId || opp.trade_id === 'generic'
    );
  }

  return matched;
}

/**
 * Returns localized label for placement status
 */
export function getPlacementStatusLabel(status: PlacementStatus, lang: LanguageCode = 'hi'): string {
  const labels: Record<PlacementStatus, Record<LanguageCode, string>> = {
    NOT_STARTED: {
      hi: 'प्रारंभ नहीं',
      mr: 'सुरू नाही',
      bn: 'শুরু হয়নি',
      ta: 'தொடங்கவில்லை',
      te: 'ప్రారంభం కాలేదు',
      kn: 'ಪ್ರಾರಂಭವಾಗಿಲ್ಲ',
      en: 'Not Started'
    },
    INTERESTED: {
      hi: 'रुचि दिखाई',
      mr: 'कौशल्यात स्वारस्य',
      bn: 'আগ্রহী',
      ta: 'ஆர்வமுள்ளவர்',
      te: 'ఆసక్తి ఉంది',
      kn: 'ಆಸಕ್ತಿ ಹೊಂದಿದ್ದಾರೆ',
      en: 'Interested in Pathway'
    },
    APPLIED: {
      hi: 'प्रशिक्षण हेतु आवेदन',
      mr: 'प्रशिक्षणासाठी अर्ज केला',
      bn: 'আবেদন করা হয়েছে',
      ta: 'விண்ணப்பித்தார்',
      te: 'దరఖాస్తు చేశారు',
      kn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ',
      en: 'Applied for Training'
    },
    ENROLLED: {
      hi: 'प्रशिक्षण में नामांकित',
      mr: 'प्रशिक्षणासाठी नोंदणीकृत',
      bn: 'প্রশিক্ষণে নাম নথিভুক্ত',
      ta: 'பயிற்சியில் சேர்ந்தார்',
      te: 'శిక్షణలో చేరారు',
      kn: 'ತರಬೇತಿಗೆ ನೋಂದಾಯಿಸಲಾಗಿದೆ',
      en: 'Enrolled in Training'
    },
    IN_TRAINING: {
      hi: 'प्रशिक्षण जारी',
      mr: 'प्रशिक्षण सुरू',
      bn: 'प्रशिक्षण চলছে',
      ta: 'பயிற்சி நடைபெறுகிறது',
      te: 'శిక్షణ కొనసాగుతోంది',
      kn: 'ತರಬೇತಿ ನಡೆಯುತ್ತಿದೆ',
      en: 'In Training'
    },
    COMPLETED: {
      hi: 'प्रशिक्षण पूर्ण एवं प्रमाणित',
      mr: 'प्रशिक्षण पूर्ण व प्रमाणित',
      bn: 'প্রশিক্ষণ সমাপ্ত',
      ta: 'பயிற்சி நிறைவடைந்தது',
      te: 'శిక్షణ పూర్తయింది',
      kn: 'ತರಬೇತಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
      en: 'Training Completed'
    },
    REFERRED: {
      hi: 'नियोक्ता को प्रेषित',
      mr: 'नियोक्त्याकडे संदर्भित',
      bn: 'নিয়োগকর্তার কাছে পাঠানো হয়েছে',
      ta: 'வேலைவாய்ப்பிற்கு பரிந்துரைக்கப்பட்டது',
      te: 'ఉపాధికి సిఫార్సు చేయబడింది',
      kn: 'ಉದ್ಯೋಗಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
      en: 'Referred to Employer'
    },
    INTERVIEW: {
      hi: 'साक्षात्कार निर्धारित',
      mr: 'मुलाखत निश्चित',
      bn: 'সাক্ষাৎকার নির্ধারিত',
      ta: 'நேர்காணல் திட்டமிடப்பட்டது',
      te: 'ఇంటర్వ్యూ ఖరారైంది',
      kn: 'ಸಂದರ್ಶನ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ',
      en: 'Interview Scheduled'
    },
    SELECTED: {
      hi: 'चयनित / ऑफर प्राप्त',
      mr: 'निवड झाली / ऑफर पत्र मिळाले',
      bn: 'নির্বাচিত',
      ta: 'தேர்வு செய்யப்பட்டார்',
      te: 'ఎంపికయ్యారు',
      kn: 'ಆಯ್ಕೆಯಾಗಿದ್ದಾರೆ',
      en: 'Selected / Offer Received'
    },
    JOINED: {
      hi: 'कार्यभार ग्रहण किया (Joined Workplace)',
      mr: 'कामावर रुजू (Joined)',
      bn: 'কাজে যোগ দিয়েছেন (Joined)',
      ta: 'பணியில் சேர்ந்தார் (Joined)',
      te: 'ఉద్యోగంలో చేరారు (Joined)',
      kn: 'ಕೆಲಸಕ್ಕೆ ಸೇರಿದ್ದಾರೆ (Joined)',
      en: 'Joined Workplace'
    },
    EVIDENCE_SUBMITTED: {
      hi: 'दस्तावेज़ प्रस्तुत (Evidence Submitted - Pending Review)',
      mr: 'कागदपत्रे सादर (Evidence Submitted)',
      bn: 'নথি জমা দেওয়া হয়েছে (Evidence Submitted)',
      ta: 'சான்றுகள் சமர்ப்பிக்கப்பட்டன (Evidence Submitted)',
      te: 'పత్రాలు సమర్పించబడ్డాయి (Evidence Submitted)',
      kn: 'ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ (Evidence Submitted)',
      en: 'Evidence Submitted (Pending Review)'
    },
    COORDINATOR_VERIFIED: {
      hi: 'समन्वयक द्वारा सत्यापित (Coordinator Verified)',
      mr: 'समन्वयकाद्वारे सत्यापित (Coordinator Verified)',
      bn: 'সমন্বয়ক দ্বারা যাচাইকৃত (Coordinator Verified)',
      ta: 'ஒருங்கிணைப்பாளரால் சரிபார்க்கப்பட்டது (Coordinator Verified)',
      te: 'కోఆర్డినేటర్ ధృవీకరించారు (Coordinator Verified)',
      kn: 'ಸಂಯೋಜಕರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (Coordinator Verified)',
      en: 'Coordinator Verified Placement'
    },
    EMPLOYER_VERIFIED: {
      hi: 'नियोक्ता द्वारा पुष्टीकृत (Employer Confirmed)',
      mr: 'नियोक्त्याद्वारे पुष्टीकृत (Employer Confirmed)',
      bn: 'নিয়োগকর্তা দ্বারা নিশ্চিত (Employer Confirmed)',
      ta: 'முதலாளியால் உறுதிப்படுத்தப்பட்டது (Employer Confirmed)',
      te: 'యాజమాన్యం ధృవీకరించింది (Employer Confirmed)',
      kn: 'ಉದ್ಯೋಗದಾತರಿಂದ ದೃಢೀಕರಿಸಲಾಗಿದೆ (Employer Confirmed)',
      en: 'Employer Verified'
    },
    PLACED: {
      hi: 'वेतन रोजगार में पदस्थापित (Placed in Job)',
      mr: 'वेतन रोजगारात रुजू (Placed)',
      bn: 'চাকরিতে নিযুক্ত (Placed)',
      ta: 'வேலையில் சேர்ந்தார் (Placed)',
      te: 'ఉద్యోగంలో చేరారు (Placed)',
      kn: 'ಉದ್ಯೋಗದಲ್ಲಿದ್ದಾರೆ (Placed)',
      en: 'Successfully Placed in Wage Employment'
    },
    SELF_EMPLOYED: {
      hi: 'स्वरोजगार स्थापित (Enterprise Launched with NSFDC/Mudra)',
      mr: 'स्वरोजगार सुरू (Self-Employed)',
      bn: 'স্ব-উদ্যোগ স্থাপিত (Self-Employed)',
      ta: 'சுயதொழில் தொடங்கப்பட்டது (Self-Employed)',
      te: 'స్వయం ఉపాధి ప్రారంభమైంది (Self-Employed)',
      kn: 'ಸ್ವಯಂ ಉದ್ಯೋಗ ಸ್ಥಾಪಿಸಲಾಗಿದೆ (Self-Employed)',
      en: 'Self-Employment Enterprise Launched'
    },
    FOLLOW_UP: {
      hi: 'पोस्ट-प्लेसमेंट अनुवर्तन (Follow-up Active)',
      mr: 'नियोजनोत्तर पाठपुरावा (Follow-up)',
      bn: 'নিয়োগ পরবর্তী পর্যবেক্ষণ (Follow-up)',
      ta: 'வேலைக்கு பிந்தைய கண்காணிப்பு (Follow-up)',
      te: 'ఉద్యోగానంతర పర్యవేక్షణ (Follow-up)',
      kn: 'ಉದ್ಯೋಗದ ನಂತರದ ಪರಿಶೀಲನೆ (Follow-up)',
      en: 'Post-Placement Follow-up Active'
    },
    DROPPED: {
      hi: 'प्रशिक्षण अधूरा / ड्रॉपआउट (Dropped Out)',
      mr: 'प्रशिक्षण अपूर्ण (Dropped Out)',
      bn: 'বাদ পড়েছে (Dropped Out)',
      ta: 'இடைநின்றது (Dropped Out)',
      te: 'మధ్యలో నిలిచిపోయింది (Dropped Out)',
      kn: 'ಮಧ್ಯದಲ್ಲೇ ಕೈಬಿಡಲಾಗಿದೆ (Dropped Out)',
      en: 'Discontinued / Dropped'
    }
  };

  return labels[status]?.[lang] || labels[status]?.en || status;
}

/**
 * Returns localized label for verification levels
 */
export function getVerificationLevelLabel(level: VerificationLevel, lang: LanguageCode = 'hi'): string {
  const labels: Record<VerificationLevel, Record<LanguageCode, string>> = {
    SELF_REPORTED: {
      hi: 'स्व-घोषित',
      mr: 'स्वयं-नोंदवलेले',
      bn: 'স্ব-ঘোষিত',
      ta: 'சுயமாக அறிவிக்கப்பட்டது',
      te: 'స్వీయ నివేదిక',
      kn: 'ಸ್ವಯಂ ಘೋಷಿತ',
      en: 'Self-Reported'
    },
    EVIDENCE_SUBMITTED: {
      hi: 'दस्तावेज़ प्रस्तुत - समीक्षाधीन',
      mr: 'कागदपत्रे सादर - पुनरावलोकनाधीन',
      bn: 'নথি জমা দেওয়া হয়েছে',
      ta: 'சான்றுகள் சமர்ப்பிக்கப்பட்டன',
      te: 'పత్రాలు సమర్పించబడ్డాయి',
      kn: 'ದಾಖಲೆ ಸಲ್ಲಿಸಲಾಗಿದೆ',
      en: 'Evidence Submitted'
    },
    COORDINATOR_VERIFIED: {
      hi: 'GIA समन्वयक द्वारा सत्यापित',
      mr: 'GIA समन्वयकाद्वारे सत्यापित',
      bn: 'সমন্বয়ক দ্বারা যাচাইকৃত',
      ta: 'ஒருங்கிணைப்பாளரால் சரிபார்க்கப்பட்டது',
      te: 'కోఆర్డినేటర్ ధృవీకరించారు',
      kn: 'ಸಂಯೋಜಕರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
      en: 'Coordinator Verified'
    },
    EMPLOYER_VERIFIED: {
      hi: 'नियोक्ता द्वारा पुष्टीकृत',
      mr: 'नियोक्त्याद्वारे पुष्टीकृत',
      bn: 'নিয়োগকর্তা দ্বারা নিশ্চিত',
      ta: 'முதலாளியால் உறுதிப்படுத்தப்பட்டது',
      te: 'యాజమాన్యం ధృవీకరించింది',
      kn: 'ಉದ್ಯೋಗದಾತರಿಂದ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
      en: 'Employer Verified'
    },
    REJECTED: {
      hi: 'अस्वीकृत / अमान्य',
      mr: 'नाकारले',
      bn: 'প্রত্যাখ্যাত',
      ta: 'நிராகரிக்கப்பட்டது',
      te: 'తిరస్కరించబడింది',
      kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
      en: 'Rejected'
    },
    NEEDS_CORRECTION: {
      hi: 'सुधार अपेक्षित',
      mr: 'दुरुस्ती आवश्यक',
      bn: 'সংশোধন প্রয়োজন',
      ta: 'திருத்தம் தேவை',
      te: 'సవరణ అవసరం',
      kn: 'ತಿದ್ದುಪಡಿ ಅಗತ್ಯವಿದೆ',
      en: 'Needs Correction'
    }
  };

  return labels[level]?.[lang] || labels[level]?.en || level;
}

/**
 * Updates placement state, notes, and verification level on beneficiary profile
 */
export function updatePlacementRecord(
  profile: BeneficiaryProfile,
  status: PlacementStatus,
  opportunityId?: string,
  notes?: string,
  verificationLevel?: VerificationLevel,
  evidenceList?: PlacementEvidence[]
): BeneficiaryProfile {
  return {
    ...profile,
    placement_status: status,
    selected_opportunity_id: opportunityId || profile.selected_opportunity_id,
    placement_notes: notes || profile.placement_notes,
    verification_level: verificationLevel || profile.verification_level,
    evidence_list: evidenceList || profile.evidence_list
  };
}
