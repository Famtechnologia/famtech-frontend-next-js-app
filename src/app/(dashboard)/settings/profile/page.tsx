'use client';
import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Wheat, Ruler } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../../config';
import { useAuthStore } from "@/lib/store/authStore"; 

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
    coordinates: {}; 
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

const GET_PROFILE_ENDPOINT = '/api/get-profile';
const GET_PROFILE_URL = `${API_URL}${GET_PROFILE_ENDPOINT}`; 

const Settings: React.FC = () => {
  const token = useAuthStore(state => state.token);
  
  // Explicitly typing state for type safety (Fixes Error 2345)
  const [farmProfile, setFarmProfile] = useState<FarmProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("You are not authenticated. Please log in."); 
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(GET_PROFILE_URL, {
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
        });
        
        // Correctly access the nested data object
        const profileData = response.data?.data?.farmProfile as FarmProfileData; 

        if (profileData) {
            setFarmProfile(profileData); 
            setError(null);
        } else {
            setError("Profile data is available but empty.");
        }

      } catch (err: unknown) { // Use unknown for safety (Addresses Error 18046)
        console.error("Failed to fetch farm profile:", err);
        
        // Safely check for axios error response
        const status = (err as any).response?.status; 

        if (status === 401) {
            setError("Authentication failed. Please log in again.");
        } else if (status === 404) {
            setError("Farm profile not found. Please create a profile.");
        } else {
            setError("Failed to load profile due to a server error.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (isLoading) {
    return <div className="md:p-8 text-center text-xl text-gray-700">Loading profile...</div>;
  }

  // Handle errors or missing profile data
  if (error || !farmProfile) {
    return <div className="md:p-8 text-center text-xl text-red-600">
        {error || "No profile data to display."}
    </div>;
  }
  
  // Destructuring is safe here because of the checks above
  const { 
    farmType, 
    farmSize, 
    farmSizeUnit,
    owner, 
    location 
  } = farmProfile;

  // Construct display strings
  const farmOwnerName = owner 
    ? `${owner.firstName} ${owner.lastName}`.trim() 
    : 'N/A';
    
  const phoneNumber = owner?.phoneNumber || 'N/A';
  
  const farmLocationDisplay = location 
    ? `${location.city}, ${location.state}` 
    : 'N/A';
    
  const farmSizeDisplay = `${farmSize} ${farmSizeUnit}`;

  return (
    <div className="md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Personalize your account</p>
      </div>

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
                <p className="text-base md:text-lg font-medium text-gray-800">Farm Owner</p>
                <p className="text-gray-600 text-sm">{farmOwnerName}</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-200 bg-gray-100">
              Edit
            </button>
          </div>

          {/* Farm Location */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full  text-blue-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-800">Farm Location</p>
                <p className="text-gray-600 text-sm">{farmLocationDisplay}</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100">
              Change
            </button>
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full text-blue-600">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-800">Phone Number</p>
                <p className="text-gray-600 text-sm">{phoneNumber}</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 bg-gray-100">
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Farm Information</h2>
        </div>
        <div className="px-2 py-4 md:p-6 space-y-4">
          {/* Farm Type */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full text-blue-600">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-700">Farm Type</p>
                <p className="text-gray-600 text-sm">{farmType}</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 bg-gray-100">
              Edit
            </button>
          </div>

          {/* Farm Size */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full  text-blue-600">
                <Ruler className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-gray-600">Farm Size</p>
                <p className="text-gray-600 text-sm">{farmSizeDisplay}</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 bg-gray-100">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;