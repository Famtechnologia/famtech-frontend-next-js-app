"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Minus, RefreshCw,
  AlertTriangle, X, ChevronDown, BarChart2, Search,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  getMarketAlerts, getCropPriceHistory, getCropPrice,
  MarketAlert, PriceHistoryPoint,
} from "@/lib/services/pricingAPI";
import apiClient from "@/lib/api/apiClient";

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna",
  "Anambra", "Enugu", "Ogun", "Delta", "Imo", "Borno",
];

const SENTIMENT_CONFIG: Record<string, { label: string; icon: string; classes: string }> = {
  bullish: { label: "Bullish", icon: "📈", classes: "text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-200 dark:border-green-900" },
  bearish: { label: "Bearish", icon: "📉", classes: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  mixed:   { label: "Mixed",   icon: "〰️", classes: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
};

const CROP_ICONS: Record<string, string> = {
  rice: "🌾", maize: "🌽", yam: "🍠", cassava: "🥔", cocoa: "🍫",
  palm_oil: "🌴", plantain: "🍌", beans: "🫘", millet: "🌾", sorghum: "🌾",
  groundnut: "🥜", sweet_potato: "🍠", tomato: "🍅", pepper: "🌶️", onion: "🧅",
  okra: "🥬", garden_egg: "🍆", watermelon: "🍉", cucumber: "🥒", lettuce: "🥬",
  cabbage: "🥬", carrot: "🥕", ginger: "🫚", garlic: "🧄", cotton: "🌿",
};

interface CropEntry {
  name: string;
  price: number | null;
  change: number | null;
  unit: string;
  loading: boolean;
  error: boolean;
}

export default function MarketPricesPage() {
  const [allCrops, setAllCrops] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [cropData, setCropData] = useState<Record<string, CropEntry>>({});
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());
  const [region, setRegion] = useState("Lagos");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCropList = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/market/crops");
      const data = res.data?.data;
      const crops: string[] = Array.isArray(data?.crops) ? data.crops : [];
      const cats: Record<string, string[]> = data?.categories && typeof data.categories === "object" ? data.categories : {};
      setAllCrops(crops);
      setCategories(cats);
      // init crop entries
      setCropData((prev) => {
        const next = { ...prev };
        crops.forEach((c) => {
          if (!next[c]) next[c] = { name: c, price: null, change: null, unit: "per kg", loading: true, error: false };
        });
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/market/summary");
      setSummary(res.data?.data ?? null);
    } catch { /* ignore */ }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await getMarketAlerts();
      const raw = (res as any)?.data;
      setAlerts(Array.isArray(raw) ? raw : []);
    } catch { /* ignore */ }
  }, []);

  // Fetch prices for visible crops in batches
  const fetchPricesForCrops = useCallback(async (crops: string[], reg: string) => {
    await Promise.allSettled(
      crops.map(async (cropName) => {
        setCropData((prev) => ({
          ...prev,
          [cropName]: { ...(prev[cropName] ?? { name: cropName, unit: "per kg" }), loading: true, error: false },
        }));
        try {
          const res = await getCropPrice(cropName, reg.toLowerCase());
          const d = (res as any)?.data;
          setCropData((prev) => ({
            ...prev,
            [cropName]: {
              name: cropName,
              price: d?.price ?? d?.currentPrice ?? null,
              change: d?.changePercent ?? d?.change ?? null,
              unit: d?.unit ?? "per kg",
              loading: false,
              error: false,
            },
          }));
        } catch {
          setCropData((prev) => ({
            ...prev,
            [cropName]: { ...(prev[cropName] ?? { name: cropName, unit: "per kg" }), loading: false, error: true },
          }));
        }
      })
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCropList();
      setLoading(false);          // show grid immediately
      setLastUpdated(new Date());
      // summary & alerts load in background — they're slow (backend iterates all 25 crops)
      loadSummary();
      loadAlerts();
    };
    init();
  }, [loadCropList, loadSummary, loadAlerts]);

  // Fetch prices once crop list is loaded
  useEffect(() => {
    if (allCrops.length > 0) fetchPricesForCrops(allCrops, region);
  }, [allCrops, region, fetchPricesForCrops]);

  const handleRefresh = () => {
    loadSummary();
    loadAlerts();
    fetchPricesForCrops(allCrops, region);
    setLastUpdated(new Date());
  };

  const loadHistory = useCallback(async (cropName: string) => {
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await getCropPriceHistory(cropName, 30);
      setHistory((res as any)?.data?.history ?? []);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleCropClick = (cropName: string) => {
    const next = selectedCrop === cropName ? null : cropName;
    setSelectedCrop(next);
    if (next) loadHistory(next);
  };

  const visibleCropNames: string[] = (() => {
    let base = activeCategory === "all" ? allCrops : (categories[activeCategory] ?? []);
    if (search.trim()) base = base.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
    return base;
  })();

  const sentCfg = summary?.marketSentiment?.overall
    ? SENTIMENT_CONFIG[summary.marketSentiment.overall]
    : null;

  const totalTracked = summary?.totalCropsTracked ?? allCrops.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 py-6 dark:text-[#e6edf3]">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#0d2a1a] flex items-center justify-center">
                <BarChart2 className="w-4.5 h-4.5 text-emerald-600 dark:text-[#4ade80]" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">Market Live Prices</h1>
            </div>
            {lastUpdated && (
              <p className="text-xs text-gray-400 dark:text-[#8b949e] ml-11">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Nigeria
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-[#30363d] rounded-xl bg-white dark:bg-[#161b22] dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-[#30363d] rounded-xl bg-white dark:bg-[#161b22] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4">
            <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-1">Crops Tracked</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">{totalTracked}</p>
          </div>
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4">
            <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-1">Market Sentiment</p>
            {sentCfg ? (
              <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg border ${sentCfg.classes}`}>
                {sentCfg.icon} {sentCfg.label}
              </span>
            ) : (
              <p className="text-sm font-bold text-gray-500 dark:text-[#8b949e]">—</p>
            )}
          </div>
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4">
            <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-1">High Volatility</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary?.highVolatility?.count ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4">
            <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-1">Active Alerts</p>
            <p className="text-2xl font-bold text-red-500">{alerts.length}</p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.filter((_, i) => !dismissedAlerts.has(i)).length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, i) => dismissedAlerts.has(i) ? null : (
              <div key={i} className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                alert.alertType === "price_increase"
                  ? "bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-200 dark:border-green-900 text-emerald-800 dark:text-[#4ade80]"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{alert.message || `${alert.crop} price ${alert.alertType === "price_increase" ? "rose" : "dropped"} ${Math.abs(alert.changePercent ?? 0).toFixed(1)}%`}</span>
                </div>
                <button onClick={() => setDismissedAlerts((s) => new Set([...s, i]))} className="shrink-0 opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search + category tabs */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-[#8b949e] font-medium whitespace-nowrap">
              {visibleCropNames.length} crop{visibleCropNames.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-1.5">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
            >
              All ({allCrops.length})
            </button>
            {Object.entries(categories).map(([cat, crops]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors capitalize ${
                  activeCategory === cat ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
                }`}
              >
                {cat} ({crops.length})
              </button>
            ))}
          </div>
        </div>

        {/* Crop grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 dark:bg-[#30363d] rounded-xl mb-3" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-[#30363d] rounded mb-2" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-[#30363d] rounded" />
              </div>
            ))}
          </div>
        ) : visibleCropNames.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-[#8b949e]">No crops found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {visibleCropNames.map((cropName) => {
              const entry = cropData[cropName];
              const pct = entry?.change ?? 0;
              const up = pct > 0;
              const down = pct < 0;
              const isSelected = selectedCrop === cropName;
              const hasPrice = entry?.price != null && !entry?.error;

              return (
                <div key={cropName} className="flex flex-col">
                  <button
                    onClick={() => handleCropClick(cropName)}
                    className={`text-left bg-white dark:bg-[#161b22] rounded-2xl border transition-all duration-200 p-4 hover:shadow-md ${
                      isSelected
                        ? "border-emerald-400 dark:border-[#4ade80] ring-2 ring-emerald-100 dark:ring-[#0d2a1a]"
                        : "border-gray-100 dark:border-[#30363d]"
                    }`}
                  >
                    {/* Emoji + trend bar */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{CROP_ICONS[cropName] ?? "🌿"}</span>
                      {hasPrice && (
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          up ? "text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a]"
                             : down ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                             : "text-gray-500 bg-gray-100 dark:bg-[#21262d]"
                        }`}>
                          {up ? <TrendingUp className="w-2.5 h-2.5" /> : down ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                          {Math.abs(pct).toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] capitalize mb-0.5">{cropName.replace(/_/g, " ")}</p>

                    {entry?.loading ? (
                      <div className="h-5 w-20 bg-gray-100 dark:bg-[#30363d] rounded animate-pulse mt-1" />
                    ) : hasPrice ? (
                      <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
                        ₦{Number(entry.price).toLocaleString()}
                        <span className="text-[10px] font-normal text-gray-400 dark:text-[#8b949e] ml-1">/kg</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-1 italic">Updating…</p>
                    )}

                    <p className="text-[10px] text-emerald-600 dark:text-[#4ade80] font-semibold mt-2">
                      {isSelected ? "Hide chart ↑" : "View history ↓"}
                    </p>
                  </button>

                  {/* Inline history chart */}
                  {isSelected && (
                    <div className="bg-white dark:bg-[#161b22] border border-t-0 border-emerald-400 dark:border-[#4ade80] rounded-b-2xl px-4 pb-4 -mt-2 pt-4">
                      {historyLoading ? (
                        <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading…
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-xs text-center text-gray-400 dark:text-[#8b949e] py-6">No history available yet</p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] mb-2 uppercase tracking-wider">30-Day Price History</p>
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} interval="preserveStartEnd" />
                              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                              <Tooltip
                                formatter={(v: number | undefined) => [`₦${(v ?? 0).toLocaleString()}`, "Price"]}
                                labelFormatter={(l) => new Date(l).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                              />
                              <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
