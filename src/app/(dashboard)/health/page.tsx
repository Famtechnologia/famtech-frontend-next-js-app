"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Leaf, PawPrint, Bug, Activity, ShieldCheck, AlertTriangle, RefreshCw, Plus, X } from "lucide-react";
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

const CROP_TYPES = ["maize", "rice", "cassava", "yam", "cowpea", "soybean", "millet", "sorghum", "plantain", "cocoa", "oil_palm", "groundnut", "sweet_potato", "beans", "tomato", "pepper"];
const DISEASE_TYPES = ["leaf_spot", "rust", "blight", "wilt", "mosaic_virus", "root_rot", "powdery_mildew", "anthracnose", "bacterial_spot", "stem_borer", "aphid_infestation", "termite_damage", "nematode_damage", "fungal_infection", "viral_infection", "nutrient_deficiency", "drought_stress", "pest_damage", "other"];
const SEVERITIES = ["low", "medium", "high", "critical"];

interface DiseaseRecord {
  _id?: string;
  id?: string;
  cropRecordId?: string;
  cropType?: string;
  diseaseName?: string;
  diseaseType?: string;
  severity?: string;
  status?: string;
  affectedArea?: number;
  isResolved?: boolean;
  createdAt?: string;
}

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

const titleCase = (s?: string) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—");
const fmtDate = (d?: string | Date) => (d ? new Date(d).toLocaleDateString() : "—");

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

const EMPTY_DISEASE_FORM = { cropType: "maize", diseaseName: "", diseaseType: "leaf_spot", severity: "medium", affectedArea: "", symptoms: "" };

export default function HealthPage() {
  const { profile } = useProfile();
  const profileId = profile?.id;

  const [tab, setTab] = useState<"crops" | "livestock" | "diseases">("crops");
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [livestock, setLivestock] = useState<LivestockRecord[]>([]);
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Log-disease modal
  const [logCrop, setLogCrop] = useState<CropRecord | null>(null);
  const [diseaseForm, setDiseaseForm] = useState(EMPTY_DISEASE_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [c, l, d] = await Promise.all([
        getCropRecords(profileId).catch(() => []),
        getLivestockRecords(profileId).catch(() => []),
        apiClient.get("/api/health/diseases").then((r) => r?.data?.data ?? []).catch(() => []),
      ]);
      setCrops(asArray<CropRecord>(c));
      setLivestock(asArray<LivestockRecord>(l));
      setDiseases(asArray<DiseaseRecord>(d));
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
  const cropNameById = useMemo(() => {
    const m = new Map<string, string>();
    crops.forEach((c) => m.set(c.id || c._id, c.cropName));
    return m;
  }, [crops]);

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

  const openLogDisease = (crop: CropRecord) => {
    const mapped = CROP_TYPES.includes((crop.cropName || "").toLowerCase()) ? (crop.cropName || "").toLowerCase() : "maize";
    setDiseaseForm({ ...EMPTY_DISEASE_FORM, cropType: mapped });
    setLogCrop(crop);
  };

  const submitDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logCrop || !profileId) return;
    const symptoms = diseaseForm.symptoms.split(",").map((s) => s.trim()).filter(Boolean);
    if (!diseaseForm.diseaseName.trim()) return toast.error("Disease name is required");
    if (symptoms.length === 0) return toast.error("Add at least one symptom");
    const area = parseFloat(diseaseForm.affectedArea);
    if (isNaN(area) || area < 0) return toast.error("Enter a valid affected area");

    // Coordinates come from the farm profile; fall back to [0,0] if unset.
    const coords = (profile?.location as { coordinates?: { lat?: string | number; lng?: string | number; lon?: string | number } } | undefined)?.coordinates;
    const lng = Number(coords?.lng ?? coords?.lon ?? 0) || 0;
    const lat = Number(coords?.lat ?? 0) || 0;

    setIsSaving(true);
    try {
      await apiClient.post("/api/health/diseases", {
        cropRecordId: logCrop.id || logCrop._id,
        cropType: diseaseForm.cropType,
        diseaseType: diseaseForm.diseaseType,
        diseaseName: diseaseForm.diseaseName.trim(),
        severity: diseaseForm.severity,
        affectedArea: area,
        symptoms,
        detectionMethod: "farmer_report",
        farmId: profileId,
        location: { type: "Point", coordinates: [lng, lat] },
      });
      toast.success("Disease logged");
      setLogCrop(null);
      setTab("diseases");
      load();
    } catch (err) {
      console.error("[health] log disease failed:", err);
      toast.error("Failed to log disease");
    } finally {
      setIsSaving(false);
    }
  };

  const summary = tab === "livestock" ? livestockSummary : cropSummary;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader title="Crop & Livestock Health" subtitle="Track the health of everything you grow and raise — and log checkups & diseases inline.">
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#30363d] overflow-x-auto">
        {[
          { id: "crops" as const, label: "Crop Health", icon: Leaf },
          { id: "livestock" as const, label: "Livestock Health", icon: PawPrint },
          { id: "diseases" as const, label: "Diseases", icon: Bug },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? "border-green-700 text-green-700 dark:border-green-500 dark:text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.id === "diseases" && diseases.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">{diseases.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Summary (crop/livestock tabs only) */}
      {tab !== "diseases" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Activity className="w-5 h-5" />} label="Records" value={summary.total} />
          <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Healthy" value={summary.healthy} tone="green" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Fair" value={summary.fair} tone="amber" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Poor" value={summary.poor} tone="rose" />
        </div>
      )}

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
        <RecordTable head={["Crop", "Variety", "Growth Stage", "Health", "Update Health", "Disease"]} empty={crops.length === 0} emptyText="No crop records yet. Add crops in Farm Operations to track their health here.">
          {crops.map((r) => {
            const rid = r.id || r._id;
            return (
              <tr key={rid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{titleCase(r.cropName)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.variety)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.currentGrowthStage)}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyle(r.healthStatus)}`}>{r.healthStatus || "—"}</span>
                </td>
                <td className="p-3.5">
                  <HealthSelect value={r.healthStatus} disabled={updatingId === rid} onChange={(s) => updateCropHealth(r, s)} />
                </td>
                <td className="p-3.5">
                  <button
                    onClick={() => openLogDisease(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
                    <Plus className="w-3 h-3" /> Disease
                  </button>
                </td>
              </tr>
            );
          })}
        </RecordTable>
      ) : tab === "livestock" ? (
        <RecordTable head={["Species", "Breed", "Count", "Health", "Last Checkup", "Update Health"]} empty={livestock.length === 0} emptyText="No livestock records yet. Add livestock in Farm Operations to track their health here.">
          {livestock.map((r) => {
            const rid = r.id || r._id;
            return (
              <tr key={rid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{titleCase(r.specie)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.breed)}</td>
                <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.numberOfAnimal ?? "—"}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyle(r.healthStatus)}`}>{r.healthStatus || "—"}</span>
                </td>
                <td className="p-3.5 text-gray-500">{fmtDate((r as LivestockRecord & { lastHealthCheckup?: string }).lastHealthCheckup)}</td>
                <td className="p-3.5">
                  <HealthSelect value={r.healthStatus} disabled={updatingId === rid} onChange={(s) => updateLivestockHealth(r, s)} />
                </td>
              </tr>
            );
          })}
        </RecordTable>
      ) : (
        <RecordTable head={["Disease", "On Crop", "Type", "Severity", "Status", "Affected", "Reported"]} empty={diseases.length === 0} emptyText="No diseases logged. Use the 'Disease' button on a crop to record one.">
          {diseases.map((r) => (
            <tr key={r._id || r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{r.diseaseName || "—"}</td>
              <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.cropRecordId ? titleCase(cropNameById.get(r.cropRecordId) || r.cropType) : titleCase(r.cropType)}</td>
              <td className="p-3.5 text-gray-700 dark:text-gray-300">{titleCase(r.diseaseType)}</td>
              <td className="p-3.5">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityStyle(r.severity)}`}>{r.severity || "—"}</span>
              </td>
              <td className="p-3.5 text-gray-700 dark:text-gray-300 capitalize">{r.status || "active"}</td>
              <td className="p-3.5 text-gray-700 dark:text-gray-300">{r.affectedArea != null ? r.affectedArea : "—"}</td>
              <td className="p-3.5 text-gray-500">{fmtDate(r.createdAt)}</td>
            </tr>
          ))}
        </RecordTable>
      )}

      {/* Log Disease modal */}
      {logCrop && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Bug className="w-4 h-4" /></span>
                Log Disease — {titleCase(logCrop.cropName)}
              </h3>
              <button onClick={() => setLogCrop(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={submitDisease} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <Field label="Disease name *">
                <input value={diseaseForm.diseaseName} onChange={(e) => setDiseaseForm({ ...diseaseForm, diseaseName: e.target.value })} placeholder="e.g. Maize Leaf Blight" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Crop type *">
                  <select value={diseaseForm.cropType} onChange={(e) => setDiseaseForm({ ...diseaseForm, cropType: e.target.value })} className={inputCls}>
                    {CROP_TYPES.map((c) => <option key={c} value={c} className="capitalize">{titleCase(c)}</option>)}
                  </select>
                </Field>
                <Field label="Disease type *">
                  <select value={diseaseForm.diseaseType} onChange={(e) => setDiseaseForm({ ...diseaseForm, diseaseType: e.target.value })} className={inputCls}>
                    {DISEASE_TYPES.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Severity *">
                  <select value={diseaseForm.severity} onChange={(e) => setDiseaseForm({ ...diseaseForm, severity: e.target.value })} className={inputCls}>
                    {SEVERITIES.map((s) => <option key={s} value={s} className="capitalize">{titleCase(s)}</option>)}
                  </select>
                </Field>
                <Field label="Affected area (ha) *">
                  <input type="number" min="0" step="0.1" value={diseaseForm.affectedArea} onChange={(e) => setDiseaseForm({ ...diseaseForm, affectedArea: e.target.value })} placeholder="e.g. 0.5" className={inputCls} />
                </Field>
              </div>
              <Field label="Symptoms * (comma-separated)">
                <input value={diseaseForm.symptoms} onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} placeholder="e.g. yellow spots, wilting leaves" className={inputCls} />
              </Field>
              <button type="submit" disabled={isSaving} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                {isSaving ? "Saving..." : "Log Disease"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-600";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function HealthSelect({ value, disabled, onChange }: { value?: string; disabled?: boolean; onChange: (s: HealthStatus) => void }) {
  return (
    <select
      value={(value || "good").toLowerCase()}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as HealthStatus)}
      className="text-xs border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] px-2 py-1 capitalize focus:outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-50">
      {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
    </select>
  );
}

function StatCard({ icon, label, value, tone = "gray" }: { icon: React.ReactNode; label: string; value: number; tone?: "gray" | "green" | "amber" | "rose" }) {
  const toneClass =
    tone === "green" ? "text-green-700 dark:text-green-400" : tone === "amber" ? "text-amber-600 dark:text-amber-400" : tone === "rose" ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300";
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

function RecordTable({ head, empty, emptyText, children }: { head: string[]; empty: boolean; emptyText: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-[#0d1117] text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-[#30363d] uppercase tracking-wider">
            <tr>{head.map((h) => <th key={h} className="p-3.5">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
            {empty ? (
              <tr><td colSpan={head.length} className="text-center py-8 text-gray-400">{emptyText}</td></tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
