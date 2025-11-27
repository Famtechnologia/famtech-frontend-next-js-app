import { Toaster } from 'react-hot-toast';
import AssigneeLayout from '@/components/layout/AssigneeLayout';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AssigneePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <AssigneeLayout title="FamTech - Assignee">
          {children}
          <Toaster position="top-right" />
        </AssigneeLayout>
    </AuthProvider>
  );
}