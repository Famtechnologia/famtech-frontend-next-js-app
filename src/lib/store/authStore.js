import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

const clearAllPersistedStores = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("famtech-auth-storage");
    localStorage.removeItem("profile-storage");
  }
  Cookies.remove("famtech-auth");
};

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
        clearAllPersistedStores();
      },
      clearUser: () => {
        set({ token: null, claims: null, user: null });
        clearAllPersistedStores();
      },
    }),
    {
      name: "famtech-auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
