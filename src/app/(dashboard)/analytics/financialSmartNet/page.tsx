// app/(dashboard)/page.tsx
"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // You can run client-side logic here if needed
    console.log("Dashboard Home mounted");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Financials SmartNet</h1>
      <p className="text-gray-600 mt-2">
        Welcome to your dashboard! Here you can see an overview of your farms,
        crops, and livestock.
      </p>
    </div>
  );
}
