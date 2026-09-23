// Disha Sarathi - IndexedDB Local Persistence Store (PS 26097)
import { get, set, del, keys } from 'idb-keyval';
import {
  AuditLogEntry,
  CoordinatorNote,
  FollowUpRecord,
  FollowUpStatus,
  PlacementEvidence,
  Session,
  VerificationLevel
} from './types';
import seedCohortData from '../data/seed_cohort.json';

const CURRENT_SESSION_KEY = 'disha_current_session';
const SESSIONS_PREFIX = 'disha_session_';
const SEED_LOADED_KEY = 'disha_seed_loaded_v3';
const AUDIT_LOGS_KEY = 'disha_audit_logs_v1';
const EVIDENCE_KEY = 'disha_placement_evidence_v1';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// In-memory fallbacks for node/unit test environments
const memoryStore: Record<string, any> = {};

async function safeGet(key: string): Promise<any> {
  try {
    const val = await get(key);
    if (val !== undefined) return val;
  } catch (e) {
    // fallback
  }
  return memoryStore[key];
}

async function safeSet(key: string, val: any): Promise<void> {
  memoryStore[key] = val;
  try {
    await set(key, val);
  } catch (e) {
    // fallback
  }
}

async function safeDel(key: string): Promise<void> {
  delete memoryStore[key];
  try {
    await del(key);
  } catch (e) {
    // fallback
  }
}

async function safeKeys(): Promise<any[]> {
  try {
    const idbKeys = await keys();
    const combined = Array.from(new Set([...idbKeys, ...Object.keys(memoryStore)]));
    return combined;
  } catch (e) {
    return Object.keys(memoryStore);
  }
}

/**
 * Normalizes seed session record to ensure all new fields are present
 */
function normalizeSession(sess: any): Session {
  const isCompleted = sess.state === 'END' || sess.profile?.placement_status === 'COMPLETED' || sess.profile?.placement_status === 'PLACED';

  const defaultEvidence: PlacementEvidence[] = sess.profile?.evidence_list || (sess.profile?.placement_status === 'PLACED' ? [
    {
      id: `ev_${sess.id}_01`,
      beneficiary_id: sess.id,
      evidence_type: 'JOINING_LETTER',
      document_name: 'Joining_Letter_Signed.pdf',
      employer_name: 'Mahindra Auto Component Ancillary Ltd.',
      designation: 'Assembly Technician',
      joining_date: '2026-02-01',
      monthly_wage_inr: '₹18,500/month',
      status: 'COORDINATOR_VERIFIED',
      submitted_at: '2026-02-02T10:30:00Z',
      verified_at: '2026-02-03T14:15:00Z',
      verified_by: 'Pooja Kulkarni (GIA Coordinator)',
      coordinator_notes: 'Verified against employer joining confirmation letter. NSQF Level 4 match.',
      is_demo: true
    }
  ] : []);

  const defaultFollowUps: FollowUpRecord[] = sess.profile?.follow_ups || [
    {
      id: `fu_${sess.id}_7d`,
      beneficiary_id: sess.id,
      period_days: 7,
      due_date: '2026-02-08',
      status: sess.profile?.placement_status === 'PLACED' ? 'RETAINED' : 'NOT_DUE',
      completed_at: sess.profile?.placement_status === 'PLACED' ? '2026-02-08T11:00:00Z' : undefined,
      completed_by: 'Pooja Kulkarni',
      wage_status: 'Settled in role, workplace accommodation confirmed.',
      remarks: 'Beneficiary reports positive workplace environment and transport support.'
    },
    {
      id: `fu_${sess.id}_30d`,
      beneficiary_id: sess.id,
      period_days: 30,
      due_date: '2026-03-02',
      status: sess.profile?.placement_status === 'PLACED' ? 'WAGE_RECEIVED' : 'NOT_DUE',
      completed_at: sess.profile?.placement_status === 'PLACED' ? '2026-03-03T10:00:00Z' : undefined,
      completed_by: 'Pooja Kulkarni',
      wage_status: 'First month salary credited: ₹18,500 via DBT/Bank Transfer.',
      remarks: 'Pay slip reviewed by GIA coordinator.'
    },
    {
      id: `fu_${sess.id}_90d`,
      beneficiary_id: sess.id,
      period_days: 90,
      due_date: '2026-05-02',
      status: 'PENDING',
      remarks: 'Scheduled quarterly livelihood sustainability audit.'
    }
  ];

  return {
    ...sess,
    profile: {
      ...sess.profile,
      name: sess.profile?.name || sess.profile?.first_name || (sess.ref_code ? `Beneficiary (${sess.ref_code})` : 'Beneficiary'),
      training_status: sess.profile?.training_status || (isCompleted ? 'COMPLETED' : sess.profile?.placement_status === 'IN_TRAINING' ? 'IN_TRAINING' : 'RECOMMENDED'),
      placement_status: sess.profile?.placement_status || (isCompleted ? 'COMPLETED' : 'NOT_STARTED'),
      verification_level: sess.profile?.verification_level || (sess.profile?.placement_status === 'PLACED' ? 'COORDINATOR_VERIFIED' : 'SELF_REPORTED'),
      evidence_list: defaultEvidence,
      follow_ups: defaultFollowUps,
      coordinator_notes: sess.profile?.coordinator_notes || []
    },
    recommendations: (sess.recommendations || []).map((rec: any) => ({
      ...rec,
      skill_gap: rec.skill_gap || {
        trade_id: rec.trade?.id || 'unknown',
        trade_name: rec.trade?.name_en || 'Trade',
        matched_skills: sess.profile?.skills_interests || [],
        missing_skills: ['Practical NSQF Certification', 'Advanced Workplace Tools'],
        training_required_skills: ['NSQF Standard Workplace Safety & Certification'],
        severity: 'medium',
        recommended_intervention: 'Standard NSQF Training with PM-AJAY GIA Tool-Kit Support'
      }
    }))
  };
}

/**
 * Initializes IndexedDB store with seed cohort on first load
 */
export async function initializeStore(): Promise<void> {
  try {
    const seedLoaded = await safeGet(SEED_LOADED_KEY);
    if (!seedLoaded) {
      const rawSeedCohort = (seedCohortData as unknown) as any[];
      const seedCohort = rawSeedCohort.map(normalizeSession);
      for (const sess of seedCohort) {
        await safeSet(`${SESSIONS_PREFIX}${sess.id}`, sess);
      }
      await safeSet(SEED_LOADED_KEY, true);

      // Seed initial audit log
      await addAuditLog(
        'SYSTEM_INITIALIZED',
        `Seeded ${seedCohort.length} pilot cohort records for PM-AJAY GIA Component (Maharashtra pilot districts).`,
        'system',
        'ADMIN',
        'SYSTEM'
      );
      console.log(`Initialized IndexedDB with ${seedCohort.length} seed cohort records.`);
    }
  } catch (err) {
    console.warn('IndexedDB initialization fallback:', err);
  }
}

/**
 * Saves current active session to IndexedDB
 */
export async function saveCurrentSession(session: Session): Promise<void> {
  try {
    const updated: Session = {
      ...session,
      updated_at: new Date().toISOString()
    };
    await safeSet(CURRENT_SESSION_KEY, updated);
    await safeSet(`${SESSIONS_PREFIX}${session.id}`, updated);
  } catch (err) {
    console.error('Failed to save session to IndexedDB:', err);
  }
}

/**
 * Loads current active session from IndexedDB if updated within 7 days
 */
export async function loadActiveSession(): Promise<Session | null> {
  try {
    const session = (await safeGet(CURRENT_SESSION_KEY)) as Session | undefined;
    if (!session) return null;

    const sessionAge = Date.now() - new Date(session.updated_at).getTime();
    if (sessionAge > SEVEN_DAYS_MS) {
      console.log('Session expired (> 7 days). Starting fresh session.');
      await safeDel(CURRENT_SESSION_KEY);
      return null;
    }
    return normalizeSession(session);
  } catch (err) {
    console.warn('Failed to load active session:', err);
    return null;
  }
}

/**
 * Retrieves a single session by its ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    const s = (await safeGet(`${SESSIONS_PREFIX}${sessionId}`)) as Session | undefined;
    if (s) return normalizeSession(s);

    // Also check current active
    const active = (await safeGet(CURRENT_SESSION_KEY)) as Session | undefined;
    if (active && active.id === sessionId) return normalizeSession(active);

    return null;
  } catch (err) {
    console.error(`Failed to fetch session ${sessionId}:`, err);
    return null;
  }
}

/**
 * Updates profile and fields of a specific session
 */
export async function updateSession(sessionId: string, sessionUpdates: Partial<Session>): Promise<Session | null> {
  try {
    const existing = await getSessionById(sessionId);
    if (!existing) return null;

    const updated: Session = {
      ...existing,
      ...sessionUpdates,
      profile: {
        ...existing.profile,
        ...(sessionUpdates.profile || {})
      },
      updated_at: new Date().toISOString()
    };

    await safeSet(`${SESSIONS_PREFIX}${sessionId}`, updated);

    const active = (await safeGet(CURRENT_SESSION_KEY)) as Session | undefined;
    if (active && active.id === sessionId) {
      await safeSet(CURRENT_SESSION_KEY, updated);
    }

    return updated;
  } catch (err) {
    console.error('Failed to update session:', err);
    return null;
  }
}

/**
 * Retrieves all stored sessions for the coordinator dashboard & map
 */
export async function getAllSessions(): Promise<Session[]> {
  try {
    await initializeStore();
    const allKeys = await safeKeys();
    const sessionKeys = allKeys.filter(
      (k) => typeof k === 'string' && k.startsWith(SESSIONS_PREFIX)
    );

    const sessions: Session[] = [];
    for (const k of sessionKeys) {
      const s = (await safeGet(k)) as Session | undefined;
      if (s) sessions.push(normalizeSession(s));
    }

    // Sort by updated_at descending
    sessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return sessions;
  } catch (err) {
    console.error('Failed to fetch sessions from store:', err);
    const raw = (seedCohortData as unknown) as any[];
    return raw.map(normalizeSession);
  }
}

/**
 * Purges a specific session by ID (e.g. for "delete my data")
 */
export async function deleteSessionById(sessionId: string): Promise<void> {
  try {
    await safeDel(`${SESSIONS_PREFIX}${sessionId}`);
    const active = (await safeGet(CURRENT_SESSION_KEY)) as Session | undefined;
    if (active && active.id === sessionId) {
      await safeDel(CURRENT_SESSION_KEY);
    }

    await addAuditLog(
      'BENEFICIARY_DATA_DELETED',
      `Purged all personal records and voice session metadata for session ${sessionId} per DPDP Act request.`,
      sessionId,
      'BENEFICIARY',
      'WEB_PWA'
    );
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
}

/**
 * Submits placement verification evidence for a beneficiary
 */
export async function submitPlacementEvidence(
  evidenceData: Omit<PlacementEvidence, 'id' | 'submitted_at' | 'status'>
): Promise<PlacementEvidence> {
  const session = await getSessionById(evidenceData.beneficiary_id);

  const newEvidence: PlacementEvidence = {
    ...evidenceData,
    id: `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    submitted_at: new Date().toISOString(),
    status: 'EVIDENCE_SUBMITTED',
    is_demo: false
  };

  if (session) {
    const currentList = session.profile.evidence_list || [];
    currentList.unshift(newEvidence);
    await updateSession(session.id, {
      profile: {
        ...session.profile,
        placement_status: 'EVIDENCE_SUBMITTED',
        verification_level: 'EVIDENCE_SUBMITTED',
        evidence_list: currentList
      }
    });
  }

  // Also save to global evidence index
  const allEv = (await safeGet(EVIDENCE_KEY)) || [];
  allEv.unshift(newEvidence);
  await safeSet(EVIDENCE_KEY, allEv);

  await addAuditLog(
    'EVIDENCE_SUBMITTED',
    `Beneficiary ${evidenceData.beneficiary_id} submitted proof "${evidenceData.document_name}" for ${evidenceData.employer_name}.`,
    evidenceData.beneficiary_id,
    'BENEFICIARY',
    'WEB_PORTAL'
  );

  return newEvidence;
}

/**
 * Retrieves all pending or submitted evidence records across all beneficiaries
 */
export async function getAllEvidence(): Promise<PlacementEvidence[]> {
  const sessions = await getAllSessions();
  const evidenceMap = new Map<string, PlacementEvidence>();

  for (const s of sessions) {
    if (s.profile.evidence_list) {
      for (const ev of s.profile.evidence_list) {
        evidenceMap.set(ev.id, ev);
      }
    }
  }

  const storedList: PlacementEvidence[] = (await safeGet(EVIDENCE_KEY)) || [];
  for (const ev of storedList) {
    evidenceMap.set(ev.id, ev);
  }

  return Array.from(evidenceMap.values()).sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );
}

/**
 * Approves, rejects, or requests corrections on submitted placement evidence
 */
export async function reviewPlacementEvidence(
  evidenceId: string,
  decision: VerificationLevel,
  coordinatorName: string,
  notes?: string
): Promise<boolean> {
  const sessions = await getAllSessions();
  let updated = false;

  for (const s of sessions) {
    if (s.profile.evidence_list) {
      const evIndex = s.profile.evidence_list.findIndex((e) => e.id === evidenceId);
      if (evIndex !== -1) {
        const ev = s.profile.evidence_list[evIndex];
        ev.status = decision;
        ev.verified_at = new Date().toISOString();
        ev.verified_by = coordinatorName;
        ev.coordinator_notes = notes || ev.coordinator_notes;

        // Update overall beneficiary placement & verification status
        let newPlacementStatus = s.profile.placement_status;
        if (decision === 'COORDINATOR_VERIFIED' || decision === 'EMPLOYER_VERIFIED') {
          newPlacementStatus = 'PLACED';
        } else if (decision === 'REJECTED') {
          newPlacementStatus = 'INTERVIEW';
        }

        await updateSession(s.id, {
          profile: {
            ...s.profile,
            placement_status: newPlacementStatus,
            verification_level: decision,
            evidence_list: s.profile.evidence_list
          }
        });
        updated = true;
        break;
      }
    }
  }

  await addAuditLog(
    'EVIDENCE_REVIEWED',
    `Coordinator ${coordinatorName} updated evidence ${evidenceId} status to ${decision}. Notes: ${notes || 'None'}`,
    coordinatorName,
    'COORDINATOR',
    'DASHBOARD'
  );

  return updated;
}

/**
 * Adds a coordinator note to a beneficiary
 */
export async function addCoordinatorNote(
  beneficiaryId: string,
  coordinatorName: string,
  content: string
): Promise<CoordinatorNote> {
  const session = await getSessionById(beneficiaryId);
  const note: CoordinatorNote = {
    id: `note_${Date.now().toString(36)}`,
    beneficiary_id: beneficiaryId,
    coordinator_name: coordinatorName,
    content: content.trim(),
    created_at: new Date().toISOString()
  };

  if (session) {
    const notes = session.profile.coordinator_notes || [];
    notes.unshift(note);
    await updateSession(session.id, {
      profile: {
        ...session.profile,
        coordinator_notes: notes
      }
    });
  }

  await addAuditLog(
    'COORDINATOR_NOTE_ADDED',
    `Note added to beneficiary ${beneficiaryId} by ${coordinatorName}: "${content.slice(0, 50)}..."`,
    coordinatorName,
    'COORDINATOR',
    'DASHBOARD'
  );

  return note;
}

/**
 * Updates a 7/30/90-day follow-up record
 */
export async function updateFollowUpRecord(
  followUpId: string,
  status: FollowUpStatus,
  completedBy: string,
  wageStatus?: string,
  remarks?: string
): Promise<boolean> {
  const sessions = await getAllSessions();
  let updated = false;

  for (const s of sessions) {
    if (s.profile.follow_ups) {
      const fuIndex = s.profile.follow_ups.findIndex((f) => f.id === followUpId);
      if (fuIndex !== -1) {
        const fu = s.profile.follow_ups[fuIndex];
        fu.status = status;
        fu.completed_at = new Date().toISOString();
        fu.completed_by = completedBy;
        fu.wage_status = wageStatus || fu.wage_status;
        fu.remarks = remarks || fu.remarks;

        await updateSession(s.id, {
          profile: {
            ...s.profile,
            follow_ups: s.profile.follow_ups
          }
        });
        updated = true;
        break;
      }
    }
  }

  await addAuditLog(
    'FOLLOW_UP_COMPLETED',
    `Follow-up ${followUpId} marked as ${status} by ${completedBy}.`,
    completedBy,
    'COORDINATOR',
    'DASHBOARD'
  );

  return updated;
}

/**
 * Adds an entry to the system audit log
 */
export async function addAuditLog(
  action: string,
  details: string,
  userId?: string,
  userRole?: string,
  ipOrChannel?: string
): Promise<AuditLogEntry> {
  const logs: AuditLogEntry[] = (await safeGet(AUDIT_LOGS_KEY)) || [];
  const entry: AuditLogEntry = {
    id: `audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    user_id: userId,
    user_role: userRole,
    ip_or_channel: ipOrChannel || 'WEB'
  };

  logs.unshift(entry);
  if (logs.length > 500) logs.pop(); // Cap at 500 entries

  await safeSet(AUDIT_LOGS_KEY, logs);
  return entry;
}

/**
 * Retrieves all audit logs
 */
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const logs = await safeGet(AUDIT_LOGS_KEY);
  if (Array.isArray(logs)) return logs;
  return [];
}

/**
 * Resets entire store to initial seed state
 */
export async function resetAllData(): Promise<void> {
  try {
    const allKeys = await safeKeys();
    for (const k of allKeys) {
      if (typeof k === 'string' && (k.startsWith('disha_') || k.startsWith(SESSIONS_PREFIX))) {
        await safeDel(k);
      }
    }
    await initializeStore();
  } catch (err) {
    console.error('Failed to reset store:', err);
  }
}
