"use client";

import { SmartCard } from "@/components/smartAdvisory/SmartCard";

export default function FarmHealthCard({ location }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <SmartCard location={location} />
      <SmartCard location={location} />
      <SmartCard location={location} />
    </div>
  );
}
