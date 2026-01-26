"use client";
import React from "react";

export default function AdviceLoader() {
  return (
    <div className="w-full p-4 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-40 bg-gray-200 rounded mb-6"></div>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-2 border-gray-200">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
          <div>
            <div className="h-6 w-20 md:w-40 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-30 md:w-60 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-4 w-30 md:w-72 bg-gray-200 rounded mb-6"></div>

        {/* Week Tabs Skeleton */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-gray-200 rounded-lg"
            ></div>
          ))}
        </div>

        {/* Week Content Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col space-y-2 bg-gray-50 p-4 border-l-4 border-green-200 rounded-lg"
            >
              <div className="h-4 w-40 md:w-48 bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
