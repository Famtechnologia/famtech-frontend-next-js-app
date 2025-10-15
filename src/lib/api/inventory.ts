import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";

export const API_URL = "https://api-famtech-backend-app.onrender.com";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// 🚀 Request Interceptor 1: Attach Authorization token automatically
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

// 🚀 Request Interceptor 2: Attach userId automatically to the request body
apiClient.interceptors.request.use(
  (config) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;

    if (
      userId &&
      (config.method === 'post' ||
        config.method === 'put' ||
        config.method === 'patch')
    ) {
      if (config.data instanceof FormData) {
        // Correctly append userId to FormData
        config.data.append('userId', userId);
      } else {
        // Default handling for all cases: add userId as a top-level property
        config.data = config.data || {};
        config.data = {
          ...config.data,
          userId: userId,
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Response Interceptor: Refresh token if expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // attempt refresh
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setToken(newAccessToken);

          // update and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // clear store and redirect
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

export default apiClient;