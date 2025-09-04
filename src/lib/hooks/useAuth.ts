// lib/hooks/useAuth.ts
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, token, claims, loading, initializeAuth, clearUser } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const logout = () => {
    clearUser();
    if (typeof window !== 'undefined') localStorage.removeItem('token');
  };

  return {
    user,
    token,
    claims: claims || { role: '', subRole: '' },
    loading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};
