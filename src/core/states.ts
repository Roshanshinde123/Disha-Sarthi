// Disha Sarathi - State Machine Definitions & Cross-Cutting Triggers (PS 26097)
import { ConversationState } from './types';

export const STATE_SEQUENCE: ConversationState[] = [
  'LANDING',
  'LANG_SELECT',
  'GREETING',
  'CONSENT',
  'LOCATION',
  'BACKGROUND',
  'FAMILY_OCCUPATION',
  'CURRENT_LIVELIHOOD',
  'SKILLS_INPUT',
  'EXPERIENCE',
  'INTERESTS',
  'ASPIRATIONS',
  'CONSTRAINTS',
  'TRAVEL_RADIUS',
  'EMPLOYMENT_PREFERENCE',
  'CONFIRM_SUMMARY',
  'SKILL_PASSPORT',
  'SKILL_GAP',
  'RECOMMENDATION',
  'BENEFICIARY_CHOICE',
  'LOCAL_OPPORTUNITY',
  'CENTER_AND_NEXT_STEPS',
  'TRAINING_PATHWAY',
  'PLACEMENT_LINKAGE',
  'ASPIRATION_CARD',
  'SESSION_FEEDBACK',
  'END'
];

export const TERMINAL_STATES: ConversationState[] = [
  'END',
  'DECLINED_END',
  'DELETED_END',
  'ESCALATE_TO_HUMAN'
];

export const INTAKE_SLOT_STATES: ConversationState[] = [
  'BACKGROUND',
  'FAMILY_OCCUPATION',
  'CURRENT_LIVELIHOOD',
  'SKILLS_INPUT',
  'EXPERIENCE',
  'INTERESTS',
  'ASPIRATIONS',
  'CONSTRAINTS',
  'TRAVEL_RADIUS',
  'EMPLOYMENT_PREFERENCE'
];

export function getNextStateInSequence(currentState: ConversationState): ConversationState {
  const idx = STATE_SEQUENCE.indexOf(currentState);
  if (idx >= 0 && idx < STATE_SEQUENCE.length - 1) {
    return STATE_SEQUENCE[idx + 1];
  }
  return 'END';
}

export function getProgressPercentage(state: ConversationState): number {
  const idx = STATE_SEQUENCE.indexOf(state);
  if (idx < 0) return 100;
  return Math.round(((idx) / (STATE_SEQUENCE.length - 1)) * 100);
}
