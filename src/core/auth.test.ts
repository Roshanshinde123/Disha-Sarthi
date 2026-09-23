import { describe, it, expect, beforeEach } from 'vitest';
import {
  login,
  logout,
  getStoredAuth,
  getAllUsers,
  createUser,
  updateUser,
  setUserStatus,
  setUserRole,
  resetUserPassword,
  canAccessRoute
} from './auth';

describe('Role-Based Authentication & User Registry', () => {
  beforeEach(() => {
    logout();
  });

  it('authenticates demo.beneficiary with correct credentials', () => {
    const res = login('demo.beneficiary', 'password123');
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe('BENEFICIARY');
    expect(res.user?.username).toBe('demo.beneficiary');
  });

  it('authenticates demo.coordinator for GIA Planning Dashboard', () => {
    const res = login('demo.coordinator', 'password123');
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe('COORDINATOR');
  });

  it('authenticates demo.admin for Telephony & State Supervision', () => {
    const res = login('demo.admin', 'password123');
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe('ADMIN');
  });

  it('allows beneficiary direct login with 10-digit phone number', () => {
    const res = login('9876543210');
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe('BENEFICIARY');
    expect(res.user?.phone).toBe('+91 9876543210');
  });

  it('rejects invalid credentials with helpful error message', () => {
    const res = login('demo.beneficiary', 'wrongpass');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('persists and clears auth state upon logout', () => {
    login('demo.admin', 'password123');
    expect(getStoredAuth().isAuthenticated).toBe(true);
    logout();
    expect(getStoredAuth().isAuthenticated).toBe(false);
  });

  it('manages dynamic user creation, role assignment, and status updates', () => {
    const initialUsers = getAllUsers();
    expect(initialUsers.length).toBeGreaterThan(0);

    const createRes = createUser({
      username: 'test.field.officer',
      fullName: 'Sanjay Jadhav',
      phone: '+91 98220 12345',
      role: 'COORDINATOR',
      district: 'Solapur',
      state: 'Maharashtra',
      status: 'ACTIVE'
    }, 'solapur2026', 'admin');

    expect(createRes.success).toBe(true);
    expect(createRes.user?.username).toBe('test.field.officer');
    expect(createRes.user?.role).toBe('COORDINATOR');

    // Update user properties
    const updatedDetails = updateUser(createRes.user!.id, { district: 'Pune' });
    expect(updatedDetails.district).toBe('Pune');

    // Reset password simulation
    const resetRes = resetUserPassword('test.field.officer', 'newSecret123');
    expect(resetRes.success).toBe(true);

    // Update role
    const updatedRoleUser = setUserRole(createRes.user!.id, 'ADMIN');
    expect(updatedRoleUser.role).toBe('ADMIN');

    // Deactivate user
    const deactivatedUser = setUserStatus(createRes.user!.id, 'INACTIVE');
    expect(deactivatedUser.status).toBe('INACTIVE');

    // Attempt login with deactivated user
    const loginDeactivated = login('test.field.officer', 'solapur2026');
    expect(loginDeactivated.success).toBe(false);
    expect(loginDeactivated.error).toContain('deactivated');
  });

  it('evaluates RBAC route permissions correctly for all roles', () => {
    // Public routes accessible by anyone
    expect(canAccessRoute(undefined, '/')).toBe(true);
    expect(canAccessRoute(undefined, '/login')).toBe(true);
    expect(canAccessRoute(undefined, '/talk')).toBe(true);

    // Beneficiary cannot access coordinator dashboard or admin routes
    expect(canAccessRoute('BENEFICIARY', '/beneficiary')).toBe(true);
    expect(canAccessRoute('BENEFICIARY', '/beneficiary/skill-passport')).toBe(true);
    expect(canAccessRoute('BENEFICIARY', '/dashboard')).toBe(false);
    expect(canAccessRoute('BENEFICIARY', '/coordinator')).toBe(false);
    expect(canAccessRoute('BENEFICIARY', '/admin')).toBe(false);

    // Coordinator cannot access admin routes
    expect(canAccessRoute('COORDINATOR', '/coordinator')).toBe(true);
    expect(canAccessRoute('COORDINATOR', '/dashboard')).toBe(true);
    expect(canAccessRoute('COORDINATOR', '/admin')).toBe(false);
    expect(canAccessRoute('COORDINATOR', '/admin/users')).toBe(false);

    // Admin has access to all routes
    expect(canAccessRoute('ADMIN', '/admin')).toBe(true);
    expect(canAccessRoute('ADMIN', '/coordinator')).toBe(true);
    expect(canAccessRoute('ADMIN', '/beneficiary')).toBe(true);
  });
});
