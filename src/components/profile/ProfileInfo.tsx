import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import type { UserProfile } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";

interface FormData {
   username: string;
   email: string;
   bio?: string;
}

const ProfileInfo = () => {
   const { t } = useTranslation();
   const { user } = useAuth();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string>("");
   const [formData, setFormData] = useState<FormData>({
      username: user?.username || "",
      email: user?.email || "",
      bio: (user as UserProfile)?.bio || "",
   });
   const [avatar, setAvatar] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
      user?.profilePicture
   );

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
         if (formData.bio) {
            formDataToSend.append("bio", formData.bio);
         }
         if (avatar) {
            formDataToSend.append("profilePicture", avatar);
         }

         await UserAPI.updateProfile(formDataToSend);
         toast.success(t("profile.profile_updated"));
      } catch (err) {
         setError(t("profile.profile_error"));
         toast.error(t("profile.profile_error"));
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return <LoadingSpinner />;
   }

   if (error || !user) {
      return (
         <div className="text-center py-8 text-red-600">
            {error || t("profile.load_error")}
         </div>
      );
   }

   return (
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
   );
};

export default ProfileInfo;
