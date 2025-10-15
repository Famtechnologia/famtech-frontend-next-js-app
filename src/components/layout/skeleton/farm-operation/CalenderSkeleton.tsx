// CalendarSkeletonLoader.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton loader for the main Calendar/Task Management Page.
 * It mimics the two-column layout: Sidebar and Main Calendar Grid.
 */
const CalendarSkeletonLoader: React.FC = () => {
  // --- Sidebar Skeleton Structure ---
  const SidebarSkeleton = (
    <div className="w-full md:w-64 space-y-6">
      {/* Calendar Widget Skeleton */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        {/* Month/Year Header */}
        <div className="flex items-center justify-between mb-4">
          <SkeletonBlock className="h-6 w-24 rounded-md" />
          <div className="flex space-x-2">
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <SkeletonBlock className="h-8 w-8 rounded-full" />
          </div>
        </div>
        {/* Days of Week (Fixed) */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={`day-${i}`} className="h-4 w-4 mx-auto rounded-sm" />
          ))}
        </div>
        {/* Calendar Day Grid (42 cells) */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: 42 }).map((_, i) => (
            <SkeletonBlock key={`cell-${i}`} className="h-6 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* View Options Skeleton */}
      <div>
        <SkeletonBlock className="h-4 w-32 rounded-sm mb-3" />
        <div className="flex space-x-2">
          <SkeletonBlock className="h-10 w-20 rounded-md" />
          <SkeletonBlock className="h-10 w-20 rounded-md" />
        </div>
      </div>

      {/* Filter Events Skeleton (4 items) */}
      <div>
        <SkeletonBlock className="h-4 w-36 rounded-sm mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`filter-${i}`} className="flex items-center space-x-2">
              <SkeletonBlock className="h-4 w-4 rounded-sm" />
              <SkeletonBlock className="h-4 w-24 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend Skeleton (5 items) */}
      <div>
        <SkeletonBlock className="h-4 w-24 rounded-sm mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`legend-${i}`} className="flex items-center space-x-2">
              <SkeletonBlock className="h-3 w-3 rounded-full" />
              <SkeletonBlock className="h-4 w-20 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Main Calendar Grid Skeleton Structure ---
  const MainContentSkeleton = (
    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      {/* Header/Controls */}
      <div className="flex justify-between items-center mb-4">
        <SkeletonBlock className="h-6 w-40 rounded-md" />
        <div className="flex items-center space-x-2">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <SkeletonBlock className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Days of Week (Fixed) */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={`main-day-${i}`} className="h-4 w-6 mx-auto rounded-sm" />
        ))}
      </div>

      {/* Main Calendar Grid Cells (6 rows x 7 cols = 42 cells) */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-sm">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={`main-cell-${i}`}
            className="md:h-28 border border-gray-200 rounded-md p-2 mt-2"
          >
            {/* Day Number */}
            <SkeletonBlock className="h-4 w-4 rounded-sm float-right mb-1" />
            {/* Task Item Placeholder (1-3 lines) */}
            <div className="space-y-1 mt-6">
                <SkeletonBlock className="h-3 w-3/4 rounded-sm" />
                {i % 3 !== 0 && <SkeletonBlock className="h-3 w-2/3 rounded-sm" />}
                {i % 5 === 0 && <SkeletonBlock className="h-3 w-1/2 rounded-sm" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-2 lg::p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {SidebarSkeleton}
      {MainContentSkeleton}
    </div>
  );
};

export default CalendarSkeletonLoader;