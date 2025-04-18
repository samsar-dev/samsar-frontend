import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaEye, FaEdit } from "react-icons/fa";

const ListingSuccess = () => {
  const location = useLocation();
  const listingId = location.state?.listingId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto mt-16 text-center space-y-6"
    >
      <div className="text-5xl text-green-500">
        🎉
      </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Your listing was successfully uploaded!
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        What would you like to do next?
      </p>

      <div className="flex justify-center gap-4">
        <Link
          to={`/listings/${listingId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaEye />
          View Listing
        </Link>
        <Link
          to={`/listings/edit/${listingId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <FaEdit />
          Edit Listing
        </Link>
      </div>
    </motion.div>
  );
};

export default ListingSuccess;
