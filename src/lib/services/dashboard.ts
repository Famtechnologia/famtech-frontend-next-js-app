import analytics, { API_URL } from "@/lib/api/analytics";

const API_BASE_URL = `${API_URL}/api/analytics`;

/* ----------------------------- Interfaces ----------------------------- */
export interface DashboardUpdatePayload {
  layout?: "grid" | "masonry" | "custom";
  widgets: {
    type: string;
    title: string;
    position: { x: number; y: number; width: number; height: number };
    config?: Record<string, any>;
  }[];
}

export interface InsightsParams {
  period?: "week" | "month" | "quarter" | "year";
}

export interface CompareParams {
  farmIds: string; // comma-separated
  startDate: string;
  endDate: string;
  metric: "yield" | "revenue" | "profit" | "efficiency";
}

/* ----------------------------- Services ----------------------------- */

// Get Dashboard Data
export const getDashboardData = async (farmId: string) => {
  const response = await analytics.get(`${API_BASE_URL}/dashboard/${farmId}`);
  return response.data;
};

//  Update Dashboard
export const updateDashboard = async (farmId: string, data: DashboardUpdatePayload) => {
  const response = await analytics.put(`${API_BASE_URL}/dashboard/${farmId}`, data);
  return response.data;
};

//  Fetch Insights & Predictions
export const getInsights = async (farmId: string, params?: InsightsParams) => {
  const response = await analytics.get(`${API_BASE_URL}/insights/${farmId}`, { params });
  return response.data;
};

//  Compare Farms
export const compareFarms = async (params: CompareParams) => {
  const response = await analytics.get(`${API_BASE_URL}/compare`, { params });
  return response.data;
};
