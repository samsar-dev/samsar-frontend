import {
  Routes as RouterRoutes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Profile } from "@/pages/Profile";
import { UserProfile } from "@/pages/UserProfile";
import Search from "@/pages/Search";
import ListingDetails from "@/components/listings/edit/ListingDetails";
import CreateListing from "@/components/listings/create/CreateListing";
import EditListing from "@/components/listings/edit/EditListing";
// import SavedListings from "@/components/listings/edit/favorites/ListingsCollection";
import Messages from "@/pages/Messages";
import CategoryPage from "@/pages/CategoryPage";
import Settings from "@/pages/Settings";
import PrivateRoute from "@/components/auth/AuthRoute";
import { ChangePassword } from "@/components/profile";
import { MyListings } from "@/components/profile";
import SavedListings from "@/components/profile/SavedListings";

const Routes = (): JSX.Element => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/listings/:id" element={<ListingDetails />} />
      {/* Redirect /listings to home */}
      <Route path="/listings" element={<Navigate to="/" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        }
      >
        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        >
          <Route path="listings" element={<MyListings />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>

        {/* Public User Profile */}
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/profile/:userId" element={<a />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/listings/create" element={<CreateListing />} />
        <Route path="/listings/:id/edit" element={<EditListing />} />
        <Route path="/saved-listings" element={<SavedListings />} />
        <Route path="/messages" element={<Messages />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
