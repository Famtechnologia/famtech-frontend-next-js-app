"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Minus, RefreshCw,
  AlertTriangle, X, ChevronDown, BarChart2,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  getMarketDashboard, getMarketSummary, getAvailableCrops,
  getMarketAlerts, getCropPriceHistory,
  CropPrice, MarketAlert, CropCategory, PriceHistoryPoint,
} from "@/lib/services/pricingAPI";

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna",
  "Anambra", "Enugu", "Ogun", "Delta", "Imo", "Borno",
];

const SENTIMENT_CONFIG: Record<string, { label: string; icon: string; classes: string }> = {
  bullish: { label: "Bullish Market", icon: "📈", classes: "text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-200 dark:border-green-900" },
  bearish: { label: "Bearish Market", icon: "📉", classes: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  mixed:   { label: "Mixed Market",   icon: "〰️", classes: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
};

export default function MarketPricesPage() {
  const [crops, setCrops] = useState<CropPrice[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<CropCategory[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());
  const [region, setRegion] = useState("Lagos");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, summaryRes, cropsRes, alertsRes] = await Promise.allSettled([
        getMarketDashboard(),
        getMarketSummary(),
        getAvailableCrops(),
        getMarketAlerts(),
      ]);
      if (dashRes.status === "fulfilled") setCrops(dashRes.value?.data?.crops ?? []);
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value?.data ?? null);
      if (cropsRes.status === "fulfilled") setCategories(cropsRes.value?.data ?? []);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value?.data ?? []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadHistory = useCallback(async (cropName: string) => {
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await getCropPriceHistory(cropName, 30);
      setHistory(res?.data?.history ?? []);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleCropClick = (cropName: string) => {
    const next = selectedCrop === cropName ? null : cropName;
    setSelectedCrop(next);
    if (next) loadHistory(next);
  };

  const visibleCrops = activeCategory === "all"
    ? crops
    : crops.filter((c) => {
        const cat = categories.find((cat) => cat.category === activeCategory);
        return cat?.crops.some((n) => n.toLowerCase() === c.crop.toLowerCase());
      });

  const sentCfg = summary ? SENTIMENT_CONFIG[summary.sentiment] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:text-[#e6edf3]">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-600 dark:text-[#4ade80]" />
            Market Live Prices
          </h1>
          {lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-[#8b949e] mt-0.5">
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Region selector */}
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
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-[#30363d] rounded-xl bg-white dark:bg-[#161b22] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {summary && (
        <div className="flex flex-wrap gap-3 mb-6">
          {sentCfg && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${sentCfg.classes}`}>
              {sentCfg.icon} {sentCfg.label}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-sm font-semibold text-gray-600 dark:text-[#8b949e]">
            {summary.totalCropsTracked} crops tracked
          </span>
          {summary.highVolatilityCrops?.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm font-bold text-amber-700 dark:text-amber-400">
              ⚡ {summary.highVolatilityCrops.length} high-volatility crop{summary.highVolatilityCrops.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Alerts strip */}
      {alerts.filter((_, i) => !dismissedAlerts.has(i)).length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, i) => dismissedAlerts.has(i) ? null : (
            <div
              key={i}
              className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                alert.alertType === "price_increase"
                  ? "bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-200 dark:border-green-900 text-emerald-800 dark:text-[#4ade80]"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{alert.message || `${alert.crop} price ${alert.alertType === "price_increase" ? "rose" : "dropped"} ${Math.abs(alert.changePercent).toFixed(1)}%`}</span>
              </div>
              <button onClick={() => setDismissedAlerts((s) => new Set([...s, i]))} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 mb-5 pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors capitalize shrink-0 ${
                activeCategory === cat.category
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>
      )}

      {/* Price grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-4 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-[#30363d] rounded" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-[#30363d] rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-[#30363d] rounded" />
            </div>
          ))}
        </div>
      ) : visibleCrops.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-[#8b949e]">
          No crops found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleCrops.map((item) => {
            const pct = item.changePercent ?? item.change ?? 0;
            const up = pct > 0;
            const down = pct < 0;
            const isSelected = selectedCrop === item.crop;
            return (
              <div key={item.crop} className="flex flex-col">
                <button
                  onClick={() => handleCropClick(item.crop)}
                  className={`text-left bg-white dark:bg-[#161b22] rounded-2xl border transition-all duration-200 p-4 shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-emerald-400 dark:border-[#4ade80] ring-2 ring-emerald-100 dark:ring-[#0d2a1a]"
                      : "border-gray-100 dark:border-[#30363d]"
                  }`}
                >
                  {/* Top bar */}
                  <div className={`h-1 rounded-full mb-3 ${up ? "bg-emerald-500" : down ? "bg-red-500" : "bg-gray-300"}`} />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-0.5">{item.unit ?? "per kg"}</p>
                      <h3 className="text-base font-bold capitalize text-gray-900 dark:text-[#e6edf3]">{item.crop}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      up ? "text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a]"
                         : down ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                         : "text-gray-500 bg-gray-100 dark:bg-[#21262d]"
                    }`}>
                      {up ? <TrendingUp className="w-3 h-3" /> : down ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {Math.abs(pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] mt-2">
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-[#8b949e]">
                    <span>{item.region ?? region}</span>
                    <span className="text-emerald-600 dark:text-[#4ade80] font-semibold">{isSelected ? "Hide chart ↑" : "View chart ↓"}</span>
                  </div>
                </button>

                {/* Inline history chart */}
                {isSelected && (
                  <div className="bg-white dark:bg-[#161b22] border border-t-0 border-emerald-400 dark:border-[#4ade80] rounded-b-2xl px-4 pb-4 -mt-2 pt-4">
                    {historyLoading ? (
                      <div className="h-32 flex items-center justify-center text-sm text-gray-400 dark:text-[#8b949e]">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading history…
                      </div>
                    ) : history.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 dark:text-[#8b949e] py-6">No history available</p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#8b949e] mb-2 uppercase tracking-wider">30-Day Price History</p>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#30363d]" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 9 }}
                              tickFormatter={(v) => new Date(v).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                              interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                            <Tooltip
                              formatter={(v: number) => [`₦${v.toLocaleString()}`, "Price"]}
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
  );
}
