// src/lib/store/profileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProfile } from "@/lib/api/profile";
import { useAuthStore } from "@/lib/store/authStore"; // still get token from auth

interface ProfileState {
  profile: unknown | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,

      fetchProfile: async () => {
        try {
          set({ loading: true, error: null });

          const { token } = useAuthStore.getState();
          if (!token) {
            set({ error: "No token found", loading: false });
            return;
          }

          console.log(token);

          const profileData = await getProfile(token);
          console.log(profileData?.data);

          // If data is an array, get the first profile or handle as needed
          const farm = Array.isArray(profileData?.data) ? profileData.data[0] : undefined;

          if (farm) {
            console.log("on");
            set({ profile: farm });
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
      name: "profile-storage", // localStorage key
      partialize: (state) => ({ profile: state.profile }), // only persist profile
    }
  )
);
