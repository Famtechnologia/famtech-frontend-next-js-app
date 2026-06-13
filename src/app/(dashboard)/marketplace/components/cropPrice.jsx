'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { getMarketSummary } from '@/lib/services/pricingAPI';

const OVERALL_CONFIG = {
  bullish: { label: 'Bullish Market',  icon: '📈', bar: 'bg-emerald-500', badge: 'text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-100 dark:border-green-900' },
  bearish: { label: 'Bearish Market',  icon: '📉', bar: 'bg-red-500',     badge: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  mixed:   { label: 'Mixed Sentiment', icon: '〰️', bar: 'bg-amber-500',   badge: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
};

const MarketTrends = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMarketSummary();
      setSummary(res?.data ?? null);
      setLastUpdated(new Date());
    } catch {
      /* show stale data if any */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const overall = summary?.marketSentiment?.overall ?? summary?.sentiment ?? null;
  const cfg = overall ? OVERALL_CONFIG[overall] : null;

  const bullish = summary?.marketSentiment?.bullish ?? 0;
  const bearish = summary?.marketSentiment?.bearish ?? 0;
  const stable  = summary?.marketSentiment?.stable  ?? 0;
  const total   = bullish + bearish + stable || 1;

  const bullPct = Math.round((bullish / total) * 100);
  const bearPct = Math.round((bearish / total) * 100);
  const stabPct = 100 - bullPct - bearPct;

  const avgPrice       = summary?.averagePrice ?? null;
  const highVolatility = summary?.highVolatility?.count ?? summary?.highVolatilityCrops?.length ?? 0;
  const totalTracked   = summary?.totalCropsTracked ?? 0;

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
        <div className="space-y-3 min-h-[160px] animate-pulse">
          <div className="h-4 w-32 bg-gray-200 dark:bg-[#30363d] rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-[#30363d] rounded-full" />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-200 dark:bg-[#30363d] rounded-xl" />)}
          </div>
        </div>
      ) : (
        <>
          {/* Sentiment breakdown bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-[#8b949e] mb-1.5 uppercase tracking-wider">
              <span>Sentiment Breakdown</span>
              <span>{totalTracked} crops</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
              {bullPct > 0 && <div className="bg-emerald-500 rounded-l-full" style={{ width: `${bullPct}%` }} title={`Bullish ${bullPct}%`} />}
              {stabPct > 0 && <div className="bg-gray-300 dark:bg-[#30363d]" style={{ width: `${stabPct}%` }} title={`Stable ${stabPct}%`} />}
              {bearPct > 0 && <div className="bg-red-500 rounded-r-full" style={{ width: `${bearPct}%` }} title={`Bearish ${bearPct}%`} />}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-[#8b949e] mt-1">
              <span className="text-emerald-600 dark:text-[#4ade80] font-semibold">▲ {bullPct}% bullish</span>
              <span className="font-semibold">{stabPct}% stable</span>
              <span className="text-red-500 font-semibold">▼ {bearPct}% bearish</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-emerald-50 dark:bg-[#0d2a1a] rounded-xl p-2.5 text-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80] mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-700 dark:text-[#4ade80]">{bullish}</p>
              <p className="text-[9px] font-bold uppercase text-emerald-600 dark:text-[#4ade80] opacity-80">Rising</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#21262d] rounded-xl p-2.5 text-center">
              <Minus className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-700 dark:text-[#e6edf3]">{stable}</p>
              <p className="text-[9px] font-bold uppercase text-gray-400 dark:text-[#8b949e]">Stable</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center">
              <TrendingDown className="w-3.5 h-3.5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-600">{bearish}</p>
              <p className="text-[9px] font-bold uppercase text-red-400">Falling</p>
            </div>
          </div>

          {/* Extra stats row */}
          <div className="flex items-center justify-between py-2.5 border-t border-gray-100 dark:border-[#30363d]">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-[#8b949e] font-bold uppercase tracking-wider">Avg. Price</p>
              <p className="text-sm font-bold text-gray-800 dark:text-[#e6edf3]">
                {avgPrice != null ? `₦${Number(avgPrice).toLocaleString()}` : '—'}
              </p>
            </div>
            {highVolatility > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                {highVolatility} high volatility
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between">
            {lastUpdated && (
              <span className="text-[10px] text-gray-400 dark:text-[#8b949e]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Link href="/market-prices" className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:underline ml-auto">
              View Live Prices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default MarketTrends;
