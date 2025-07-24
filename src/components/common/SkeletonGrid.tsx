interface SkeletonCardProps {
  className?: string;
}



const SkeletonListingCard = ({ className = "" }: SkeletonCardProps) => (
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

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

const SkeletonListingGrid = ({ count = 8, className = "" }: SkeletonGridProps) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
  >
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonListingCard key={idx} />
    ))}
  </div>
);

export default SkeletonListingGrid;
