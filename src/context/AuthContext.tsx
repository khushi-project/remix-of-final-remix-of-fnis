import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  age: 28,
  weight: 75,
  height: 178,
  goal: 'Build Muscle',
  role: 'user',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fnis_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // Admin check
    if (email === ADMIN_USERNAME || email === 'admin@fnis.com') {
      if (password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@fnis.com',
          age: 0,
          weight: 0,
          height: 0,
          goal: '',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('fnis_user', JSON.stringify(adminUser));
        localStorage.setItem('isAdmin', 'true');
        return { success: true };
      }
      return { success: false, error: 'Invalid admin username or password' };
    }

    // Regular user login
    const u: User = { ...mockUser, email, role: 'user' };
    setUser(u);
    localStorage.setItem('fnis_user', JSON.stringify(u));
    localStorage.removeItem('isAdmin');
    return { success: true };
  };

  const register = (name: string, email: string, _password: string) => {
    const u: User = { ...mockUser, name, email, role: 'user' };
    setUser(u);
    localStorage.setItem('fnis_user', JSON.stringify(u));
    localStorage.removeItem('isAdmin');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fnis_user');
    localStorage.removeItem('isAdmin');
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
