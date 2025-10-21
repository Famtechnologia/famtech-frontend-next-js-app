"use client";
import React from "react";

const FarmCardSkeleton = () => {
  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4">
        {/* Title and Badge */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
        </div>

        {/* Location */}
        <div className="mt-2 h-3 w-32 bg-gray-200 rounded"></div>

        {/* Growth Stage */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-10 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-gray-300 rounded-full w-1/2"></div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 bg-gray-100 rounded-lg flex items-center p-3 gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-40 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="border-t border-gray-100 p-4">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default FarmCardSkeleton;
