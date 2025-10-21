"use client"
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setLoading, token } = useAuthStore();
  const setToken = useAuthStore((state) => state.setToken);
  const cookie = Cookies.get("famtech-auth");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (cookie) {
      try {
        setToken(cookie);
        const publicRoutes = [
          '/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-code',
          '/verify-email',
          '/complete-farm-profile',
        ];
console.log(publicRoutes.includes(pathname))
        if (publicRoutes.includes(pathname)) {
            router.push('/dashboard');
          
        }
      } catch (error) {
        console.error("Failed to parse auth cookie:", error);
      }
    }
    setLoading(false);
  }, [setToken, setLoading, cookie, router, pathname]);

  console.log(token)

  return <>{children}</>;
}