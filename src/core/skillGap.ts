// Disha Sarathi - Skill Gap Analysis Engine (PS 26097)
import { BeneficiaryProfile, NSQFTrade, SkillGapAnalysis } from './types';

// Sector-level standard NSQF competency maps
const SECTOR_COMPETENCIES: Record<string, string[]> = {
  'Apparel, Made-Ups & Home Furnishing': [
    'Garment Pattern Drafting',
    'Industrial Sewing Machine Operation',
    'Quality Inspection & Finishing',
    'Fabric Selection & Cutting',
    'Workplace Health & Safety Standards'
  ],
  'Electronics & Hardware': [
    'Basic Electrical & Electronic Principles',
    'Circuit Diagnostics & Multimeter Use',
    'Soldering & Component Assembly',
    'Wiring & Panel Installation',
    'Electrical Safety & Earthing Protocols'
  ],
  'Construction': [
    'Basic Electrical Wiring & Load Calculation',
    'Circuit Breakers & Distribution Boards',
    'Conduit & Cable Routing',
    'Earthing & Lightning Protection',
    'Electrical Safety Compliance & First Aid'
  ],
  'Healthcare': [
    'Patient Vital Signs Monitoring',
    'Infection Control & Hygiene Protocols',
    'Basic First Aid & Emergency Response',
    'Patient Mobility & Bedside Care',
    'Medical Equipment Sterilization'
  ],
  'Agriculture': [
    'Soil Health & Organic Nutrient Management',
    'Drip Irrigation & Water Conservation',
    'Integrated Pest Management (IPM)',
    'Post-Harvest Storage & Processing',
    'Farm Equipment Operation & Safety'
  ],
  'Automotive': [
    'Engine & Transmission Diagnostics',
    'Brake & Suspension Servicing',
    'Automotive Electrical Wiring',
    'Preventive Maintenance Checklists',
    'Workshop Safety & Hazardous Material Handling'
  ],
  'Beauty & Wellness': [
    'Skin & Hair Care Procedures',
    'Sanitation & Sterilization Standards',
    'Professional Makeup & Styling Techniques',
    'Client Consultation & Ethics',
    'Product Knowledge & Inventory Care'
  ],
  'IT-ITeS': [
    'Data Entry & Typing Accuracy',
    'Office Productivity Tools (Excel, Docs)',
    'Digital Communication & Customer Query Resolution',
    'Internet & Cyber Safety Awareness',
    'Basic Hardware Troubleshooting'
  ],
  'Green Jobs': [
    'Solar PV Panel Installation & Mounting',
    'Inverter & Battery Wiring Connections',
    'Solar System Performance Testing',
    'Rooftop Electrical Safety Protocols',
    'Renewable Energy System Maintenance'
  ],
  'Tourism & Hospitality': [
    'Food Preparation & Culinary Hygiene',
    'Guest Relations & Professional Etiquette',
    'Table Setup & Beverage Service',
    'Food Safety & HACCP Guidelines',
    'Billing & Point of Sale (POS) Operation'
  ]
};

// Default fallback competencies
const DEFAULT_COMPETENCIES = [
  'Foundational Trade Theory',
  'Practical Tool & Equipment Handling',
  'Quality Standards & Measurement',
  'Workplace Safety Compliance',
  'Customer Interaction & Service Skills'
];

/**
 * Calculates skill gap analysis between beneficiary profile and NSQF trade
 */
export function analyzeSkillGap(
  profile: BeneficiaryProfile,
  trade: NSQFTrade
): SkillGapAnalysis {
  if (!trade) {
    return {
      trade_id: 'unknown',
      trade_name: 'General Trade',
      matched_skills: [],
      missing_skills: ['Foundational Vocational Competencies'],
      training_required_skills: ['NSQF Standard Workplace Safety & Certification'],
      severity: 'medium',
      recommended_intervention: 'Standard NSQF Skilling under PM-AJAY.'
    };
  }

  const userInterests = (profile.skills_interests || []).map((s) => s.toLowerCase());
  const userOccupations = [
    (profile.family_occupation || '').toLowerCase(),
    (profile.current_livelihood || '').toLowerCase()
  ].filter(Boolean);

  // Determine required competencies for this trade
  const tradeCompetencies =
    trade.competencies && trade.competencies.length > 0
      ? trade.competencies
      : trade.required_skills && trade.required_skills.length > 0
      ? trade.required_skills
      : SECTOR_COMPETENCIES[trade.sector] || DEFAULT_COMPETENCIES;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const comp of tradeCompetencies) {
    const compLower = comp.toLowerCase();
    // Check if user has related interest, current livelihood, or family occupation
    const isMatched =
      userInterests.some((ui) => compLower.includes(ui) || ui.includes(compLower)) ||
      userOccupations.some((occ) => compLower.includes(occ) || occ.includes(compLower)) ||
      trade.related_occupations.some((ro) =>
        userOccupations.some((occ) => occ.includes(ro.toLowerCase()) || ro.toLowerCase().includes(occ))
      ) && (compLower.includes('basic') || compLower.includes('operation') || compLower.includes('care'));

    if (isMatched) {
      matchedSkills.push(comp);
    } else {
      missingSkills.push(comp);
    }
  }

  // If nothing matched, assign base foundational match from interest
  if (matchedSkills.length === 0 && userInterests.length > 0) {
    const firstMatchedInterest = userInterests[0];
    matchedSkills.push(`Foundational interest in ${firstMatchedInterest}`);
  }

  // Training required skills are missing skills + safety/certification modules
  const trainingRequired = [...missingSkills];
  if (!trainingRequired.includes('NSQF Standard Workplace Safety & Certification')) {
    trainingRequired.push('NSQF Standard Workplace Safety & Certification');
  }

  // Severity calculation
  const matchRatio = matchedSkills.length / Math.max(tradeCompetencies.length, 1);
  let severity: 'low' | 'medium' | 'high' = 'medium';
  if (matchRatio >= 0.5) {
    severity = 'low';
  } else if (matchRatio <= 0.2) {
    severity = 'high';
  }

  // Recommended intervention
  let intervention = '';
  if (severity === 'low') {
    intervention = `Bridge Training & Recognition of Prior Learning (RPL) under PM-AJAY (${trade.duration_hours} hrs Fast-Track).`;
  } else if (severity === 'medium') {
    intervention = `Standard NSQF Level ${trade.nsqf_level} Certification with practical hands-on workshop training (${trade.duration_hours} hrs).`;
  } else {
    intervention = `Full Foundation & Advanced Skilling Package with dedicated tool-kit subsidy and placement linkage under PM-AJAY GIA (${trade.duration_hours} hrs).`;
  }

  return {
    trade_id: trade.id,
    trade_name: trade.name_en,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    training_required_skills: trainingRequired,
    severity,
    recommended_intervention: intervention
  };
}
