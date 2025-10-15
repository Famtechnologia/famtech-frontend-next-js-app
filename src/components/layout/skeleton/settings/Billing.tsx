// PlanAndBillingSkeletonLoader.tsx

import React from "react";

/**
 * A component to create a pulsing gray block, mimicking content loading.
 * @param className - Tailwind classes to define the shape (width/height/rounded).
 */
const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

/**
 * Skeleton for a single Plan Card.
 */
const PlanCardSkeleton: React.FC = () => (
  <div className="flex flex-col px-4 py-6 md:p-6 border border-gray-200 rounded-xl bg-white">
    {/* Plan Title and Price Section */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-start space-x-2">
        {/* Radio Button Placeholder */}
        <SkeletonBlock className="h-5 w-5 rounded-full mt-0.5" />
        {/* Plan Name Placeholder */}
        <SkeletonBlock className="h-6 w-32 rounded-md" />
      </div>
      <div className="flex-shrink-0 text-right space-y-1">
        {/* Price Placeholder */}
        <SkeletonBlock className="h-8 w-16 rounded-md" />
        {/* /month Placeholder */}
        <SkeletonBlock className="h-3 w-10 rounded-sm ml-auto" />
      </div>
    </div>

    {/* Feature List Placeholder */}
    <div className="flex-grow space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={`feature-item-${i}`} className="flex items-center list-none">
          {/* Check Icon Placeholder */}
          <SkeletonBlock className="h-4 w-4 rounded-full mr-2 flex-shrink-0" />
          {/* Feature Text Placeholder */}
          <SkeletonBlock className={`h-4 rounded-sm ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
        </li>
      ))}
    </div>
    
    {/* Annual Save Message Placeholder (optional) */}
    <SkeletonBlock className="h-4 w-40 rounded-sm mt-4" />
  </div>
);

/**
 * Main Skeleton Loader for the Plan & Billing Page.
 */
const PlanAndBillingSkeletonLoader: React.FC = () => {
  const numPlans = 3; // Typically 3 plans (e.g., Basic, Pro, Enterprise)

  return (
    <div className="min-h-screen bg-gray-100 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-8xl bg-white rounded-lg shadow-md px-4 py-8 md:p-8">
        
        {/* Header Skeleton */}
        <div className="mb-2">
          {/* Main Title: "Plan & Billing" */}
          <SkeletonBlock className="h-9 w-60 rounded-md mb-2" /> 
          {/* Subtitle/Description */}
          <SkeletonBlock className="h-5 w-3/4 rounded-sm mb-8" />
        </div>

        {/* Plan Selection Subtitle */}
        <SkeletonBlock className="h-6 w-32 rounded-md mb-6" />

        {/* Plan Cards List Skeleton */}
        <div className="flex flex-col space-y-6">
          {Array.from({ length: numPlans }).map((_, i) => (
            <PlanCardSkeleton key={`plan-skeleton-${i}`} />
          ))}
        </div>

        {/* Action Buttons Skeleton */}
        <div className="mt-8 flex justify-end space-x-4">
          {/* Cancel Button */}
          <SkeletonBlock className="h-12 w-24 rounded-md" />
          {/* Save Plan Button */}
          <SkeletonBlock className="h-12 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default PlanAndBillingSkeletonLoader;