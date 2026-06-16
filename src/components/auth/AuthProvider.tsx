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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookie, token]); // setToken is a stable Zustand action — excluded to prevent re-render loops

  // 2. Fetch user when token changes — use token as the only dep to avoid
  //    re-triggering when setLoading/fetchUser refs change or user object updates
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (user?.farmProfile) return; // already have a complete user
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
