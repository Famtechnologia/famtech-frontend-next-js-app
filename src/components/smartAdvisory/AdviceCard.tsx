"use client";
import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import { ClipboardList, Loader2 } from "lucide-react";
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
    <Card
      title="Farming Plan"
      borderless={true}
      className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-w-[250px] relative overflow-hidden"
    >
      {/* Top green line indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-600" />
      
      <div className="flex flex-col justify-between h-full pt-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-700 hidden md:block">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-1 font-semibold text-slate-500">
            <p className="capitalize">
              Type: <span className="text-slate-800 font-bold ml-1">{farmType}</span>
            </p>
            <p className="capitalize">
              Produce: <span className="text-slate-800 font-bold ml-1">{produce}</span>
            </p>
            <p className="capitalize text-[11px]">
              Location:{" "}
              <span className="text-slate-700 ml-1">
                {location.state}, {location.country}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleViewAdvice}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-1.5 text-center bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 py-2.5 px-4 rounded-xl text-xs font-bold transition duration-150 mt-6 ${
            loading ? "opacity-80 cursor-not-allowed" : ""
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {loading ? "Loading..." : "View Advice Plan"}
        </button>
      </div>
    </Card>
  );
};

export default AdviceCard;
