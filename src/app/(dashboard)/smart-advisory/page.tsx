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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    <div className="text-slate-900 dark:text-[#e6edf3] font-sans p-3 md:p-6 bg-slate-50/30 dark:bg-[#0d1117]">

      {/* Header Block */}
      <div className="hidden md:flex mb-6 bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/50 dark:border-[#30363d] flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e6edf3] tracking-tight">
            Advisory Workspace
          </h1>
          <p className="text-slate-500 dark:text-[#8b949e] mt-1 text-sm font-medium">
            Generate expert advice plans and consult with your AI assistant.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <span className="inline-flex px-3 py-1 bg-slate-50 dark:bg-[#21262d] border border-slate-150 dark:border-[#30363d] text-slate-600 dark:text-[#8b949e] text-[10px] font-bold rounded-lg uppercase tracking-wider w-fit">
            Hi, {owner?.firstName || "Farmer"}
          </span>
          <p className="text-slate-400 dark:text-[#6e7681] text-[10px] font-bold uppercase tracking-wider">
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
      <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#161b22] rounded-xl md:rounded-2xl mb-4 md:mb-6 max-w-2xl scrollbar-none">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabKey === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center justify-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all duration-200 whitespace-nowrap flex-1 shrink-0
                        ${
                          isActive
                            ? "bg-white dark:bg-[#21262d] text-green-700 dark:text-green-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                            : "text-slate-500 dark:text-[#8b949e] hover:text-slate-800 dark:hover:text-[#e6edf3] hover:bg-white/50 dark:hover:bg-[#21262d]/50"
                        }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render the Active Component */}
      <div className="mt-4">{ActiveComponent}</div>
    </div>
  );
}