"use client";
import React, { useState, useEffect } from "react";
import { ClipboardList, Loader2, MapPin, Sprout, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import AdviceCardSkeleton from "../skeleton/smart-advisory/AdviceCard"; // 👈 import skeleton

interface AdviceCardProps {
  farmType: string;
  produce: string;
  location: {
    state: string;
    country: string;
  };
  advice: string;
  id: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({
  farmType,
  produce,
  location,
  id,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true); // 👈 skeleton state

  // 👇 simulate loading delay before showing real card
  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewAdvice = () => {
    setLoading(true);
    // 👇 add a tiny delay so the loader shows briefly
    setTimeout(() => {
      router.push(`/smart-advisory/${id}`);
    }, 1000);
  };

  // 👇 show skeleton if still loading
  if (showSkeleton) {
    return <AdviceCardSkeleton />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative group min-w-[250px]">
      {/* Top green line indicator */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 opacity-80" />
      
      <div className="p-5 flex-1 pt-7">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-xl leading-snug tracking-tight">
            Farming Plan
          </h3>
        </div>

        {/* Info Section */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-green-600 transition-colors">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <span className="font-medium text-slate-700 capitalize">
              Type: <span className="font-bold text-slate-900 ml-1">{farmType}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <Sprout className="h-4.5 w-4.5" />
            </div>
            <span className="font-medium text-slate-700 capitalize">
              Produce: <span className="font-bold text-slate-900 ml-1">{produce}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <span className="truncate font-medium text-slate-700">
              Location: <span className="font-bold text-slate-900 ml-1">{location.state}, {location.country}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleViewAdvice}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-1.5 text-center bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 py-2.5 px-4 rounded-xl text-sm font-semibold transition duration-150 ${
            loading ? "opacity-80 cursor-not-allowed" : ""
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {loading ? "Loading..." : "View Advice Plan"}
        </button>
      </div>
    </div>
  );
};

export default AdviceCard;
