import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  MOCK_ADMIN_ACCOUNT,
  MOCK_USER_ACCOUNT,
  type AuthUser as User,
} from '@/services/mockAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
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

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedLogin = email.trim().toLowerCase();

    if (
      normalizedLogin === MOCK_ADMIN_ACCOUNT.username ||
      normalizedLogin === MOCK_ADMIN_ACCOUNT.user.email.toLowerCase()
    ) {
      if (password === MOCK_ADMIN_ACCOUNT.password) {
        persistUser(MOCK_ADMIN_ACCOUNT.user, true);
        return { success: true };
      }
      return { success: false, error: 'Invalid admin username or password' };
    }

    const u: User = { ...MOCK_USER_ACCOUNT.user, email, role: 'user' };
    persistUser(u);
    return { success: true };
  };

  const register = (name: string, email: string, _password: string) => {
    const u: User = { ...MOCK_USER_ACCOUNT.user, name, email, role: 'user' };
    persistUser(u);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.isAdmin);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
