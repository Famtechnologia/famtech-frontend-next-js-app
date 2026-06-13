import apiClient from "../api/apiClient";
import axios from "axios";
import { Notification } from "./taskplanner";

export interface StaffType {
  name?: string;
  phone?: string;
  email?: string;
  isVerified?: string;
  inviteStatus?: "pending" | "accepted";
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

// Invite a new staff member (invite-only flow)
export const inviteStaff = async (data: { name: string; email: string; farmId: string }): Promise<any> => {
  const response = await apiClient.post("/api/staff/invite", data);
  return response.data;
};

// Verify an invite token (returns name + email if valid)
export const verifyInviteToken = async (token: string): Promise<{ name: string; email: string }> => {
  const response = await apiClient.get(`/api/staff/invite/${token}`);
  return response.data.data;
};

// Staff accepts invite and sets their password
export const acceptInvite = async (token: string, password: string): Promise<any> => {
  const response = await apiClient.post(`/api/staff/accept-invite/${token}`, { password });
  return response.data;
};

// Legacy — kept for backward compat but no longer used in UI
export const createStaff = async (taskData: StaffType): Promise<any> => {
  const response = await apiClient.post("/api/staff/signup", taskData);
  return response.data;
};

// Regenerate staff password
export const regenerateStaffPassword = async (
  email: string
): Promise<{ success: boolean; tempPassword: string }> => {
  const response = await apiClient.post("/api/staff/regenerate-password", { email });
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

export const getNotification = async (id: string): Promise<Notification[]> => {
  const response = await apiClient.get(`/api/staff/notifications/${id}`);
  return response.data;
};