import { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout title="FamTech - Dashboard">
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
          <Toaster position="top-right" />
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}