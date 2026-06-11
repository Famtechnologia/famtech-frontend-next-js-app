import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useProfileStore } from "@/lib/store/farmStore";
import apiClient from "../api/apiClient";
import { getMe } from "../api/auth";

// Module-level guard: prevents duplicate in-flight fetches across all hook instances
let isFetching = false;

export const useProfile = () => {
  const { token } = useAuthStore();
  const { profile, _hasHydrated, setId } = useProfileStore() as {
    profile: Record<string, unknown> | null;
    _hasHydrated: boolean;
    setId: (id: string) => void;
  };

  // isHydrating = store hasn't finished reading from localStorage yet
  const isHydrating = !_hasHydrated;

  useEffect(() => {
    // Not ready yet, or already have profile data, or a fetch is running
    if (!_hasHydrated || profile || !token || isFetching) return;

    const hydrate = async () => {
      isFetching = true;
      try {
        const userData = await getMe(token);
        const userId = userData?.data?._id;
        if (!userId) return;

        setId(userId);

        const response = await apiClient.get(`/api/get-profile/${userId}`);
        const farmProfile = response?.data?.data?.farmProfile;

        if (farmProfile) {
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
  }, [token, _hasHydrated]);

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
    /** true while Zustand is reading from localStorage — never show empty states during this */
    isHydrating,
    setProfile: (p: unknown) =>
      useProfileStore.setState({ profile: p as Record<string, unknown> }),
  };
};
