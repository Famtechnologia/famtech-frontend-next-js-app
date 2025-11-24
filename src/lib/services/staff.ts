import apiClient from "../api/apiClient";
import axios from "axios";

export interface StaffType {
  name?: string;
  phone?: string;
  email?: string;
  isVerified?: string;
  farmId?: string;
  _id?: string;
}

export const getStaffs = async (id: string): Promise<StaffType[]> => {
  const response = await apiClient.get(`/api/staff/me/${id}`);
  return response.data.data;
};

export const getStaffById = async (id: string): Promise<StaffType> => {
  const response = await apiClient.get(`/api/staff/attendee/${id}`);
  return response.data.data;
};

// Create a new staff
export const createStaff = async (taskData: StaffType): Promise<StaffType> => {
  const response = await apiClient.post("/api/staff/signup", taskData);
  return response.data;
};

// Update staff
export const updateStaff = async (
  taskData: Partial<StaffType>
): Promise<StaffType> => {
  const response = await apiClient.put(`/api/staff/update`, taskData);
  return response.data;
};

// Change a staff password
export const changeStaffPassword = async (
  taskData: Partial<{
    id: string;
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
  }>
): Promise<StaffType> => {
  const response = await apiClient.put(`/api/staff/change-password`, taskData);
  return response.data;
};

// Delete a staff
export const deleteStaff = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/staff/delete/${id}`);
  return response.data.data;
};

export const loginStaff = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  token: string;
}> => {
  try {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      token: string;
    }>("/api/staff/login", {
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
    throw new Error("An unknown error occurred during login.");
  }
};
