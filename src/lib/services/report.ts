import analytics, { API_URL } from "@/lib/api/analytics";

const API_BASE_URL = `${API_URL}/api/analytics/reports`;

export interface ReportPayload {
  farmId: string;
  type: "performance" | "financial" | "crop_analysis" | "livestock_report" | "comprehensive";
  format?: "pdf" | "excel" | "csv";
  startDate: string;
  endDate: string;
  includeCharts?: boolean;
  includePredictions?: boolean;
  includeRecommendations?: boolean;
  crops?: string[];
  livestock?: string[];
}

export interface ReportQuery {
  limit?: number;
  page?: number;
  type?: string;
}

//  Generate Report
export const generateReport = async (data: ReportPayload) => {
  const response = await analytics.post(`${API_BASE_URL}/generate`, data);
  return response.data;
};

// List Reports
export const getReports = async (params?: ReportQuery) => {
  const response = await analytics.get(API_BASE_URL, { params });
  return response.data;
};

//  Download Report
export const downloadReport = async (id: string) => {
  // Request binary data (blob) from the server
  const response = await analytics.get(`${API_BASE_URL}/${id}/download`, {
    responseType: "blob",
  });
  // Return both data and headers so callers can extract filename from Content-Disposition
  return { data: response.data, headers: response.headers };
};

//  Delete Report
export const deleteReport = async (id: string) => {
  const response = await analytics.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
