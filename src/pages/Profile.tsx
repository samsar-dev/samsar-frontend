import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  MyListings,
  ProfileInfo,
  ChangePassword,
  PublicProfileInfo,
} from "@/components/profile";
import { useAuth } from "@/hooks/useAuth";

interface ProfileProps {
  isRTL?: boolean;
}

interface TabItem {
  id: string;
  path: string;
  label: string;
  icon: string;
}

export const Profile: React.FC<ProfileProps> = ({ isRTL = false }) => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isViewingOtherProfile = userId && userId !== user?.id;

  const tabs: TabItem[] = [
    {
      id: "profile",
      path: isViewingOtherProfile ? `/profile/${userId}` : "/profile",
      label: isViewingOtherProfile
        ? t("viewing", { username: "User" })
        : t("info"),
      icon: "👤",
    },
    {
      id: "listings",
      path: isViewingOtherProfile
        ? `/profile/${userId}/listings`
        : "/profile/listings",
      label: t("my_listings"),
      icon: "📂",
    },
  ];

  // Only show password tab for own profile
  if (!isViewingOtherProfile) {
    tabs.push({
      id: "password",
      path: "/profile/password",
      label: t("change_password"),
      icon: "🔒",
    });
  }

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="md:w-64 bg-gray-50 dark:bg-gray-900 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {t("title")}
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPath === tab.path
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
