import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      claims: null,
      user: null,
      loading: true,
      _hasHydrated: false,

      setToken: (token) => set({ token }),
      setClaims: (claims) => set({ claims }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      logout: () => {
        set({ token: null, claims: null, user: null });
        Cookies.remove("famtech-auth");
      },
      clearUser: () => {
        set({ token: null, claims: null, user: null });
        Cookies.remove("famtech-auth");
      },
    }),
    {
      name: "famtech-auth-storage",
      // ✅ Signal when localStorage data has been restored
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
