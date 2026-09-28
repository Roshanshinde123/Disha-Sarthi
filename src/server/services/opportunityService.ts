// Disha Sarathi - Opportunity Search & Real/Demo Data Service (PS 26097)
// Authoritative dataset lookup with Haversine distance and strict demo vs real indicators.
// SERVER-SIDE ONLY.

import { Opportunity, TrainingCenter } from '../../core/types';
import { calculateHaversineDistanceKm } from '../../core/geo';
import opportunitiesData from '../../data/opportunities.json';
import trainingCentersData from '../../data/training_centers.json';

const allOpportunities = opportunitiesData as (Opportunity & { lat?: number; lng?: number })[];
const allTrainingCenters = trainingCentersData as TrainingCenter[];

export interface OpportunitySearchQuery {
  tradeId?: string;
  skills?: string[];
  district?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  employmentPreference?: string;
  language?: 'en' | 'hi' | 'mr' | string;
}

export interface GroundedOpportunityResult {
  id: string;
  title: string;
  employerName: string;
  tradeId: string;
  location: string;
  district: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  employmentType: 'wage_employment' | 'self_employment';
  salaryRange: string;
  source: string;
  sourceDate: string;
  isLive: boolean;
  isDemo: boolean;
  contactPerson?: string;
  contactPhone?: string;
}

export interface GroundedCenterResult {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  address: string;
  contactPhone?: string;
  isDemo: boolean;
}

export interface OpportunitySearchResponse {
  success: boolean;
  source: string;
  isLive: boolean;
  isDemo: boolean;
  opportunities: GroundedOpportunityResult[];
  trainingCenters: GroundedCenterResult[];
  summary: string;
  error?: string;
}

/**
 * Searches authoritative opportunity catalog and calculates distance using Haversine if coordinates exist.
 * NEVER fabricates coordinates or live vacancies.
 */
export function searchOpportunities(query: OpportunitySearchQuery): OpportunitySearchResponse {
  try {
    const normDistrict = (query.district || '').toLowerCase().trim();
    const normTradeId = (query.tradeId || '').toLowerCase().trim();
    const userLat = typeof query.latitude === 'number' && !isNaN(query.latitude) && query.latitude !== 0 ? query.latitude : null;
    const userLng = typeof query.longitude === 'number' && !isNaN(query.longitude) && query.longitude !== 0 ? query.longitude : null;
    const radius = query.radiusKm && query.radiusKm > 0 ? query.radiusKm : 50;
    const lang = query.language === 'en' || query.language === 'hi' || query.language === 'mr' ? query.language : 'mr';

    // 1. Filter opportunities by trade & district
    let matchedOpps = allOpportunities.filter((opp) => {
      const oppTrade = (opp.trade_id || '').toLowerCase();
      const oppDist = (opp.district || '').toLowerCase();

      const tradeMatch = !normTradeId
        ? true
        : (oppTrade === normTradeId || (normTradeId === 'generic' && oppTrade === 'generic'));
      const distMatch = !normDistrict || oppDist === normDistrict || oppDist === 'default';

      if (query.employmentPreference === 'self_employment') {
        return tradeMatch && distMatch && opp.type === 'self_employment';
      } else if (query.employmentPreference === 'wage_employment') {
        return tradeMatch && distMatch && opp.type === 'wage_employment';
      }

      return tradeMatch && distMatch;
    });

    // Fallback by trade if no exact district match
    if (matchedOpps.length === 0 && normTradeId) {
      matchedOpps = allOpportunities.filter((opp) => {
        const oppTrade = (opp.trade_id || '').toLowerCase();
        return oppTrade === normTradeId || (normTradeId === 'generic' && oppTrade === 'generic');
      });
    }

    // Transform into grounded results with distance calculation
    const formattedOpps: GroundedOpportunityResult[] = matchedOpps.map((opp) => {
      const hasValidCoords = typeof opp.lat === 'number' && typeof opp.lng === 'number' && !isNaN(opp.lat) && !isNaN(opp.lng) && opp.lat !== 0 && opp.lng !== 0;
      let distKm: number | null = null;

      if (hasValidCoords && userLat !== null && userLng !== null) {
        distKm = calculateHaversineDistanceKm(userLat, userLng, opp.lat!, opp.lng!);
      }

      return {
        id: opp.id,
        title: opp.title,
        employerName: opp.company_or_agency,
        tradeId: opp.trade_id,
        location: opp.address,
        district: opp.district,
        state: opp.state,
        latitude: hasValidCoords ? opp.lat! : null,
        longitude: hasValidCoords ? opp.lng! : null,
        distanceKm: distKm,
        employmentType: opp.type,
        salaryRange: opp.wage_or_support_inr,
        source: opp.is_demo_seed ? 'Indicative Demo Data (Seed Catalog)' : 'Authoritative National Apprenticeship & State Registry',
        sourceDate: '2026-09-28',
        isLive: false,
        isDemo: opp.is_demo_seed !== false,
        contactPerson: opp.contact_person,
        contactPhone: opp.contact_phone
      };
    });

    // Sort by distance if available
    formattedOpps.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

    const proximateOpps = (userLat !== null && userLng !== null && radius > 0)
      ? formattedOpps.filter(o => o.distanceKm === null || o.distanceKm <= radius * 2)
      : formattedOpps;

    // 2. Find matching training centers
    let matchedCenters = allTrainingCenters.filter((c) => {
      const tradeMatch = !normTradeId || c.trades_offered.includes(normTradeId);
      const distMatch = !normDistrict || c.district.toLowerCase() === normDistrict;
      return tradeMatch && distMatch;
    });

    if (matchedCenters.length === 0 && normTradeId) {
      matchedCenters = allTrainingCenters.filter((c) => c.trades_offered.includes(normTradeId));
    }

    const formattedCenters: GroundedCenterResult[] = matchedCenters.slice(0, 3).map((c) => {
      const hasValidCoords = typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng) && c.lat !== 0 && c.lng !== 0;
      let distKm: number | null = null;

      if (hasValidCoords && userLat !== null && userLng !== null) {
        distKm = calculateHaversineDistanceKm(userLat, userLng, c.lat, c.lng);
      }

      return {
        id: c.id,
        name: c.name,
        district: c.district,
        state: c.state,
        latitude: hasValidCoords ? c.lat : null,
        longitude: hasValidCoords ? c.lng : null,
        distanceKm: distKm,
        address: c.address,
        contactPhone: c.contact_phone,
        isDemo: c.is_demo_seed !== false
      };
    });

    // Generate clean summary text
    let summaryText = '';
    const oppCount = proximateOpps.length;
    const centerCount = formattedCenters.length;

    if (oppCount === 0) {
      if (lang === 'mr') {
        summaryText = `आपण निवडलेल्या निकषांनुसार सध्या कोणतीही थेट उपलब्ध संधी सापडली नाही.`;
      } else if (lang === 'hi') {
        summaryText = `आपके चुने गए मानदंडों के अनुसार वर्तमान में कोई उपयुक्त अवसर नहीं मिला।`;
      } else {
        summaryText = `No matching opportunities were found for your selected criteria.`;
      }
    } else {
      if (lang === 'mr') {
        summaryText = `आपल्यासाठी ${oppCount} स्थानिक संधी व ${centerCount} प्रशिक्षण केंद्रे सापडली आहेत (डेमो कॅटलॉग डेटा).`;
      } else if (lang === 'hi') {
        summaryText = `आपके लिए ${oppCount} स्थानीय अवसर और ${centerCount} प्रशिक्षण केंद्र मिले हैं (डेमो कैटलॉग डेटा)।`;
      } else {
        summaryText = `Found ${oppCount} local opportunities and ${centerCount} training centers (indicative demo data).`;
      }
    }

    return {
      success: true,
      source: 'Indicative Demo Data (Seed Catalog)',
      isLive: false,
      isDemo: true,
      opportunities: proximateOpps,
      trainingCenters: formattedCenters,
      summary: summaryText
    };
  } catch (err: any) {
    return {
      success: false,
      source: 'Error',
      isLive: false,
      isDemo: true,
      opportunities: [],
      trainingCenters: [],
      summary: 'Error processing opportunity search',
      error: err?.message || 'Internal error'
    };
  }
}
