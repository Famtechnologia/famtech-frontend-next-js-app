"use client";
import React, { useState, useEffect } from "react";
import AdviceCard from "./AdviceCard";
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

  useEffect(() => {
    const fetchUserAdvice = async () => {
      if (user?.id) {
        const user_advice = await getUserAdvice(user.id);

        setAdviceData(user_advice?.data);
      }
    };
    fetchUserAdvice();
  }, [user]);
  console.log(
    adviceData[1]?.advice
      ?.replace(/\\n```/g, "")
      .replace(/\\n/g, "")
      .replace(/```json\\n/g, "")
      .replace(/```json/g, "")
      .replace(/\\\\/g, "")
      .replace(/\\/g, "")
  );

  return (
    <div className="px-3 md:px-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Farming Advice</h2>
        <button
          onClick={() => setShowFarmingType(true)}
          className="bg-green-600 text-white py-2 px-2 md:px-4 text-sm md:text-base rounded-md hover:bg-green-700 transition duration-150"
        >
          New <span className="hidden md:flex">Advice</span>
        </button>
      </div>
      {adviceData.length === 0 ? (
        <div className="text-center text-gray-500 w-full h-48 flex items-center justify-center">
          No advice available, click on "New (Advice)" to generate one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adviceData.map((data) => (
            <AdviceCard
              key={data.id}
              farmType={data.type}
              produce={data.produce}
              location={{
                state: user?.state || "",
                country: user?.country || "",
              }}
              advice={JSON.parse(data.advice)
                .advice?.replace(/\\n```/g, "")
                .replace(/\\n/g, "")
                .replace(/```/g, "")
                .replace(/```json\\n/g, "")
                .replace(/```json/g, "")
                .replace(/\\\\/g, "")
                .replace(/\\/g, "")}

                id={data?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Advice;
