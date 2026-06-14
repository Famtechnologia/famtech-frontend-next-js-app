"use client";
import { useEffect, useState } from "react";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import WeatherForecast from "@/app/(dashboard)/weather/components/WeatherCard";
import Tasks from "@/components/tasks/tasksCard";
import Alerts from "@/components/notifications/AlertBanner";
import MarketPrices from "@/app/(dashboard)/marketplace/components/cropPrice";
import FarmDiary from "@/app/(dashboard)/farm-operation/components/farmDiary";
import SmartAdvisory from "@/app/(dashboard)/farm-operation/components/SmartAdvisoryCard";
import TaskOverviewCard from "@/components/dashboard/TaskOverviewCard";
import CropHealthCard from "@/app/(dashboard)/dashboard/components/CropHealthOverview";

interface DashboardStats {
  crops: {
    winterWheat: { healthScore: number };
    corn: { healthScore: number };
  };
  weather: {
    current: {
      temperature: number;
      condition: string;
      humidity: number;
      soilTemp: number;
    };
  };
  financials: {
    totalNetWorth: number;
    growth: number;
  };
  notifications: Array<{
    id: string;
    type: "warning" | "info";
    message: string;
    location?: string;
    timestamp: string;
  }>;
}

export default function FarmerAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        crops: {
          winterWheat: { healthScore: 85 },
          corn: { healthScore: 68 },
        },
        weather: {
          current: {
            temperature: 24,
            condition: "Partly Cloudy",
            humidity: 62,
            soilTemp: 18,
          },
        },
        financials: {
          totalNetWorth: 842500,
          growth: 5.2,
        },
        notifications: [
          {
            id: "1",
            type: "warning",
            message: "Soil moisture below threshold",
            location: "in Field B3",
            timestamp: "2 hours ago",
          },
          {
            id: "2",
            type: "info",
            message: "Weather alert: Heavy rain",
            timestamp: "4 hours ago",
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4 px-0">
      <WelcomeHeader />

      {/* Top row — 3 equal cards, all same height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        <div className="flex flex-col"><WeatherForecast /></div>
        <div className="flex flex-col"><Tasks /></div>
        <div className="flex flex-col"><SmartAdvisory /></div>
      </div>

      {/* Middle row — 2/3 + 1/3, same height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 flex flex-col"><TaskOverviewCard /></div>
        <div className="lg:col-span-1 flex flex-col"><CropHealthCard /></div>
      </div>

      {/* Bottom row — 3 equal cards, same height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        <div className="flex flex-col"><MarketPrices /></div>
        <div className="flex flex-col"><FarmDiary /></div>
        <div className="flex flex-col"><Alerts /></div>
      </div>
    </div>
  );
}
