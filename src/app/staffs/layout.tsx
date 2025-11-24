import { Toaster } from 'react-hot-toast';
import AssigneeLayout from '@/components/layout/AssigneeLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AssigneePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AssigneeLayout title="FamTech - Assignee">
          {children}
          <Toaster position="top-right" />
        </AssigneeLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}