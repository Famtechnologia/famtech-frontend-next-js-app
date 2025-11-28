// src/lib/analytics.ts
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore"

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-famtech-backend-app.onrender.com";


const analytics = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});


analytics.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Attach userId to POST/PUT/PATCH requests
analytics.interceptors.request.use(
  (config) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;

    if (
      userId &&
      ["post", "put", "patch"].includes(config.method || "")
    ) {
      if (config.data instanceof FormData) {
        config.data.append("userId", userId);
      } else {
        config.data = { ...(config.data || {}), userId };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh Token on Expiry
analytics.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token found");

        // Attempt token refresh
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return analytics(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Logout and redirect
        const { clearUser } = useAuthStore.getState();
        clearUser();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default analytics;
