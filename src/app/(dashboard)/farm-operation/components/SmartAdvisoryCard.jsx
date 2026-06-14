"use client";
import { useEffect, useState } from 'react';
import { BotMessageSquare, Lightbulb, ArrowRight, RefreshCw, Sprout, CloudSun, Microscope, HelpCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';

const STORAGE_KEY = 'smartAdvisoryHistory';

const QUICK_PROMPTS = [
  { label: 'Crop health', icon: Sprout,     color: 'text-emerald-600 bg-emerald-50 dark:bg-[#0d2a1a]' },
  { label: 'Weather tip', icon: CloudSun,   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Soil advice', icon: Microscope, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { label: 'Livestock',   icon: HelpCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
];

const SmartAdvisory = () => {
  const [lastAdvice, setLastAdvice]     = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [timestamp, setTimestamp]       = useState(null);

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const history = JSON.parse(raw);
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].type === 'bot') {
          setLastAdvice(history[i].text);
          setTimestamp(history[i].time ?? null);
          if (i > 0 && history[i - 1].type === 'user') setLastQuestion(history[i - 1].text);
          break;
        }
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadFromStorage();
    const onStorage = (e) => { if (e.key === STORAGE_KEY) loadFromStorage(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Strip markdown for plain preview
  const preview = lastAdvice
    ? lastAdvice.replace(/[#*`_>]/g, '').replace(/\n+/g, ' ').trim().slice(0, 220) +
      (lastAdvice.length > 220 ? '…' : '')
    : null;

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-blue-500" />
            <span>Smart Advisory</span>
          </div>
          {lastAdvice && (
            <button onClick={loadFromStorage} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      }
      className="h-full dark:bg-[#161b22] dark:border-[#30363d]"
      headerClassName="bg-blue-50 dark:bg-[#161b22] border-b border-blue-100 dark:border-[#30363d]"
      bodyClassName="p-4 flex flex-col"
    >
      <div className="flex flex-col flex-1 gap-3">

        {preview ? (
          /* Latest advice */
          <div className="flex-1 space-y-2.5">
            {lastQuestion && (
              <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider truncate">
                Re: {lastQuestion}
              </p>
            )}
            <div className="bg-blue-50 dark:bg-[#0d1b2a] rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <div className="flex gap-2">
                <BotMessageSquare className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-slate-700 dark:text-[#e6edf3] font-medium">
                  {preview}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state with category chips */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-2">
            <div className="p-2.5 bg-blue-50 dark:bg-[#0d1b2a] rounded-xl">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-[#8b949e] max-w-[180px]">
              AI-powered advice tailored to your farm — start a session to see tips here.
            </p>
            <div className="grid grid-cols-2 gap-1.5 w-full">
              {QUICK_PROMPTS.map(({ label, icon: Icon, color }) => (
                <Link
                  key={label}
                  href="/smart-advisory"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${color} transition-opacity hover:opacity-80`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <p className="text-[10px] text-gray-400 dark:text-[#8b949e]">Powered by Gemini AI</p>
          <Link
            href="/smart-advisory"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {preview ? 'Full session' : 'Get started'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SmartAdvisory;
