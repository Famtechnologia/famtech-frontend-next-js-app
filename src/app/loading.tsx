// app/(dashboard)/page.tsx
"use client";

import { useEffect } from "react";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

export default function Page() {
  useEffect(() => {
    // You can run client-side logic here if needed
    console.log("Dashboard Home mounted");
  }, []);

  return (
    <div className="p-6">
    <DashboardSkeleton />
    </div>
  );
}
