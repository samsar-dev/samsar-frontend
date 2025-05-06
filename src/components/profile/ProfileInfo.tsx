import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import type { UserProfile } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-toastify";
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCity,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
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
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
        <FaInfoCircle className="inline-block mr-2" />
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FaUser className="inline-block mr-2" size={20} />
        {t("profile.loading")}
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t("profile.personal_information")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("profile.update_info")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-md">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt={formData.username}
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all duration-200"
            >
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <FaCamera size={16} />
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t("profile.change_photo")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaUser className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.name")}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaEnvelope className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="bio"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaInfoCircle className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.bio")}
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dateOfBirth"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaCalendarAlt className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.date of birth")}
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="street"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaMapMarkerAlt className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.street")}
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="city"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FaCity className="mr-2 text-gray-500 dark:text-gray-400" />
              {t("profile.city")}
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t("common.saving")}
              </>
            ) : (
              t("Save Changes")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
