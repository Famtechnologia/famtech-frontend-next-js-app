import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  role: string;
  region: string;
  language: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null; // accessToken
  refreshToken: string | null;
  claims: { role: string; subRole?: string } | null;
  loading: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setClaims: (claims: { role: string; subRole?: string } | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      claims: null,
      loading: true,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setClaims: (claims) => set({ claims }),
      setLoading: (loading) => set({ loading }),

      initializeAuth: () => {
        const { user, token } = get();
        if (user && token) {
          set({ claims: { role: user.role }, loading: false });
        } else {
          set({ loading: false });
        }
      },

      clearUser: () => set({ user: null, token: null, refreshToken: null, claims: null }),
    }),
    { name: "auth-storage" }
  )
);
