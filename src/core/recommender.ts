// Disha Sarathi - Deterministic NSQF Recommendation Engine (PS 26097)
import {
  BeneficiaryProfile,
  CandidateTrace,
  EducationLevel,
  LanguageCode,
  NSQFTrade,
  RecommendationResult,
  RecommendationTrace
} from './types';
import nsqfTradesData from '../data/nsqf_trades.json';
import districtMarketData from '../data/district_market.json';
import testimonialsData from '../data/testimonials.json';
import schemesData from '../data/schemes.json';
import { findNearestCenterForTrade } from './geo';
import { analyzeSkillGap } from './skillGap';

const trades = nsqfTradesData as NSQFTrade[];
const districtMarket = districtMarketData as any;
const testimonials = testimonialsData as any[];
const schemes = schemesData as any[];

const EDU_TO_LEARNER_LEVEL: Record<EducationLevel, number> = {
  none: 2,
  primary: 2,
  middle: 3,
  secondary: 4,
  higher_secondary: 4,
  iti_diploma: 5,
  graduate: 5
};

export const EDU_RANK: Record<EducationLevel, number> = {
  none: 0,
  primary: 1,
  middle: 2,
  secondary: 3,
  higher_secondary: 4,
  iti_diploma: 5,
  graduate: 6
};

/**
 * Checks if all required profiling checklist fields are complete
 */
export function isProfileChecklistComplete(profile: BeneficiaryProfile | undefined | null): boolean {
  if (!profile) return false;
  const hasDistrict = !!profile.district;
  const hasEdu = !!profile.education_level;
  const hasFamilyOcc = !!profile.family_occupation;
  const hasLivelihood = !!profile.current_livelihood;
  const hasSkills = !!(profile.skills_interests && profile.skills_interests.length > 0);
  const hasExp = profile.experience_years !== undefined && profile.experience_years !== null;
  const hasRadius = profile.travel_radius_km !== undefined && profile.travel_radius_km !== null;
  const hasPreference = !!profile.employment_preference;

  return (
    hasDistrict &&
    hasEdu &&
    hasFamilyOcc &&
    hasLivelihood &&
    hasSkills &&
    hasExp &&
    hasRadius &&
    hasPreference
  );
}

/**
 * Recommendation Gate Function:
 * Recommendations can ONLY be generated when required fields are complete AND summary is confirmed by beneficiary.
 */
export function canGenerateRecommendations(session: any): boolean {
  if (!session || !session.profile) return false;
  const complete = isProfileChecklistComplete(session.profile);
  const confirmed = session.profile.summary_confirmed === true;
  return complete && confirmed;
}

/**
 * Deterministic recommendation engine (<200ms) with full Explainability Trace & Skill Gaps
 */
export function recommendNSQFTrades(
  profile: BeneficiaryProfile,
  lang: LanguageCode = 'hi',
  sessionId: string = 'session_local'
): { results: RecommendationResult[]; trace: RecommendationTrace } {
  const startTime = performance.now();

  const userEduLevel: EducationLevel = profile.education_level || 'none';
  const learnerLevel = EDU_TO_LEARNER_LEVEL[userEduLevel];
  const userInterests = (profile.skills_interests || []).map((s) => s.toLowerCase());
  const userOccupations = [
    (profile.family_occupation || '').toLowerCase(),
    (profile.current_livelihood || '').toLowerCase()
  ].filter(Boolean);
  const userRadius = profile.travel_radius_km || 25;
  const userConstraints = (profile.constraints || []).map((c) => c.toLowerCase());
  const userPreference = profile.employment_preference || 'either';
  const userDistrict = profile.district || 'Varanasi';
  const userLat = profile.lat || 25.3176;
  const userLng = profile.lng || 82.9739;

  const candidateTraces: CandidateTrace[] = [];
  const validCandidates: Array<{ trade: NSQFTrade; trace: CandidateTrace; score: number }> = [];

  for (const trade of trades) {
    let filteredOut = false;
    let filterReason = '';

    // Hard Filter 1: Physical / Mobility Constraint conflict
    if (
      userConstraints.includes('locomotor_difficulty') &&
      trade.physical_demands.some((p) =>
        ['climbing_ladders', 'climbing_roofs', 'climbing_scaffolding', 'heavy_physical_labor'].includes(p)
      )
    ) {
      filteredOut = true;
      filterReason = 'Physical demand conflicts with mobility constraint';
    }

    // Hard Filter 2: Education Level below trade minimum
    if (!filteredOut && EDU_RANK[userEduLevel] < EDU_RANK[trade.min_education]) {
      filteredOut = true;
      filterReason = `Requires minimum education level: ${trade.min_education} (Beneficiary level: ${userEduLevel})`;
    }

    if (filteredOut) {
      candidateTraces.push({
        trade_id: trade.id,
        trade_name: trade.name_en,
        sector: trade.sector,
        filtered_out: true,
        filter_reason: filterReason,
        interest_match: 0,
        skill_transfer: 0,
        education_fit: 0,
        local_demand: 0,
        preference_fit: 0,
        accessibility: 0,
        raw_score: 0,
        no_center_in_range: false,
        final_score: 0
      });
      continue;
    }

    // 1. Interest Match (0.32 weight)
    let interestMatch = 0;
    const tradeInterests = trade.interest_tags.map((t) => t.toLowerCase());
    if (userInterests.length > 0) {
      const intersection = userInterests.filter((ui) =>
        tradeInterests.some((ti) => ti.includes(ui) || ui.includes(ti))
      );
      interestMatch = intersection.length > 0 ? Math.min(1.0, intersection.length / userInterests.length + 0.3) : 0.1;
      if (tradeInterests.some((ti) => userInterests[0] && ti.includes(userInterests[0]))) {
        interestMatch = 1.0;
      }
    } else {
      interestMatch = 0.5;
    }

    // 2. Skill Transfer (0.20 weight)
    let skillTransfer = 0.1;
    const related = trade.related_occupations.map((r) => r.toLowerCase());
    for (const occ of userOccupations) {
      if (related.some((r) => r.includes(occ) || occ.includes(r))) {
        skillTransfer = 1.0;
        break;
      }
    }

    // 3. Education Fit (0.16 weight)
    // Formula: 1 - |trade.nsqf_level - learner_level| / 4
    const eduDiff = Math.abs(trade.nsqf_level - learnerLevel);
    const educationFit = Math.max(0, Math.min(1, 1 - eduDiff / 4));

    // 4. Local Demand (0.16 weight)
    let localDemand = 0.75;
    const districtEntry =
      districtMarket.pilot_districts[userDistrict] || districtMarket.pilot_districts['default'];
    if (districtEntry && districtEntry[trade.sector]) {
      localDemand = districtEntry[trade.sector].demand_score;
    }

    // 5. Preference Fit (0.10 weight)
    let preferenceFit = 0.5;
    if (userPreference === 'self_employment') {
      preferenceFit = trade.self_employment_viable ? 1.0 : 0.2;
    } else if (userPreference === 'wage_employment') {
      preferenceFit = 1.0;
    } else {
      preferenceFit = 0.8;
    }

    // 6. Accessibility (0.06 weight)
    // Inverse of duration barrier
    const accessibility = Math.max(0.2, 1 - (trade.duration_hours - 200) / 400);

    // Raw Score calculation
    const rawScore =
      0.32 * interestMatch +
      0.20 * skillTransfer +
      0.16 * educationFit +
      0.16 * localDemand +
      0.10 * preferenceFit +
      0.06 * accessibility;

    // Check Nearest Training Center within radius
    const centerInfo = findNearestCenterForTrade(userLat, userLng, trade.id);
    let noCenterInRange = false;
    let finalScore = rawScore;

    if (!centerInfo || centerInfo.distanceKm > userRadius) {
      noCenterInRange = true;
      finalScore = rawScore * 0.6; // 40% penalty for transport barrier
    }

    // Analyze skill gap for this trade
    const gapAnalysis = analyzeSkillGap(profile, trade);

    const candidateTrace: CandidateTrace = {
      trade_id: trade.id,
      trade_name: trade.name_en,
      sector: trade.sector,
      filtered_out: false,
      interest_match: Number(interestMatch.toFixed(3)),
      skill_transfer: Number(skillTransfer.toFixed(3)),
      education_fit: Number(educationFit.toFixed(3)),
      local_demand: Number(localDemand.toFixed(3)),
      preference_fit: Number(preferenceFit.toFixed(3)),
      accessibility: Number(accessibility.toFixed(3)),
      raw_score: Number(rawScore.toFixed(3)),
      no_center_in_range: noCenterInRange,
      final_score: Number(finalScore.toFixed(3)),
      skill_gaps: gapAnalysis.missing_skills
    };

    candidateTraces.push(candidateTrace);
    validCandidates.push({ trade, trace: candidateTrace, score: finalScore });
  }

  // Sort candidates by final score descending
  validCandidates.sort((a, b) => b.score - a.score);

  // Top 3 recommendations
  const topCandidates = validCandidates.slice(0, 3);
  const results: RecommendationResult[] = topCandidates.map((c, index) => {
    const trade = c.trade;
    const centerInfo = findNearestCenterForTrade(userLat, userLng, trade.id);
    const gapAnalysis = analyzeSkillGap(profile, trade);

    // Build personalized rationale interpolating actual spoken/selected slot values
    const spokenInterest = userInterests[0] || 'आपके हुनर';
    const spokenOcc = profile.current_livelihood || profile.family_occupation || 'पारंपरिक अनुभव';

    let rationale = '';
    if (lang === 'hi') {
      rationale = `आपकी "${spokenInterest}" में रुचि और "${spokenOcc}" के अनुभव के आधार पर यह एनएसक्यूएफ लेवल ${trade.nsqf_level} कोर्स आपके जिले में उच्च मांग वाला है।`;
    } else if (lang === 'mr') {
      rationale = `तुमची "${spokenInterest}" मधील आवड आणि "${spokenOcc}" चा अनुभव यावर आधारित हा एनएसक्यूएफ स्तर ${trade.nsqf_level} कोर्स सर्वाधिक उपयुक्त आहे.`;
    } else if (lang === 'bn') {
      rationale = `আপনার "${spokenInterest}" প্রতি আগ্রহ এবং "${spokenOcc}" অভিজ্ঞতার ভিত্তিতে এই এনএসকিউএফ লেভেল ${trade.nsqf_level} কোর্সটি অত্যন্ত লাভজনক।`;
    } else if (lang === 'ta') {
      rationale = `உங்கள் "${spokenInterest}" ஆர்வம் மற்றும் "${spokenOcc}" அனுபவத்தின் அடிப்படையில் இந்த என்எஸ்யுஎஃப் நிலை ${trade.nsqf_level} பயிற்சி சிறந்த வாய்ப்பாகும்.`;
    } else if (lang === 'te') {
      rationale = `మీ "${spokenInterest}" ఆసక్తి మరియు "${spokenOcc}" అనుభవం ఆధారంగా ఈ ఎన్‌ఎస్‌క్యుఎఫ్ లెవల్ ${trade.nsqf_level} కోర్సు చాలా ఉపయోగకరం.`;
    } else if (lang === 'kn') {
      rationale = `ನಿಮ್ಮ "${spokenInterest}" ಆಸಕ್ತಿ ಮತ್ತು "${spokenOcc}" ಅನುಭವದ ಆಧಾರದ ಮೇಲೆ ಈ ಎನ್‌ಎಸ್‌ಕ್ಯೂಎಫ್ ಹಂತ ${trade.nsqf_level} ತರಬೇತಿ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.`;
    } else {
      rationale = `Based on your interest in "${spokenInterest}" and background in "${spokenOcc}", this NSQF Level ${trade.nsqf_level} trade offers strong livelihood prospects in ${userDistrict}.`;
    }

    // Matching testimonial / synthetic persona
    const matchingTestimonial = testimonials.find((t) => t.trade_id === trade.id);

    // Matching scheme
    const schemeLink = trade.scheme_links[0]
      ? schemes.find((s) => s.id === trade.scheme_links[0])
      : undefined;

    return {
      trade,
      score: Number(c.score.toFixed(3)),
      rank: index + 1,
      rationale,
      skill_gap: gapAnalysis,
      nearest_center: centerInfo ? { center: centerInfo.center, distance_km: centerInfo.distanceKm } : undefined,
      no_center_in_range: c.trace.no_center_in_range,
      matching_testimonial: matchingTestimonial,
      scheme_link: schemeLink
    };
  });

  const durationMs = Math.round(performance.now() - startTime);

  const trace: RecommendationTrace = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    duration_ms: durationMs,
    profile_summary: {
      education: userEduLevel,
      family_occupation: profile.family_occupation || 'Not specified',
      current_livelihood: profile.current_livelihood || 'Not specified',
      interests: userInterests,
      constraints: userConstraints,
      radius_km: userRadius,
      preference: userPreference,
      district: userDistrict
    },
    candidates_evaluated_count: trades.length,
    filtered_out_count: candidateTraces.filter((t) => t.filtered_out).length,
    surviving_candidates: candidateTraces.filter((t) => !t.filtered_out),
    demand_source: districtMarket.source || 'synthetic_seed_v1',
    engine: 'DeterministicLocalEngine_v2'
  };

  return { results, trace };
}
