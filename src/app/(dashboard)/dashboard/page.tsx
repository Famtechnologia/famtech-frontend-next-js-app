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
      <div className="space-y-6">
        <WelcomeHeader />

        {/* Top Section */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 3fr))",
          }}
        >
          <WeatherForecast />
          <Tasks />
          <Alerts />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskOverviewCard />
          </div>
          <div className="lg:col-span-1">{stats && <CropHealthCard />}</div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MarketPrices />
          <FarmDiary />
          <SmartAdvisory />
        </div>
      </div>
  );
}
