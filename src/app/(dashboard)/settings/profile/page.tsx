import React from 'react';
import { User, MapPin, Phone, Wheat, Ruler } from 'lucide-react';

const Settings = () => {
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
                <p className="text-gray-600 text-sm">Eribola Ayomiposi</p>
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
                <p className="text-gray-600 text-sm">Ibadan, Lagos</p>
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
                <p className="text-gray-600 text-sm">+234 812 673 1234</p>
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
                <p className="text-gray-600 text-sm">Mixed Farming</p>
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
                <p className="text-gray-600 text-sm">2 Acres</p>
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
