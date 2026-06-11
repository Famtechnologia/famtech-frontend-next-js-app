// app/(dashboard)/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
//import axios, { AxiosError } from "axios";
//import apiClient from "@/lib/api/apiClient";
//import { useAuth } from "@/lib/hooks/useAuth";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FarmHealthCard from "@/components/smartAdvisory/FarmHealthCard";
import { BrainCircuit, HeartPulse, Telescope } from "lucide-react";
import { SmartInsight } from "@/components/smartAdvisory/SmartInsight";
import { Explore } from "@/components/smartAdvisory/Explore";
import SmartAdvisory from '@/components/skeleton/smart-advisory/SmartAdvisory'
import { useProfile } from "@/lib/hooks/useProfile";

const tabsConfig = [
  { label: "Farm Advice", icon: Telescope, key: "farm advice" },
  { label: "Farm Health", icon: HeartPulse, key: "health" },
  { label: "Smart Insight", icon: BrainCircuit, key: "chat" },
];

interface Owner {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface FarmLocation {
  state: string;
  country: string;
}

interface FarmProfileData {
  id: string;
  uid: string;
  farmName: string;
  farmType: string;
  farmSize: number;
  farmSizeUnit: string;
  establishedYear: number;
  location: FarmLocation;
  currency: string;
  timezone: string;
  primaryCrops: string[];
  farmingMethods: string[];
  seasonalPattern: string;
  language: string;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {profile} = useProfile()

  const activeTabKey = searchParams.get("tab") || "farm advice";

  // Function to handle tab clicks (updates the URL query)
  const handleTabChange = (key: string) => {
    const newUrl = `${pathname}?tab=${key}`;
    router.push(newUrl, { scroll: false });
  };

  const [farmProfile, setFarmProfile] = useState<FarmProfileData | null>(null);

  useEffect(() => {
    setFarmProfile(profile as FarmProfileData | null);
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // ⏳ 1.5 seconds (you can adjust this)

    return () => clearTimeout(timer);
  }, [])

  const owner = farmProfile?.owner;

  const ActiveComponent = useMemo(() => {
    const defaultLocation = { state: "", country: "" };

    switch (activeTabKey) {
      case "health":
        return <FarmHealthCard location={farmProfile?.location ?? defaultLocation} />;
      case "chat":
        return <SmartInsight />;
      case "farm advice":
        return <Explore location={farmProfile?.location ?? defaultLocation} />;
        
      default:
        // Use the first tab's component as the default if a strange key is found
        return <Explore location={farmProfile?.location ?? defaultLocation} />;
    }
  }, [activeTabKey, farmProfile?.location]);


  if (isLoading) {
      return <SmartAdvisory />;
    }
  
  return (
    <div className="text-slate-900 font-sans p-4 md:p-6 bg-slate-50/30">
      
      {/* Header Block */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Advisory Workspace
            <span className="text-xs font-bold text-slate-400 capitalize px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/50">
              Hi, {owner?.firstName || "Farmer"}
            </span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* --- SEGMENTED TABS SECTION --- */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/80 rounded-xl mb-4 max-w-xl">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabKey === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap flex-1
                        ${
                          isActive
                            ? "bg-white text-green-700 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                            : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                        }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render the Active Component */}
      <div className="mt-2">{ActiveComponent}</div>
    </div>
  );
}