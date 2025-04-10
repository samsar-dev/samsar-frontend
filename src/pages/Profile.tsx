import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { MyListings, ProfileInfo, ChangePassword, PublicProfileInfo } from "@/components/profile";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileProps {
  isRTL?: boolean;
}

interface TabItem {
  id: string;
  path: string;
  label: string;
  component: JSX.Element;
}

export const Profile: React.FC<ProfileProps> = ({ isRTL = false }) => {
  const { t } = useTranslation();
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
      label: "👤 " + (isViewingOtherProfile 
        ? t("profile.viewing", { username: "User" }) 
        : t("profile.info")),
      component: isViewingOtherProfile 
        ? <PublicProfileInfo /> 
        : <ProfileInfo />,
    },
    {
      id: "listings",
      path: isViewingOtherProfile ? `/profile/${userId}/listings` : "/profile/listings",
      label: "📂 " + t("profile.my_listings"),
      component: <MyListings userId={userId} />,
    },
  ];

  // Only show password tab for own profile
  if (!isViewingOtherProfile) {
    tabs.push({
      id: "password",
      path: "/profile/password",
      label: "🔒 " + t("profile.change_password"),
      component: <ChangePassword />,
    });
  }

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isRTL ? "rtl" : "ltr"}`}>
      <h1 className="text-3xl font-bold mb-6">
        {isViewingOtherProfile 
          ? t("profile.viewing", { username: "User" })
          : t("profile.title")}
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`${
                  currentPath === tab.path
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {tabs.find((tab) => tab.path === currentPath)?.component || tabs[0].component}
        </div>
      </div>

      <Outlet />
    </div>
  );
};