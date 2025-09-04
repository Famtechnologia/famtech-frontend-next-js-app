// components/auth/ProtectedRoute.tsx
'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  requiredSubRole?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredSubRole 
}: ProtectedRouteProps) {
  const { user, loading, claims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!claims?.role) {
      router.push('/unauthorized');
      return;
    }

    const userRole = claims.role.toLowerCase();
    const expectedRole = requiredRole.toLowerCase();

    if (userRole !== expectedRole) {
      router.push('/unauthorized');
      return;
    }

    if (requiredSubRole) {
      const userSubRole = claims.subRole?.toLowerCase();
      const expectedSubRole = requiredSubRole.toLowerCase();

      if (userSubRole !== expectedSubRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, claims, router, requiredRole, requiredSubRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
