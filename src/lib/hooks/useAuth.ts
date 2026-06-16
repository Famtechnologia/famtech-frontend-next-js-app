import { useAuthStore } from '@/lib/store/authStore';
import { useCallback } from 'react';
import { getMe } from '../api/auth';

export const useAuth = () => {
  const { token, user, setUser, loading, logout: storeLogout, _hasHydrated } = useAuthStore();

  // True while Zustand is still reading from localStorage — never show empty states during this
  const isHydrating = !_hasHydrated;

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      // Backend decodes the JWT from the URL param server-side
      const userData = await getMe(token);
      setUser(userData?.data);
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // setUser is a stable Zustand action — excluded to prevent re-render loops

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