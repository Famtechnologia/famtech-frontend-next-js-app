"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Leaf, PawPrint, Activity, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import apiClient from "@/lib/api/apiClient";
import { useProfile } from "@/lib/hooks/useProfile";
import { toast } from "react-hot-toast";
import {
  getCropRecords,
  getLivestockRecords,
  CropRecord,
  LivestockRecord,
} from "@/lib/services/croplivestock";

type HealthStatus = "excellent" | "good" | "fair" | "poor";
const STATUS_OPTIONS: HealthStatus[] = ["excellent", "good", "fair", "poor"];

const statusStyle = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "excellent":
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "fair":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "poor":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const titleCase = (s?: string) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—");
const fmtDate = (d?: string | Date) => (d ? new Date(d).toLocaleDateString() : "—");

// Pull an array out of either a bare array or a { data: [] } envelope.
function asArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const inner = (res as { data?: unknown })?.data;
  return Array.isArray(inner) ? (inner as T[]) : [];
}

function summarize(records: { healthStatus?: string }[]) {
  const norm = (r: { healthStatus?: string }) => (r.healthStatus || "").toLowerCase();
  return {
    total: records.length,
    healthy: records.filter((r) => ["excellent", "good"].includes(norm(r))).length,
    fair: records.filter((r) => norm(r) === "fair").length,
    poor: records.filter((r) => norm(r) === "poor").length,
  };
}

export default function HealthPage() {
  const { profile } = useProfile();
  const profileId = profile?.id;

  const [tab, setTab] = useState<"crops" | "livestock">("crops");
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [livestock, setLivestock] = useState<LivestockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [c, l] = await Promise.all([
        getCropRecords(profileId).catch(() => []),
        getLivestockRecords(profileId).catch(() => []),
      ]);
      setCrops(asArray<CropRecord>(c));
      setLivestock(asArray<LivestockRecord>(l));
    } catch (err) {
      console.error("[health] failed to load records:", err);
      setError("Could not load your crop and livestock records.");
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const cropSummary = useMemo(() => summarize(crops), [crops]);
  const livestockSummary = useMemo(() => summarize(livestock), [livestock]);

  // Update a crop's health status. The backend PUT validates the full record
  // and expects multipart, so we resend the existing fields + new status.
  const updateCropHealth = async (record: CropRecord, status: HealthStatus) => {
    const rid = record.id || record._id;
    setUpdatingId(rid);
    try {
      const fd = new FormData();
      fd.append("cropName", record.cropName || "");
      fd.append("variety", record.variety || "");
      fd.append("location", record.location || "");
      fd.append("plantingDate", record.plantingDate ? new Date(record.plantingDate).toISOString() : "");
      fd.append("expectedHarvestDate", record.expectedHarvestDate ? new Date(record.expectedHarvestDate).toISOString() : "");
      fd.append("currentGrowthStage", record.currentGrowthStage || "");
      fd.append("healthStatus", status);
      fd.append("area[value]", String(record.area?.value ?? 0));
      fd.append("area[unit]", record.area?.unit || "ac");
      fd.append("seedQuantity[value]", String(record.seedQuantity?.value ?? 0));
      fd.append("seedQuantity[unit]", record.seedQuantity?.unit || "kg");
      await apiClient.put(`/api/crop-record/${rid}`, fd);
      setCrops((prev) => prev.map((r) => ((r.id || r._id) === rid ? { ...r, healthStatus: status } : r)));
      toast.success("Crop health updated");
    } catch (err) {
      console.error("[health] crop update failed:", err);
      toast.error("Failed to update crop health");
    } finally {
      setUpdatingId(null);
    }
  };

  // Update a livestock group's health status and stamp the checkup date.
  const updateLivestockHealth = async (record: LivestockRecord, status: HealthStatus) => {
    const rid = record.id || record._id;
    setUpdatingId(rid);
    try {
      const fd = new FormData();
      fd.append("specie", record.specie || "");
      fd.append("breed", record.breed || "");
      fd.append("numberOfAnimal", String(record.numberOfAnimal ?? 0));
      fd.append("valuePerHead", String(record.valuePerHead ?? 0));
      fd.append("ageGroup", (record.ageGroup || "adult").toLowerCase());
      fd.append("acquisitionDate", record.acquisitionDate ? new Date(record.acquisitionDate).toISOString() : "");
      fd.append("healthStatus", status);
      fd.append("lastHealthCheckup", new Date().toISOString());
      await apiClient.put(`/api/livestock-record/${rid}`, fd);
      setLivestock((prev) =>
        prev.map((r) =>
          (r.id || r._id) === rid
            ? { ...r, healthStatus: status, lastHealthCheckup: new Date().toISOString() }
            : r
        )
      );
      toast.success("Livestock health updated");
    } catch (err) {
      console.error("[health] livestock update failed:", err);
      toast.error("Failed to update livestock health");
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = tab === "crops" ? cropSummary : livestockSummary;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader title="Crop & Livestock Health" subtitle="Track the health of everything you grow and raise — and log a checkup inline.">
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
          { id: "livestock" as const, label: "Livestock Health", icon: PawPrint },
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

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Activity className="w-5 h-5" />} label="Records" value={summary.total} />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Healthy" value={summary.healthy} tone="green" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Fair" value={summary.fair} tone="amber" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Poor" value={summary.poor} tone="rose" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-green-700 dark:text-green-500 gap-2 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading records...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{error}</p>
          <button onClick={load} className="text-xs font-semibold text-green-700 dark:text-green-500 hover:underline">Try again</button>
        </div>
      ) : tab === "crops" ? (
        <RecordTable head={["Crop", "Variety", "Growth Stage", "Health", "Update Health"]} empty={crops.length === 0} emptyText="No crop records yet. Add crops in Farm Operations to track their health here.">
          {crops.map((r) => {
            const rid = r.id || r._id;
            return (
              <tr key={rid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{titleCase(r.cropName)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.variety)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.currentGrowthStage)}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyle(r.healthStatus)}`}>
                    {r.healthStatus || "—"}
                  </span>
                </td>
                <td className="p-3.5">
                  <HealthSelect value={r.healthStatus} disabled={updatingId === rid} onChange={(s) => updateCropHealth(r, s)} />
                </td>
              </tr>
            );
          })}
        </RecordTable>
      ) : (
        <RecordTable head={["Species", "Breed", "Count", "Health", "Last Checkup", "Update Health"]} empty={livestock.length === 0} emptyText="No livestock records yet. Add livestock in Farm Operations to track their health here.">
          {livestock.map((r) => {
            const rid = r.id || r._id;
            return (
              <tr key={rid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{titleCase(r.specie)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.breed)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.numberOfAnimal ?? "—"}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyle(r.healthStatus)}`}>
                    {r.healthStatus || "—"}
                  </span>
                </td>
                <td className="p-3.5 text-gray-500">{fmtDate((r as LivestockRecord & { lastHealthCheckup?: string }).lastHealthCheckup)}</td>
                <td className="p-3.5">
                  <HealthSelect value={r.healthStatus} disabled={updatingId === rid} onChange={(s) => updateLivestockHealth(r, s)} />
                </td>
              </tr>
            );
          })}
        </RecordTable>
      )}
    </div>
  );
}

function HealthSelect({
  value,
  disabled,
  onChange,
}: {
  value?: string;
  disabled?: boolean;
  onChange: (s: HealthStatus) => void;
}) {
  return (
    <select
      value={(value || "good").toLowerCase()}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as HealthStatus)}
      className="text-xs border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] px-2 py-1 capitalize focus:outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-50">
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="capitalize">{s}</option>
      ))}
    </select>
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
                <td colSpan={head.length} className="text-center py-8 text-gray-400">{emptyText}</td>
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
