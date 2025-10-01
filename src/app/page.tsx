"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  // Removed unused icons: Droplets, Thermometer, CheckCircle, Clock, AlertCircle, Eye, Leaf, Wheat
} from "lucide-react";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
// Imported Components (Assume these are self-managing components/widgets)
import WeatherForecast from "@/app/(dashboard)/weather/components/WeatherCard";
import Tasks from "@/components/tasks/tasksCard";
import Alerts from "@/components/notifications/AlertBanner";
import MarketPrices from "@/app/(dashboard)/marketplace/components/cropPrice";
import FarmDiary from "@/app/(dashboard)/farm-operation/components/farmDiary";
import SmartAdvisory from "@/app/(dashboard)/farm-operation/components/SmartAdvisoryCard";

// NOTE: Since child components are self-managing, this interface is only needed for the (now removed) manual sections. 
// Keeping it simple for the initial loading state.
interface DashboardStats {
    // Only need a minimal structure to simulate loading completion
    tasks: {
        completed: number;
    }
    // ... all other fields can be removed if not used by the main component
}

export default function FarmerAdminDashboard() {
  // Keeping the state to drive the initial loading screen
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - **Replace with actual logic to check user auth/permissions.**
    // We keep this to show the DashboardSkeleton for a moment.
    setTimeout(() => {
      // NOTE: Only setting a minimal stat to switch off loading
      setStats({
        tasks: { completed: 3 } 
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    // Use the skeleton while data is being fetched/initialized
    return <DashboardSkeleton />;
  }
  
  // NOTE: Removed getTaskIcon and getPriorityColor functions as the Task Overview 
  // section they were used in is now replaced by the self-managing <Tasks /> component.

  return (
    <ProtectedRoute requiredRole="farmer">
      <DashboardLayout title="Dashboard">
        <div className="space-y-6 ">
          {/* Welcome Header */}
          <WelcomeHeader />
          
          {/* TOP WIDGET GRID (Weather, Tasks, Alerts) */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            // Keeping the style for flexibility, but grid-cols-3 works fine too
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            }}
          >
            {/* These components are assumed to be self-managing Client Widgets */}
            <WeatherForecast />
            <Tasks />
            <Alerts /> 
          </div>

          {/* MIDDLE WIDGET GRID (Market Prices, Farm Diary, Smart Advisory) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MarketPrices />
            <FarmDiary />
            <SmartAdvisory />
          </div>

          {/* NOTE: The manually rendered Task Overview and Crop Health Snapshot sections 
              have been removed. If you need a combined Task/Crop overview, 
              you must create a separate, dedicated component for it. */}
              
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}