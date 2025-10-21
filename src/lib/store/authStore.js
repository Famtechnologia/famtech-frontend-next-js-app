import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

// export interface AuthState {
//   token: string | null; // accessToken
//   claims: { role: string; subRole?: string } | null;
//   loading: boolean;

//   setToken: (token: string) => void;
//   setClaims: (claims: { role: string; subRole?: string } | null) => void;
//   setLoading: (loading: boolean) => void;
//   logout: () => void;
// }

const cookieStorage = {
  getItem: (name) => {
    const cookie = Cookies.get(name);
    if (!cookie) return null;
    try {
      const parsed = JSON.parse(cookie);
      return parsed.state.token;
    } catch (error) {
      return null;
    }
  },
  setItem: (name, value) => {
    // The backend is responsible for setting the cookie.
  },
  removeItem: (name) => {
    // The backend is responsible for removing the cookie.
  },
};

export const useAuthStore = create()(
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
      storage: cookieStorage,
      partialize: (state) => ({ token: state.token, claims: state.claims }),
    }
  )
);
