import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProfile } from "@/lib/api/profile";
import { useAuthStore } from "@/lib/store/authStore";

interface Profile {
  [key: string]: unknown;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  id: string | null;
  fetchProfile: (id: string) => Promise<void>;
  setId: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      id: null,
      setId: (id) => set({ id }),

      fetchProfile: async (id) => {
        try {
          set({ loading: true, error: null });

          const { token } = useAuthStore.getState();
          if (!token) {
            set({ error: "No token found", loading: false });
            return;
          }

          const profileData = await getProfile(token, id);
          const farm = Array.isArray(profileData?.data)
            ? profileData.data[0]
            : undefined;

          if (farm) {
            set({ profile: farm as Profile });
          } else {
            set({ error: "Profile not found" });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          set({ error: "Failed to load profile" });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
