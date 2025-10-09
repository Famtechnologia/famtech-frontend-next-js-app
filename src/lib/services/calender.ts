import apiClient, { API_URL } from "../api/farmoperation";

const API_BASE_URL = `${API_URL}/api/task-planner`;

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'ongoing' | 'completed';
    priority: 'low' | 'medium' | 'high';
    timeline: {
        dueDate: string;
        dueTime: string;
    };
    note: string;
    taskType: string;
    assignee: string;
    entity_id: string;
}

export interface DayTasks {
    day: number;
    tasks: Task[];
}

export interface CalendarData {
    month: number;
    year: number;
    days: DayTasks[];
}

export const getTasks = async (id: string): Promise<Task[]> => {
  const response = await apiClient.get(`${API_BASE_URL}/assignee/${id}`);
  return response.data;
};

export const createTask = async (taskData: Omit<Task, '_id'>): Promise<Task> => {
    const response = await apiClient.post(`${API_BASE_URL}/tasks/`, taskData);
    return response.data;
};

export const updateTask = async (id: string, taskData: Partial<Omit<Task, '_id'>>): Promise<Task> => {
    const response = await apiClient.put(`${API_BASE_URL}/tasks/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`${API_BASE_URL}/tasks/${id}`);
    return response.data;
};


export const getCalendarData = async (year: number, month: number, userId: string): Promise<CalendarData> => {
    const response = await apiClient.get(`${API_BASE_URL}/calendar`, {
        params: { year, month }
    });
    return response.data;
};
