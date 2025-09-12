// src/lib/api/auth.ts
import apiClient from "./apiClient"; // ✅ use the shared client
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role?: string;
      subRole?: string;
      region?: string;
      language?: string;
      isVerified?: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface RegisterResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role?: string;
      region?: string;
      language?: string;
      isVerified?: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken?: string;
    };
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};

export interface RegisterPayload {
  email: string;
  password: string;
  region: string;
  language: string;
}

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  try {
    const { data } = await apiClient.post<RegisterResponse>(
      "/auth/signup",
      payload
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};

export const verifyEmail = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
  await apiClient.get(`/auth/verify-email?token=${token}`);
  return { success: true, message: "Email verified successfully" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Email verification failed";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.clearUser);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      logout();
      router.push("/auth/login");
    }
  };

  return { handleLogout };
};

export const forgotPassword = async (
  email: string,
) => {
  try {
    const { data } = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Password Reset link failed";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};

export const resetPassword = async (
  password: string,
  token: string
) => {
  try {
    const { data } = await apiClient.post("/auth/reset-password", {
      password,
      token
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Password Reset failed";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};

