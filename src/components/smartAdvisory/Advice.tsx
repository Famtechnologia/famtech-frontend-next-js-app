"use client";
import React, { useState, useEffect } from "react";
import AdviceCard from "./AdviceCard";
import { getUserAdvice } from "@/lib/services/advisory";
import {useAuth} from "@/lib/hooks/useAuth"

interface AdviceData {
  id: string;
  type: string;
  produce: string;
  advice: string;
}

const Advice: React.FC<{ setShowFarmingType: (show: boolean) => void }> = ({
  setShowFarmingType,
}) => {
  const { user } = useAuth();
  const [adviceData, setAdviceData] = useState<AdviceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAdvice = async () => {
      try {
        setLoading(true);

        const user_advice = await getUserAdvice(user?._id || "");
        setAdviceData(user_advice?.data || []);

        // 🕒 Ensure skeleton shows for at least 2s even if fetch is fast
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("❌ Failed to fetch advice:", error);
        setLoading(false);
      }
    };

    fetchUserAdvice();
  }, [user?._id]);

  return (
    <div className="px-3 md:px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Farming Advice Plans</h2>
        <button
          onClick={() => setShowFarmingType(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition shadow-sm hover:shadow"
        >
          New Advice Plan
        </button>
      </div>

      {/* 🧭 Loading state with skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skeleton loading elements */}
        </div>
      ) : adviceData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto my-4 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold">No advice available yet</p>
          <p className="text-slate-400 text-xs mt-1 mb-6">Create a new advisory roadmap custom to your crops and proficiency.</p>
          <button
            onClick={() => setShowFarmingType(true)}
            className="bg-green-600 text-white py-2.5 px-5 text-xs font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Generate New Advice
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adviceData.map((data) => {
            const cleanedAdvice = JSON.parse(data.advice)
              .advice?.replace(/\\n```/g, "")
              .replace(/\\n/g, "")
              .replace(/```/g, "")
              .replace(/```json\\n/g, "")
              .replace(/```json/g, "")
              .replace(/\\\\/g, "")
              .replace(/\\/g, "");

            return (
              <AdviceCard
                key={data.id}
                farmType={data.type}
                produce={data.produce}
                location={{
                  state: user?.state || "",
                  country: user?.country || "",
                }}
                advice={cleanedAdvice}
                id={data.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Advice;
