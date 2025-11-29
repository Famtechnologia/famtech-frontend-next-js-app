"use client";

import { useState } from "react";
import Card from "@/components/ui/Card"; 
import { useAuth } from "@/lib/hooks/useAuth";
import { generateAnalytics } from "@/lib/services/analytics";
import { generateReport } from "@/lib/services/report"; 
import { useAnalyticsHistory } from "@/lib/hooks/useAnalytics"; 
import { useReports } from "@/lib/hooks/useReports"; 
import { AxiosError } from "axios";

// -------------------- Analytics Generator --------------------
const AnalyticsGenerator = () => {
  const { user } = useAuth();
  const farmId = user?.farmProfile || "";
  
  const { mutate: mutateHistory } = useAnalyticsHistory();
  
  const [formData, setFormData] = useState({
    type: "farm_performance",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    periodType: "custom",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const analyticsTypes = [
    { value: "farm_performance", label: "Overall Performance" },
    { value: "crop_yield", label: "Crop Yield Analysis" },
    { value: "financial", label: "Financial Metrics" },
    { value: "livestock_performance", label: "Livestock Performance" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        farmId,
      };

      await generateAnalytics(payload);

      setMessage({
        type: "success",
        text: "Analytics generated successfully! Check the History tab.",
      });

      mutateHistory();
    } catch (err) {
      let errorText = "Failed to generate analytics due to a network or server error.";
      if (err instanceof AxiosError) {
        errorText = err.response?.data?.message || errorText;
      } else if (err instanceof Error) {
        errorText = err.message;
      }
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Generate Real-Time Analytics" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Request immediate analysis of your farm data for a specific period.
        </p>

        {/* Type Select */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Analysis Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          >
            {analyticsTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-40 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          }`}
        >
          {loading ? "Generating..." : "Run Analysis"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </Card>
  );
};

// -------------------- Report Generator --------------------
const ReportGenerator = () => {
  const { user } = useAuth();
  const farmId = user?.farmProfile || "";
  const { mutate: mutateReports } = useReports(); 

  const [formData, setFormData] = useState({
    type: "comprehensive",
    format: "pdf",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    includeCharts: true,
    includePredictions: true,
    includeRecommendations: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const reportTypes = [
    { value: "comprehensive", label: "Comprehensive Farm Report" },
    { value: "performance", label: "Detailed Performance" },
    { value: "financial", label: "Financial Summary" },
    { value: "crop_analysis", label: "Crop Analysis" },
    { value: "livestock_report", label: "Livestock Report" },
  ];
  const reportFormats = [
    { value: "pdf", label: "PDF Document" },
    { value: "excel", label: "Excel Spreadsheet" },
    { value: "csv", label: "CSV Data File" },
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && "checked" in e.target) {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        farmId,
      };

      await generateReport(payload);

      setMessage({
        type: "success",
        text: "Report successfully queued for generation! Check the History tab.",
      });

      mutateReports();
    } catch (err) {
      let errorText = "Failed to queue report generation.";
      if (err instanceof AxiosError) {
        errorText = err.response?.data?.message || errorText;
      } else if (err instanceof Error) {
        errorText = err.message;
      }
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Generate Downloadable Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Generate a comprehensive, downloadable report in your preferred format.
        </p>

        {/* Report Type & Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              id="reportType"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">
              Output Format
            </label>
            <select
              id="format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            >
              {reportFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportStartDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="reportStartDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label htmlFor="reportEndDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="reportEndDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        {/* Inclusion Checkboxes */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Inclusions</label>
          <div className="flex flex-wrap gap-4">
            {["includeCharts", "includePredictions", "includeRecommendations"].map((key) => (
              <div key={key} className="flex items-center">
                <input
                  id={key}
                  name={key}
                  type="checkbox"
                  checked={formData[key]}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                  {key === "includeCharts"
                    ? "Include Charts"
                    : key === "includePredictions"
                    ? "Include Predictions"
                    : "Include Recommendations"}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-40 py-2 px-4 flex items-center justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          }`}
        >
          {loading ? "Queuing Report..." : "Generate Report"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </Card>
  );
};

// -------------------- Generate Tab --------------------
export default function GenerateTab() {
  return (
    <div className="space-y-8">
      <AnalyticsGenerator />
      <ReportGenerator />
    </div>
  );
}
