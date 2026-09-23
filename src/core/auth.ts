// Disha Sarathi - Role-Based Authentication & Session Access (PS 26097)

export type UserRole = 'BENEFICIARY' | 'COORDINATOR' | 'ADMIN';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  district?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  last_login?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  token?: string;
}

const AUTH_STORAGE_KEY = 'disha_auth_user_v1';
const USERS_REGISTRY_KEY = 'disha_users_registry_v1';

// In-memory fallback for test environments without localStorage
let memoryAuthStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Ignored
    }
  }
  return memoryAuthStorage[key] || null;
}

function safeSetItem(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignored
    }
  }
  memoryAuthStorage[key] = value;
}

function safeRemoveItem(key: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignored
    }
  }
  delete memoryAuthStorage[key];
}

export const DEMO_ACCOUNTS: Record<string, { user: UserAccount; passwordHash: string }> = {
  'demo.beneficiary': {
    user: {
      id: 'usr_ben_01',
      username: 'demo.beneficiary',
      name: 'Ramesh Sonawane (लाभार्थी)',
      role: 'BENEFICIARY',
      phone: '+91 98765 43210',
      email: 'ramesh.beneficiary@pmajay.demo',
      district: 'Pune',
      status: 'ACTIVE',
      created_at: '2026-01-15T09:00:00Z',
      last_login: new Date().toISOString()
    },
    passwordHash: 'password123'
  },
  'demo.coordinator': {
    user: {
      id: 'usr_coord_01',
      username: 'demo.coordinator',
      name: 'Pooja Kulkarni (GIA Coordinator)',
      role: 'COORDINATOR',
      phone: '+91 98765 43211',
      email: 'pooja.coord@pmajay.gov.in',
      district: 'Pune',
      status: 'ACTIVE',
      created_at: '2026-01-10T09:00:00Z',
      last_login: new Date().toISOString()
    },
    passwordHash: 'password123'
  },
  'demo.admin': {
    user: {
      id: 'usr_admin_01',
      username: 'demo.admin',
      name: 'Dr. A. Verma (State Admin & Telephony Supervisor)',
      role: 'ADMIN',
      phone: '+91 98765 43212',
      email: 'admin.verma@pmajay.gov.in',
      district: 'Maharashtra',
      status: 'ACTIVE',
      created_at: '2026-01-01T09:00:00Z',
      last_login: new Date().toISOString()
    },
    passwordHash: 'password123'
  }
};

/**
 * Initializes and retrieves the complete user registry
 */
export function getAllUsers(): UserAccount[] {
  try {
    const raw = safeGetItem(USERS_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load user registry from storage:', e);
  }

  // Seed default registry
  const initial = Object.values(DEMO_ACCOUNTS).map((d) => d.user);
  saveUsersRegistry(initial);
  return initial;
}

/**
 * Saves user registry to persistence
 */
export function saveUsersRegistry(users: UserAccount[]): void {
  safeSetItem(USERS_REGISTRY_KEY, JSON.stringify(users));
}

/**
 * Creates a new user in the registry
 */
export function createUser(
  userData: {
    username: string;
    name?: string;
    fullName?: string;
    role: UserRole;
    phone?: string;
    email?: string;
    district?: string;
    state?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  },
  _password?: string,
  _creator?: string
): UserAccount & { success: boolean; user: UserAccount; error?: string } {
  const users = getAllUsers();
  const cleanUsername = userData.username.trim().toLowerCase();
  const displayName = (userData.name || userData.fullName || userData.username).trim();

  const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    throw new Error(`Username "${userData.username}" already exists.`);
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    name: displayName,
    role: userData.role,
    phone: userData.phone,
    email: userData.email,
    district: userData.district || 'Pune',
    status: userData.status || 'ACTIVE',
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsersRegistry(users);
  return {
    ...newUser,
    success: true,
    user: newUser
  };
}

/**
 * Updates an existing user
 */
export function updateUser(id: string, updates: Partial<UserAccount>): UserAccount {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`User with ID ${id} not found.`);
  }

  users[index] = { ...users[index], ...updates };
  saveUsersRegistry(users);

  // If current logged-in user is updated, update active auth session
  const currentAuth = getStoredAuth();
  if (currentAuth.currentUser && currentAuth.currentUser.id === id) {
    safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(users[index]));
  }

  return users[index];
}

/**
 * Toggles or sets user active/inactive status
 */
export function setUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): UserAccount {
  return updateUser(id, { status });
}

/**
 * Assigns a role to a user
 */
export function setUserRole(id: string, role: UserRole): UserAccount {
  return updateUser(id, { role });
}

/**
 * Simulates password reset
 */
export function resetUserPassword(usernameOrId: string, _newPass?: string): { success: boolean; message: string } {
  return {
    success: true,
    message: `Password reset link/token generated for ${usernameOrId}. Temporary access key enabled.`
  };
}

/**
 * Loads current authenticated user from local storage
 */
export function getStoredAuth(): AuthState {
  try {
    const raw = safeGetItem(AUTH_STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw) as UserAccount;
      // Simulated bearer token
      const token = `disha_jwt_${user.id}_${user.role}_${Date.now()}`;
      return {
        isAuthenticated: true,
        currentUser: user,
        token
      };
    }
  } catch (e) {
    console.warn('Failed to load stored auth:', e);
  }
  return {
    isAuthenticated: false,
    currentUser: null
  };
}

/**
 * Authenticates user credentials against demo database or phone number
 */
export function login(
  usernameOrPhone: string,
  password?: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanInput = usernameOrPhone.trim().toLowerCase();

  // 1. Check Demo Account match
  const demoEntry = DEMO_ACCOUNTS[cleanInput];
  if (demoEntry) {
    if (!password || password === demoEntry.passwordHash) {
      const activeUser = { ...demoEntry.user, last_login: new Date().toISOString() };
      safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    }
    return { success: false, error: 'Invalid password. Use: password123' };
  }

  // 2. Check dynamic users registry
  const registeredUsers = getAllUsers();
  const matchedUser = registeredUsers.find(
    (u) => u.username.toLowerCase() === cleanInput || (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, ''))
  );

  if (matchedUser) {
    if (matchedUser.status === 'INACTIVE') {
      return { success: false, error: 'This user account has been deactivated. Please contact administrator.' };
    }
    const updated = { ...matchedUser, last_login: new Date().toISOString() };
    updateUser(matchedUser.id, updated);
    safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
  }

  // 3. Phone number login (for beneficiaries logging in after calling Disha Sarathi)
  const phoneDigits = cleanInput.replace(/[^0-9]/g, '');
  if (phoneDigits.length >= 10) {
    const user: UserAccount = {
      id: `usr_phone_${phoneDigits.slice(-10)}`,
      username: phoneDigits.slice(-10),
      name: `Beneficiary (+91 ${phoneDigits.slice(-10)})`,
      role: 'BENEFICIARY',
      phone: `+91 ${phoneDigits.slice(-10)}`,
      district: 'Pune',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    safeSetItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  return {
    success: false,
    error: 'Invalid username or 10-digit phone number. Try demo.beneficiary, demo.coordinator, or demo.admin'
  };
}

/**
 * Logs out the active user
 */
export function logout(): void {
  safeRemoveItem(AUTH_STORAGE_KEY);
  memoryAuthStorage = {};
}

/**
 * Role-Based Access Control (RBAC) route permission checker
 */
export function canAccessRoute(userRole: UserRole | undefined, path: string): boolean {
  // Public routes
  if (['/', '/login', '/register', '/diagnostics', '/talk', '/channel/whatsapp', '/channel/ivr'].includes(path)) {
    return true;
  }

  if (!userRole) return false;

  // Admin has access to everything
  if (userRole === 'ADMIN') return true;

  // Coordinator has access to coordinator routes, dashboard, and beneficiary viewing
  if (userRole === 'COORDINATOR') {
    if (path.startsWith('/admin')) return false;
    return true;
  }

  // Beneficiary only has access to beneficiary routes, talk, landing, etc.
  if (userRole === 'BENEFICIARY') {
    if (path.startsWith('/admin') || path.startsWith('/coordinator') || path === '/dashboard') {
      return false;
    }
    return true;
  }

  return false;
}
