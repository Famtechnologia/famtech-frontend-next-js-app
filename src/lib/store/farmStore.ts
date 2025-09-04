// src/lib/store/profileStore.ts
import { create } from "zustand";
import { getProfile } from "@/lib/api/profile";
import { useAuthStore } from "@/lib/store/authStore"; // still get token from auth

interface ProfileState {
  profile: any;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    const { token } = useAuthStore.getState(); // get token from auth store
    if (!token) {
      set({ error: "No token found", profile: null });
      return;
    }

    try {
      set({ loading: true, error: null });

      const profileData = await getProfile(token);
      const { data } = profileData;

      if (data?.farmProfile) {
        set({ profile: data.farmProfile });
      } else {
        set({ error: "Profile not found", profile: null });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      set({ error: "Failed to load profile", profile: null });
    } finally {
      set({ loading: false });
    }
  },
}));
