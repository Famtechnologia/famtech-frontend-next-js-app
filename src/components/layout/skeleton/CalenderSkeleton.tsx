"use client";

import React from "react";

const CalendarPageSkeleton = () => {
  return (
    <div className="w-full min-h-screen p-4 lg:p-6 bg-gray-50 animate-pulse space-y-6">
      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
        <div className="flex space-x-3">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* MAIN WRAPPER */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-64 space-y-6">
          {/* Mini Calendar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between mb-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-6 w-full bg-gray-200 rounded-sm"></div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CALENDAR GRID */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="flex space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`header-${i}`} className="h-4 bg-gray-200 rounded"></div>
            ))}
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={`cell-${i}`}
                className="md:h-28 h-20 border border-gray-200 rounded-md bg-gray-100"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPageSkeleton;
