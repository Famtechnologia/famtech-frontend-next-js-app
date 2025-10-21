"use client"

import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const token = useAuthStore.getState().token

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.push('/login');
      return;
    }

    // if (!user?.role) {
    //   router.push('/unauthorized');
    //   return;
    // }

    // const userRole = user?.role.toLowerCase();
    // const expectedRole = requiredRole.toLowerCase();

    // if (userRole !== expectedRole) {
    //   router.push('/unauthorized');
    //   return;
    // }
  }, [user, loading, token, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
