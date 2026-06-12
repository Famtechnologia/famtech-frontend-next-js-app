import { useAuthStore } from '@/lib/store/authStore';
import { useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useAuth = () => {
  const { token, user, setUser, loading, logout: storeLogout, _hasHydrated } = useAuthStore();

  // True while Zustand is still reading from localStorage — never show empty states during this
  const isHydrating = !_hasHydrated;

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      // /auth/me uses the Authorization header (set by apiClient interceptor)
      const { data } = await apiClient.get('/auth/me');
      setUser(data?.data ?? data);
    } catch (error) {
      console.log(error);
    }
  }, [token, setUser]);

  const logout = () => {
    storeLogout();
  };
 
  return {
    user,
    setUser,
    token,
    loading,
    isHydrating,
    isAuthenticated: !!user && !!token,
    logout,
    fetchUser,
  };
};