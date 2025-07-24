import { useTranslation } from "react-i18next";
import {
  useNavigate,
  useLocation,
  useParams,
  Routes,
  Route,
} from "react-router-dom";
import { PublicProfileInfo } from "@/components/profile";
import { lazy, Suspense } from "react";

const MyListings = lazy(() => import("@/components/profile/MyListings"));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const ChangePassword = lazy(() => import("@/components/profile/ChangePassword"));
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
              {t("profile")}
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const isActive =
                  currentPath === tab.path ||
                  (tab.path !== "/profile" && currentPath.startsWith(tab.path));

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
                        <Suspense
              fallback={
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <Routes>
                <Route index element={<ProfileInfo />} />
                <Route path="listings" element={<MyListings />} />
                <Route path="password" element={<ChangePassword />} />
                <Route path=":userId" element={<PublicProfileInfo />} />
                <Route
                  path=":userId/listings"
                  element={<PublicProfileInfo showListings />}
                />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
