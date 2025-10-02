"use client";
import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Droplets,
  Thermometer,
  Leaf,
  Wheat,
} from "lucide-react";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import WeatherForecast from "@/app/(dashboard)/weather/components/WeatherCard";
import Tasks from "@/components/tasks/tasksCard";
import Alerts from "@/components/notifications/AlertBanner";
import MarketPrices from "@/app/(dashboard)/marketplace/components/cropPrice";
import FarmDiary from "@/app/(dashboard)/farm-operation/components/farmDiary";
import SmartAdvisory from '@/app/(dashboard)/farm-operation/components/SmartAdvisoryCard'

// Import the new Task Overview Card
import TaskOverviewCard from "@/components/dashboard/TaskOverviewCard"; 

// 1. UPDATED: Removed the 'tasks' property from the DashboardStats interface
interface DashboardStats {
  crops: {
    winterWheat: {
      healthScore: number;
    };
    corn: {
      healthScore: number;
    };
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
  
  // State now uses the simplified interface
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Simulate API call for other dashboard data - tasks are now fetched internally by TaskOverviewCard
    setTimeout(() => {
      setStats({
        // 2. UPDATED: Removed the simulated 'tasks' data object
        crops: {
          winterWheat: {
            healthScore: 85,
          },
          corn: {
            healthScore: 68,
          },
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ProtectedRoute requiredRole="farmer">
      {/* <DashboardLayout title="Dashboard"> */}
        <div className="space-y-6 ">
          {/* Welcome Header */}
          <WelcomeHeader />
          {/* Main Grid */}
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
          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Overview (Now using the new component!) */}
            <div className="lg:col-span-2">
              {/* 3. FIX: Removed the 'tasks' prop. TaskOverviewCard now fetches its own data. */}
              <TaskOverviewCard />
            </div>

            {/* Middle Column - Crop Health */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Crop Health Snapshot
                </h3>

                {/* Winter Wheat */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Wheat className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Winter Wheat
                        </p>
                        <p className="text-sm text-gray-500">
                          Health Score: {stats?.crops.winterWheat.healthScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats?.crops.winterWheat.healthScore}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Corn */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Corn</p>
                        <p className="text-sm text-gray-500">
                          Health Score: {stats?.crops.corn.healthScore}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${stats?.crops.corn.healthScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Environmental Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-lg font-semibold text-blue-800">
                        {stats?.weather.current.humidity}%
                      </p>
                      <p className="text-xs text-gray-500">Moisture</p>
                      <p className="text-xs text-gray-400">Optimal: 55-65%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-lg font-semibold text-orange-800">
                        {stats?.weather.current.soilTemp}°C
                      </p>
                      <p className="text-xs text-gray-500">Soil Temp</p>
                      <p className="text-xs text-gray-400">Optimal: 15-21°C</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for Right Column */}
            <div className="lg:col-span-1">
              {/* This column is available for other components */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MarketPrices />
            <FarmDiary />
            <SmartAdvisory />
          </div>
        </div>
      {/* </DashboardLayout> */}
    </ProtectedRoute>
  );
}
