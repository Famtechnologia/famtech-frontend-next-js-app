"use client";
import React from "react";

const TaskPageSkeleton = () => {
  return (
    <div className="p-2 lg:p-6 min-h-screen bg-gray-50 animate-pulse">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
          <div className="h-8 w-48 bg-gray-200 rounded-md mb-4 md:mb-0" />
          <div className="flex space-x-4">
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
            <div className="h-10 w-24 bg-gray-200 rounded-md" />
          </div>
        </div>

        <div className="space-y-6 md:space-y-0 md:flex md:space-x-6">
          {/* Left Sidebar Skeleton */}
          <div className="w-full md:w-64 space-y-6 p-4 bg-white rounded-xl shadow-xl">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="h-8 w-full bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="h-8 w-full bg-gray-200 rounded-xl" />
                ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-6">
            {/* Search bar */}
            <div className="h-10 w-full bg-gray-200 rounded-md" />

            {/* Tasks Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="space-y-3">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-6 bg-gray-200 rounded-lg"
                    >
                      <div className="h-5 w-2/3 bg-gray-300 rounded" />
                      <div className="h-5 w-1/6 bg-gray-300 rounded" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPageSkeleton;
