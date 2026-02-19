// src/contexts/AuthContext.tsx
import React, {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Shg {
  id: string;
  name: string;
  village?: string;
  district?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  shg: Shg | null;
  onboarded: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [shg, setShg] = useState<Shg | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.user);
      setShg(res.shg);
      setOnboarded(res.onboarded);
    } catch {
      setUser(null);
      setShg(null);
      setOnboarded(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    setOnboarded(res.onboarded);
    if (res.onboarded) await refreshUser();
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await authApi.signup({ name, email, password });
    setUser(res.user);
    setOnboarded(false);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setShg(null);
    setOnboarded(false);
  };

  return (
    <AuthContext.Provider value={{ user, shg, onboarded, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}