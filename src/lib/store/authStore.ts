import { create } from "zustand";
import { persist, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  role: string;
  country: string;
  state: string;
  lga?:string;
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

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 3 }); // Expires in 3 days
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

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
    {
      name: "auth-storage",
      storage: cookieStorage,
    }
  )
);