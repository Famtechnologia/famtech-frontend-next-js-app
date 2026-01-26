// SettingsSkeletonLoader.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton for a single detail row (like email, phone, farm size).
 */
const DetailRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-4">
      {/* Icon Placeholder */}
      <SkeletonBlock className="h-10 w-10 rounded-full" />
      <div>
        {/* Title Placeholder */}
        <SkeletonBlock className="h-4 w-32 rounded-sm mb-1" />
        {/* Value Placeholder */}
        <SkeletonBlock className="h-4 w-48 rounded-sm" />
      </div>
    </div>
    {/* Edit/Change Button Placeholder */}
    <SkeletonBlock className="h-8 w-16 rounded-lg" />
  </div>
);

/**
 * Skeleton for an entire section card (e.g., Account Details or Owner Profile).
 * @param titleWidth - Tailwind class for the title block width.
 * @param numRows - Number of detail rows to render inside the card.
 * @param showButton - Whether to show the edit button on the right side of the main card's title section (like in Account Details)
 */
const SectionCardSkeleton: React.FC<{ titleWidth: string; numRows: number; showButton?: boolean }> = ({ 
    titleWidth, 
    numRows,
    showButton = false
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    {/* Card Header (Title and Subtitle) */}
    <div className={`p-6 border-b border-gray-200 ${showButton ? 'flex items-center justify-between' : ''}`}>
        <div className="space-y-1">
            {/* Title */}
            <SkeletonBlock className={`h-6 ${titleWidth} rounded-md`} />
            {/* Subtitle */}
            <SkeletonBlock className="h-4 w-5/6 rounded-sm" />
        </div>
        {showButton && (
            <SkeletonBlock className="h-10 w-20 rounded-lg" />
        )}
    </div>

    {/* Details List */}
    <div className="px-2 py-4 md:p-6 space-y-4">
      {Array.from({ length: numRows }).map((_, i) => (
        <DetailRowSkeleton key={`row-${i}`} />
      ))}
    </div>
  </div>
);

/**
 * Main Skeleton Loader for the Settings Page.
 */
const SettingsSkeletonLoader: React.FC = () => {
  return (
    <div className="md:p-8 space-y-8 bg-gray-50 min-h-screen">
      
      {/* Global Header Skeleton */}
      <div className="space-y-2">
        {/* Main Title: "Settings" */}
        <SkeletonBlock className="h-9 w-40 rounded-md" /> 
        {/* Subtitle: "Personalize your account" */}
        <SkeletonBlock className="h-4 w-48 rounded-sm" />
      </div>

      {/* --- Account Details Section --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="space-y-1">
                {/* Title */}
                <SkeletonBlock className="h-6 w-40 rounded-md" />
                {/* Subtitle */}
                <SkeletonBlock className="h-4 w-60 rounded-sm" />
            </div>
            {/* Edit Button for Account Details */}
            <SkeletonBlock className="h-10 w-16 rounded-lg bg-green-200" />
        </div>
        
        {/* Email Display Row */}
        <div className="flex items-center justify-start px-2 py-4 md:p-6">
             <div className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Email Icon Placeholder */}
                    <SkeletonBlock className="h-10 w-10 rounded-full" />
                    <div>
                        {/* Email Title */}
                        <SkeletonBlock className="h-4 w-32 rounded-sm mb-1" />
                        {/* Email Address Value */}
                        <SkeletonBlock className="h-4 w-56 rounded-sm" />
                    </div>
                </div>
            </div>
        </div>
      </div>
      

      {/* --- Owner Profile Section --- */}
      <SectionCardSkeleton 
        titleWidth="w-32" 
        numRows={3} // Farm Owner, Farm Location, Phone Number
      />

      {/* --- Farm Information Section --- */}
      <SectionCardSkeleton 
        titleWidth="w-40" 
        numRows={2} // Farm Type, Farm Size
      />
    </div>
  );
};

export default SettingsSkeletonLoader;