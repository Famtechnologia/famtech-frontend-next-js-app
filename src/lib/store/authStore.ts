import { create } from "zustand";
import { persist, StateStorage, PersistStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export interface AuthState {
  token: string | null; // accessToken
  claims: { role: string; subRole?: string } | null;
  loading: boolean;

  setToken: (token: string) => void;
  setClaims: (claims: { role: string; subRole?: string } | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const cookie = Cookies.get(name);
    if (!cookie) return null;
    try {
      const parsed = JSON.parse(cookie);
      return parsed.state.token;
    } catch (error) {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    // The backend is responsible for setting the cookie.
  },
  removeItem: (name: string): void => {
    // The backend is responsible for removing the cookie.
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      claims: null,
      loading: true,

      setToken: (token) => set({ token }),
      setClaims: (claims) => set({ claims }),
      setLoading: (loading) => set({ loading }),
      logout: () => {
        set({ token: null, claims: null });
        Cookies.remove("famtech-auth");
      },
    }),
    {
      name: "famtech-auth",
      storage: cookieStorage as unknown as PersistStorage<AuthState, unknown>,
      partialize: (state) => ({ token: state.token, claims: state.claims }),
    }
  )
);
