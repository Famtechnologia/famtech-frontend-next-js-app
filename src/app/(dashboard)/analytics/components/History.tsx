"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card"; // Assuming Card is imported correctly
import { useAnalyticsHistory } from "@/lib/hooks/useAnalytics";
import { useReports } from "@/lib/hooks/useReports";
import { deleteReport, downloadReport, ReportQuery } from "@/lib/services/report"; // Import services and query type

// ----------------------------------------------------
// Sub-Component: Analytics History Table (Task 2C)
// ----------------------------------------------------
const AnalyticsHistoryTable: React.FC = () => {
  // State for filtering/pagination parameters
  const [params, setParams] = useState<ReportQuery>({ limit: 10, page: 1, type: undefined });

  // 🧠 Fetch data using SWR hook
  const { data, isLoading, error } = useAnalyticsHistory(params);

  if (isLoading)
    return <div className="text-gray-600 italic py-4">Loading analytics history...</div>;

  if (error)
    return <div className="text-red-600 py-4">Error loading history: {error.message}</div>;

  const historyRecords = data?.records || []; // Assuming the API returns a 'records' array

  return (
    <Card title="Generated Analytics Records" headerClassName="bg-gray-50">
      <div className="overflow-x-auto">
        {/* Placeholder for Filters/Pagination UI */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <p className="text-gray-500">
            Found <b>{data?.totalRecords || 0}</b> records.
          </p>
          {/* Add Filter inputs here (e.g., Type dropdown, Date range) */}
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Generated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Analysis Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyRecords.length > 0 ? (
              historyRecords.map((record: any) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {record.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Complete
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  No historical analytics found. Generate one in the <b>Generate</b> tab!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ----------------------------------------------------
// Sub-Component: Report Management Table (Task 2D)
// ----------------------------------------------------
const ReportManagementTable: React.FC = () => {
  const [params, setParams] = useState<ReportQuery>({ limit: 10, page: 1 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🧠 Fetch data and get the mutator
  const { data, isLoading, error, mutate } = useReports(params);

  // --- Handlers for Actions ---

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    setDeletingId(id);
    try {
      await deleteReport(id);
      // 🔑 CRITICAL: Refresh the list after successful deletion
      mutate(); 
    } catch (err) {
      alert("Failed to delete report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      // The downloadReport service should be configured to handle the file download directly (e.g., setting responseType: 'blob' in axios)
      const fileData = await downloadReport(id);

      // Create a temporary URL to trigger the download
      const url = window.URL.createObjectURL(new Blob([fileData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report. It may be expired or unavailable.");
    }
  };


  if (isLoading)
    return <div className="text-gray-600 italic py-4">Loading report list...</div>;

  if (error)
    return <div className="text-red-600 py-4">Error loading reports: {error.message}</div>;

  const reports = data?.reports || []; // Assuming the API returns a 'reports' array

  return (
    <Card title="Generated Reports Management" headerClassName="bg-gray-50">
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4 text-sm">
          <p className="text-gray-500">
            Found <b>{data?.totalReports || 0}</b> reports. Reports are auto-deleted after 30 days.
          </p>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Generated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((report: any) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {report.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleDownload(report.id, `report_${report.type}_${report.createdAt}.` + report.format)}
                      className="text-green-600 hover:text-green-900 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                      className="text-red-600 hover:text-red-900 transition disabled:text-gray-400"
                    >
                      {deletingId === report.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  No reports found. Generate one in the <b>Generate</b> tab!
                </td>
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