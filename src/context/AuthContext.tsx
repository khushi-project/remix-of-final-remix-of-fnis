import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  loginUser, registerUser, updateUserProfile,
  setToken, clearToken,
} from '@/api/api';
import type { AuthUser, UserRole } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'fnis_user';

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const persistUser = (user: AuthUser | null) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login: AuthContextType['login'] = async (email, password, role) => {
    setLoading(true);
    try {
      const { token, user: u } = await loginUser(email, password, role);
      setToken(token);
      setUser(u);
      persistUser(u);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register: AuthContextType['register'] = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { token, user: u } = await registerUser(name, email, password, role);
      setToken(token);
      setUser(u);
      persistUser(u);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
    clearToken();
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    // Optimistic update — replace with the value the server returns when available.
    const optimistic = { ...user, ...updates, email: user.email };
    setUser(optimistic);
    persistUser(optimistic);
    try {
      const updated = await updateUserProfile(user.id, updates);
      setUser(updated);
      persistUser(updated);
    } catch {
      /* keep optimistic update; surfacing errors is up to the caller */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
