// ─────────────────────────────────────────────────────────────
// TEMPORARY mock auth provider.
// Persists registered users in localStorage so login/register
// works end-to-end without a backend.
//
// HOW TO REPLACE WITH CONVEX (or any real backend):
//   1. Delete this file.
//   2. In src/api/api.ts, remove the `mockAuth.*` short-circuits
//      inside loginUser / registerUser / updateUserProfile.
//   3. Point VITE_API_BASE_URL at the real backend.
// Nothing else in the app needs to change.
// ─────────────────────────────────────────────────────────────

import type { AuthUser, UserRole } from '@/types';

const USERS_KEY = 'fnis_mock_users';

interface StoredUser extends AuthUser {
  password: string;
}

const readUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as StoredUser[];
  } catch {
    /* ignore */
  }
  // Seed default accounts so each role is testable out of the box.
  const seed: StoredUser[] = [
    {
      id: 'admin-1', name: 'Admin', email: 'admin@fnis.com',
      password: 'admin123', role: 'admin',
    },
    {
      id: 'trainer-1', name: 'Demo Trainer', email: 'trainer@fnis.com',
      password: 'trainer123', role: 'trainer', specialization: 'Strength',
    },
    {
      id: 'client-1', name: 'Demo Client', email: 'client@fnis.com',
      password: 'client123', role: 'client', goal: 'Lose weight',
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
  return seed;
};

const writeUsers = (users: StoredUser[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

const stripPassword = (u: StoredUser): AuthUser => {
  const { password: _pw, ...rest } = u;
  return rest;
};

const fakeToken = (user: AuthUser) =>
  `mock.${btoa(`${user.id}:${user.role}:${Date.now()}`)}`;

export const mockAuth = {
  async login(email: string, password: string, role: UserRole) {
    await new Promise(r => setTimeout(r, 250));
    const users = readUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role,
    );
    if (!found) throw new Error('No account found for that email and role');
    if (found.password !== password) throw new Error('Incorrect password');
    const user = stripPassword(found);
    return { token: fakeToken(user), user };
  },

  async register(name: string, email: string, password: string, role: UserRole) {
    await new Promise(r => setTimeout(r, 250));
    const users = readUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with that email already exists');
    }
    const newUser: StoredUser = {
      id: `${role}-${Date.now()}`,
      name, email, password, role,
    };
    users.push(newUser);
    writeUsers(users);
    const user = stripPassword(newUser);
    return { token: fakeToken(user), user };
  },

  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    await new Promise(r => setTimeout(r, 150));
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates, id: users[idx].id, email: users[idx].email };
    writeUsers(users);
    return stripPassword(users[idx]);
  },
};

// Toggle this off (or delete the file) when switching to a real backend.
export const USE_MOCK_AUTH = true;
