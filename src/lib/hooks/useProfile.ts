import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useProfileStore } from "@/lib/store/farmStore";
import apiClient from "../api/apiClient";

export const useProfile = () => {
  const { token, user } = useAuthStore();
  const { profile, _hasHydrated, setId } = useProfileStore() as {
    profile: Record<string, unknown> | null;
    _hasHydrated: boolean;
    setId: (id: string) => void;
  };

  // isHydrating = store hasn't finished reading from localStorage yet
  const isHydrating = !_hasHydrated;

  // Per-component fetch guard — avoids the module-level singleton that gets stuck
  const isFetching = useRef(false);

  useEffect(() => {
    if (!_hasHydrated || !token || isFetching.current) return;

    const userId = user?._id;
    if (!userId) return;

    // Read fresh store state — not the stale closure values
    const { id: storedId, profile: storedProfile } = useProfileStore.getState();

    // If profile belongs to a different user, clear it
    if (storedId && storedId !== userId) {
      useProfileStore.setState({ profile: null, id: null });
    } else if (storedProfile && storedId === userId) {
      // Already have the correct user's profile — nothing to do
      return;
    }

    const hydrate = async () => {
      isFetching.current = true;
      try {
        setId(userId);

        const response = await apiClient.get(`/api/get-profile/${userId}`);
        const farmProfile = response?.data?.data?.farmProfile;

        if (farmProfile) {
          useProfileStore.setState({ profile: farmProfile });
        }
      } catch (error) {
        console.error("[useProfile] Failed to hydrate profile:", error);
      } finally {
        isFetching.current = false;
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?._id, _hasHydrated]);

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
