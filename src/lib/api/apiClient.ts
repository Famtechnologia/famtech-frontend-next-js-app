import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-famtech-backend-app.onrender.com";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
});

// 🚀 Request Interceptor → attach accessToken automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Response Interceptor → refresh token if expired
// 🔄 Response Interceptor → refresh token on 401 and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { token, refreshToken, setToken } = useAuthStore.getState() as {
          token: string | null;
          refreshToken?: string | null;
          setToken: (t: string) => void;
        };

        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data?.accessToken;
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — clear auth and redirect to login
        const { clearUser } = useAuthStore.getState() as { clearUser?: () => void };
        if (clearUser) clearUser();
        else useAuthStore.setState({ token: null, user: null });
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
