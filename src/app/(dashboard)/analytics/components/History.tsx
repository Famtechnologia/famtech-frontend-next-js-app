"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { useAnalyticsHistory } from "@/lib/hooks/useAnalytics";
import { useReports } from "@/lib/hooks/useReports";
import {
  deleteReport,
  downloadReport,
  ReportQuery,
} from "@/lib/services/report";
import {
  getAnalyticsById,
} from "@/lib/services/analytics";
import { Trash2, Download, Eye, Loader2 } from "lucide-react";

// ----------------------------------------------------
// Sub-Component: Analytics History Table
// ----------------------------------------------------
const AnalyticsHistoryTable: React.FC = () => {
  const [viewing, setViewing] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [params, setParams] = useState<ReportQuery>({ limit: 10, page: 1 });

  const { data, isLoading, error } = useAnalyticsHistory(params);

  if (isLoading)
    return (
      <div className="text-gray-600 italic py-4">
        Loading analytics history...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 py-4">
        Error loading history: {error.message}
      </div>
    );

  const historyRecords =
    data?.data?.analytics ?? data?.analytics ?? data?.records ?? [];
  const pagination = data?.data?.pagination ?? data?.pagination;

  const handleViewDetails = async (record: any) => {
    setLoadingDetails(true);
    try {
      if (record.metrics && record.trends && record.predictions) {
        setDetails(record);
      } else {
        const res = await getAnalyticsById(record._id || record.id);
        setDetails(res?.data ?? res);
      }
      setViewing(true);
    } catch (err) {
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                View
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyRecords.length > 0 ? (
              historyRecords.map((record: any) => (
                <tr key={record._id || record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(
                      record.createdAt || record.generatedAt
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {record.type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(
                      record.period?.startDate || record.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      record.period?.endDate || record.endDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Complete
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full"
                      onClick={() => handleViewDetails(record)}
                      disabled={loadingDetails}
                      title="View analytics details"
                    >
                      {loadingDetails ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 italic"
                >
                  No historical analytics found. Generate one in the{" "}
                  <b>Generate</b> tab!
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modern Popup */}
        {viewing && details && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 relative overflow-y-auto max-h-[90vh] animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Eye size={20} className="text-green-600" /> Analytics
                    Details
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Farm:{" "}
                    <span className="font-medium">
                      {details.farmId?.farmName || "—"}
                    </span>{" "}
                    • Type:{" "}
                    <span className="capitalize">
                      {details.type?.replace("_", " ") || "—"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setViewing(false)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-sm transition"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <p>
                  <span className="font-semibold">Period:</span>{" "}
                  {new Date(details.period?.startDate).toLocaleDateString()} -{" "}
                  {new Date(details.period?.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Generated At:</span>{" "}
                  {details.generatedAt
                    ? new Date(details.generatedAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-green-700 mb-2">
                  Key Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {/* Map and render only primitive key metrics here */}
                  {Object.entries(details.metrics || {}).map(
                    ([key, val]: [string, any], idx) => {
                      // Skip all nested objects/arrays which are handled separately below
                      if (typeof val === "object" && val !== null) {
                          // Explicitly skip nested object keys
                          if (['resourceUtilization', 'weatherImpact', 'cropData', 'livestockData'].includes(key)) {
                              return null; 
                          }
                      }

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-green-50 rounded-lg border border-green-100 shadow-sm"
                        >
                          <p className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-green-700 font-semibold">
                            {typeof val === "number"
                              ? val.toLocaleString()
                              : String(val)}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* New Section: Resource Utilization Details */}
                {details.metrics?.resourceUtilization && (
                    <div className="mt-4 border-t pt-4">
                        <h5 className="font-semibold text-gray-700 mb-2">
                            Resource Utilization (Units Used)
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {Object.entries(details.metrics.resourceUtilization).map(([key, val]) => (
                                <div
                                    key={key}
                                    className="p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm"
                                >
                                    <p className="text-xs text-gray-500 capitalize">
                                        {key}
                                    </p>
                                    <p className="text-blue-700 font-semibold">
                                        {typeof val === "number" ? val.toLocaleString() : String(val)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* New Section: Weather Impact Details */}
                {details.metrics?.weatherImpact && (
                    <div className="mt-4 border-t pt-4">
                        <h5 className="font-semibold text-gray-700 mb-2">
                            Weather Impact
                        </h5>
                        <p className="text-sm">
                            <span className="font-semibold">Impact Score:</span> 
                            <span className="ml-2 font-medium text-orange-600">
                                {String(details.metrics.weatherImpact.impactScore)}
                            </span> 
                            <span className="text-gray-500 ml-1">(1=Low Impact, 10=High Impact)</span>
                        </p>
                    </div>
                )}


                {/* Crop Data (Existing logic, now placed correctly) */}
                {details.metrics?.cropData?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-gray-700 mb-1">
                      Crop Data
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              "Crop",
                              "Area",
                              "Yield",
                              "Revenue",
                              "Expenses",
                              "Profit",
                            ].map((h) => (
                              <th
                                key={h}
                                className="p-2 text-left font-medium text-gray-600"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {details.metrics.cropData.map(
                            (crop: any, idx: number) => (
                              <tr key={idx} className="border-t text-gray-700">
                                <td className="p-2">{crop.cropType}</td>
                                <td className="p-2">{crop.area}</td>
                                <td className="p-2">{crop.yield}</td>
                                <td className="p-2">
                                  ₦{crop.revenue?.toLocaleString()}
                                </td>
                                <td className="p-2">
                                  ₦{crop.expenses?.toLocaleString()}
                                </td>
                                <td className="p-2">
                                  ₦{crop.profit?.toLocaleString()}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Trends */}
              {details.trends && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-green-700 mb-2">Trends</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {Object.entries(details.trends).map(([key, val]) => (
                      <li key={key}>
                        <span className="font-semibold capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>{" "}
                        {String(val)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Predictions & Recommendations */}
              {details.predictions && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-green-700 mb-2">
                    Predictions & Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {details.predictions.nextPeriodYield && (
                      <li>
                        <span className="font-semibold">
                          Next Period Yield:
                        </span>{" "}
                        {String(details.predictions.nextPeriodYield)}
                      </li>
                    )}
                    {details.predictions.nextPeriodRevenue && (
                      <li>
                        <span className="font-semibold">
                          Next Period Revenue:
                        </span>{" "}
                        ₦
                        {details.predictions.nextPeriodRevenue.toLocaleString()}
                      </li>
                    )}
                    {details.predictions.recommendedActions?.length > 0 && (
                      <li>
                        <span className="font-semibold">
                          Recommended Actions:
                        </span>{" "}
                        {details.predictions.recommendedActions.join(", ")}
                      </li>
                    )}
                    {details.predictions.riskFactors?.length > 0 && (
                      <li>
                        <span className="font-semibold">Risk Factors:</span>{" "}
                        {details.predictions.riskFactors.join(", ")}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ----------------------------------------------------
// Sub-Component: Report Management Table
// ----------------------------------------------------
const ReportManagementTable: React.FC = () => {
  const [params, setParams] = useState<ReportQuery>({ limit: 10, page: 1 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data, isLoading, error, mutate } = useReports(params);

  const handleDelete = async (id: string) => {
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

  const handleDownload = async (id: string, filename: string) => {
    try {
      const res = await downloadReport(id);
      const blobData =
        res?.data instanceof Blob ? res.data : new Blob([res?.data]);
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

  if (isLoading)
    return <div className="text-gray-600 italic py-4">Loading reports...</div>;

  if (error)
    return (
      <div className="text-red-600 py-4">
        Error loading reports: {error.message}
      </div>
    );

  const reports = data?.reports || data?.data?.reports || [];
  const pagination = data?.pagination || data?.data?.pagination;

  return (
    <Card title="Generated Reports Management" headerClassName="bg-gray-50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((r: any) => (
                <tr key={r._id || r.id}>
                  <td className="px-6 py-4 text-sm">{r.type}</td>
                  <td className="px-6 py-4 text-sm">{r.format}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {r.expiresAt
                      ? new Date(r.expiresAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() =>
                        handleDownload(
                          r._id || r.id,
                          `report_${r.type}.${r.format}`
                        )
                      }
                      className="text-green-600 hover:text-green-800 transition p-1"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id || r.id)}
                      disabled={deletingId === (r._id || r.id)}
                      className="text-red-600 hover:text-red-800 transition p-1 disabled:opacity-50"
                    >
                      {deletingId === (r._id || r.id) ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-6 italic"
                >
                  No reports found.
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

