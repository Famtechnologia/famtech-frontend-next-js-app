import { useAuthStore } from '@/lib/store/authStore';
import { useCallback } from 'react';
import { getMe } from '../api/auth';

export const useAuth = () => {
  const { token, user, setUser, loading, logout: storeLogout } = useAuthStore();

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await getMe(token);
      setUser(userData?.data);
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
    isAuthenticated: !!user && !!token,
    logout,
    fetchUser,
  };
};