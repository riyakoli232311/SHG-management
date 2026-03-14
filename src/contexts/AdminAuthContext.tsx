// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';

interface Admin {
  id: string;
  email: string;
  area_assigned: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      const res = await adminApi.me();
      setAdmin(res.admin);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    refreshAdmin().finally(() => setLoading(false));
  }, [refreshAdmin]);

  const login = async (email: string, password: string) => {
    const res = await adminApi.login({ email, password });
    setAdmin(res.admin);
  };

  const logout = async () => {
    await adminApi.logout();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, refreshAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
