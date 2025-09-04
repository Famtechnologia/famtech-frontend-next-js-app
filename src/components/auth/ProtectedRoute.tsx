// components/auth/ProtectedRoute.tsx
'use client';
import { useAuth } from '../../lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React from 'react';
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
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (claims.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
      
     if (claims.role?.toLowerCase() !== requiredRole.toLowerCase()) {
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
