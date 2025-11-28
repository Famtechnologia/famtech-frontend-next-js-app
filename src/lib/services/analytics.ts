import analytics, { API_URL } from "@/lib/api/analytics";


const API_BASE_URL = `${API_URL}/api/analytics`;

/* ----------------------------- Interfaces ----------------------------- */
export interface AnalyticsPayload {
  farmId: string;
  type: "farm_performance" | "crop_yield" | "financial" | "livestock_performance";
  startDate: string;
  endDate: string;
  periodType?: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
}

export interface AnalyticsHistoryParams {
  farmId?: string;
  type?: string;
  limit?: number;
  page?: number;
}

/* ----------------------------- Services ----------------------------- */

//  Generate analytics for a specific farm & period
export const generateAnalytics = async (data: AnalyticsPayload) => {
  const response = await analytics.post(`${API_BASE_URL}/generate`, data);
  return response.data;
};

//  Fetch analytics history with filters & pagination
export const getAnalyticsHistory = async (params?: AnalyticsHistoryParams) => {
  const response = await analytics.get(`${API_BASE_URL}/history`, { params });
  return response.data;
};

//  Fetch single analytics record
export const getAnalyticsById = async (id: string) => {
  const response = await analytics.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Download analytics result (binary or export)
export const downloadAnalytics = async (id: string) => {
  const response = await analytics.get(`${API_BASE_URL}/reports/${id}/download`, {
    responseType: "blob",
  });
  return { data: response.data, headers: response.headers };
};

// Delete analytics record
export const deleteAnalytics = async (id: string) => {
  const response = await analytics.delete(`${API_BASE_URL}/reports/${id}`);
  return response.data;
};
