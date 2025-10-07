import * as React from 'react';
import Skeleton from './Skeleton';

// Interface to allow rendering multiple skeletons easily
interface CardSkeletonProps {
  count?: number;
}

/**
 * Component that mimics the structure of a single card.
 * It copies the structural classes (padding, borders, shadow)
 * from your Card.tsx and uses Skeletons for content.
 */
const SingleCardSkeleton: React.FC = () => {
  return (
    // 1. MIRROR OUTER CARD CONTAINER
    // Classes: bg-white rounded-lg shadow-sm border border-gray-200
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      
      {/* 2. MIRROR HEADER SECTION */}
      {/* Classes: p-4 border-b border-gray-200 */}
      <div className="p-4 border-b border-gray-200">
        
        {/* 3. MIMIC H2 TITLE */}
        {/* Title is text-lg font-semibold, so we use a proportional height/width. */}
        <Skeleton className="h-6 w-3/5" /> 
      </div>
      
      {/* 4. MIRROR BODY SECTION */}
      {/* Classes: p-4 */}
      <div className="p-4">
        {/* Placeholder Content Lines (mimicking the children content) */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};

/**
 * Renders a list of card skeletons.
 */
const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SingleCardSkeleton key={index} />
      ))}
    </>
  );
};

export default CardSkeleton;