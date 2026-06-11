"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protect Farmer-only routes (e.g. /dashboard)
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user && (user.role === "staff" || user.role === "assignee")) {
      router.push("/staffs/dashboard");
    }
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!token || (user && (user.role === "staff" || user.role === "assignee"))) {
    return null;
  }

  return <>{children}</>;
}

// Protect Staff-only routes (e.g. /staffs/dashboard)
export function StaffProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "staff" && user.role !== "assignee") {
      router.push("/dashboard");
    }
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!token || (user && user.role !== "staff" && user.role !== "assignee")) {
    return null;
  }

  return <>{children}</>;
}
