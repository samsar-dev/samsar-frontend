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
         label:
            "👤 " +
            (isViewingOtherProfile
               ? t("profile.viewing", { username: "User" })
               : t("profile.info")),
      },
      {
         id: "listings",
         path: isViewingOtherProfile
            ? `/profile/${userId}/listings`
            : "/profile/listings",
         label: "📂 " + t("profile.my_listings"),
      },
   ];

   // Only show password tab for own profile
   if (!isViewingOtherProfile) {
      tabs.push({
         id: "password",
         path: "/profile/password",
         label: "🔒 " + t("profile.change_password"),
      });
   }

   const handleTabClick = (path: string) => {
      navigate(path);
   };

   return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex flex-col space-y-4">
            <div className="flex space-x-4 border-b dark:border-gray-700">
               {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => handleTabClick(tab.path)}
                     className={`py-2 px-4 ${
                        currentPath === tab.path
                           ? "border-b-2 border-primary text-primary"
                           : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
            <div className="py-4">
               <Outlet />
            </div>
         </div>
      </div>
   );
};
