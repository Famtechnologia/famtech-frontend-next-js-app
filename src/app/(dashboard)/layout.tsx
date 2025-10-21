import { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="farmer">
        <DashboardLayout title="FamTech - Dashboard">
          {children}
          <Toaster position="top-right" />
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}