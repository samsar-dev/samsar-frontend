import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import type { UserProfile } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-toastify";

interface FormData {
  username: string;
  email: string;
  bio?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;
}

const ProfileInfo = () => {
  const { t } = useTranslation();
  const { user, updateAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined,
  );

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: (user as unknown as UserProfile)?.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        street: user.street || "",
        city: user.city || "",
      });
      // Always set the avatar preview from the user's profile picture
      if (user.profilePicture) {
        setAvatarPreview(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      if (formData.dateOfBirth) {
        formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      }
      if (formData.street) {
        formDataToSend.append("street", formData.street);
      }
      if (formData.city) {
        formDataToSend.append("city", formData.city);
      }
      if (avatar) {
        formDataToSend.append("profilePicture", avatar);
      }

      const response = await UserAPI.updateProfile(formDataToSend);
      if (response.success && response.data) {
        // Update the user data in the auth context
        updateAuthUser(response.data);
        // Update the avatar preview with the new profile picture URL
        if (response.data.profilePicture) {
          setAvatarPreview(response.data.profilePicture);
        }
        toast.success(t("profile.profile_updated"));
      } else {
        throw new Error(t("profile.profile_error"));
      }
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

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t("profile.loading")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow space-y-6"
    >
      <div className="flex flex-col items-center space-y-4 mb-6">
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
            {t("profile.name")}
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

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("profile.date of birth")}
          </label>
          <input
            type="text"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="street"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("profile.street")}
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("profile.city")}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div></div>
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
