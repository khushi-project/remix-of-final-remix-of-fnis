import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  user: 'fnis_user',
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

  const persistUser = (nextUser: User, isAdmin = false) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    if (isAdmin) {
      localStorage.setItem(STORAGE_KEYS.isAdmin, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.isAdmin);
    }
  };

  const login = (email: string, password: string, role: UserRole): { success: boolean; error?: string } => {
    const normalizedLogin = email.trim().toLowerCase();

    // Admin login
    if (role === 'admin') {
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

    // Trainer / Client login
    const u: User = {
      ...MOCK_USER_ACCOUNT.user,
      id: `${role}-${Date.now()}`,
      email,
      role,
      name: email.split('@')[0],
    };
    persistUser(u);
    return { success: true };
  };

  const register = (name: string, email: string, _password: string, role: UserRole) => {
    const u: User = {
      ...MOCK_USER_ACCOUNT.user,
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
    };
    persistUser(u);
    addRegisteredUser({ id: u.id, name: u.name, email: u.email, role: u.role });
    // Also add to the persistent trainer/client stores
    if (role === 'trainer') {
      const trainers = getTrainers();
      if (!trainers.find(t => t.email === email)) {
        addTrainer({ name, email, phone: '', specialization: '' });
      }
    } else if (role === 'client') {
      const clients = getClients();
      if (!clients.find(c => c.email === email)) {
        addClient({ name, email, phone: '', goal: '' });
      }
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.isAdmin);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates, email: user.email }; // email stays read-only
    persistUser(updated, updated.role === 'admin');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
