"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Droplets,
  Thermometer,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Leaf,
  Wheat,
} from "lucide-react";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import WeatherForecast from "@/app/(dashboard)/weather/components/WeatherCard";
import Tasks from "@/components/tasks/tasksCard";
import Alerts from "@/components/notifications/AlertBanner";
import  MarketPrices from "@/app/(dashboard)/marketplace/components/cropPrice";
import FarmDiary from "@/app/(dashboard)/farm-operation/components/farmDiary";
import SmartAdvisory from '@/app/(dashboard)/farm-operation/components/SmartAdvisoryCard'

interface DashboardStats {
  tasks: {
    completed: number;
    inProgress: number;
    overdue: number;
    items: Array<{
      id: string;
      title: string;
      status: "completed" | "pending" | "overdue";
      priority: "low" | "medium" | "high";
      dueDate: string;
    }>;
  };
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
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    // Simulate API call - replace with actual data fetching
    setTimeout(() => {
      setStats({
        tasks: {
          completed: 3,
          inProgress: 8,
          overdue: 2,
          items: [
            {
              id: "1",
              title: "Irrigation system maintenance",
              status: "completed",
              priority: "medium",
              dueDate: "Completed today",
            },
            {
              id: "2",
              title: "Harvest winter wheat - North field",
              status: "pending",
              priority: "high",
              dueDate: "Due tomorrow",
            },
            {
              id: "3",
              title: "Order livestock feed supplies",
              status: "pending",
              priority: "medium",
              dueDate: "Due in 2 days",
            },
            {
              id: "4",
              title: "Repair fence in east pasture",
              status: "overdue",
              priority: "high",
              dueDate: "Overdue by 1 day",
            },
          ],
        },
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

  const getTaskIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <ProtectedRoute requiredRole="farmer">
      <DashboardLayout title="Dashboard">
        <div className="space-y-6 ">
          {/* Welcome Header */}
          <WelcomeHeader />
          {/* Main Grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(50px, 3fr))",
            }}
          >
            <WeatherForecast />
            <Tasks />
              <Alerts />
          </div>
          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm  p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Task Overview
                  </h3>
                  <button className="text-green-600 text-sm font-medium flex items-center">
                    View All <Eye className="w-4 h-4 ml-1" />
                  </button>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-800">
                      {stats?.tasks.completed}
                    </p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-800">
                      {stats?.tasks.inProgress}
                    </p>
                    <p className="text-xs text-blue-600">In Progress</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-800">
                      {stats?.tasks.overdue}
                    </p>
                    <p className="text-xs text-red-600">Overdue</p>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {stats?.tasks.items.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      {getTaskIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">{task.dueDate}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - Crop Health */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm  p-6">
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

            {/* Right Column - Recent Notifications */}
            {/* <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {stats?.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      {notification.type === 'warning' ? 
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" /> :
                        <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      }
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                          {notification.location && <span className="text-gray-600"> {notification.location}</span>}
                        </p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Overview */}
            <MarketPrices />
            <FarmDiary />
            <SmartAdvisory/>

         

            {/* Middle Column - Crop Health */}
          

            
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
