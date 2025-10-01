import apiClient, { API_URL } from "../api/farmoperation";

const BASE_URL = `${API_URL}/api/task-planner`;

export interface Task {
  id:string;
  title: string;
  status?: string;
  priority?: string;
  timeline?: {
    dueDate?: string;
    dueTime?: string;
  };
  createdTime?: string;
  note?: string;
  attachment?: unknown; // Changed 'any' to 'unknown'
  taskType: string;
  assignee: string;
  entity_id: string;
}

// Defines the shape of data sent for creation/update, which is essentially 'Task' without 'createdTime'.
type TaskCreationData = Omit<Task, 'createdTime'>;

// Fetches all tasks from the API using apiClient.
// This automatically attaches the authentication token.
export const getTasks = async (id: string): Promise<Task[]> => {
  const response = await apiClient.get(`${BASE_URL}/assignee/${id}`);
  // axios returns the data in the 'data' property
  return response.data;
};

// Creates a new task using apiClient.
// This automatically attaches the authentication token.
export const createTask = async (taskData: TaskCreationData): Promise<Task> => { // Changed 'any' to 'TaskCreationData'
  const response = await apiClient.post(BASE_URL, taskData);
  return response.data;
};

// Updates an existing task by its ID using apiClient.
// This automatically attaches the authentication token.
export const updateTask = async (id: string, taskData: TaskCreationData): Promise<Task> => { // Changed 'any' to 'TaskCreationData'
  const response = await apiClient.put(`${BASE_URL}/${id}`, taskData);
  return response.data;
};

// Deletes a task by its ID using apiClient.
// This automatically attaches the authentication token.
export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};