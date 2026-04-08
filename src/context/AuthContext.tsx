import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loginAPI, registerAPI } from '@/api/api';
import {
  MOCK_ADMIN_ACCOUNT,
  MOCK_USER_ACCOUNT,
  type AuthUser as User,
  type UserRole,
} from '@/services/mockAuth';
import { addRegisteredUser, getTrainers, getClients, addTrainer, addClient } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  user: 'fnis_user',
  token: 'token',
  isAdmin: 'isAdmin',
};

const getStoredUser = (): User | null => {
  const savedUser = localStorage.getItem(STORAGE_KEYS.user);
  const isAdmin = localStorage.getItem(STORAGE_KEYS.isAdmin) === 'true';

  if (!savedUser) return isAdmin ? MOCK_ADMIN_ACCOUNT.user : null;

  try {
    const parsedUser = JSON.parse(savedUser) as User;
    if (isAdmin) {
      return { ...MOCK_ADMIN_ACCOUNT.user, ...parsedUser, role: 'admin' };
    }
    return parsedUser;
  } catch {
    return isAdmin ? MOCK_ADMIN_ACCOUNT.user : null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  const persistUser = (nextUser: User, isAdmin = false) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    if (isAdmin) {
      localStorage.setItem(STORAGE_KEYS.isAdmin, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.isAdmin);
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Admin login stays mock-based
    if (role === 'admin') {
      const normalizedLogin = email.trim().toLowerCase();
      if (
        normalizedLogin === MOCK_ADMIN_ACCOUNT.username ||
        normalizedLogin === MOCK_ADMIN_ACCOUNT.user.email.toLowerCase()
      ) {
        if (password === MOCK_ADMIN_ACCOUNT.password) {
          persistUser(MOCK_ADMIN_ACCOUNT.user, true);
          return { success: true };
        }
        return { success: false, error: 'Invalid admin credentials' };
      }
      return { success: false, error: 'Invalid admin credentials' };
    }

    // Try real backend first, fall back to mock
    setLoading(true);
    try {
      const data = await loginAPI(email, password);
      const token = data.token;
      const backendUser = data.user;

      localStorage.setItem(STORAGE_KEYS.token, token);

      const u: User = {
        id: backendUser._id || backendUser.id || `${role}-${Date.now()}`,
        name: backendUser.name || email.split('@')[0],
        email: backendUser.email || email,
        age: backendUser.age || 0,
        weight: backendUser.weight || 0,
        height: backendUser.height || 0,
        goal: backendUser.goal || '',
        role: backendUser.role || role,
      };
      persistUser(u);
      return { success: true };
    } catch (err: any) {
      // If backend is unreachable, fall back to mock login
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const u: User = {
          ...MOCK_USER_ACCOUNT.user,
          id: `${role}-${Date.now()}`,
          email,
          role,
          name: email.split('@')[0],
        };
        persistUser(u);
        return { success: true };
      }
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const data = await registerAPI(name, email, password, role);
      const token = data.token;
      const backendUser = data.user;

      if (token) localStorage.setItem(STORAGE_KEYS.token, token);

      const u: User = {
        id: backendUser?._id || backendUser?.id || `${role}-${Date.now()}`,
        name: backendUser?.name || name,
        email: backendUser?.email || email,
        age: backendUser?.age || 0,
        weight: backendUser?.weight || 0,
        height: backendUser?.height || 0,
        goal: backendUser?.goal || '',
        role: backendUser?.role || role,
      };
      persistUser(u);
      addRegisteredUser({ id: u.id, name: u.name, email: u.email, role: u.role });
      if (role === 'trainer') {
        const trainers = getTrainers();
        if (!trainers.find(t => t.email === email)) addTrainer({ name, email, phone: '', specialization: '' });
      } else if (role === 'client') {
        const clients = getClients();
        if (!clients.find(c => c.email === email)) addClient({ name, email, phone: '', goal: '' });
      }
      return { success: true };
    } catch (err: any) {
      // Fallback to mock if backend is down
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        const u: User = { ...MOCK_USER_ACCOUNT.user, id: `${role}-${Date.now()}`, name, email, role };
        persistUser(u);
        addRegisteredUser({ id: u.id, name: u.name, email: u.email, role: u.role });
        if (role === 'trainer') {
          const trainers = getTrainers();
          if (!trainers.find(t => t.email === email)) addTrainer({ name, email, phone: '', specialization: '' });
        } else if (role === 'client') {
          const clients = getClients();
          if (!clients.find(c => c.email === email)) addClient({ name, email, phone: '', goal: '' });
        }
        return { success: true };
      }
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.isAdmin);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates, email: user.email };
    persistUser(updated, updated.role === 'admin');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
