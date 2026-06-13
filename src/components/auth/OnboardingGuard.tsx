"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, _hasHydrated, loading } = useAuthStore();

  // Wait for hydration and auth to resolve before blocking
  if (!_hasHydrated || loading) return <>{children}</>;

  // Staff users don't go through farm profile onboarding
  const isStaff = user?.role === "staff" || user?.role === "assignee";
  if (isStaff) return <>{children}</>;

  // If the user has no farm profile, block the UI with an onboarding prompt
  if (user && !user.farmProfile) {
    if (pathname === "/dashboard") {
      return <>{children}</>;
    }
    return (
      <>
        {/* Dim the dashboard behind the modal */}
        <div className="pointer-events-none select-none opacity-30 blur-sm">
          {children}
        </div>

        {/* Blocking overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] p-8 shadow-2xl text-center border border-transparent dark:border-[#30363d]">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-[#1a3a2a]">
              <svg
                className="h-8 w-8 text-green-600 dark:text-[#4ade80]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7a4 4 0 014-4h10a4 4 0 014 4v3a9 9 0 01-18 0V7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10a9 9 0 0018 0"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">
              Complete Your Farm Profile
            </h2>
            <p className="mb-6 text-gray-500 dark:text-[#8b949e]">
              To unlock all features, please complete your farm setup first.
            </p>

            <button
              onClick={() => router.push("/complete-farm-profile")}
              className="w-full rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Set Up Farm Profile &rarr;
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
