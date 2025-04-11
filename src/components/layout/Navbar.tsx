import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useUI } from "@/contexts/UIContext";
import { SearchBar, Tooltip } from "@/components/ui";
import NotificationBell from "@/components/notifications/NotificationBell";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaList,
  FaFileAlt,
  FaMoon,
  FaSun,
  FaSpinner,
  FaEnvelope
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showListingsMenu, setShowListingsMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu') && !target.closest('.listings-menu')) {
        setShowProfileMenu(false);
        setShowListingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setShowListingsMenu(false);
  }, [location.pathname]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showListingsMenu) setShowListingsMenu(false);
  };

  const toggleListingsMenu = () => {
    setShowListingsMenu(!showListingsMenu);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const dropdownClasses = "absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-all duration-200";
  const activeDropdownClasses = "transform opacity-100 scale-100";
  const inactiveDropdownClasses = "transform opacity-0 scale-95 pointer-events-none";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t("navigation.home")}
            </Link>
            <div className="hidden md:flex md:ml-6 space-x-4">
              <Link
                to="/vehicles"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
              >
                {t('navigation.vehicles')}
              </Link>
              <Link
                to="/properties"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
              >
                {t('navigation.properties')}
              </Link>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center">
            <div className="w-full">
              <SearchBar
                onSearch={handleSearch}
                placeholder={t("common.search")}
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center justify-center w-8 h-8">
                <FaSpinner className="animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                {/* Listings Menu */}
                <div className="relative listings-menu">
                  <Tooltip content={t("navigation.listings")} position="bottom">
                    <button
                      onClick={toggleListingsMenu}
                      className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <FaList className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  <div
                    className={`${dropdownClasses} ${
                      showListingsMenu ? activeDropdownClasses : inactiveDropdownClasses
                    }`}
                  >
                    <Link
                      to="/listings/create"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaPlus className="mr-3" />
                      {t("navigation.create_listing")}
                    </Link>
                    <Link
                      to="/profile/listings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaFileAlt className="mr-3" />
                      {t("My Listings")}
                    </Link>
                  </div>
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Messages */}
                <Tooltip content={t("navigation.messages")} position="bottom">
                  <Link
                    to="/messages"
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <FaEnvelope className="h-5 w-5" />
                  </Link>
                </Tooltip>

                {/* Profile Menu */}
                <div className="relative profile-menu">
                  <Tooltip content={user.name || user.email} position="bottom">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center focus:outline-none"
                    >
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name || "Profile"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                      )}
                    </button>
                  </Tooltip>
                  <div
                    className={`${dropdownClasses} ${
                      showProfileMenu ? activeDropdownClasses : inactiveDropdownClasses
                    }`}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaUser className="mr-3" />
                      {t("navigation.profile")}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaCog className="mr-3" />
                      {t("navigation.settings")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {isLoggingOut ? (
                        <FaSpinner className="animate-spin mr-3" />
                      ) : (
                        <FaSignOutAlt className="mr-3" />
                      )}
                      {isLoggingOut ? t("auth.logging_out") : t("navigation.logout")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t("auth.login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t("auth.register")}
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {theme === "dark" ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
