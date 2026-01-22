import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../services/apiClient';

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  role: 'admin' | 'student' | null;
  login: (payload: { username: string; password: string }) => Promise<void>;
  register: (payload: { username: string; password: string; displayName?: string }) => Promise<void>;
  signOutUser: () => Promise<void>;
};

export type AuthUser = {
  uid: string;
  username: string;
  role: 'admin' | 'student';
  displayName?: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const me = await apiGet<AuthUser>('/api/auth/me', { requireAuth: false });
        setUser(me);
        setRole(me.role);
      } catch (error) {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (payload: { username: string; password: string }) => {
    const userData = await apiPost<AuthUser>('/api/auth/login', payload, { requireAuth: false });
    setUser(userData);
    setRole(userData.role);
  };

  const register = async (payload: { username: string; password: string; displayName?: string }) => {
    const userData = await apiPost<AuthUser>('/api/auth/register', payload, { requireAuth: false });
    setUser(userData);
    setRole(userData.role);
  };

  const signOutUser = async () => {
    await apiPost('/api/auth/logout', {}, { requireAuth: false });
    setUser(null);
    setRole(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      role,
      login,
      register,
      signOutUser,
    }),
    [user, loading, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
