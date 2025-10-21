'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function Page() {
  const { user } = useAuth();
  return (
    <div>
      <LoginForm />
    </div>
  );
}