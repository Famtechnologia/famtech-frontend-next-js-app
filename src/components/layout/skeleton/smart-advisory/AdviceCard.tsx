"use client";
import React from "react";

const AdviceCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
      {/* Icon and text block */}
      <div className="flex items-start mb-4">
        <div className="w-8 h-8 bg-gray-300 rounded mr-4 hidden md:flex"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>

      {/* Button placeholder */}
      <div className="h-10 bg-gray-300 rounded mt-4"></div>
    </div>
  );
};

export default AdviceCardSkeleton;
