import * as React from 'react';

// 1. Define component props with TypeScript
interface SkeletonProps {
  className?: string; // Allows customizing size, shape, etc.
}

/**
 * A basic, reusable skeleton block with Tailwind's pulse animation.
 * The size (h-*, w-*) should be passed via the className prop.
 */
const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`
      }
    />
  );
};

export default Skeleton;