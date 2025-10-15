// DashboardHubSkeleton.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Placeholder skeleton for the main content area (where ActiveComponent renders).
 * This should be replaced by a more specific skeleton (e.g., MetricsSkeleton)
 * if you know which tab is active on initial load.
 */
const ContentPlaceholderSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Large Card/Chart Placeholder */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={`metric-${i}`} className="h-28 w-full rounded-xl" />
        ))}
    </div>
    
    {/* Data Table/List Placeholder */}
    <SkeletonBlock className="h-6 w-40 rounded-md" />
    <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`list-item-${i}`} className="flex justify-between items-center py-2 border-b last:border-b-0">
          <SkeletonBlock className="h-4 w-1/3 rounded-sm" />
          <SkeletonBlock className="h-4 w-1/5 rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton loader for the main Tabbed Dashboard/Hub page.
 */
const DashboardHubSkeleton: React.FC = () => {
  // Assuming a typical setup of 4 tabs based on common dashboard layouts
  const numTabs = 4;

  return (
    <div className="p-0 md:p-6 bg-white">
      {/* Header/Greeting Area Skeleton */}
      <div>
        {/* "Hi Farmer, here's is your farm health's today" */}
        <SkeletonBlock className="h-8 w-72 rounded-md mb-3" /> 
        {/* Date */}
        <SkeletonBlock className="h-4 w-40 rounded-sm mb-6" />
      </div>
      
      {/* Tab Navigation Skeleton */}
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 mt-2">
        {Array.from({ length: numTabs }).map((_, i) => (
          <div key={`tab-${i}`} className="px-1 mr-8 py-3">
            {/* Tab text and icon placeholder */}
            <SkeletonBlock className={`h-6 rounded-md ${i === 0 ? 'w-24 border-b-2 border-green-600' : 'w-20'}`} />
          </div>
        ))}
      </div>

      {/* Render the Active Component Skeleton (Placeholder) */}
      <div className="mt-4">
        <ContentPlaceholderSkeleton />
      </div>
    </div>
  );
};

export default DashboardHubSkeleton;