import { UserAPI } from "@/api/auth.api";
import ListingCard from "@/components/listings/details/ListingCard";
import { Button } from "@/components/ui/Button2";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import type { CategoryFilter } from "@/types/listings";
import { formatDistanceToNow } from "date-fns";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaClock } from "@react-icons/all-files/fa/FaClock";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { FaPhone } from "@react-icons/all-files/fa/FaPhone";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import UserPrivateProfile from "@/components/profile/UserPrivateProfile";

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  status?: "ONLINE" | "OFFLINE";
  createdAt?: string;
  listings?: Array<any>;
  allowMessaging?: boolean;
  listingNotifications?: boolean;
  messageNotifications?: boolean;
  loginNotifications?: boolean;
  showEmail?: boolean;
  showOnlineStatus?: boolean;
  showPhoneNumber?: boolean;
  privateProfile?: "public" | "private";
}

const categoryFilterOptions = ["ALL", "VEHICLES", "REAL_ESTATE"];

export const UserProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

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
        console.log("user data", userData);
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
      images: listing?.images?.map((image: { url: string }) => image.url),
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (profile?.privateProfile) {
    return <UserPrivateProfile />;
  }

  if (error || !profile) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"></div>
      {/* Cover with all content inside */}
      <div className="relative h-auto bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Profile Content */}
        <div className="relative z-10 px-4 sm:px-6 py-6 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out opacity-100 translate-y-0 flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 self-center sm:self-start relative transition-opacity duration-300 ease-in-out opacity-100 translate-y-0">
              <div className="flex-shrink-0 self-center sm:self-start relative">
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
                {profile.showOnlineStatus && (
                  <div className="mt-3 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-gray-800/80 text-blue-800 dark:text-blue-300 w-fit mx-auto">
                    {profile.status === "ONLINE" ? t("online") : t("offline")}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full space-y-1 transition-opacity duration-300 ease-in-out opacity-100 translate-y-0">
              <h1 className="text-xl font-semibold text-white/90">
                {profile?.username || "UserName"}
              </h1>
              <div className="text-sm text-white/80">
                {profile.location || "Location"}
              </div>
              <div className="text-sm text-white/80">@{profile.username}</div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-start gap-2 text-white text-sm transition-opacity duration-500 ease-in-out opacity-100 translate-y-0">
              {profile.email && profile.showEmail && (
                <div className="flex items-center gap-2 text-white/90">
                  <FaEnvelope className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && profile?.showPhoneNumber && (
                <div className="flex items-center gap-2 text-white/90">
                  <FaPhone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.createdAt && (
                <div className="flex items-center gap-2 text-white/80">
                  <FaClock className="w-4 h-4" />
                  <span>
                    {t("Joined")}{" "}
                    {formatDistanceToNow(new Date(profile.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto transition-opacity duration-300 ease-in-out opacity-100 translate-y-0">
              <button
                className={`group px-4 py-1.5 ${profile.allowMessaging ? "bg-white hover:bg-gray-100" : "bg-gray-300"} border border-gray-300 rounded-md text-sm font-medium text-gray-700 transition-transform duration-150 ease-in-out`}
              >
                Message
              </button>
              <button
                className="px-4 py-1.5 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-transform duration-150 ease-in-out"
              >
                Share profile
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Listings Section */}
      {profile.listings && profile.listings.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("Posted Listings")}
            </h2>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1 sm:overflow-visible">
              {categoryFilterOptions.map((filter) => (
                <div>
                  <Button
                    variant={categoryFilter === filter ? "primary" : "outline"}
                    onClick={() => setCategoryFilter(filter as CategoryFilter)}
                  >
                    {filter}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings?.map((listing) => (
              <ListingCard
                listing={listing}
                showPrice={true}
                showLocation={true}
              />
            ))}
          </div>

          {filteredListings?.length === 0 && (
            <div className="text-center py-8 transition-opacity duration-300 ease-in-out opacity-100">
              <p className="text-gray-500 dark:text-gray-400">
                {t("profile.no_listings_found")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
