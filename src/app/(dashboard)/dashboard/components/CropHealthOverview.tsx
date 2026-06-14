"use client";
import React, { useEffect, useState } from "react";
import { Wheat, Plus, AlertCircle, Heart, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import { useProfile } from "@/lib/hooks/useProfile";
import { getCropRecords, CropRecord } from "@/lib/services/croplivestock";
import Link from "next/link";

const CropHealthCard = () => {
  const { profile } = useProfile();
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchCrops = async () => {
      try {
        setLoading(true);
        const data = await getCropRecords(profile.id);
        // Ensure data is array
        if (Array.isArray(data)) {
          setCrops(data);
        } else if (data && typeof data === "object" && "data" in data) {
          // Handle case if API returns { success: true, data: [...] }
          const records = (data as any).data;
          if (Array.isArray(records)) {
            setCrops(records);
          }
        }
        setError(false);
      } catch (err) {
        console.error("Error fetching crop records for dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [profile?.id]);

  const getHealthBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "excellent":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "good":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "fair":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "poor":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getGrowthProgress = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "seeding":
        return 15;
      case "vegetative":
        return 40;
      case "flowering":
        return 60;
      case "fruiting":
        return 80;
      case "maturity":
        return 95;
      case "harvesting":
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="h-full">
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wheat className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">Crop Health Snapshot</span>
            </div>
            {crops.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {crops.length} Active
              </span>
            )}
          </div>
        }
        className="h-full border border-gray-100 hover:shadow-md transition-shadow"
        headerClassName="bg-emerald-50/40 border-b border-emerald-100"
        bodyClassName="p-5 flex flex-col"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 font-medium">Analyzing field status...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-xs font-semibold text-gray-700">Failed to fetch crop data</p>
            <p className="text-[11px] text-gray-400">Please check your connection and try again.</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <Wheat className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">No Active Crop Records</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Add your crop cultivation details to monitor growth progress and health metrics.
              </p>
            </div>
            <Link
              href="/farm-operation"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Crop</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col flex-1 space-y-4">
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {crops.slice(0, 3).map((crop) => (
                <div
                  key={crop._id}
                  className="p-3 rounded-xl bg-gray-50/70 border border-gray-100/80 hover:bg-white hover:border-emerald-100 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 capitalize">
                        {crop.cropName}
                      </h4>
                      <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                        {crop.variety || "Standard Variety"}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border capitalize tracking-wide ${getHealthBadgeColor(
                        crop.healthStatus
                      )}`}
                    >
                      {crop.healthStatus || "good"}
                    </span>
                  </div>

                  {/* Growth stage progress */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1 font-medium">
                      <span className="capitalize">Stage: {crop.currentGrowthStage || "Seeding"}</span>
                      <span>{getGrowthProgress(crop.currentGrowthStage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${getGrowthProgress(crop.currentGrowthStage)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">
                Showing {Math.min(3, crops.length)} of {crops.length}
              </span>
              <Link
                href="/farm-operation"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition"
              >
                View all crops &rarr;
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CropHealthCard;
