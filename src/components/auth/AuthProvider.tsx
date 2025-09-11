// components/auth/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useProfileStore } from '@/lib/store/farmStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const token = useAuthStore((state) => state.token);
// Let TypeScript infer the type automatically
const fetchProfile = useProfileStore(state => state.fetchProfile);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      if (useAuthStore.getState().token) {
        await fetchProfile();
      }
    };
    init();
  }, []); // run once on mount

  return <>{children}</>;
}
