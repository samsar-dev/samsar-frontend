const SkeletonListingCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group relative animate-pulse">
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-t-lg w-full" />

    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4" />
    </div>
  </div>
);

export const SkeletonListingGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonListingCard key={idx} />
    ))}
  </div>
);

export default SkeletonListingGrid;
