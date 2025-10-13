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
  };

  return {
    user,
    token,
    claims: claims || { role: user?.role, subRole: '' },
    loading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};
