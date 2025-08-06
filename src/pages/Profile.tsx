import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";

interface TabItem {
  id: string;
  path: string;
  label: string;
  icon: string;
}

export const Profile = () => {
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
      id: "mylistings",
      path: isViewingOtherProfile
        ? `/profile/${userId}/listings`
        : "/profile/mylistings",
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

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath.includes("/mylistings")) return "mylistings";
    if (currentPath.includes("/listings")) return "mylistings"; // Fallback for old URLs
    if (currentPath.includes("/change-password")) return "password";
    if (currentPath.includes("/saved")) return "saved";
    return "profile";
  };

  console.log("Rendering Profile", {
    currentPath,
    isViewingOtherProfile,
    userId,
    user: user?.id,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="md:w-64 bg-gray-50 dark:bg-gray-900 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {t("profile")}
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const isActive = tab.id === getActiveTab();
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8">
            <ErrorBoundary
              fallback={
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h3 className="text-red-800 dark:text-red-200 font-medium">
                    {t("error_occurred")}
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {t("error_loading_content")}
                  </p>
                </div>
              }
            >
              <Suspense
                fallback={
                  <div className="flex flex-col justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="mt-4 text-gray-500 dark:text-gray-400">
                      {t("loading")}...
                    </span>
                    <div className="mt-2 text-sm text-gray-400">
                      Loading profile content...
                    </div>
                  </div>
                }
              >
                <div className="h-full">
                  <Outlet />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
