'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { getMarketDashboard, getMarketSummary } from '@/lib/services/pricingAPI';

const SENTIMENT_CONFIG = {
  bullish: { label: 'Bullish', color: 'text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border-emerald-100 dark:border-green-900', icon: '📈' },
  bearish: { label: 'Bearish', color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800', icon: '📉' },
  mixed:   { label: 'Mixed',   color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800', icon: '〰️' },
};

const MarketPrices = () => {
  const [crops, setCrops] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, summaryRes] = await Promise.all([
        getMarketDashboard(["rice", "maize", "yam", "cassava", "beans", "tomato"]),
        getMarketSummary(),
      ]);
      setCrops(dashRes?.data?.crops?.slice(0, 6) ?? []);
      setSentiment(summaryRes?.data?.sentiment ?? null);
      setLastUpdated(new Date());
    } catch {
      setError("Unable to load market prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sentimentCfg = sentiment ? SENTIMENT_CONFIG[sentiment] : null;

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>Market Prices</span>
            {sentimentCfg && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sentimentCfg.color}`}>
                {sentimentCfg.icon} {sentimentCfg.label}
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
      {loading ? (
        <div className="space-y-2.5 min-h-[180px]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="h-3.5 w-24 bg-gray-200 dark:bg-[#30363d] rounded" />
              <div className="h-3.5 w-16 bg-gray-200 dark:bg-[#30363d] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-sm text-gray-400 dark:text-[#8b949e]">
          <p>{error}</p>
          <button onClick={load} className="mt-2 text-emerald-600 dark:text-[#4ade80] font-semibold text-xs hover:underline">Retry</button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100 dark:divide-[#30363d]">
            {crops.map((item) => {
              const pct = item.changePercent ?? item.change ?? 0;
              const up = pct > 0;
              const down = pct < 0;
              return (
                <div key={item.crop} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold capitalize text-gray-800 dark:text-[#e6edf3]">{item.crop}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-600 dark:text-[#4ade80]' : down ? 'text-red-500' : 'text-gray-400'}`}>
                      {up ? <TrendingUp className="w-3 h-3" /> : down ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {Math.abs(pct).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#30363d] flex items-center justify-between">
            {lastUpdated && (
              <span className="text-[10px] text-gray-400 dark:text-[#8b949e]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Link href="/market-prices" className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:underline ml-auto">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
};

export default MarketPrices;
