// EquipmentSyncSkeletonLoader.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * It uses the Tailwind 'animate-pulse' utility.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton for the Card component that contains selectable options (Equipment/Sync Method).
 * It mimics a title followed by a grid of buttons.
 */
const OptionsCardSkeleton: React.FC<{ numItems: number; gridCols: string }> = ({
  numItems,
  gridCols,
}) => (
  <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
    {/* Card Title Placeholder */}
    <SkeletonBlock className="h-6 w-1/3 rounded-md mb-2" />

    {/* Grid of Option Buttons */}
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: numItems }).map((_, i) => (
        <div
          key={`opt-${i}`}
          className="flex flex-col items-start p-4 border rounded-lg bg-gray-50"
        >
          {/* Icon Placeholder */}
          <SkeletonBlock className="h-6 w-6 rounded-md mb-2" />
          {/* Title Placeholder */}
          <SkeletonBlock className="h-4 w-3/4 rounded-sm mb-1" />
          {/* Description Placeholder */}
          <SkeletonBlock className="h-3 w-full rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for the Discovered Devices list on the right-hand side.
 */
const DiscoveredDevicesSkeleton: React.FC = () => {
  const numDevices = 4; // Mimic a few devices

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Card Header Placeholder */}
      <SkeletonBlock className="h-6 w-3/5 rounded-md mb-6" />

      {/* List of Devices */}
      <div className="space-y-3">
        {Array.from({ length: numDevices }).map((_, i) => (
          <div
            key={`device-${i}`}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {/* Icon Placeholder */}
              <SkeletonBlock className="h-5 w-5 rounded-full" />
              <div>
                {/* Device Name */}
                <SkeletonBlock className="h-4 w-24 rounded-sm mb-1" />
                {/* Distance/Signal */}
                <div className="flex items-center space-x-1">
                  <SkeletonBlock className="h-3 w-3 rounded-full" />
                  <SkeletonBlock className="h-3 w-12 rounded-sm" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Status/Connect Button */}
              <SkeletonBlock className="h-4 w-12 rounded-sm" />
              <SkeletonBlock className="h-7 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Skeleton Loader for the Farm Equipment Sync Page.
 */
const EquipmentSyncSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-0 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6">
          {/* Main Title */}
          <SkeletonBlock className="h-8 w-64 rounded-md mb-2" />
          {/* Subtitle */}
          <SkeletonBlock className="h-4 w-96 rounded-sm" />
        </div>

        {/* Main Grid Layout (1 large column, 1 small column) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 md:gap-6">
          {/* Left/Main Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Choose Equipment Type Card (2 items in a 2-col grid) */}
            <OptionsCardSkeleton numItems={2} gridCols="grid-cols-2" />

            {/* Select Sync Method Card (3 items in a 3-col grid) */}
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
                {/* Card Title Placeholder */}
                <SkeletonBlock className="h-6 w-1/3 rounded-md mb-2" />
                <div className={`grid md:grid-cols-3 gap-4`}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`sync-opt-${i}`} className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                            {/* Icon Placeholder */}
                            <SkeletonBlock className="h-6 w-6 rounded-md mb-2" />
                            {/* Title Placeholder */}
                            <SkeletonBlock className="h-4 w-4/5 rounded-sm mb-1" />
                            {/* Description Placeholder */}
                            <SkeletonBlock className="h-3 w-full rounded-sm" />
                        </div>
                    ))}
                </div>
                {/* Start Syncing Button */}
                <SkeletonBlock className="h-10 w-36 rounded-md m-auto lg:ml-0 mt-6" />
            </div>
            
          </div>

          {/* Right Column (Discovered Devices Card) */}
          <div className="lg:col-span-1">
            <DiscoveredDevicesSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSyncSkeletonLoader;