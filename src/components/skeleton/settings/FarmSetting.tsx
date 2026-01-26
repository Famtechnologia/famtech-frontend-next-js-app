// SettingsNavigationSkeleton.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton for a single navigable list item within a section.
 */
const NavItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-start justify-start space-x-4">
      {/* Icon Placeholder */}
      <SkeletonBlock className="h-10 w-10 rounded-full" /> 
      <div>
        {/* Label Placeholder */}
        <SkeletonBlock className="h-4 w-36 rounded-sm mb-1" />
        {/* Description Placeholder */}
        <SkeletonBlock className="h-4 w-64 rounded-sm" />
      </div>
    </div>
    {/* Action Button Placeholder */}
    <SkeletonBlock className="h-9 w-20 rounded-xl" />
  </div>
);

/**
 * Skeleton for an entire settings section card.
 * @param numItems - Number of navigation items (rows) to render inside the card.
 */
const SectionCardSkeleton: React.FC<{ numItems: number }> = ({ numItems }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    {/* Section Title Header */}
    <div className="p-6 border-b border-gray-200">
      <SkeletonBlock className="h-6 w-1/4 rounded-md" />
    </div>

    {/* Navigation Items List */}
    <div className="px-2 py-4 md:p-6 space-y-4">
      {Array.from({ length: numItems }).map((_, i) => (
        <NavItemSkeleton key={`nav-item-skeleton-${i}`} />
      ))}
    </div>
  </div>
);

/**
 * Main Skeleton Loader for the Settings Navigation Page.
 */
const SettingsNavigationSkeleton: React.FC = () => {
  // We'll mimic two distinct sections with a variable number of items
  const sections = [
    { numItems: 3 }, // E.g., Account, Profile, Notifications
    { numItems: 2 }, // E.g., Billing, Integrations
  ];

  return (
    <div className="md:p-8 space-y-8 bg-gray-50 min-h-screen">
      
      {/* Global Header Skeleton */}
      <div className="space-y-2">
        {/* Main Title: "Settings" */}
        <SkeletonBlock className="h-9 w-40 rounded-md" /> 
        {/* Subtitle: "Personalize your account" */}
        <SkeletonBlock className="h-4 w-48 rounded-sm" />
      </div>

      {/* Dynamic Sections Skeleton */}
      {sections.map((section, index) => (
        <SectionCardSkeleton key={`section-skeleton-${index}`} numItems={section.numItems} />
      ))}
      
    </div>
  );
};

export default SettingsNavigationSkeleton;