'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import apiClient from '@/lib/api/apiClient';

interface Alert {
  _id: string;
  cropType: string;
  message: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'acknowledged';
  channel: string;
}

const STATUS_CONFIG = {
  pending:      { icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-100 dark:border-amber-800' },
  sent:         { icon: AlertTriangle, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-100 dark:border-blue-800' },
  acknowledged: { icon: CheckCircle,   color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-[#0d2a1a]',   border: 'border-emerald-100 dark:border-green-900' },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Alerts = () => {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/alerts');
      const data: Alert[] = res.data?.alerts ?? [];
      // Show latest 4, unacknowledged first
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'acknowledged' && b.status !== 'acknowledged') return 1;
        if (b.status === 'acknowledged' && a.status !== 'acknowledged') return -1;
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      });
      setAlerts(sorted.slice(0, 4));
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const acknowledge = async (id: string) => {
    try {
      await apiClient.patch(`/api/alerts/${id}`, { status: 'acknowledged' });
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: 'acknowledged' } : a));
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const unread = alerts.filter(a => a.status !== 'acknowledged').length;

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Alerts</span>
            {unread > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{unread}</span>
            )}
          </div>
          <button onClick={load} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
      className="h-fit dark:bg-[#161b22] dark:border-[#30363d]"
      headerClassName="bg-amber-50 dark:bg-[#161b22] border-b border-amber-100 dark:border-[#30363d]"
      bodyClassName="p-4"
    >
      <div className="flex flex-col min-h-[180px]">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-[#21262d] rounded-xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-500 dark:text-[#8b949e] py-6">
            <Bell className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm font-medium">No alerts yet.</p>
            <p className="text-xs mt-1">You'll be notified about crop and weather events here.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {alerts.map(alert => {
              const cfg = STATUS_CONFIG[alert.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={alert._id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} transition-opacity ${alert.status === 'acknowledged' ? 'opacity-50' : ''}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-[#e6edf3] capitalize">{alert.cropType}</p>
                    <p className="text-xs text-gray-600 dark:text-[#8b949e] leading-snug mt-0.5 line-clamp-2">{alert.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e] mt-1">{timeAgo(alert.scheduledAt)}</p>
                  </div>
                  {alert.status !== 'acknowledged' && (
                    <button
                      onClick={() => acknowledge(alert._id)}
                      className="shrink-0 text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors whitespace-nowrap"
                    >
                      ✓ Done
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 mt-2 border-t border-gray-100 dark:border-[#30363d] flex items-center justify-between">
          <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">
            {unread > 0 ? `${unread} unacknowledged` : 'All caught up'}
          </p>
          <Link href="/settings" className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default Alerts;
