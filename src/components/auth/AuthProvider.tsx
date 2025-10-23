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
  const { setLoading} = useAuthStore();
  const setToken = useAuthStore((state) => state.setToken);
  const cookie = Cookies.get("famtech-auth");
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (cookie) {
      try {
        setToken(cookie);
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-code",
          "/verify-email",
        ];
        if (publicRoutes.includes(pathname)) {
          if (!user?.farmProfile || user?.farmProfile === null || user?.farmProfile === undefined || user?.farmProfile === "") {
            router.push("/complete-farm-profile");
            return;
          }
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to parse auth cookie:", error);
      }
    }
    setLoading(false);
  }, [setToken, setLoading, cookie, router, pathname, user?.farmProfile]);
  
  return <>{children}</>;
}
