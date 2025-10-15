// RecordsListSkeletonLoader.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton Card for the grid view.
 * Mimics the structure of an individual Crop/Livestock card.
 */
const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
    {/* Image Placeholder (h-48) */}
    <SkeletonBlock className="w-full h-48" />

    <div className="relative p-4">
      {/* Health Status Badge Placeholder */}
      <SkeletonBlock className="absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded-full h-5 w-16" />

      {/* Title */}
      <SkeletonBlock className="h-6 w-3/4 rounded-md mb-2" />

      {/* Subtitle/Location/Animals */}
      <SkeletonBlock className="h-4 w-1/2 rounded-md mb-4" />

      {/* Detail Section (Growth/Age/Checkup) */}
      <div className="space-y-2 pb-4">
        {/* Detail Line 1 */}
        <SkeletonBlock className="h-3 w-5/6 rounded-sm" />
        {/* Detail Line 2 (Progress Bar placeholder) */}
        <SkeletonBlock className="h-2 w-full rounded-full" />
        {/* Detail Line 3 (Date/Last Checkup) */}
        <SkeletonBlock className="h-3 w-2/3 rounded-sm" />
      </div>

      {/* Actions (Buttons) */}
      <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
        {/* Icon Buttons */}
        <div className="flex space-x-4">
          <SkeletonBlock className="h-5 w-5 rounded-full" />
          <SkeletonBlock className="h-5 w-5 rounded-full" />
        </div>
        {/* Text Button */}
        <SkeletonBlock className="h-5 w-24 rounded-md" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton loader for the main Records List Page (Crops/Livestock).
 */
const RecordsListSkeletonLoader: React.FC = () => {
  // Use a sensible number of cards to fill the typical screen space (e.g., 6 or 9)
  const numCards = 6; 

  return (
    <div className="p-2 lg:p-6">
      {/* Tab Navigation Skeleton */}
      <div className="flex items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        <SkeletonBlock className="h-8 w-24 rounded-t-md mr-4 border-b-2 border-green-600" />
        <SkeletonBlock className="h-8 w-24 rounded-t-md" />
      </div>

      {/* Search & Action Bar Skeleton */}
      <div className="md:flex justify-between space-y-4 items-center mb-6">
        {/* Search Input */}
        <SkeletonBlock className="w-64 h-10 rounded-md" />
        {/* Filter/Add Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <SkeletonBlock className="h-10 w-24 rounded-md" />
          <SkeletonBlock className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Records Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: numCards }).map((_, i) => (
          <CardSkeleton key={`skeleton-card-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default RecordsListSkeletonLoader;