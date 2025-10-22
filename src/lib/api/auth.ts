// src/lib/api/auth.ts
import apiClient from "./apiClient"; // ✅ use the shared client
import axios from "axios";

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string; 
}

export interface RegisterResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role?: string;
      country?: string;
      state?: string;
      lga?: string;
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
    },
  );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed";
      throw new Error(message);
    }
    throw new Error("An unknown error occurred during login.");
  }
};

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  lga?: string; // 👈 optional LGA
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
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      let errorMessage = "Registration failed"; // Default message

      if (responseData) {
        if (responseData.errors && typeof responseData.errors === 'object' && Object.keys(responseData.errors).length > 0) {
          const errorMessages = Object.values(responseData.errors)
            .flat()
            .map((error: unknown) => {
              if (typeof error === 'string') {
                return error;
              }
              // Assuming the error object has a 'message' property
              if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
                return error.message;
              }
              // Fallback for unexpected error structures
              return "An unknown validation error occurred.";
            });
          
          // Join the messages, filtering out any null/undefined entries.
          errorMessage = errorMessages.filter(Boolean).join('. ');
        } else if (responseData.message || responseData.error) {
          errorMessage = responseData.message || responseData.error;
        }
      }
      
      // Ensure a final message is always available
      throw new Error(errorMessage || "Registration failed");
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

// export const useLogout = () => {
//   const router = useRouter();
//   const logout = useAuthStore((state) => state.clearUser);

//   const handleLogout = async () => {
//     try {
//       await apiClient.post("/auth/logout",)
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       logout();
//       router.push("/login");
//     }
//   };

//   return { handleLogout };
// };

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

export const getMe = async (id: string) => {
  try {
    const { data } = await apiClient.get(`/auth/me/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch user";
      throw new Error(message);
    }
    throw new Error("Network error occurred");
  }
};
