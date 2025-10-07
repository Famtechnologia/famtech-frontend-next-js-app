import * as React from 'react';
import clsx from 'clsx';

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
      className={clsx(
        // Base skeleton styles: background color and rounded corners
        'bg-gray-200 dark:bg-gray-700 rounded-md', 
        // Tailwind's built-in pulse animation
        'animate-pulse', 
        // User-provided classes for size, margin, etc.
        className
      )}
    />
  );
};

export default Skeleton;