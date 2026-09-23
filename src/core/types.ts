// Disha Sarathi - Core Type Definitions (PS 26097)

export type LanguageCode = 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'kn' | 'en';

export type EducationLevel =
  | 'none'
  | 'primary'
  | 'middle'
  | 'secondary'
  | 'higher_secondary'
  | 'iti_diploma'
  | 'graduate';

export type EmploymentPreference = 'self_employment' | 'wage_employment' | 'either';

export type TravelRadiusKm = 2 | 5 | 10 | 25 | 50;

export type PlacementStatus =
  | 'NOT_STARTED'
  | 'INTERESTED'
  | 'APPLIED'
  | 'ENROLLED'
  | 'IN_TRAINING'
  | 'COMPLETED'
  | 'REFERRED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'JOINED'
  | 'EVIDENCE_SUBMITTED'
  | 'COORDINATOR_VERIFIED'
  | 'EMPLOYER_VERIFIED'
  | 'PLACED'
  | 'SELF_EMPLOYED'
  | 'FOLLOW_UP'
  | 'DROPPED';

export type VerificationLevel =
  | 'SELF_REPORTED'
  | 'EVIDENCE_SUBMITTED'
  | 'COORDINATOR_VERIFIED'
  | 'EMPLOYER_VERIFIED'
  | 'REJECTED'
  | 'NEEDS_CORRECTION';

export type EvidenceType =
  | 'OFFER_LETTER'
  | 'APPOINTMENT_LETTER'
  | 'JOINING_LETTER'
  | 'EMPLOYER_CONFIRMATION'
  | 'EMPLOYMENT_ID'
  | 'OTHER';

export interface PlacementEvidence {
  id: string;
  beneficiary_id: string;
  evidence_type: EvidenceType;
  document_name: string;
  document_url?: string;
  employer_name: string;
  designation?: string;
  joining_date?: string;
  monthly_wage_inr?: string;
  status: VerificationLevel;
  submitted_at: string;
  verified_at?: string;
  verified_by?: string;
  coordinator_notes?: string;
  is_demo?: boolean;
}

export type FollowUpStatus =
  | 'PENDING'
  | 'RETAINED'
  | 'WAGE_RECEIVED'
  | 'ISSUE_REPORTED'
  | 'DROPPED_OUT'
  | 'NOT_DUE';

export interface FollowUpRecord {
  id: string;
  beneficiary_id: string;
  period_days: 7 | 30 | 90;
  due_date: string;
  status: FollowUpStatus;
  completed_at?: string;
  completed_by?: string;
  wage_status?: string;
  remarks?: string;
}

export interface CoordinatorNote {
  id: string;
  beneficiary_id: string;
  coordinator_name: string;
  content: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id?: string;
  user_role?: string;
  action: string;
  details: string;
  ip_or_channel?: string;
}

export interface TrainingBatch {
  id: string;
  center_id: string;
  center_name: string;
  trade_id: string;
  trade_name: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  capacity: number;
  enrolled_count: number;
  stipend_inr_month: number;
  toolkit_subsidy_inr: number;
}

export interface SkillGapAnalysis {
  trade_id: string;
  trade_name: string;
  matched_skills: string[];
  missing_skills: string[];
  training_required_skills: string[];
  severity: 'low' | 'medium' | 'high';
  recommended_intervention: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company_or_agency: string;
  sector: string;
  trade_id: string;
  district: string;
  state: string;
  type: 'wage_employment' | 'self_employment';
  openings_or_capacity: number;
  wage_or_support_inr: string;
  contact_person: string;
  contact_phone: string;
  address: string;
  scheme_link?: string;
  is_demo_seed?: boolean;
}

export interface BeneficiaryProfile {
  name?: string;
  first_name?: string;
  phone_number?: string;
  age?: number;
  gender?: string;
  language?: LanguageCode;
  consent_given?: boolean;
  education_level?: EducationLevel;
  family_occupation?: string;
  current_livelihood?: string;
  skills_interests: string[];
  existing_skills?: string[];
  traditional_skills?: string[];
  transferable_skills?: string[];
  experience_years?: number;
  interests?: string[];
  aspirations?: string;
  constraints: string[];
  constraints_recorded?: boolean;
  travel_radius_km?: TravelRadiusKm;
  employment_preference?: EmploymentPreference;
  district?: string;
  district_name_local?: string;
  state?: string;
  lat?: number;
  lng?: number;
  gps_accuracy_m?: number;
  summary_confirmed?: boolean;
  skill_gap_generated?: boolean;
  profile_completed?: boolean;
  selected_trade_id?: string;
  wants_finance_assistance?: boolean;
  training_status?: 'RECOMMENDED' | 'INTERESTED' | 'APPLIED' | 'ENROLLED' | 'IN_TRAINING' | 'COMPLETED' | 'DROPPED';
  placement_status?: PlacementStatus;
  placement_notes?: string;
  selected_opportunity_id?: string;
  verification_level?: VerificationLevel;
  evidence_list?: PlacementEvidence[];
  follow_ups?: FollowUpRecord[];
  coordinator_notes?: CoordinatorNote[];
}

export type ConversationState =
  | 'LANDING'
  | 'LANG_SELECT'
  | 'GREETING'
  | 'CONSENT'
  | 'LOCATION'
  | 'LOCATION_MANUAL'
  | 'BACKGROUND'
  | 'FAMILY_OCCUPATION'
  | 'CURRENT_LIVELIHOOD'
  | 'SKILLS_INPUT'
  | 'SKILLS_INTERESTS'
  | 'EXPERIENCE'
  | 'INTERESTS'
  | 'ASPIRATIONS'
  | 'CONSTRAINTS'
  | 'TRAVEL_RADIUS'
  | 'EMPLOYMENT_PREFERENCE'
  | 'CONFIRM_SUMMARY'
  | 'SKILL_PASSPORT'
  | 'SKILL_GAP'
  | 'RECOMMENDATION'
  | 'BENEFICIARY_CHOICE'
  | 'LOCAL_OPPORTUNITY'
  | 'CENTER_AND_NEXT_STEPS'
  | 'TRAINING_PATHWAY'
  | 'PLACEMENT_LINKAGE'
  | 'FINANCE_TRACK'
  | 'ASPIRATION_CARD'
  | 'SESSION_FEEDBACK'
  | 'END'
  | 'DECLINED_END'
  | 'DELETED_END'
  | 'ESCALATE_TO_HUMAN'
  | 'PAUSE_RESUME';

export interface ChipOption {
  value: string;
  label: string;
  icon?: string;
}

export interface PromptPackEntry {
  prompt: string;
  simplified: string;
  chips: ChipOption[];
  allowMultiple?: boolean;
  allowFreeText?: boolean;
}

export type PromptPack = Record<string, PromptPackEntry>;

export interface Action {
  type:
    | 'speak'
    | 'render_chips'
    | 'persist'
    | 'play_audio'
    | 'emit_card'
    | 'escalate'
    | 'navigate';
  payload?: any;
}

export interface ConversationEvent {
  type:
    | 'USER_INPUT'
    | 'CHIP_CLICK'
    | 'REPEAT'
    | 'SIMPLIFY'
    | 'SWITCH_LANG'
    | 'ESCALATE'
    | 'DELETE_DATA'
    | 'LOCATION_RESOLVED'
    | 'LOCATION_FAILED'
    | 'CONFIRM'
    | 'REVISE_SLOT'
    | 'SELECT_TRADE'
    | 'SELECT_FINANCE'
    | 'UPDATE_PLACEMENT'
    | 'SUBMIT_FEEDBACK'
    | 'RESTART';
  payload?: any;
  raw_transcript?: string;
  engine?: string;
}

export interface Session {
  id: string;
  ref_code: string;
  created_at: string;
  updated_at: string;
  lang: LanguageCode;
  state: ConversationState;
  previous_state?: ConversationState;
  profile: BeneficiaryProfile;
  transcript: Array<{
    sender: 'bot' | 'user';
    text: string;
    timestamp: string;
    engine?: string;
    state?: ConversationState;
    confidence?: number;
  }>;
  recommendations?: RecommendationResult[];
  trace?: RecommendationTrace;
  feedback?: {
    rating: number;
    comment?: string;
  };
  is_demo_seed?: boolean;
}

export interface DistrictCentroid {
  key: string;
  name: string;
  name_local: Record<LanguageCode, string>;
  state: string;
  lat: number;
  lng: number;
}

export interface NSQFTrade {
  id: string;
  qp_code: string;
  name_en: string;
  name_local: Record<LanguageCode, string>;
  sector: string;
  ssc: string;
  nsqf_level: number;
  duration_hours: number;
  min_education: EducationLevel;
  interest_tags: string[];
  related_occupations: string[];
  physical_demands: string[];
  self_employment_viable: boolean;
  typical_wage_band_inr: string;
  scheme_links: string[];
  required_skills?: string[];
  competencies?: string[];
}

export interface TrainingCenter {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  trades_offered: string[];
  contact_phone: string;
  address: string;
  is_demo_seed?: boolean;
}

export interface SchemeInfo {
  id: string;
  name: Record<LanguageCode, string>;
  short_desc: Record<LanguageCode, string>;
  max_subsidy_loan: string;
  target_group: string;
  link: string;
  interest_subvention: string;
}

export interface CoordinatorInfo {
  id: string;
  name: string;
  district: string;
  state: string;
  phone: string;
  role: 'district_coordinator' | 'financial_consultant';
}

export interface Testimonial {
  id: string;
  trade_id: string;
  beneficiary_name: string;
  district: string;
  lang: LanguageCode;
  quote: string;
  audio_url?: string;
  duration_sec: number;
  consent_on_file: boolean;
}

export interface RecommendationResult {
  trade: NSQFTrade;
  score: number;
  rank: number;
  rationale: string;
  skill_gap: SkillGapAnalysis;
  nearest_center?: {
    center: TrainingCenter;
    distance_km: number;
  };
  no_center_in_range: boolean;
  matching_testimonial?: Testimonial;
  scheme_link?: SchemeInfo;
}

export interface CandidateTrace {
  trade_id: string;
  trade_name: string;
  sector: string;
  filtered_out: boolean;
  filter_reason?: string;
  interest_match: number;
  skill_transfer: number;
  education_fit: number;
  local_demand: number;
  preference_fit: number;
  accessibility: number;
  raw_score: number;
  no_center_in_range: boolean;
  final_score: number;
  skill_gaps?: string[];
}

export interface RecommendationTrace {
  session_id: string;
  timestamp: string;
  duration_ms: number;
  profile_summary: {
    education: string;
    family_occupation: string;
    current_livelihood: string;
    interests: string[];
    constraints: string[];
    radius_km: number;
    preference: string;
    district: string;
  };
  candidates_evaluated_count: number;
  filtered_out_count: number;
  surviving_candidates: CandidateTrace[];
  demand_source: string;
  engine: string;
}
