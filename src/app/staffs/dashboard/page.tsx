"use client";
import { useEffect, useState } from "react";
import WelcomeHeader from "./components/WelcomeHeader";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

import Tasks from "./components/tasksCard";

export default function FarmerAdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
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
        
        <Tasks />
        
      </div>
    </div>
  );
}
