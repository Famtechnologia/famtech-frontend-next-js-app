import { Toaster } from 'react-hot-toast';
import AssigneeLayout from '@/components/layout/AssigneeLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { StaffProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AssigneePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StaffProtectedRoute>
        <AssigneeLayout title="FamTech - Assignee">
          {children}
          <Toaster position="top-right" />
        </AssigneeLayout>
      </StaffProtectedRoute>
    </AuthProvider>
  );
}