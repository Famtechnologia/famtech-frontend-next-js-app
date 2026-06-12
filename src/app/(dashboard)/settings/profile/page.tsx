"use client";
import React, { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Wheat, 
  Ruler, 
  Mail, 
  Calendar, 
  DollarSign, 
  Globe, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  Settings as SettingsIcon,
  Layers,
  Sprout
} from "lucide-react";
import Link from "next/link";
import SettingsSkeletonLoader from "@/components/skeleton/settings/Profile";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";

// --- TYPE DEFINITIONS FOR FARM PROFILE ---
interface Owner {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface Location {
  country: string;
  state: string;
  city: string;
  address: string;
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
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
  primaryCrops?: string[];
  farmingMethods?: string[];
  seasonalPattern: string;
  language: string;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}
// ----------------------------------------

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [farmProfile, setFarmProfile] = useState<FarmProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    setFarmProfile(profile as FarmProfileData | null);
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  const { 
    farmName = "My Farm",
    farmType = "crop", 
    farmSize = 0, 
    farmSizeUnit = "hectares", 
    owner, 
    location,
    establishedYear,
    currency = "NGN",
    timezone = "Africa/Lagos",
    primaryCrops = [],
    farmingMethods = [],
    seasonalPattern = "year-round",
    language = "en"
  } = farmProfile || {};

  const userEmail = user?.email || "N/A";
  const farmOwnerName = owner ? `${owner.firstName} ${owner.lastName}`.trim() : "N/A";
  const phoneNumber = owner?.phoneNumber || "N/A";
  const farmLocationDisplay = location ? `${location.city}, ${location.state}` : "N/A";
  const fullAddress = location?.address || "No address provided";
  const farmSizeDisplay = `${farmSize} ${farmSizeUnit}`;

  return (
    <div className="md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-800 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-2xl md:text-3xl font-extrabold uppercase text-white shadow-inner">
              {farmName ? farmName.substring(0, 2) : "FM"}
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-green-100 border border-white/10 uppercase tracking-wide">
                <SettingsIcon className="h-3 w-3 text-emerald-100 animate-spin-slow" /> Farm Settings
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{farmName}</h1>
              <p className="text-sm text-green-100 font-medium">Owned by {farmOwnerName}</p>
            </div>
          </div>
          
          <Link href="/settings/edit-farm-profile" passHref>
            <button className="self-start md:self-auto px-5 py-2.5 bg-white text-emerald-800 rounded-xl font-bold hover:bg-emerald-50 transition duration-150 text-sm shadow-md flex items-center gap-2">
              Edit Farm Profile
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: ACCOUNT DETAILS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
                <p className="text-xs text-slate-400 font-medium">Manage your sign-in details</p>
              </div>
              <Link href="/settings/updateUser" passHref>
                <button className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition duration-150">
                  Edit Credentials
                </button>
              </Link>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700 break-all">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-700">{phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM SETTINGS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">System Preferences</h2>
              <p className="text-xs text-slate-400 font-medium">Regional & interface values</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Currency</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{currency}</p>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Language</span>
                </div>
                <p className="text-sm font-bold text-slate-700 uppercase">{language}</p>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 col-span-2 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Timezone</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{timezone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FARM PROFILE & METRICS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Operational Profile</h2>
                <p className="text-xs text-slate-400 font-medium">Farm activities and crop layouts</p>
              </div>
              <Link href="/settings/edit-farm-profile" passHref>
                <button className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition duration-150">
                  Update
                </button>
              </Link>
            </div>

            {/* QUICK METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-100/50 text-emerald-700 rounded-xl">
                  <Wheat className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Farm Type</p>
                  <p className="text-sm font-bold text-slate-800 capitalize">{farmType}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-100/50 text-blue-700 rounded-xl">
                  <Ruler className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Farm Size</p>
                  <p className="text-sm font-bold text-slate-800">{farmSizeDisplay}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-100/50 text-amber-700 rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Established</p>
                  <p className="text-sm font-bold text-slate-800">{establishedYear || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* ADITIONAL OPERATIONAL DETAILS */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Location Display */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Location & Coordinates</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <p className="text-sm font-semibold text-slate-700">{farmLocationDisplay}</p>
                    <p className="text-xs text-slate-400 font-medium">{fullAddress}</p>
                    {location?.coordinates?.latitude && location?.coordinates?.longitude && (
                      <div className="pt-1.5 text-[11px] font-mono text-slate-500 flex gap-3">
                        <span>Lat: {location.coordinates.latitude}</span>
                        <span>Lng: {location.coordinates.longitude}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seasonal Patterns */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Seasonal Cycle</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 h-[88px] flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-700 capitalize">{seasonalPattern.replace("-", " ")}</p>
                    <p className="text-xs text-slate-400 font-medium">Optimal operation schedule set by admin</p>
                  </div>
                </div>

              </div>

              {/* Badges for Crops & Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Farming Methods */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Farming Methods</p>
                  {farmingMethods.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {farmingMethods.map((method, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 capitalize">
                          {method}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No farming methods specified.</p>
                  )}
                </div>

                {/* Primary Crops */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Crops</p>
                  {primaryCrops && primaryCrops.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {primaryCrops.map((crop, index) => (
                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-100 capitalize">
                          <Sprout className="h-3 w-3 text-blue-500" /> {crop}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No primary crops listed.</p>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

