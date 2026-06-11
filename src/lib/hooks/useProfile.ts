import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useProfileStore } from "@/lib/store/farmStore";
import apiClient from "../api/apiClient";
import { getMe } from "../api/auth";

// Module-level guard: prevents duplicate in-flight fetches across all hook instances
let isFetching = false;

export const useProfile = () => {
  const { token } = useAuthStore();
  const { profile, setId } = useProfileStore() as {
    profile: Record<string, unknown> | null;
    setId: (id: string) => void;
  };

  useEffect(() => {
    // ✅ Already cached in Zustand (persisted to localStorage) → instant, no fetch
    if (profile || !token || isFetching) return;

    const hydrate = async () => {
      isFetching = true;
      try {
        const userData = await getMe(token);
        const userId = userData?.data?._id;
        if (!userId) return;

        // Register the user ID so other store consumers can use it
        setId(userId);

        const response = await apiClient.get(`/api/get-profile/${userId}`);
        const farmProfile = response?.data?.data?.farmProfile;

        if (farmProfile) {
          // Push directly into the persisted Zustand store — instantly
          // available to every component using useProfile across the app
          useProfileStore.setState({ profile: farmProfile });
        }
      } catch (error) {
        console.error("[useProfile] Failed to hydrate profile:", error);
      } finally {
        isFetching = false;
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    profile: profile as {
      id: string;
      uid: string;
      farmName: string;
      farmType: string;
      farmSize: number;
      farmSizeUnit: string;
      establishedYear: number;
      location: { city: string; state: string; country?: string };
      currency: string;
      timezone: string;
      primaryCrops: string[];
      farmingMethods: string[];
      seasonalPattern: string;
      language: string;
      owner: { firstName: string; lastName: string; phoneNumber: string };
      createdAt: string;
      updatedAt: string;
    } | null,
    // Keep the same API surface so no other files need changes
    setProfile: (p: unknown) =>
      useProfileStore.setState({ profile: p as Record<string, unknown> }),
  };
};
