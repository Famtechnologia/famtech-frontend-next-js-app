import React from "react";

const InventorySkeleton: React.FC = () => {
  // Helper to repeat elements
  const SkeletonCard = () => (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white animate-pulse">
      <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
      <div className="h-5 w-32 bg-gray-300 rounded mb-4"></div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-3 w-20 bg-gray-300 rounded"></div>
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
        <div className="h-3 w-20 bg-gray-300 rounded"></div>
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="h-10 w-32 bg-gray-300 rounded"></div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="h-10 w-28 bg-gray-300 rounded"></div>
          <div className="h-10 w-40 bg-gray-300 rounded"></div>
          <div className="h-10 w-28 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-3 border-b border-gray-200 pb-2 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-gray-300 rounded-full"></div>
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
};

export default InventorySkeleton;
