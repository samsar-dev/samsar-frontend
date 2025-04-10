import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import { useParams, Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  listings?: Array<any>;
}

export const UserProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<UserProfileData | null>(null);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-2xl">{profile.username[0].toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.username}
            </h1>
            {profile.listings && (
              <p className="text-gray-600 dark:text-gray-300">
                {t("profile.total_listings", { count: profile.listings.length })}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("profile.email")}
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
          </div>

          {profile.bio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile.bio")}
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* User's Listings Section */}
        {profile.listings && profile.listings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t("profile.my_listings")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add listing cards here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
