import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import type { UserProfile } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

interface PublicUserProfile {
   id: string;
   username: string;
   email: string;
   bio?: string;
   profilePicture?: string;
   listings?: number;
}

interface UserProfileResponse {
   id: string;
   username: string;
   email: string;
   bio?: string;
   profilePicture?: string;
   listings?: Array<any>;
}

interface FormData {
   username: string;
   email: string;
   bio?: string;
}

const PublicProfileInfo = () => {
   const { t } = useTranslation();
   const { user } = useAuth();
   const { userId } = useParams();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string>("");
   const [profile, setProfile] = useState<PublicUserProfile | null>(null);
   const [formData, setFormData] = useState<FormData>({
      username: "",
      email: "",
      bio: "",
   });
   const [avatar, setAvatar] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            setLoading(true);
            // If no userId is provided or it matches current user, show current user's profile
            if (!userId || (user && userId === user.id)) {
               if (!user) {
                  throw new Error("User not found");
               }
               setProfile({
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  bio: (user as UserProfile)?.bio || "",
                  profilePicture: user.profilePicture || undefined,
               });
               setFormData({
                  username: user.username,
                  email: user.email,
                  bio: (user as UserProfile)?.bio || "",
               });
               setAvatarPreview(user.profilePicture);
            } else {
               // Fetch other user's profile
               const response = await UserAPI.getProfile(userId);
               const userData = response.data as UserProfileResponse;
               if (!userData) {
                  throw new Error("User not found");
               }
               setProfile({
                  id: userData.id,
                  username: userData.username,
                  email: userData.email,
                  bio: userData.bio || "",
                  profilePicture: userData.profilePicture,
                  listings: userData.listings?.length || 0,
               });
            }
         } catch (err) {
            setError(t("profile.load_error"));
            toast.error(t("profile.load_error"));
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [userId, user, t]);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setAvatar(file);
         setAvatarPreview(URL.createObjectURL(file));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
         const formDataToSend = new FormData();
         formDataToSend.append("username", formData.username);
         formDataToSend.append("email", formData.email);
         if (formData.bio) formDataToSend.append("bio", formData.bio);
         if (avatar) formDataToSend.append("profilePicture", avatar);

         const response = await UserAPI.updateProfile(formDataToSend);
         if (response.data) {
            toast.success(t("profile.updated"));
         }
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : t("profile.update_error");
         setError(errorMessage);
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return <LoadingSpinner />;
   }

   if (error || !profile) {
      return <div className="text-red-500">{error}</div>;
   }

   return (
      <div>
         {user && userId === user.id ? (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="flex items-center space-x-6">
                  <div className="relative">
                     <img
                        src={avatarPreview || "/default-avatar.png"}
                        alt={formData.username}
                        className="w-24 h-24 rounded-full object-cover"
                     />
                     <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600"
                     >
                        <input
                           id="avatar-upload"
                           type="file"
                           className="hidden"
                           accept="image/*"
                           onChange={handleAvatarChange}
                        />
                        <svg
                           className="w-4 h-4"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                           />
                        </svg>
                     </label>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                     >
                        {t("profile.username")}
                     </label>
                     <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     />
                  </div>

                  <div>
                     <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                     >
                        {t("profile.email")}
                     </label>
                     <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     />
                  </div>

                  <div>
                     <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                     >
                        {t("profile.bio")}
                     </label>
                     <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     />
                  </div>
               </div>

               <div className="flex justify-end">
                  <button
                     type="submit"
                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                     {t("profile.save_changes")}
                  </button>
               </div>
            </form>
         ) : (
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
                        <span className="text-2xl">
                           {profile.username[0].toUpperCase()}
                        </span>
                     </div>
                  )}
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.username}
                     </h2>
                     {profile.listings !== undefined && (
                        <p className="text-gray-600 dark:text-gray-300">
                           {t("profile.total_listings", {
                              count: profile.listings,
                           })}
                        </p>
                     )}
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("profile.email")}
                     </label>
                     <p className="mt-1 text-gray-900 dark:text-white">
                        {profile.email}
                     </p>
                  </div>

                  {profile.bio && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           {t("profile.bio")}
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                           {profile.bio}
                        </p>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export { PublicProfileInfo };
export default PublicProfileInfo;
