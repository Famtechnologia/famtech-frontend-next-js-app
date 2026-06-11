"use client";
import React, { useState, useEffect, useCallback } from "react";
import { SmartCard } from "@/components/smartAdvisory/SmartCard";
import { getCropRecords, getLivestockRecords } from "@/lib/services/croplivestock";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import FarmCardSkeleton from "@/components/skeleton/smart-advisory/FarmCardSkeleton"; 
export default function FarmHealthCard({ location }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropRecords, setCropRecords] = useState([]);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [smartProduct, setSmartProduct] = useState([]);

  const { user } = useAuth();

  const fetchCropData = useCallback(async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getCropRecords(user?._id);
      setCropRecords(data?.map((record) => ({ ...record, type: "crop" })));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  const fetchLivestockData = useCallback(async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getLivestockRecords(user?._id);

      setLivestockRecords(
        data?.map((record) => ({ ...record, type: "livestock" }))
      );
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchCropData();
    fetchLivestockData();
  }, [fetchCropData, fetchLivestockData]);

  useEffect(() => {
    setSmartProduct([...cropRecords, ...livestockRecords]);
  }, [cropRecords, livestockRecords]);

  const getGrowthPercentageFromStage = (stage, type) => {
    if (!stage || !type) return 0;

    const normalizedStage = stage.trim().toLowerCase();
    if (type === "crop") {
      if (normalizedStage.includes("seeding") || normalizedStage.includes("planting")) return 20;
      if (normalizedStage.includes("vegetative") || normalizedStage.includes("early growth")) return 40;
      if (normalizedStage.includes("flowering") || normalizedStage.includes("tasseling")) return 60;
      if (normalizedStage.includes("fruiting") || normalizedStage.includes("maturation") || normalizedStage.includes("ripening")) return 80;
      if (normalizedStage.includes("maturity") || normalizedStage.includes("completed")) return 100;
    } else if (type === "livestock") {
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
      {isLoading ? (
        // 🦴 show skeletons while loading
        [...Array(3)].map((_, i) => <FarmCardSkeleton key={i} />)
      ) : smartProduct?.length === 0 ? (
        <div className="w-full px-4 md:px-6 py-6 md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Farming Health</h2>
            <Link
              href="/farm-operation?tab=records"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition shadow-sm hover:shadow"
            >
              Add Record
            </Link>
          </div>
          <div className="text-center py-16 max-w-md mx-auto my-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <span className="font-bold text-xl">+</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold">No crop or livestock records found</p>
            <p className="text-slate-400 text-xs mt-1 mb-6">Please register some livestock or crop items in your farm operations to unlock health checks.</p>
            <Link
              href="/farm-operation?tab=records"
              className="inline-flex bg-green-600 text-white py-2.5 px-5 text-xs font-bold rounded-xl hover:bg-green-700 transition shadow-sm"
            >
              Go to Farm Operations
            </Link>
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
                ? getGrowthPercentageFromStage(smart.currentGrowthStage, smart?.type)
                : 20
            }
          />
        ))
      )}
    </div>
  );
}
