import { lazy } from "react";
import { RouteObject, Outlet } from "react-router-dom";
import PrivateRoute from "@/components/auth/AuthRoute";

// Lazy load profile components
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const ProfileInfo = lazy(() => import("@/components/profile/ProfileInfo"));
const SavedListings = lazy(() => import("@/components/profile/SavedListings"));
const MyListings = lazy(() => import("@/components/profile/MyListings"));
const ChangePassword = lazy(() => import("@/components/profile/ChangePassword"));
const Messages = lazy(() => import("@/pages/Messages"));
const Settings = lazy(() => import("@/pages/Settings"));

const profileRoutes: RouteObject[] = [
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Outlet />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
      {
        path: "info",
        element: <ProfileInfo />,
      },
      {
        path: "saved",
        element: <SavedListings />,
      },
      {
        path: "listings",
        element: <MyListings />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/user/:id",
    element: <UserProfile />,
  },
];

export default profileRoutes;
