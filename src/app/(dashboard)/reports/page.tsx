"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Calendar,
  Sparkles,
  Loader2,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Search
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  getReports,
  generateReport,
  downloadReport,
  deleteReport,
  ReportPayload
} from "@/lib/services/report";

interface Report {
  _id: string;
  title: string;
  type: string;
  format: string;
  config: {
    period: { startDate: string; endDate: string };
    includeCharts?: boolean;
    includePredictions?: boolean;
    includeRecommendations?: boolean;
  };
  status: "generating" | "completed" | "failed";
  createdAt: string;
  downloadCount: number;
}

const REPORT_TYPES = [
  { value: "performance", label: "Performance Report", desc: "Overall farm metrics, yield trends, and financial overview." },
  { value: "financial", label: "Financial Report", desc: "Detailed revenue, expenses, and profit margin analysis." },
  { value: "crop_analysis", label: "Crop Analysis", desc: "Yield breakdown, growth status, and seeding density analysis." },
  { value: "livestock_report", label: "Livestock Report", desc: "Herd count, feed conversion, and health monitoring." },
  { value: "comprehensive", label: "Comprehensive Report", desc: "Full operational report compiling all metrics and advisory recommendations." }
];

export default function ReportsPage() {
  const { profile, isHydrating } = useProfile();
  
  // State variables
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  
  // Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Action State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Generation Form Fields
  const [formData, setFormData] = useState({
    type: "performance" as "performance" | "financial" | "crop_analysis" | "livestock_report" | "comprehensive",
    format: "pdf" as "pdf" | "excel",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeCharts: true,
    includePredictions: false,
    includeRecommendations: true
  });

  // Fetch reports on mount and when profile changes
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReports();
      if (res && res.success && res.data) {
        setReports(res.data.reports || []);
      } else {
        setError("Failed to retrieve reports from server.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse?.response?.data?.message || "An unexpected error occurred while loading reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrating && profile?.id) {
      fetchReports();
    }
  }, [profile?.id, isHydrating]);

  // Handle toast timers
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Filtered reports computed
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === "all" || r.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedTypeFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === "completed").length;
    const pending = reports.filter(r => r.status === "generating").length;
    const totalDownloads = reports.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
    return { total, completed, pending, totalDownloads };
  }, [reports]);

  // Handle report generation
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      setGenError("No active farm profile found. Please complete profile configuration first.");
      return;
    }

    try {
      setGenerating(true);
      setGenError(null);

      const payload: ReportPayload = {
        farmId: profile.id,
        type: formData.type,
        format: formData.format,
        startDate: formData.startDate,
        endDate: formData.endDate,
        includeCharts: formData.includeCharts,
        includePredictions: formData.includePredictions,
        includeRecommendations: formData.includeRecommendations
      };

      const res = await generateReport(payload);
      if (res && res.success) {
        setSuccessToast("Report generation initiated successfully!");
        setShowGenModal(false);
        // Refresh list
        fetchReports();
      } else {
        setGenError(res?.message || "Failed to trigger report generation.");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setGenError(errorResponse?.response?.data?.message || "Unable to communicate with the server to generate reports.");
    } finally {
      setGenerating(false);
    }
  };

  // Handle report download
  const handleDownload = async (report: Report) => {
    try {
      setDownloadingId(report._id);
      const { data, fileName } = await downloadReport(report._id);
      
      const blob = new Blob([data], { 
        type: report.format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || `${report.title}.${report.format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessToast("File download started successfully!");
      // Refresh count locally
      setReports(prev => prev.map(r => r._id === report._id ? { ...r, downloadCount: (r.downloadCount || 0) + 1 } : r));
    } catch (err: unknown) {
      console.error(err);
      setSuccessToast("Failed to download file. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle report delete
  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteReport(reportToDelete._id);
      if (res && res.success) {
        setSuccessToast("Report deleted successfully!");
        setReports(prev => prev.filter(r => r._id !== reportToDelete._id));
        setReportToDelete(null);
      } else {
        setSuccessToast("Failed to delete the report.");
      }
    } catch (err: unknown) {
      console.error(err);
      setSuccessToast("An error occurred during report deletion.");
    } finally {
      setDeleting(false);
    }
  };

  if (isHydrating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 font-medium">
        <Loader2 className="animate-spin h-10 w-10 text-green-600 mb-4" />
        <p>Loading farm profile and preferences...</p>
      </div>
    );
  }

  return (
    <div className="text-slate-900 font-sans p-3 md:p-6 bg-slate-50/30 min-h-screen">
      
      {/* Success Toast Banner */}
      {successToast && (
        <div className="fixed top-4 right-4 z-200 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg transition-transform duration-300 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex mb-6 bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/50 flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Analytics Reporting
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Generate, view, and export detailed PDFs and Excel sheets of your farm operational metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-green-600/10 hover:shadow-green-700/20 scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Reports</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800">{metrics.total}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-green-600">{metrics.completed}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Generating</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-500">{metrics.pending}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Downloads</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{metrics.totalDownloads}</span>
          </div>
        </div>
      </div>

      {/* Controls & Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
        
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl max-w-xl">
            {["all", "performance", "financial", "crop_analysis", "livestock_report", "comprehensive"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTypeFilter(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize
                  ${
                    selectedTypeFilter === tab
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {tab === "all" ? "All Formats" : tab.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm"
            />
          </div>
        </div>

        {/* Reports History List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium">
            <Loader2 className="animate-spin h-8 w-8 text-green-600 mb-4" />
            <p>Loading your reports history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-slate-500 font-medium text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
            <p className="max-w-md">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1.5 text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Retry Loading
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No reports generated</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              {searchQuery || selectedTypeFilter !== "all"
                ? "No reports match your current search queries or filters."
                : "Choose a template and select a custom range to generate your first agricultural PDF or Excel document."}
            </p>
            {!searchQuery && selectedTypeFilter === "all" && (
              <button
                onClick={() => setShowGenModal(true)}
                className="mt-6 bg-green-50 text-green-700 hover:bg-green-100 px-5 py-2 rounded-xl font-bold transition-all text-sm"
              >
                Create a Report
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-150">
                  <th className="p-4 pl-6">Report Title</th>
                  <th className="p-4">Template Type</th>
                  <th className="p-4">Range Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Format</th>
                  <th className="p-4 text-center">Downloads</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-800">
                      {report.title}
                    </td>
                    <td className="p-4 text-slate-500 capitalize">
                      {report.type.replace("_", " ")}
                    </td>
                    <td className="p-4 text-slate-500 text-xs tabular">
                      {new Date(report.config?.period?.startDate).toLocaleDateString()} – {new Date(report.config?.period?.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {report.status === "completed" && (
                        <span className="inline-flex px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                          Ready
                        </span>
                      )}
                      {report.status === "generating" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-250 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                          <Loader2 className="animate-spin h-3 w-3" />
                          <span>Building</span>
                        </span>
                      )}
                      {report.status === "failed" && (
                        <span className="inline-flex px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
                        {report.format === "pdf" ? (
                          <>
                            <FileText className="h-4 w-4 text-rose-500" />
                            <span>PDF</span>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            <span>XLSX</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-500 tabular font-medium">
                      {report.downloadCount || 0}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === "completed" ? (
                          <button
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId !== null}
                            className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-750 bg-green-50 border border-green-200/50 hover:bg-green-100/55 px-3 py-1.5 rounded-lg transition-all"
                          >
                            {downloadingId === report._id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                            <span>Download</span>
                          </button>
                        ) : (
                          <div className="h-7 w-20 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            —
                          </div>
                        )}
                        <button
                          onClick={() => setReportToDelete(report)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Delete Report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        show={showGenModal}
        onClose={() => !generating && setShowGenModal(false)}
        title="Generate New Report"
      >
        <form onSubmit={handleCreateReport} className="space-y-6">
          
          {genError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{genError}</span>
            </div>
          )}

          {/* Type Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Report Template</label>
            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {REPORT_TYPES.map((t) => {
                const active = formData.type === t.value;
                return (
                  <label
                    key={t.value}
                    className={`cursor-pointer rounded-xl border p-3.5 flex items-start gap-3 transition-all
                      ${active
                        ? "border-green-600 bg-green-50/40 ring-1 ring-green-600"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={t.value}
                      className="sr-only"
                      checked={active}
                      onChange={() => setFormData(prev => ({ ...prev, type: t.value as typeof prev.type }))}
                    />
                    <div className={`mt-0.5 p-2 rounded-lg ${active ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${active ? "text-green-700" : "text-slate-800"}`}>
                        {t.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {t.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Formats Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">Output File Format</label>
            <div className="flex items-center gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-xl cursor-pointer font-semibold text-sm transition-all
                ${formData.format === "pdf"
                  ? "border-rose-350 bg-rose-50/20 text-rose-700 ring-1 ring-rose-250"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={formData.format === "pdf"}
                  onChange={() => setFormData(prev => ({ ...prev, format: "pdf" }))}
                  className="sr-only"
                />
                <FileText className="h-4 w-4 text-rose-500" />
                <span>PDF Document</span>
              </label>
              
              <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-xl cursor-pointer font-semibold text-sm transition-all
                ${formData.format === "excel"
                  ? "border-green-300 bg-green-50/20 text-green-700 ring-1 ring-green-350"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={formData.format === "excel"}
                  onChange={() => setFormData(prev => ({ ...prev, format: "excel" }))}
                  className="sr-only"
                />
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span>Excel Spreadsheet</span>
              </label>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Period Start</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-slate-205 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/25"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Period End</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-slate-205 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/25"
                  required
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-150/40">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Additional Options</span>
            
            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.includeCharts}
                onChange={(e) => setFormData(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="h-4.5 w-4.5 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <span>Include Performance Charts</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.includePredictions}
                onChange={(e) => setFormData(prev => ({ ...prev, includePredictions: e.target.checked }))}
                className="h-4.5 w-4.5 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <span>Include Crop Yield Predictions</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.includeRecommendations}
                onChange={(e) => setFormData(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                className="h-4.5 w-4.5 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <span>Include Expert AI Recommendations</span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 text-green-500 shrink-0" />
              <span>Auto-compiles log activities</span>
            </span>
            
            <div className="flex gap-2">
              <button
                type="button"
                disabled={generating}
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/60 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-600/10"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    <span>Compile Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </Modal>

      {/* Delete Confirmation Modal (Avoid native browser prompts) */}
      <Modal
        show={reportToDelete !== null}
        onClose={() => !deleting && setReportToDelete(null)}
        title="Delete Report"
      >
        <div className="space-y-5">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 flex gap-3 text-sm">
            <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Action</p>
              <p className="mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold">{reportToDelete?.title}</span>? This action is permanent, and the generated file will be removed from the farm logs.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setReportToDelete(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/60 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md"
            >
              {deleting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
