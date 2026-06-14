"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import {
  Map, Plus, Layers, Trash2, Edit3, Download, Upload,
  RefreshCw, ChevronDown, X, Check, Activity, Ruler,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

/* ── Dynamic import — Leaflet requires no SSR ── */
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#161b22]">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-gray-500 dark:text-[#8b949e] font-medium">Loading map…</p>
    </div>
  </div>
)});

/* ── API config ── */
const GEO_BASE = "https://finite-enmu.sa.pipeops.app/api/v1";

type Farm = {
  id: string;
  name: string;
  externalId?: string;
  boundary?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  totalArea?: number;
  areaUnit?: string;
  createdAt?: string;
};

type Section = {
  id: string;
  name: string;
  farmId: string;
  cropType?: string;
  boundary?: GeoJSON.Polygon;
  area?: number;
};

type Asset = {
  id: string;
  name: string;
  assetType: string;
  farmId: string;
  location?: GeoJSON.Point;
};

function geoHeaders(userId: string, tenantId: string) {
  return {
    "Content-Type": "application/json",
    "X-User-Id": userId,
    "X-Tenant-Id": tenantId,
  };
}

export default function MappingPage() {
  const { user } = useAuthStore();
  const userId   = user?._id ?? "guest";
  const tenantId = user?.farmId ?? "default";

  const [farms, setFarms]       = useState<Farm[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assets, setAssets]     = useState<Asset[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [loading, setLoading]   = useState(true);
  const [panel, setPanel]       = useState<"farms" | "sections" | "assets">("farms");

  /* modals */
  const [showNewFarm, setShowNewFarm]       = useState(false);
  const [showNewSection, setShowNewSection] = useState(false);
  const [showNewAsset, setShowNewAsset]     = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [toast, setToast]                   = useState<string | null>(null);

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ── Fetch farms ── */
  const fetchFarms = useCallback(async () => {
    try {
      const res = await fetch(`${GEO_BASE}/farms`, { headers: geoHeaders(userId, tenantId) });
      const json = await res.json();
      const list: Farm[] = Array.isArray(json) ? json : json.data ?? json.farms ?? [];
      setFarms(list);
      if (list.length > 0 && !activeFarm) setActiveFarm(list[0]);
    } catch { /* ignore */ }
  }, [userId, tenantId, activeFarm]);

  /* ── Fetch sections for active farm ── */
  const fetchSections = useCallback(async (farmId: string) => {
    try {
      const res = await fetch(`${GEO_BASE}/sections/farm/${farmId}`, { headers: geoHeaders(userId, tenantId) });
      const json = await res.json();
      setSections(Array.isArray(json) ? json : json.data ?? json.sections ?? []);
    } catch { /* ignore */ }
  }, [userId, tenantId]);

  /* ── Fetch assets for active farm ── */
  const fetchAssets = useCallback(async (farmId: string) => {
    try {
      const res = await fetch(`${GEO_BASE}/assets/farm/${farmId}`, { headers: geoHeaders(userId, tenantId) });
      const json = await res.json();
      setAssets(Array.isArray(json) ? json : json.data ?? json.assets ?? []);
    } catch { /* ignore */ }
  }, [userId, tenantId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchFarms();
      setLoading(false);
    };
    init();
  }, [fetchFarms]);

  useEffect(() => {
    if (activeFarm) {
      fetchSections(activeFarm.id);
      fetchAssets(activeFarm.id);
    }
  }, [activeFarm, fetchSections, fetchAssets]);

  /* ── Create farm ── */
  const [farmForm, setFarmForm] = useState({ name: "", externalId: "" });
  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${GEO_BASE}/farms`, {
        method: "POST",
        headers: geoHeaders(userId, tenantId),
        body: JSON.stringify({ name: farmForm.name, externalId: farmForm.externalId || undefined }),
      });
      if (res.ok) {
        notify("Farm registered ✓");
        setShowNewFarm(false);
        setFarmForm({ name: "", externalId: "" });
        await fetchFarms();
      }
    } finally { setSaving(false); }
  };

  /* ── Create section ── */
  const [sectionForm, setSectionForm] = useState({ name: "", cropType: "" });
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;
    setSaving(true);
    try {
      const res = await fetch(`${GEO_BASE}/sections`, {
        method: "POST",
        headers: geoHeaders(userId, tenantId),
        body: JSON.stringify({ name: sectionForm.name, cropType: sectionForm.cropType || undefined, farmId: activeFarm.id }),
      });
      if (res.ok) {
        notify("Section created ✓");
        setShowNewSection(false);
        setSectionForm({ name: "", cropType: "" });
        fetchSections(activeFarm.id);
      }
    } finally { setSaving(false); }
  };

  /* ── Create asset ── */
  const [assetForm, setAssetForm] = useState({ name: "", assetType: "equipment" });
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;
    setSaving(true);
    try {
      const res = await fetch(`${GEO_BASE}/assets`, {
        method: "POST",
        headers: geoHeaders(userId, tenantId),
        body: JSON.stringify({ name: assetForm.name, assetType: assetForm.assetType, farmId: activeFarm.id }),
      });
      if (res.ok) {
        notify("Asset registered ✓");
        setShowNewAsset(false);
        setAssetForm({ name: "", assetType: "equipment" });
        fetchAssets(activeFarm.id);
      }
    } finally { setSaving(false); }
  };

  /* ── Delete farm ── */
  const deleteFarm = async (id: string) => {
    await fetch(`${GEO_BASE}/farms/${id}`, { method: "DELETE", headers: geoHeaders(userId, tenantId) });
    notify("Farm deleted");
    if (activeFarm?.id === id) setActiveFarm(null);
    fetchFarms();
  };

  /* ── Delete section ── */
  const deleteSection = async (id: string) => {
    await fetch(`${GEO_BASE}/sections/${id}`, { method: "DELETE", headers: geoHeaders(userId, tenantId) });
    notify("Section deleted");
    if (activeFarm) fetchSections(activeFarm.id);
  };

  /* ── Export GeoJSON ── */
  const exportGeoJSON = async () => {
    if (!activeFarm) return;
    const res = await fetch(`${GEO_BASE}/import-export/farms/${activeFarm.id}/geojson`, { headers: geoHeaders(userId, tenantId) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${activeFarm.name}.geojson`; a.click();
    URL.revokeObjectURL(url);
    notify("GeoJSON exported ✓");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0d1117] overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[500] flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
          <Check className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">Farm Mapping</span>
          <span className="hidden sm:inline text-xs text-gray-400 dark:text-[#8b949e]">· Geospatial Intelligence · WGS84</span>
        </div>
        <div className="flex items-center gap-2">
          {activeFarm && (
            <button onClick={exportGeoJSON} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#21262d]">
              <Download className="w-3 h-3" /> GeoJSON
            </button>
          )}
          <button onClick={() => setShowNewFarm(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            <Plus className="w-3 h-3" /> New Farm
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] flex flex-col overflow-hidden">

          {/* Farm selector */}
          <div className="p-3 border-b border-gray-100 dark:border-[#30363d]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#484f58] mb-2">Active Farm</p>
            <div className="relative">
              <select
                value={activeFarm?.id ?? ""}
                onChange={(e) => setActiveFarm(farms.find(f => f.id === e.target.value) ?? null)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold border border-gray-200 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none"
              >
                <option value="">— Select farm —</option>
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Panel tabs */}
          <div className="flex border-b border-gray-100 dark:border-[#30363d]">
            {(["farms", "sections", "assets"] as const).map(t => (
              <button key={t} onClick={() => setPanel(t)}
                className={`flex-1 py-2 text-[10px] font-bold capitalize transition-colors ${panel === t ? "text-emerald-600 dark:text-[#4ade80] border-b-2 border-emerald-500" : "text-gray-400 dark:text-[#484f58]"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">

            {panel === "farms" && (
              <div>
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="m-3 h-10 bg-gray-100 dark:bg-[#21262d] rounded-lg animate-pulse" />)
                ) : farms.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Map className="w-8 h-8 text-gray-300 dark:text-[#30363d] mx-auto mb-2" />
                    <p className="text-xs text-gray-400 dark:text-[#484f58]">No farms yet. Register one.</p>
                  </div>
                ) : farms.map(farm => (
                  <div key={farm.id} onClick={() => setActiveFarm(farm)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-gray-50 dark:border-[#30363d]/40 transition-colors ${activeFarm?.id === farm.id ? "bg-emerald-50 dark:bg-[#0d2a1a] border-l-2 border-l-emerald-500" : "hover:bg-gray-50 dark:hover:bg-[#21262d]"}`}>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${activeFarm?.id === farm.id ? "text-emerald-700 dark:text-[#4ade80]" : "text-gray-700 dark:text-[#c9d1d9]"}`}>{farm.name}</p>
                      {farm.totalArea && <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{farm.totalArea.toFixed(2)} {farm.areaUnit ?? "ha"}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteFarm(farm.id); }} className="p-1 text-gray-300 dark:text-[#484f58] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setShowNewFarm(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:bg-emerald-50 dark:hover:bg-[#0d2a1a] transition-colors">
                  <Plus className="w-3 h-3" /> Register Farm
                </button>
              </div>
            )}

            {panel === "sections" && (
              <div>
                {!activeFarm ? (
                  <p className="text-xs text-center text-gray-400 dark:text-[#484f58] py-8 px-4">Select a farm first</p>
                ) : sections.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Layers className="w-8 h-8 text-gray-300 dark:text-[#30363d] mx-auto mb-2" />
                    <p className="text-xs text-gray-400 dark:text-[#484f58]">No sections. Add a plot.</p>
                  </div>
                ) : sections.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 dark:border-[#30363d]/40 hover:bg-gray-50 dark:hover:bg-[#21262d]">
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-[#c9d1d9]">{s.name}</p>
                      {s.cropType && <p className="text-[10px] text-gray-400 dark:text-[#484f58] capitalize">{s.cropType}</p>}
                    </div>
                    <button onClick={() => deleteSection(s.id)} className="p-1 text-gray-300 dark:text-[#484f58] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {activeFarm && (
                  <button onClick={() => setShowNewSection(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:bg-emerald-50 dark:hover:bg-[#0d2a1a] transition-colors">
                    <Plus className="w-3 h-3" /> Add Section
                  </button>
                )}
              </div>
            )}

            {panel === "assets" && (
              <div>
                {!activeFarm ? (
                  <p className="text-xs text-center text-gray-400 dark:text-[#484f58] py-8 px-4">Select a farm first</p>
                ) : assets.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Activity className="w-8 h-8 text-gray-300 dark:text-[#30363d] mx-auto mb-2" />
                    <p className="text-xs text-gray-400 dark:text-[#484f58]">No assets tracked.</p>
                  </div>
                ) : assets.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 dark:border-[#30363d]/40 hover:bg-gray-50 dark:hover:bg-[#21262d]">
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-[#c9d1d9]">{a.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58] capitalize">{a.assetType}</p>
                    </div>
                  </div>
                ))}
                {activeFarm && (
                  <button onClick={() => setShowNewAsset(true)} className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:bg-emerald-50 dark:hover:bg-[#0d2a1a] transition-colors">
                    <Plus className="w-3 h-3" /> Track Asset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats footer */}
          {activeFarm && (
            <div className="p-3 border-t border-gray-100 dark:border-[#30363d] grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-[#21262d] rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">{sections.length}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#484f58] font-bold uppercase">Sections</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#21262d] rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">{assets.length}</p>
                <p className="text-[10px] text-gray-400 dark:text-[#484f58] font-bold uppercase">Assets</p>
              </div>
            </div>
          )}
        </aside>

        {/* ── Map ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapView
            farm={activeFarm}
            sections={sections}
            assets={assets}
            onBoundaryUpdate={async (farmId, boundary) => {
              await fetch(`${GEO_BASE}/farms/${farmId}/boundary`, {
                method: "PATCH",
                headers: geoHeaders(userId, tenantId),
                body: JSON.stringify({ boundary }),
              });
              notify("Boundary saved ✓");
              fetchFarms();
            }}
          />
        </div>
      </div>

      {/* ── Modal: New Farm ── */}
      {showNewFarm && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-[#30363d] w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">Register Farm</h3>
              <button onClick={() => setShowNewFarm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateFarm} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">Farm Name *</label>
                <input required value={farmForm.name} onChange={e => setFarmForm(p => ({...p, name: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Ikeja Farm North" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">External ID (optional)</label>
                <input value={farmForm.externalId} onChange={e => setFarmForm(p => ({...p, externalId: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Link to your main system ID" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                {saving ? "Saving…" : "Register Farm"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: New Section ── */}
      {showNewSection && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-[#30363d] w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">Add Section / Plot</h3>
              <button onClick={() => setShowNewSection(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateSection} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">Section Name *</label>
                <input required value={sectionForm.name} onChange={e => setSectionForm(p => ({...p, name: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Plot A — Rice Field" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">Crop Type</label>
                <input value={sectionForm.cropType} onChange={e => setSectionForm(p => ({...p, cropType: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. rice, maize, cassava" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                {saving ? "Saving…" : "Add Section"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: New Asset ── */}
      {showNewAsset && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-[#30363d] w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-bold text-gray-900 dark:text-[#e6edf3] text-sm">Track Asset</h3>
              <button onClick={() => setShowNewAsset(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateAsset} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">Asset Name *</label>
                <input required value={assetForm.name} onChange={e => setAssetForm(p => ({...p, name: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Tractor #1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-[#8b949e] block mb-1">Asset Type</label>
                <select value={assetForm.assetType} onChange={e => setAssetForm(p => ({...p, assetType: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl dark:bg-[#0d1117] dark:text-[#e6edf3] focus:outline-none">
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="storage">Storage</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="sensor">Sensor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                {saving ? "Saving…" : "Track Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
