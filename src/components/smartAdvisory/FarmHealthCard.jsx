"use client";
import React, { useState, useEffect, useCallback } from "react";

import { SmartCard } from "@/components/smartAdvisory/SmartCard";
import {
  getCropRecords,
  getLivestockRecords,
} from "@/lib/services/croplivestock";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import {  Link2, MoveRight } from "lucide-react";
export default function FarmHealthCard({ location }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropRecords, setCropRecords] = useState([]);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [smartProduct, setSmartProduct] = useState([]);

  const userId = useAuthStore((state) => state.user?.id);

  const fetchCropData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getCropRecords(userId);
      setCropRecords(data?.map((record) => ({ ...record, type: "crop" })));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchLivestockData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getLivestockRecords(userId);

      setLivestockRecords(
        data?.map((record) => ({ ...record, type: "livestock" }))
      );
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCropData();
    fetchLivestockData();
  }, [fetchCropData, fetchLivestockData]);

  useEffect(() => {
    setSmartProduct([...cropRecords, ...livestockRecords]);
  }, [cropRecords, livestockRecords]);

  const getGrowthPercentageFromStage = (stage, type) => {
    if (!stage || !type) return 0;

    if (type === "crop") {
      // Normalize and trim the stage name for robust matching
      const normalizedStage = stage.trim().toLowerCase();

      // Define your 5 stages and their percentage steps (20% each)
      if (
        normalizedStage.includes("seeding") ||
        normalizedStage.includes("planting")
      )
        return 20;
      if (
        normalizedStage.includes("vegetative") ||
        normalizedStage.includes("early growth")
      )
        return 40;
      if (
        normalizedStage.includes("flowering") ||
        normalizedStage.includes("tasseling")
      )
        return 60;
      if (
        normalizedStage.includes("fruiting") ||
        normalizedStage.includes("maturation") ||
        normalizedStage.includes("ripening")
      )
        return 80;
      if (
        normalizedStage.includes("harvest") ||
        normalizedStage.includes("completed")
      )
        return 100;
    } else if (type === "livestock") {
      // Normalize and trim the stage name for robust matching
      const normalizedStage = stage.trim().toLowerCase();

      // Define your 5 stages and their percentage steps (20% each)
      if (normalizedStage.includes("newborn")) return 20;
      if (normalizedStage.includes("juvenile")) return 40;
      if (normalizedStage.includes("young")) return 60;
      if (normalizedStage.includes("adult")) return 80;
      if (normalizedStage.includes("senior")) return 100;
    }


    // Fallback in case a stage name doesn't match a defined keyword
    return 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 min-h-40">
      {smartProduct?.length === 0 ? (
       <div className="w-full px-2 md:px-6 p-6 md:col-span-2 lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm">
       <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:2xl font-bold">Farming Health</h2>
          <Link href='/farm-operation?tab=records' className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-150"
          >
            Add <span className="hidden md:flex">Record</span>
          </Link>
        </div>
        <div className="text-center text-gray-500 w-full h-48 flex items-center justify-center">
            No crop or livestock records found. Please add some to view health tips.
          </div>
          </div>
      ) : (
        smartProduct?.map((smart, index) => (
          <SmartCard
            key={index}
            location={location}
            type={smart.type}
            name={smart.type === "crop" ? smart?.cropName : smart?.specie}
            tip={smart}
            record={
              smart.type === "crop"
                ? getGrowthPercentageFromStage(
                    smart.currentGrowthStage,
                    smart?.type
                  )
                : 20
            }
          />
        ))
      )}
    </div>
  );
}
