import { useAuthStore } from '@/lib/store/authStore';

import { useEffect, useCallback, useState } from 'react';
import { getMe } from '../api/auth';

export const useAuth = () => {
  const { token, loading, logout: storeLogout } = useAuthStore();
  const [user, setUser] = useState<{
    _id: string;
    email: string;
    role: string;
    country: string;
    state: string;
    lga: string;
    language: string;
    farmAssets: [];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    farmProfile: string;
  } | null>(null);
  

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await getMe(token);
      setUser(userData?.data);
    } catch (error) {
      console.log(error)
    }
  }, [token])

useEffect(() => {
  fetchUser();
}, [fetchUser]);


  const logout = () => {
    storeLogout();
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};