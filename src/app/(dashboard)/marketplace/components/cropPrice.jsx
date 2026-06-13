'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { getMarketSummary, getCropPrice } from '@/lib/services/pricingAPI';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const SENTIMENT_CONFIG = {
  bullish: { label: 'Bullish Market',  icon: '📈', badge: 'text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-100 dark:border-green-900' },
  bearish: { label: 'Bearish Market',  icon: '📉', badge: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  mixed:   { label: 'Mixed Sentiment', icon: '〰️', badge: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
};

const TOP_CROPS = ['rice', 'maize', 'yam', 'cassava', 'beans', 'tomato'];

const MarketTrends = () => {
  const [summary, setSummary] = useState(null);
  const [cropPrices, setCropPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMarketSummary();
      setSummary(res?.data ?? null);
      setLastUpdated(new Date());
    } catch { /* show stale */ } finally {
      setLoading(false);
    }
    // Load top crop prices in background for bar chart
    const results = await Promise.allSettled(
      TOP_CROPS.map(crop => getCropPrice(crop, 'lagos'))
    );
    const prices = results
      .map((r, i) => ({
        name: TOP_CROPS[i].charAt(0).toUpperCase() + TOP_CROPS[i].slice(1),
        price: r.status === 'fulfilled' ? (r.value?.data?.adjustedPrice ?? r.value?.data?.price ?? null) : null,
        trend: r.status === 'fulfilled' ? (r.value?.data?.marketTrend ?? 'stable') : 'stable',
      }))
      .filter(p => p.price != null);
    setCropPrices(prices);
  };

  useEffect(() => { load(); }, []);

  const overall = summary?.marketSentiment?.overall ?? summary?.sentiment ?? null;
  const cfg = overall ? SENTIMENT_CONFIG[overall] : null;

  const bullish = summary?.marketSentiment?.bullish ?? 0;
  const bearish = summary?.marketSentiment?.bearish ?? 0;
  const stable  = summary?.marketSentiment?.stable  ?? 0;
  const total   = bullish + bearish + stable || 1;

  const donutData = [
    { name: 'Bullish', value: bullish, color: '#10b981' },
    { name: 'Stable',  value: stable,  color: '#6b7280' },
    { name: 'Bearish', value: bearish, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const avgPrice       = summary?.averagePrice ?? null;
  const highVolatility = summary?.highVolatility?.count ?? 0;
  const totalTracked   = summary?.totalCropsTracked ?? 0;

  const barColor = (trend) =>
    trend === 'bullish' ? '#10b981' : trend === 'bearish' ? '#ef4444' : '#6b7280';

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>Market Trends</span>
            {cfg && !loading && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                {cfg.icon} {cfg.label}
              </span>
            )}
          </div>
          <button onClick={load} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3] transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
      className="h-fit dark:bg-[#161b22] dark:border-[#30363d]"
      headerClassName="dark:bg-[#161b22] dark:border-[#30363d]"
      bodyClassName="p-4"
    >
      {loading && !summary ? (
        <div className="space-y-3 min-h-[220px] animate-pulse">
          <div className="h-4 w-32 bg-gray-200 dark:bg-[#30363d] rounded" />
          <div className="h-32 bg-gray-100 dark:bg-[#21262d] rounded-xl" />
          <div className="h-24 bg-gray-100 dark:bg-[#21262d] rounded-xl" />
        </div>
      ) : (
        <>
          {/* Donut + stats row */}
          <div className="flex items-center gap-4 mb-4">
            {donutData.length > 0 ? (
              <div className="shrink-0">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={42}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip
                      formatter={(v, name) => [`${v} crops`, name]}
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-[90px] h-[90px] shrink-0 rounded-full bg-gray-100 dark:bg-[#21262d] animate-pulse" />
            )}

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-[#4ade80]">
                  <TrendingUp className="w-3 h-3" /> {bullish} Rising
                </span>
                <span className="flex items-center gap-1 font-semibold text-gray-500">
                  <Minus className="w-3 h-3" /> {stable} Stable
                </span>
                <span className="flex items-center gap-1 font-semibold text-red-500">
                  <TrendingDown className="w-3 h-3" /> {bearish} Falling
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {bullish > 0 && <div className="bg-emerald-500 rounded-l-full" style={{ width: `${(bullish/total)*100}%` }} />}
                {stable  > 0 && <div className="bg-gray-300 dark:bg-[#30363d]" style={{ width: `${(stable/total)*100}%` }} />}
                {bearish > 0 && <div className="bg-red-500 rounded-r-full"    style={{ width: `${(bearish/total)*100}%` }} />}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#8b949e] uppercase font-bold tracking-wide">Avg Price</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-[#e6edf3]">
                    {avgPrice ? `₦${Number(avgPrice).toLocaleString()}` : '—'}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">{totalTracked} crops</p>
              </div>
            </div>
          </div>

          {/* Bar chart — top crop live prices */}
          {cropPrices.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider mb-2">
                Live Prices (₦/kg)
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={cropPrices} margin={{ top: 0, right: 0, left: -22, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <ReTooltip
                    formatter={v => [`₦${Number(v).toLocaleString()}`, 'Price']}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                    {cropPrices.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.trend)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Rising</span>
                <span className="flex items-center gap-1 text-[9px] text-gray-400 font-semibold"><span className="w-2 h-2 rounded-sm bg-gray-400 inline-block" /> Stable</span>
                <span className="flex items-center gap-1 text-[9px] text-red-500 font-semibold"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Falling</span>
              </div>
            </div>
          )}

          {/* Alerts + footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#30363d]">
            <div className="flex items-center gap-2">
              {highVolatility > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg">
                  <AlertTriangle className="w-3 h-3" /> {highVolatility} volatile
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] text-gray-400 dark:text-[#8b949e]">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <Link href="/market-prices" className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default MarketTrends;
