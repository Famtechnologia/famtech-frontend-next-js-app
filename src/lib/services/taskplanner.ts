// src/lib/services/taskplanner.ts
import apiClient from "../api/apiClient";

// ----------------------------
// 📌 Task Types
// ----------------------------
export interface Task {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  timeline?: {
    dueDate?: string;
    dueTime?: string;
  };
  createdTime?: string;
  note?: string;
  attachment?: unknown;
  taskType: string;
  assignee: string;
  entity_id: string;
}

export type TaskCreationPayload = Omit<Task, "id" | "createdTime">;
export type TaskUpdatePayload = TaskCreationPayload & { id: string };

// ----------------------------
// 📌 Task API Functions
// ----------------------------

// Fetch all tasks for a specific user
export const getTasks = async (id: string): Promise<Task[]> => {
  const response = await apiClient.get(`/api/task-planner/assignee/${id}`);
  console.log(`/api/task-planner/assignee/${id}`);
  return response.data;
};

// Create a new task
export const createTask = async (
  taskData: TaskCreationPayload
): Promise<Task> => {
  const response = await apiClient.post("/api/task-planner", taskData);
  return response.data;
};

// Update an existing task
export const updateTask = async (
  id: string,
  taskData: Partial<TaskCreationPayload>
): Promise<Task> => {
  const response = await apiClient.put(`/api/task-planner/${id}`, taskData);
  return response.data;
};

// Delete a task
export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/task-planner/${id}`);
  return response.data;
};

// ----------------------------
// 🔔 Notification Types & API
// ----------------------------
export interface Notification {
  timeline: {dueDate: Date; dueTime: string;};
  notification: string;
  title: string;
  id: string;
  message: string;
  taskId: string;
  read: boolean;
  timestamp: string;
}

// Fetch notifications for a specific user 
export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
  const response = await apiClient.get(
    `/api/task-planner/notification/${userId}`
  );
  return response.data;
};
