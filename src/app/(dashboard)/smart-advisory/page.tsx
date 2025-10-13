// app/(dashboard)/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import axios, { AxiosError } from "axios";
import { API_URL } from "../../../../config";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FarmHealthCard from "@/components/smartAdvisory/FarmHealthCard";
import { BrainCircuit, HeartPulse, Telescope } from "lucide-react";
import { SmartInsight } from "@/components/smartAdvisory/SmartInsight";
import { Explore } from "@/components/smartAdvisory/Explore";

const tabsConfig = [
  { label: "Explore", icon: Telescope, key: "explore" },
  { label: "Farm Health", icon: HeartPulse, key: "health" },
  { label: "Smart Insight", icon: BrainCircuit, key: "chat" },
];

const GET_PROFILE_ENDPOINT = "/api/get-profile";
const GET_PROFILE_URL = `${API_URL}${GET_PROFILE_ENDPOINT}`;

interface Owner {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface FarmProfileData {
  id: string;
  uid: string;
  farmName: string;
  farmType: string;
  farmSize: number;
  farmSizeUnit: string;
  establishedYear: number;
  location: Location;
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

  // Get the current tab from the URL query, defaulting to 'planner'
  const activeTabKey = searchParams.get("tab") || "planner";

  // Function to handle tab clicks (updates the URL query)
  const handleTabChange = (key: string) => {
    const newUrl = `${pathname}?tab=${key}`;
    router.push(newUrl, { scroll: false });
  };

  const [farmProfile, setFarmProfile] = useState<FarmProfileData | null>(null);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(GET_PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Correctly access the nested data object
        const profileData = response.data?.data?.farmProfile as FarmProfileData;

        setFarmProfile(profileData);
      } catch (err: unknown) {
        console.error("Failed to fetch farm profile:", err);

        // FIX 2: Safely check for AxiosError and access the status property
        let errorMessage = "Failed to load profile due to an unknown error.";

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          const status = axiosError.response?.status; // Safely access status

          if (status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (status === 404) {
            errorMessage = "Farm profile not found. Please create a profile.";
          } else if (status !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            errorMessage = `Server error (Status: ${status}). Failed to load profile.`;
          }
        }
      }
    };

    fetchProfile();
  }, [token]);

  const owner = farmProfile?.owner;

  const ActiveComponent = useMemo(() => {
    switch (activeTabKey) {
      case "health":
        return <FarmHealthCard location={farmProfile?.location} />;
      case "chat":
        return <SmartInsight />;
      case "explore":
        return <Explore location={farmProfile?.location} />;
        
      default:
        return <Explore location={farmProfile?.location} />;
    }
  }, [activeTabKey, farmProfile?.location]);

  return (
    <div className="p-0 md:p-6 bg-white">
      <div>
        <h2 className="text-lg text-green-700 sm:text-xl lg:text-2xl font-bold leading-tight">
          Hi <span className="capitalize">{owner?.firstName || "Farmer"}</span>,
          here&apos;s is your farm health&apos;s today ⛅
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
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
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors
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
