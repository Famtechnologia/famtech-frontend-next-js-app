"use client";
import React, { useState, useEffect } from "react";
import AdviceCard from "./AdviceCard";
import AdviceCardSkeleton from "../layout/skeleton/smart-advisory/AdviceCard"; // ✅ import the skeleton component
import { useAuthStore } from "@/lib/store/authStore";
import { getUserAdvice } from "@/lib/services/advisory";

interface AdviceData {
  id: string;
  type: string;
  produce: string;
  advice: string;
}

const Advice: React.FC<{ setShowFarmingType: (show: boolean) => void }> = ({
  setShowFarmingType,
}) => {
  const { user } = useAuthStore();
  const [adviceData, setAdviceData] = useState<AdviceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAdvice = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const user_advice = await getUserAdvice(user.id);
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
  }, [user]);

  return (
    <div className="px-3 md:px-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Farming Advice</h2>
        <button
          onClick={() => setShowFarmingType(true)}
          className="bg-green-600 text-white py-2 px-2 md:px-4 text-sm md:text-base rounded-md hover:bg-green-700 transition duration-150"
        >
          New <span className="hidden md:flex">Advice</span>
        </button>
      </div>

      {/* 🧭 Loading state with skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <AdviceCardSkeleton key={i} />
          ))}
        </div>
      ) : adviceData.length === 0 ? (
        <div className="text-center text-gray-500 w-full h-48 flex items-center justify-center">
          No advice available, click on &#34;New (Advice)&#34; to generate one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
