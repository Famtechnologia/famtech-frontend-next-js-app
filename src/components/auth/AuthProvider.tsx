"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, setToken, user, loading, setLoading } = useAuthStore();
  const cookie = Cookies.get("famtech-auth");
  const router = useRouter();
  const pathname = usePathname();
  const { fetchUser } = useAuth();

  // 1. Sync cookie to Zustand token; on logout also wipe the profile store
  useEffect(() => {
    if (cookie && cookie !== token) {
      setToken(cookie);
    } else if (!cookie && token) {
      // This clears auth + profile localStorage so no stale data bleeds to next user
      useAuthStore.getState().logout();
    }
  }, [cookie, token, setToken]);

  // 2. Fetch user if token is present but user is null
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      fetchUser().finally(() => {
        setLoading(false);
      });
    } else if (!token) {
      setLoading(false);
    }
  }, [token, user, fetchUser, setLoading]);

  // 3. Perform routing logic based on user role and path
  useEffect(() => {
    if (loading) return;

    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-code",
      "/verify-email",
    ];

    if (token && user) {
      const isStaff = user.role === "staff" || user.role === "assignee";

      if (publicRoutes.includes(pathname)) {
        if (isStaff) {
          router.replace("/staffs/tasks");
        } else {
          if (!user.farmProfile) {
            router.replace("/complete-farm-profile");
          } else {
            router.replace("/dashboard");
          }
        }
      }
    }
  }, [loading, token, user, pathname, router]);

  return <>{children}</>;
}
