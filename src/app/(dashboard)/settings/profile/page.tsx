"use client";
import React, { useState, useEffect } from "react";
import { User, MapPin, Phone, Wheat, Ruler, Mail } from "lucide-react";
import Link from "next/link"; // Import Link for navigation
import SettingsSkeletonLoader from "@/components/layout/skeleton/settings/Profile";
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
  coordinates: Record<string, unknown>;
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
    }, 1500); // ⏳ 1.5 seconds (you can adjust this)

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    // Display the skeleton while data is being fetched
    return <SettingsSkeletonLoader />;
  }

  if (!farmProfile) {
    console.log("No profile data to display.")
  }

  const { farmType, farmSize, farmSizeUnit, owner, location } = farmProfile || {};

  // Use user store data for account details
  const userEmail = user?.email || "N/A";

  // Construct display strings
  const farmOwnerName = owner
    ? `${owner.firstName} ${owner.lastName}`.trim()
    : "N/A";

  const phoneNumber = owner?.phoneNumber || "N/A";

  const farmLocationDisplay = location
    ? `${location.city}, ${location.state}`
    : "N/A";

  const farmSizeDisplay = `${farmSize} ${farmSizeUnit}`;

  return (
    <div className="md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Personalize your account</p>
      </div>

      {/* --- NEW SECTION: Account Details (for email, password, country/state) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Account Details
          </h2>
          <p className="text-sm text-gray-500">
            Manage your sign-in details and location.
          </p>
        </div>
        <div className="flex items-center justify-between px-2 py-4 md:p-6">
          {/* Email Display */}
          <div className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="p-2 rounded-full text-green-600">
                <Mail className="h-6 w-6" />
              </div>
              <div className="">
                <p className="text-base md:text-lg font-medium text-gray-800">
                  Email Address
                </p>
                <p className="text-gray-600 text-sm truncate max-w-36 md:max-w-full ">
                  {userEmail}
                </p>
              </div>
            </div>
            {/* No Edit button here as per your requirement that email can't be changed in the form */}
          </div>

          {/* Link to Update Sign-in Details */}
          <div className="flex items-center">
            <Link href="/settings/updateUser" passHref>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150">
                Edit
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* --- END NEW SECTION --- */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Owner Profile</h2>
        </div>
        <div className="px-2 py-4 md:p-6 space-y-4">
          {/* Farm Owner */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full text-green-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-800">
                  Farm Owner
                </p>
                <p className="text-gray-600 text-sm">{farmOwnerName}</p>
              </div>
            </div>
            <Link
              href="/settings/edit-farm-profile"
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100"
            >
              Edit
            </Link>
          </div>

          {/* Farm Location */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full  text-blue-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-800">
                  Farm Location
                </p>
                <p className="text-gray-600 text-sm">{farmLocationDisplay}</p>
              </div>
            </div>
            <Link
              href="/settings/edit-farm-profile"
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100"
            >
              Change
            </Link>
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full text-blue-600">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-800">
                  Phone Number
                </p>
                <p className="text-gray-600 text-sm">{phoneNumber}</p>
              </div>
            </div>
            <Link
              href="/settings/edit-farm-profile"
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Farm Information
          </h2>
        </div>
        <div className="px-2 py-4 md:p-6 space-y-4">
          {/* Farm Type */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full text-blue-600">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-700">
                  Farm Type
                </p>
                <p className="text-gray-600 text-sm">{farmType}</p>
              </div>
            </div>
            <Link
              href="/settings/edit-farm-profile"
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100"
            >
              Edit
            </Link>
          </div>

          {/* Farm Size */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full  text-blue-600">
                <Ruler className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-600">
                  Farm Size
                </p>
                <p className="text-gray-600 text-sm">{farmSizeDisplay}</p>
              </div>
            </div>
            <Link
              href="/settings/edit-farm-profile"
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
