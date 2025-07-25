import React from 'react';
import { memo } from 'react';

const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group relative ${className}`}
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-t-lg w-full animate-pulse" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse" />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 8, className = "" }: { count?: number; className?: string }) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
  >
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} />
    ))}
  </div>
);

export default memo(SkeletonGrid);
