import { motion } from "framer-motion";

const SkeletonListingCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse"
  >
    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
    <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4" />
  </motion.div>
);

export const SkeletonListingGrid = ({ count = 8 }: { count?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonListingCard key={idx} />
    ))}
  </motion.div>
);

export default SkeletonListingGrid;
