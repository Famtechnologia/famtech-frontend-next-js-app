"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Leaf,
  Bug,
  Activity,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import apiClient from "@/lib/api/apiClient";

interface CropHealthRecord {
  _id?: string;
  id?: string;
  cropType?: string;
  fieldName?: string;
  growthStage?: string;
  healthStatus?: string;
  overallScore?: number;
  inspectionDate?: string;
  createdAt?: string;
}

interface DiseaseRecord {
  _id?: string;
  id?: string;
  cropType?: string;
  diseaseName?: string;
  diseaseType?: string;
  severity?: string;
  status?: string;
  affectedArea?: number;
  isResolved?: boolean;
  createdAt?: string;
}

const healthStatusStyle = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "excellent":
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "fair":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "poor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
    case "critical":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const severityStyle = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "low":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
    case "critical":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const diseaseStatusStyle = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "contained":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "active":
    case "spreading":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const titleCase = (s?: string) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—");
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");

export default function HealthPage() {
  const [tab, setTab] = useState<"crops" | "diseases">("crops");
  const [cropRecords, setCropRecords] = useState<CropHealthRecord[]>([]);
  const [diseaseRecords, setDiseaseRecords] = useState<DiseaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [crops, diseases] = await Promise.all([
        apiClient.get("/api/health/crops").catch(() => ({ data: { data: [] } })),
        apiClient.get("/api/health/diseases").catch(() => ({ data: { data: [] } })),
      ]);
      setCropRecords((crops?.data?.data ?? []) as CropHealthRecord[]);
      setDiseaseRecords((diseases?.data?.data ?? []) as DiseaseRecord[]);
    } catch (err) {
      console.error("[health] failed to load:", err);
      setError("Could not load health records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cropSummary = useMemo(() => {
    const healthy = cropRecords.filter((r) => ["excellent", "good"].includes((r.healthStatus || "").toLowerCase())).length;
    const attention = cropRecords.filter((r) => ["fair", "poor"].includes((r.healthStatus || "").toLowerCase())).length;
    const critical = cropRecords.filter((r) => (r.healthStatus || "").toLowerCase() === "critical").length;
    return { total: cropRecords.length, healthy, attention, critical };
  }, [cropRecords]);

  const diseaseSummary = useMemo(() => {
    const active = diseaseRecords.filter((r) => ["active", "spreading"].includes((r.status || "").toLowerCase())).length;
    const critical = diseaseRecords.filter((r) => (r.severity || "").toLowerCase() === "critical").length;
    const resolved = diseaseRecords.filter((r) => r.isResolved || (r.status || "").toLowerCase() === "resolved").length;
    return { total: diseaseRecords.length, active, critical, resolved };
  }, [diseaseRecords]);

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader title="Crop & Livestock Health" subtitle="Monitor crop health records and track disease outbreaks.">
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#30363d]">
        {[
          { id: "crops" as const, label: "Crop Health", icon: Leaf },
          { id: "diseases" as const, label: "Diseases", icon: Bug },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id
                ? "border-green-700 text-green-700 dark:border-green-500 dark:text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-green-700 dark:text-green-500 gap-2 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading health records...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{error}</p>
          <button onClick={load} className="text-xs font-semibold text-green-700 dark:text-green-500 hover:underline">Try again</button>
        </div>
      ) : tab === "crops" ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Activity className="w-5 h-5" />} label="Records" value={cropSummary.total} />
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Healthy" value={cropSummary.healthy} tone="green" />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Needs Attention" value={cropSummary.attention} tone="amber" />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Critical" value={cropSummary.critical} tone="rose" />
          </div>

          <RecordTable
            empty={cropRecords.length === 0}
            emptyText="No crop health records yet."
            head={["Crop", "Field", "Growth Stage", "Status", "Score", "Inspected"]}>
            {cropRecords.map((r) => (
              <tr key={r._id || r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{titleCase(r.cropType)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.fieldName || "—"}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.growthStage)}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${healthStatusStyle(r.healthStatus)}`}>
                    {r.healthStatus || "—"}
                  </span>
                </td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.overallScore != null ? `${r.overallScore}` : "—"}</td>
                <td className="p-3.5 text-gray-500">{fmtDate(r.inspectionDate || r.createdAt)}</td>
              </tr>
            ))}
          </RecordTable>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Bug className="w-5 h-5" />} label="Records" value={diseaseSummary.total} />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Active" value={diseaseSummary.active} tone="rose" />
            <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Critical" value={diseaseSummary.critical} tone="rose" />
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Resolved" value={diseaseSummary.resolved} tone="green" />
          </div>

          <RecordTable
            empty={diseaseRecords.length === 0}
            emptyText="No disease records yet."
            head={["Disease", "Crop", "Type", "Severity", "Status", "Affected (ha)", "Reported"]}>
            {diseaseRecords.map((r) => (
              <tr key={r._id || r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{r.diseaseName || "—"}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.cropType)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.diseaseType)}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityStyle(r.severity)}`}>
                    {r.severity || "—"}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${diseaseStatusStyle(r.status)}`}>
                    {r.status || "—"}
                  </span>
                </td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.affectedArea != null ? r.affectedArea : "—"}</td>
                <td className="p-3.5 text-gray-500">{fmtDate(r.createdAt)}</td>
              </tr>
            ))}
          </RecordTable>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "gray",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "gray" | "green" | "amber" | "rose";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700 dark:text-green-400"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "rose"
      ? "text-rose-600 dark:text-rose-400"
      : "text-gray-700 dark:text-gray-300";
  return (
    <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={toneClass}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold mt-2 ${toneClass}`}>{value}</p>
    </div>
  );
}

function RecordTable({
  head,
  empty,
  emptyText,
  children,
}: {
  head: string[];
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-[#0d1117] text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-[#30363d] uppercase tracking-wider">
            <tr>
              {head.map((h) => (
                <th key={h} className="p-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
            {empty ? (
              <tr>
                <td colSpan={head.length} className="text-center py-8 text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
