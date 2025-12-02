"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { useAnalyticsHistory } from "@/lib/hooks/useAnalytics";
import { useReports } from "@/lib/hooks/useReports";
import { deleteReport, downloadReport } from "@/lib/services/report";
import { getAnalyticsById } from "@/lib/services/analytics";
import { Trash2, Download, Eye, Loader2 } from "lucide-react";

// ----------------------------------------------------
// Analytics History Table
// ----------------------------------------------------
const AnalyticsHistoryTable = () => {
  const [viewing, setViewing] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [params] = useState({ limit: 10, page: 1 });

  const { data, isLoading, error } = useAnalyticsHistory(params);

  if (isLoading) return <div className="text-gray-600 italic py-4">Loading analytics history...</div>;
  if (error) return <div className="text-red-600 py-4">Error loading history: {error.message}</div>;

  const historyRecords = data?.data?.analytics ?? data?.analytics ?? data?.records ?? [];
  const pagination = data?.data?.pagination ?? data?.pagination;

  const handleViewDetails = async (record) => {
    setLoadingDetails(true);
    try {
      if (record.metrics && record.trends && record.predictions) {
        setDetails(record);
      } else {
        const res = await getAnalyticsById(record._id || record.id);
        setDetails(res?.data ?? res);
      }
      setViewing(true);
    } catch {
      toast.error("Failed to fetch analytics details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <Card title="Generated Analytics Records" headerClassName="bg-gray-50">
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4 text-sm">
          <p className="text-gray-500">
            Found <b>{pagination?.total || data?.totalRecords || 0}</b> records.
          </p>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyRecords.length > 0 ? (
              historyRecords.map((record) => (
                <tr key={record._id || record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.createdAt || record.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.type.replace("_", " ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.period?.startDate || record.startDate).toLocaleDateString()} -{" "}
                    {new Date(record.period?.endDate || record.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Complete</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full"
                      onClick={() => handleViewDetails(record)}
                      disabled={loadingDetails}
                      title="View analytics details"
                    >
                      {loadingDetails ? <Loader2 size={18} className="animate-spin" /> : <Eye size={20} />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  No historical analytics found. Generate one in the <b>Generate</b> tab!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
     {viewing && details && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-6 overflow-y-auto max-h-[90vh] animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Eye size={20} className="text-green-600" /> Analytics Details
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Farm: <span className="font-medium">{details.farmId?.farmName || "—"}</span> • Type:{" "}
            <span className="capitalize">{details.type?.replace("_", " ") || "—"}</span>
          </p>
          <p className="text-xs text-gray-400">
            Period: {new Date(details.period?.startDate).toLocaleDateString()} -{" "}
            {new Date(details.period?.endDate).toLocaleDateString()} ({details.period?.periodType})
          </p>
        </div>
        <button
          onClick={() => setViewing(false)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm transition"
        >
          Close
        </button>
      </div>

      {/* Metrics */}
      <h4 className="font-semibold text-gray-700 mb-2">Metrics Overview</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          ["Total Yield", details.metrics?.totalYield],
          ["Avg Yield/ha", details.metrics?.averageYieldPerHectare],
          ["Success Rate", details.metrics?.cropSuccessRate],
          ["Revenue", details.metrics?.totalRevenue],
          ["Expenses", details.metrics?.totalExpenses],
          ["Profit Margin", `${details.metrics?.profitMargin}%`],
        ].map(([label, value]) => (
          <div key={label} className="p-3 border border-gray-200 rounded-md bg-green-50">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-green-700">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Weather Impact */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Weather Impact</h4>
        <p className="text-sm text-gray-600">
          Impact Score: <span className="font-medium text-green-700">
            {details.metrics?.weatherImpact?.impactScore ?? "—"}
          </span>
        </p>
      </div>

      {/* Resource Utilization */}
      <h4 className="font-semibold text-gray-700 mb-2">Resource Utilization</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(details.metrics?.resourceUtilization || {}).map(([key, val]) => (
          <div key={key} className="p-3 border border-gray-200 rounded-md bg-green-50">
            <p className="text-xs text-gray-500 capitalize">{key}</p>
            <p className="text-lg font-semibold text-green-700">
              {val ?? 0}%
            </p>
          </div>
        ))}
      </div>

      {/* Trends */}
      <h4 className="font-semibold text-gray-700 mb-2">Performance Trends</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(details.trends || {}).map(([trend, val]) => (
          <div key={trend} className="p-3 border border-gray-200 rounded-md bg-green-50">
            <p className="text-xs text-gray-500 capitalize">
              {trend.replace("Trend", "")}
            </p>
            <p className="text-sm font-medium text-green-700">{val}</p>
          </div>
        ))}
      </div>

      {/* Predictions */}
      <h4 className="font-semibold text-gray-700 mb-2">Predictions & Risks</h4>
      {details.predictions?.recommendedActions?.length > 0 ? (
        <ul className="list-disc pl-5 text-sm text-gray-700 mb-3">
          {details.predictions.recommendedActions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mb-3 ">
          No recommended actions available.
        </p>
      )}

      {details.predictions?.riskFactors?.length > 0 ? (
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {details.predictions.riskFactors.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 ">
          No risk factors identified.
        </p>
      )}
    </div>
  </div>
)}

    </Card>
  );
};

// ----------------------------------------------------
// Report Management Table
// ----------------------------------------------------
const ReportManagementTable = () => {
  const [deletingId, setDeletingId] = useState(null);
  const { data, isLoading, error, mutate } = useReports({ limit: 10, page: 1 });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setDeletingId(id);
    try {
      await deleteReport(id);
      mutate();
      toast.success("Report deleted successfully!");
    } catch {
      toast.error("Failed to delete report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await downloadReport(id);
      const blobData = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully!");
    } catch {
      toast.error("Failed to download report.");
    }
  };

  if (isLoading) return <div className="text-gray-600 italic py-4">Loading reports...</div>;
  if (error) return <div className="text-red-600 py-4">Error loading reports: {error.message}</div>;

  const reports = data?.reports || data?.data?.reports || [];

  return (
    <Card title="Generated Reports Management" headerClassName="bg-gray-50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((r) => (
                <tr key={r._id || r.id}>
                  <td className="px-6 py-4 text-sm">{r.type}</td>
                  <td className="px-6 py-4 text-sm">{r.format}</td>
                  <td className="px-6 py-4 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "-"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleDownload(r._id || r.id, `report_${r.type}.${r.format}`)} className="text-green-600 hover:text-green-800 transition p-1">
                      <Download size={18} />
                    </button>
                    <button onClick={() => handleDelete(r._id || r.id)} disabled={deletingId === (r._id || r.id)} className="text-red-600 hover:text-red-800 transition p-1 disabled:opacity-50">
                      {deletingId === (r._id || r.id) ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6 italic">No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ----------------------------------------------------
// Main History Tab Component
// ----------------------------------------------------
export default function HistoryTab() {
  return (
    <div className="space-y-8">
      <AnalyticsHistoryTable />
      <ReportManagementTable />
    </div>
  );
}