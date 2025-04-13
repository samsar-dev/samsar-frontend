import { UserAPI } from "@/api/auth.api";
import ListingCard from "@/components/listings/details/ListingCard";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { CategoryFilter } from "@/types/listings";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaClock, FaEnvelope, FaPhone } from "react-icons/fa";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface UserProfileData {
   id: string;
   username: string;
   email: string;
   phone?: number;
   bio?: string;
   profilePicture?: string;
   location?: string;
   status?: "ONLINE" | "OFFLINE";
   createdAt?: string;
   listings?: Array<any>;
}

const categoeryFillterOptions = ["ALL", "VEHICLES", "REAL_ESTATE"];

export const UserProfile = () => {
   const { t } = useTranslation();
   const { user } = useAuth();
   const { userId } = useParams();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string>("");
   const [profile, setProfile] = useState<UserProfileData | null>(null);

   const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

   console.log(profile);

   // Redirect to profile page if trying to view own profile
   if (user && userId === user.id) {
      return <Navigate to="/profile" replace />;
   }

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            setLoading(true);
            const response = await UserAPI.getProfile(userId!);
            const userData = response.data;
            if (!userData) {
               throw new Error("User not found");
            }
            console.log(userData);
            setProfile(userData);
         } catch (err) {
            setError(t("profile.load_error"));
            toast.error(t("profile.load_error"));
         } finally {
            setLoading(false);
         }
      };

      if (userId) {
         fetchProfile();
      }
   }, [userId, t]);

   const filteredListings = profile?.listings
      ?.map((listing) => ({
         ...listing,
         images: listing?.images?.map((image) => image.url),
         category: {
            mainCategory: listing.category,
            subCategory: listing.subCategory,
         },
      }))
      ?.filter((listing) => {
         if (categoryFilter === "ALL") return true;
         if (categoryFilter === "VEHICLES")
            return listing.mainCategory === "vehicles";
         if (categoryFilter === "REAL_ESTATE")
            return listing.mainCategory === "realEstate";
         return true;
      });

   if (loading) {
      return <LoadingSpinner />;
   }

   if (error || !profile) {
      return <div className="text-red-500">{error}</div>;
   }

   return (
      <div className="max-w-7xl mx-auto px-4 py-8">
         {/* Profile Header */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900" />

            <div className="p-6 -mt-20">
               <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-start gap-4 px-4"
               >
                  {/* Profile Picture */}
                  <motion.div
                     initial={{ opacity: 0, y: 2 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2, duration: 0.3 }}
                     className="relative"
                  >
                     {profile.profilePicture ? (
                        <img
                           src={profile.profilePicture}
                           alt={profile.username}
                           className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
                        />
                     ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800">
                           <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">
                              {profile.username[0].toUpperCase()}
                           </span>
                        </div>
                     )}
                     <span className="w-fit items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-gray-800/80 text-blue-800 dark:text-blue-300 absolute top-5 -right-[74px]">
                        {profile.status === "ONLINE"
                           ? t("online")
                           : t("offline")}
                     </span>
                  </motion.div>

                  {/* Profile Info */}
                  <motion.div
                     initial={{ opacity: 0, x: 5 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2, duration: 0.3 }}
                     className="flex flex-col gap-1"
                  >
                     <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {profile?.name ? profile?.name : "UserName"}
                     </h1>
                     <div className="flex items-center gap-1 text-gray-600 text-sm dark:text-gray-400">
                        <span>
                           {profile.location ? profile.location : "Location"}
                        </span>
                     </div>
                     <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>@{profile.username}</span>
                     </div>
                  </motion.div>

                  <div>
                     {profile.email && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                           <FaEnvelope className="w-4 h-4" />
                           <span>{profile.email}</span>
                        </div>
                     )}
                     {profile.phone && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                           <FaPhone className="w-4 h-4" />
                           <span>{profile.phone}</span>
                        </div>
                     )}
                     {profile.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                           <FaClock className="w-4 h-4" />
                           <span>
                              {t("Joined")}{" "}
                              {formatDistanceToNow(
                                 new Date(profile.createdAt),
                                 {
                                    addSuffix: true,
                                 }
                              )}
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                     initial={{ opacity: 0, y: 4 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2, duration: 0.3 }}
                     className="flex gap-2"
                  >
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700"
                     >
                        Message
                     </motion.button>
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-1.5 bg-blue-600 rounded-md text-sm font-medium text-white"
                     >
                        Share profile
                     </motion.button>
                  </motion.div>
               </motion.div>

               {/* Bio */}
               {profile.bio && (
                  <div className="mt-6">
                     <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {profile.bio}
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* Listings Section */}
         {profile.listings && profile.listings.length > 0 && (
            <motion.div className="mt-8">
               <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                     {t("Posted Listings")}
                  </h2>

                  {/* Category Filters */}
                  <motion.div className="flex items-center gap-2">
                     {categoeryFillterOptions.map((filter) => (
                        <motion.div>
                           <Button
                              variant={
                                 categoryFilter === filter
                                    ? "primary"
                                    : "outline"
                              }
                              onClick={() =>
                                 setCategoryFilter(filter as CategoryFilter)
                              }
                           >
                              {filter}
                           </Button>
                        </motion.div>
                     ))}
                  </motion.div>
               </motion.div>

               {/* Listings Grid */}
               <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredListings?.map((listing, index) => (
                     <ListingCard
                        listing={listing}
                        showPrice={true}
                        showLocation={true}
                        showDate={true}
                     />
                  ))}
               </motion.div>

               {filteredListings?.length === 0 && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.2, duration: 0.3 }}
                     className="text-center py-8"
                  >
                     <p className="text-gray-500 dark:text-gray-400">
                        {t("profile.no_listings_found")}
                     </p>
                  </motion.div>
               )}
            </motion.div>
         )}
      </div>
   );
};

export default UserProfile;
