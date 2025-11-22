import apiClient from "../api/apiClient";

export interface StaffType {
  name?: string;
  phone?: string;
  email?: string;
  isVerified?: string;
  farmId?: string;
}

export const getStaffs = async (id: string): Promise<StaffType[]> => {
  const response = await apiClient.get(`/api/staff/me/${id}`);
  return response.data.data;
};

export const getStaffById = async (id: string): Promise<StaffType> => {
  const response = await apiClient.get(`/api/staff/${id}`);
  return response.data.data;
};

// Create a new task
export const createStaff = async (
  taskData: StaffType
): Promise<StaffType> => {
  const response = await apiClient.post("/api/staff/signup", taskData);
  return response.data;
};

// Update an existing task
export const updateStaff = async (
  id: string,
  taskData: Partial<StaffType>
): Promise<StaffType> => {
  const response = await apiClient.put(`/api/staff/update`, taskData);
  return response.data;
};

// Delete a task
export const deleteStaff = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/staff/delete/${id}`);
  return response.data.data;
};

// // ----------------------------
// // 🔔 Notification Types & API
// // ----------------------------
// export interface Notification {
//   timeline: {dueDate: Date; dueTime: string;};
//   notification: string;
//   title: string;
//   id: string;
//   message: string;
//   taskId: string;
//   read: boolean;
//   timestamp: string;
// }

// // Fetch notifications for a specific user 
// export const getNotifications = async (
//   userId: string
// ): Promise<Notification[]> => {
//   const response = await apiClient.get(
//     `/api/task-planner/notification/${userId}`
//   );
//   return response.data;
// };
