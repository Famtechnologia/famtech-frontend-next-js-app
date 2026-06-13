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

  // 2. Fetch user if token is present but user is null,
  //    OR if user exists but farmProfile is missing (stale cached data)
  useEffect(() => {
    if (token && (!user || !user.farmProfile)) {
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
    if (!user) return; // Wait until user is fully loaded before routing

    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/post-signup",
    ];

    // Pages that are authenticated but should not trigger further redirects
    const skipRedirectRoutes = ["/complete-farm-profile", "/verify-email"];

    if (token && user) {
      const isStaff = user.role === "staff" || user.role === "assignee";

      if (publicRoutes.includes(pathname)) {
        if (skipRedirectRoutes.includes(pathname)) {
          return;
        }
        // User is on a public route but already logged in — send them where they belong
        if (isStaff) {
          router.replace("/staffs/tasks");
        } else {
          router.replace("/dashboard");
        }
      }
    }

  }, [loading, token, user, pathname, router]);


  return <>{children}</>;
}
