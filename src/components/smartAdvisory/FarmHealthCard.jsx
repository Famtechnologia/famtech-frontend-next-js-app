"use client";
import React, { useState, useEffect, useCallback } from "react";

import { SmartCard } from "@/components/smartAdvisory/SmartCard";
import {
  getCropRecords,
  getLivestockRecords,
} from "@/lib/services/croplivestock";
import { useAuthStore } from "@/lib/store/authStore";

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
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 text-medium text-center">
            You Don&apos;t have any Crop and Livestock
          </p>
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
