// src/app/(dashboard)/layout.tsx
import { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="FamTech - Dashboard">
      {children}
      <Toaster position="top-right" />
    </DashboardLayout>
  );
}