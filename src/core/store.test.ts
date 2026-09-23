import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCurrentSession,
  getSessionById,
  getAllSessions,
  submitPlacementEvidence,
  reviewPlacementEvidence,
  addCoordinatorNote,
  updateFollowUpRecord,
  addAuditLog,
  getAuditLogs
} from './store';
import { createInitialSession } from './orchestrator';
import { Session } from './types';

describe('Central Store & Evidence Verification Lifecycle', () => {
  let session: Session;

  beforeEach(async () => {
    session = createInitialSession('mr');
    session.id = `test_sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    session.profile.name = 'Sunita Kamble';
    session.profile.district = 'Pune';
    session.profile.placement_status = 'IN_TRAINING';
    session.profile.verification_level = 'SELF_REPORTED';
    await saveCurrentSession(session);
  });

  it('retrieves and updates session by id', async () => {
    const fetched = await getSessionById(session.id);
    expect(fetched).toBeDefined();
    expect(fetched?.profile.name).toBe('Sunita Kamble');

    const all = await getAllSessions();
    expect(all.some((s) => s.id === session.id)).toBe(true);
  });

  it('handles beneficiary evidence submission and transitions status to EVIDENCE_SUBMITTED', async () => {
    const ev = await submitPlacementEvidence({
      beneficiary_id: session.id,
      evidence_type: 'JOINING_LETTER',
      document_name: 'tata_motors_offer.pdf',
      employer_name: 'Tata Motors Assembly Line',
      monthly_wage_inr: '₹17,500/month',
      joining_date: '2026-10-01',
      coordinator_notes: 'Joining as Junior Wireman'
    });

    expect(ev).toBeDefined();
    expect(ev.status).toBe('EVIDENCE_SUBMITTED');
    expect(ev.employer_name).toBe('Tata Motors Assembly Line');

    const updatedSession = await getSessionById(session.id);
    expect(updatedSession?.profile.verification_level).toBe('EVIDENCE_SUBMITTED');
    expect(updatedSession?.profile.evidence_list?.length).toBeGreaterThan(0);

    // Verify audit log was recorded
    const auditLogs = await getAuditLogs();
    expect(auditLogs.some((l) => l.action.includes('EVIDENCE_SUBMITTED'))).toBe(true);
  });

  it('allows coordinator to verify and approve submitted evidence', async () => {
    // 1. Submit evidence
    const ev = await submitPlacementEvidence({
      beneficiary_id: session.id,
      evidence_type: 'JOINING_LETTER',
      document_name: 'joining_letter.pdf',
      employer_name: 'Solar Power Tech Pvt Ltd',
      monthly_wage_inr: '₹19,000/month',
      joining_date: '2026-10-01'
    });

    // 2. Coordinator reviews and approves
    const isApproved = await reviewPlacementEvidence(
      ev.id,
      'COORDINATOR_VERIFIED',
      'Sanjay Coordinator',
      'Verified with HR department over phone call.'
    );

    expect(isApproved).toBe(true);

    const updatedSession = await getSessionById(session.id);
    expect(updatedSession?.profile.verification_level).toBe('COORDINATOR_VERIFIED');
    expect(updatedSession?.profile.placement_status).toBe('PLACED');
    const matchedEv = updatedSession?.profile.evidence_list?.find((e) => e.id === ev.id);
    expect(matchedEv?.status).toBe('COORDINATOR_VERIFIED');
    expect(matchedEv?.verified_by).toBe('Sanjay Coordinator');
  });

  it('allows coordinator to reject invalid evidence with reason', async () => {
    const ev = await submitPlacementEvidence({
      beneficiary_id: session.id,
      evidence_type: 'OTHER',
      document_name: 'unclear_scan.jpg',
      employer_name: 'Local Shop'
    });

    const isReviewed = await reviewPlacementEvidence(
      ev.id,
      'REJECTED',
      'Sanjay Coordinator',
      'Document illegible. Please upload clear copy of letterhead.'
    );

    expect(isReviewed).toBe(true);

    const updatedSession = await getSessionById(session.id);
    expect(updatedSession?.profile.verification_level).toBe('REJECTED');
  });

  it('adds and retains coordinator audit notes', async () => {
    const note = await addCoordinatorNote(
      session.id,
      'Sanjay Coordinator',
      'Beneficiary requested evening batch due to day farm work.'
    );

    expect(note).toBeDefined();
    expect(note.content).toContain('evening batch');
    expect(note.coordinator_name).toBe('Sanjay Coordinator');

    const updatedSession = await getSessionById(session.id);
    expect(updatedSession?.profile.coordinator_notes?.length).toBeGreaterThan(0);
  });

  it('updates 7/30/90-day retention follow-up records', async () => {
    const s = (await getSessionById(session.id))!;
    const fuId = s.profile.follow_ups?.[0]?.id || `fu_${session.id}_7d`;

    const isUpdated = await updateFollowUpRecord(
      fuId,
      'RETAINED',
      'Sanjay Coordinator',
      '₹18,000/month via DBT',
      'Beneficiary reported steady attendance and received first month stipend/wage.'
    );

    expect(isUpdated).toBe(true);

    const updatedSession = await getSessionById(session.id);
    const fu = updatedSession?.profile.follow_ups?.find((f) => f.id === fuId);
    expect(fu).toBeDefined();
    expect(fu?.status).toBe('RETAINED');
    expect(fu?.completed_by).toBe('Sanjay Coordinator');
  });

  it('records and retrieves system audit logs with filters', async () => {
    await addAuditLog(
      'SYSTEM_SETTINGS_UPDATE',
      'Updated STT confidence threshold to 0.70',
      'usr_admin',
      'ADMIN',
      'WEB'
    );

    const logs = await getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    const settingLog = logs.find((l) => l.action === 'SYSTEM_SETTINGS_UPDATE');
    expect(settingLog).toBeDefined();
    expect(settingLog?.user_role).toBe('ADMIN');
  });
});
