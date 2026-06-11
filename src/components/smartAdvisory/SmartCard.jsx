"use client";
import React, { useState, useEffect } from "react";
import { getAdvice } from "@/lib/services/advisory";
import { CircleCheck, MoveRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const SmartCard = ({
  location,
  type,
  name,
  tip,
  record,
}) => {
  const [advice, setAdvice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const generateAdvice = async () => {
      const question = "I need a 4 word tip, Note go straight to the point for the tip don't add any unnecessary text, just give me the 4 word tip, no more, no less. Note only the tip.";
      try {
        const res = await getAdvice(question, tip);
        setAdvice(res?.advice);
      } catch (error) {
        setError(error?.message);
      }
    };
    generateAdvice();
  }, [tip]);

  return (
    <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/60 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-between">
      <div>
        {/* Header Block */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg capitalize tracking-tight truncate">
            {name}
          </h3>
          <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/40 uppercase tracking-wider shrink-0">
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
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${record}%` }}
            />
          </div>
        </div>

        {/* Advisory Tips banner */}
        <div className="mt-5 bg-emerald-50/35 border border-emerald-100/30 rounded-xl p-3.5 text-xs font-semibold text-slate-700 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Quick Tip</span>
            <span className="leading-relaxed">{advice || "Optimizing records..."}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100/80 pt-4 mt-6 flex justify-end">
        <Link
          href="/farm-operation?tab=records"
          className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50/50 hover:bg-green-50 px-3 py-1.5 rounded-xl transition-all"
        >
          View More
          <MoveRight size={14} />
        </Link>
      </div>
    </div>
  );
};
