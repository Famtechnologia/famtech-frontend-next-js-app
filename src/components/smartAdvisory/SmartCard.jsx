"use client";
import React, { useState, useEffect } from "react";
import { getAdvice } from "@/lib/services/advisory";
import { MoveRight, Lightbulb, Sprout, PawPrint } from "lucide-react";
import Link from "next/link";

const TIP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Read a cached tip, returning null if missing or expired */
const getCachedTip = (key) => {
  try {
    const raw = localStorage.getItem(`tip_${key}`);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > TIP_TTL_MS) {
      localStorage.removeItem(`tip_${key}`);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

const setCachedTip = (key, value) => {
  try {
    localStorage.setItem(`tip_${key}`, JSON.stringify({ value, ts: Date.now() }));
  } catch { /* storage quota */ }
};

export const SmartCard = ({ location, type, name, tip, record }) => {
  // Seed state directly from localStorage — renders instantly without an API call
  const [advice, setAdvice] = useState(() => getCachedTip(`${name}_${type}`) ?? "");

  const isCrop = type === "crop";

  useEffect(() => {
    // Cache hit → nothing to fetch
    if (advice) return;

    const generateAdvice = async () => {
      const question =
        "I need a 4 word tip, Note go straight to the point for the tip don't add any unnecessary text, just give me the 4 word tip, no more, no less. Note only the tip.";
      try {
        const res = await getAdvice(question, tip);
        const text = res?.advice;
        if (text) {
          setAdvice(text);
          setCachedTip(`${name}_${type}`, text);
        }
      } catch (err) {
        console.error("[SmartCard] tip fetch failed:", err);
      }
    };

    generateAdvice();
  }, [tip, name, type, advice]);

  return (
    <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/60 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-between">
      <div>
        {/* Header Block */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg capitalize tracking-tight truncate flex items-center gap-1.5">
            {isCrop ? (
              <Sprout className="h-4 w-5 text-emerald-600 shrink-0" />
            ) : (
              <PawPrint className="h-4 w-5 text-blue-600 shrink-0" />
            )}
            {name}
          </h3>
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider shrink-0 ${
              isCrop
                ? "bg-emerald-50 text-emerald-700 border-emerald-100/40"
                : "bg-blue-50 text-blue-700 border-blue-100/40"
            }`}
          >
            {type}
          </span>
        </div>

        <p className="text-slate-400 text-xs font-semibold mt-1 capitalize">
          {location?.state}, {location?.country}
        </p>

        {/* Growth stage tracking */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Growth Stage</span>
            <span className="text-slate-800">{record}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCrop ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${record}%` }}
            />
          </div>
        </div>

        {/* Advisory Tips banner */}
        <div
          className={`mt-5 border rounded-xl p-3.5 text-xs font-semibold text-slate-700 flex items-start gap-2.5 ${
            isCrop
              ? "bg-emerald-50/35 border-emerald-100/30"
              : "bg-blue-50/35 border-blue-100/30"
          }`}
        >
          <Lightbulb
            className={`h-4 w-4 shrink-0 mt-0.5 ${
              isCrop ? "text-emerald-600" : "text-blue-600"
            }`}
          />
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">
              Quick Tip
            </span>
            <span className="leading-relaxed">
              {advice || (
                <span className="animate-pulse text-slate-400">Loading tip…</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100/80 pt-4 mt-6 flex justify-end">
        <Link
          href="/farm-operation?tab=records"
          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
            isCrop
              ? "text-green-700 hover:text-green-800 bg-green-50/50 hover:bg-green-50"
              : "text-blue-700 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50"
          }`}
        >
          View More
          <MoveRight size={14} />
        </Link>
      </div>
    </div>
  );
};
