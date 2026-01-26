// components/smartAdvisory/FarmDashboardSkeleton.tsx
import React from 'react';

const FarmDashboardSkeleton: React.FC = () => {
  return (
    <div className="p-3 pt-6 md:p-6 bg-white animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        {/* Title/Greeting */}
        <div className="h-7 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
        {/* Date */}
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 mt-2">
        {/* Skeleton for 3 Tabs */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2 px-1 mr-8 py-3">
            {/* Icon placeholder */}
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div> 
            {/* Label placeholder */}
            <div className="h-5 bg-gray-300 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Active Component Area Skeleton (Mimics a card or main content) */}
      <div className="mt-4">
        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 h-64 w-full">
          <div className="h-8 w-1/3 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-gray-200 rounded col-span-2"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDashboardSkeleton;