"use client";
import { useEffect, useState, useRef } from 'react';
import { Lightbulb, ArrowRight, Send, BotMessageSquare, User2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { getAdvice } from '@/lib/services/advisory';
import { useProfile } from '@/lib/hooks/useProfile';
import { getCropRecords, getLivestockRecords } from '@/lib/services/croplivestock';

const STORAGE_KEY = 'smartAdvisoryHistory';

const SmartAdvisory = () => {
  const [lastAdvice, setLastAdvice]   = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [question, setQuestion]       = useState('');
  const [loading, setLoading]         = useState(false);
  const inputRef                      = useRef(null);

  const { profile, isHydrating } = useProfile();
  const [farmContext, setFarmContext] = useState(null);

  // Load farm context once
  useEffect(() => {
    if (isHydrating || !profile?.id) return;
    Promise.allSettled([
      getCropRecords(profile.id),
      getLivestockRecords(profile.id),
    ]).then(([cropsRes, lsRes]) => {
      setFarmContext({
        crops: (cropsRes.value || []).map(r => ({ name: r.cropName, stage: r.currentGrowthStage, health: r.healthStatus })),
        livestock: (lsRes.value || []).map(r => ({ name: r.specie, stage: r.currentGrowthStage, health: r.healthStatus })),
      });
    });
  }, [profile?.id, isHydrating]);

  // Read latest advice from shared localStorage
  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const history = JSON.parse(raw);
      // Walk from end: find last bot message and the user message before it
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].type === 'bot') {
          setLastAdvice(history[i].text);
          if (i > 0 && history[i - 1].type === 'user') setLastQuestion(history[i - 1].text);
          break;
        }
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadFromStorage();
    // Re-sync whenever localStorage changes from the main advisory page
    const onStorage = (e) => { if (e.key === STORAGE_KEY) loadFromStorage(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setQuestion('');
    setLoading(true);
    setLastQuestion(q);
    setLastAdvice(null);
    try {
      const result = await getAdvice(q, farmContext || { note: 'General farm advice' });
      const advice = result.advice;
      setLastAdvice(advice);
      // Persist into shared history so main page sees it too
      const raw = localStorage.getItem(STORAGE_KEY);
      const history = raw ? JSON.parse(raw) : [];
      history.push({ type: 'user', text: q });
      history.push({ type: 'bot', text: advice });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      setLastAdvice('Advisory service is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Truncate advice for card display
  const preview = lastAdvice
    ? lastAdvice.replace(/[#*`_]/g, '').replace(/\n+/g, ' ').trim().slice(0, 200) + (lastAdvice.length > 200 ? '…' : '')
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
            <button onClick={loadFromStorage} className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      }
      className="h-fit dark:bg-[#161b22] dark:border-[#30363d]"
      headerClassName="bg-blue-50 dark:bg-[#161b22] border-b border-blue-100 dark:border-[#30363d]"
      bodyClassName="p-4"
    >
      <div className="flex flex-col gap-3 min-h-[180px]">

        {/* Latest advice from main page */}
        {preview ? (
          <div className="flex-1 space-y-2">
            {lastQuestion && (
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-slate-100 dark:bg-[#21262d] rounded-lg shrink-0 mt-0.5">
                  <User2 className="w-3 h-3 text-slate-500 dark:text-[#8b949e]" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8b949e] italic truncate">{lastQuestion}</p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-[#0d1b2a] rounded-lg shrink-0 mt-0.5">
                <BotMessageSquare className="w-3 h-3 text-blue-500" />
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-[#e6edf3] font-medium">{preview}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-[#8b949e] py-2">
            <Lightbulb className="w-7 h-7 text-blue-400 mb-2" />
            <p className="text-xs font-medium max-w-[200px]">
              Ask a question below or visit Smart Advisory for a full session.
            </p>
          </div>
        )}

        {/* Quick ask input */}
        <form onSubmit={handleAsk} className="flex items-center gap-2 border border-slate-200 dark:border-[#30363d] rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#0d1117] focus-within:border-blue-400 transition-colors">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a quick question…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 text-xs bg-transparent text-slate-700 dark:text-[#e6edf3] placeholder-slate-400 dark:placeholder-[#8b949e] focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            {loading
              ? <RefreshCw className="w-3 h-3 animate-spin" />
              : <Send className="w-3 h-3" />
            }
          </button>
        </form>

        {/* Footer link */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#30363d]">
          <p className="text-[10px] text-slate-400 dark:text-[#8b949e]">Powered by Gemini AI</p>
          <Link href="/smart-advisory" className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Full session <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SmartAdvisory;
