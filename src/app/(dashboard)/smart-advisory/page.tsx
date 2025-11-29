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
import SmartAdvisory from '@/components/layout/skeleton/smart-advisory/SmartAdvisory'
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
    <div className="p-3 pt-6 md:p-6 bg-white">
      <div>
        <h2 className="text-lg text-green-700 sm:text-xl lg:text-2xl font-bold leading-tight mb-4">
          Hi <span className="capitalize">{owner?.firstName || "Farmer"}</span>,
          here&apos;s your farm health update for today ⛅
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-4">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 mt-2">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabKey === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center space-x-2 px-1 mr-8 py-3 text-base font-medium transition-colors
                                ${
                                  isActive
                                    ? "border-b-2 border-green-600 text-green-700"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
            >
              <Icon size={18} />
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