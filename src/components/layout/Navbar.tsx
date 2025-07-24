import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks";
import { useUI } from "@/contexts/UIContext";
import { Tooltip } from "@/components/ui/tooltip";
import { SearchBar } from "@/components/search/SearchBar";
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
  FaEnvelope,
  FaHeart,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  // --- Added for category search ---
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  // --- END ---

  const { t, i18n, ready } = useTranslation();

  // Detect RTL based on language, default to false if i18n not ready
  const isRTL = ready && (i18n.language === "ar" || (i18n.language && i18n.language.startsWith("ar-")));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showListingsMenu, setShowListingsMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu") && !target.closest(".listings-menu")) {
      setShowProfileMenu(false);
      setShowListingsMenu(false);
    }
  }, []);

  // Add click outside listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Close dropdowns on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setShowListingsMenu(false);
  }, [location.pathname]);

  const handleSearch = (
    query: string,
    category?: string,
    subcategory?: string,
  ) => {
    if (!query.trim()) return; // Only search if query is not empty
    let searchUrl = `/search?q=${encodeURIComponent(query.trim())}`;
    if (category && category !== "all") {
      searchUrl += `&category=${encodeURIComponent(category)}`;
    }
    if (subcategory) {
      searchUrl += `&subcategory=${encodeURIComponent(subcategory)}`;
    }
    navigate(searchUrl);
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

  // Memoize toggle functions
  const toggleProfileMenu = useCallback(() => {
    setShowProfileMenu(prev => {
      if (!prev && showListingsMenu) {
        setShowListingsMenu(false);
      }
      return !prev;
    });
  }, [showListingsMenu]);

  const toggleListingsMenu = useCallback(() => {
    setShowListingsMenu(prev => {
      if (!prev && showProfileMenu) {
        setShowProfileMenu(false);
      }
      return !prev;
    });
  }, [showProfileMenu]);

  // Memoize dropdown classes
  const dropdownClasses = useMemo(() => ({
    base: "absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-all duration-200",
    active: "transform opacity-100 scale-100",
    inactive: "transform opacity-0 scale-95 pointer-events-none"
  }), []);

  // Memoize dropdown menu items to prevent unnecessary re-renders
  const ListingsMenu = memo(() => (
    <div
      className={`${dropdownClasses.base} ${
        showListingsMenu ? dropdownClasses.active : dropdownClasses.inactive
      }`}
    >
      <Link
        to="/listings/create"
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaPlus />
        {t("navigation.create_listing")}
      </Link>
      <Link
        to="/profile/listings"
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaFileAlt />
        {t("navigation.my_listings")}
      </Link>
      <Link
        to="/saved"
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaHeart className="text-red-500" />
        {t("navigation.saved_listings")}
      </Link>
    </div>
  ));

  const ProfileMenu = memo(({ onLogout, isLoggingOut }: { onLogout: () => void, isLoggingOut: boolean }) => (
    <div
      className={`${dropdownClasses.base} ${
        showProfileMenu ? dropdownClasses.active : dropdownClasses.inactive
      }`}
    >
      <Link
        to="/profile"
        onClick={() => setShowProfileMenu(false)}
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaUser />
        {t("navigation.profile")}
      </Link>
      <Link
        to="/settings"
        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <FaCog />
        {t("navigation.settings")}
      </Link>
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        {isLoggingOut ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaSignOutAlt />
        )}
        {isLoggingOut ? t("loggingOut") : t("logout")}
      </button>
    </div>
  ));

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start group">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                SAMSAR
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">
                MARKETPLACE
              </span>
            </Link>
            <div className="hidden md:flex md:ml-6 space-x-4">
              <Link
                to="/vehicles"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
              >
                {t("navigation.vehicles")}
              </Link>
              <Link
                to="/realestate"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
              >
                {t("navigation.real_estate")}
              </Link>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center">
            <div className="w-full">
              <div className="flex gap-2 items-center w-full">
                {/* Category Dropdown */}
                <div className="relative">
                  <label htmlFor="category-select" className="sr-only">
                    {t("selectCategory")}
                  </label>
                  <select
                    id="category-select"
                    className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory("");
                    }}
                    aria-label={t("selectCategory")}
                  >
                    <option value="all">{t("all")}</option>
                    <option value="vehicles">{t("navigation.vehicles")}</option>
                    <option value="realEstate">
                      {t("navigation.real_estate")}
                    </option>
                  </select>
                </div>

                {/* Subcategory Dropdown (conditional) */}
                {selectedCategory === "vehicles" && (
                  <div className="relative">
                    <label
                      htmlFor="vehicles-subcategory-select"
                      className="sr-only"
                    >
                      {t("selectVehicleType")}
                    </label>
                    <select
                      id="vehicles-subcategory-select"
                      className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      aria-label={t("selectVehicleType")}
                    >
                      <option value="">All Types</option>
                      <option value="CAR">Car</option>
                      <option value="TRUCK">Truck</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="RV">RV</option>
                      <option value="BUS">Bus</option>
                      <option value="VAN">Van</option>
                      <option value="TRACTOR">Tractor</option>
                      <option value="CONSTRUCTION">Construction</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                )}
                {selectedCategory === "realEstate" && (
                  <div className="relative">
                    <label
                      htmlFor="realestate-subcategory-select"
                      className="sr-only"
                    >
                      {t("selectPropertyType")}
                    </label>
                    <select
                      id="realestate-subcategory-select"
                      className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      aria-label={t("selectPropertyType")}
                    >
                      <option value="">All Types</option>
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="CONDO">Condo</option>
                      <option value="LAND">Land</option>
                      <option value="COMMERCIAL">Commercial</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                )}

                <div className="flex-1">
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder={t("search")}
                    category={selectedCategory}
                    subcategory={selectedSubcategory}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div
            className={`flex items-center ${isRTL ? "flex-row-reverse" : "flex-row"} space-x-4 sm:space-x-4`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center w-8 h-8">
                <FaSpinner className="animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                {/* Listings Menu */}
                {/* Listings Menu */}
                <div className="relative listings-menu">
                  <Tooltip content="Listings" position="bottom">
                    <button
                      onClick={toggleListingsMenu}
                      className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      aria-label={t("listings")}
                      aria-expanded={showListingsMenu}
                      aria-haspopup="true"
                    >
                      <FaList className="h-5 w-5 mx-1 sm:mx-0" />
                    </button>
                  </Tooltip>
                  <ListingsMenu />
                </div>

                {/* Notifications */}
                <Tooltip content={t("navigation.notifications")} position="bottom">
                  <div>
                    <NotificationBell />
                  </div>
                </Tooltip>

                {/* Messages */}
                <Tooltip content={t("navigation.messages")} position="bottom">
                  <Link
                    to="/messages"
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    aria-label={t("messages")}
                  >
                    <FaEnvelope className="h-5 w-5 mx-1 sm:mx-0" />
                  </Link>
                </Tooltip>

                {/* Profile Menu */}
                <div className="relative profile-menu">
                  <Tooltip content={user.name || user.email} position="bottom">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center focus:outline-none"
                      aria-label={t("profileMenu")}
                      aria-expanded={showProfileMenu}
                      aria-haspopup="true"
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
                  <ProfileMenu onLogout={handleLogout} isLoggingOut={isLoggingOut} />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {t("auth.login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {t("auth.register")}
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-label={
                theme === "dark"
                  ? t("switchToLightMode")
                  : t("switchToDarkMode")
              }
            >
              {theme === "dark" ? (
                <FaSun className="h-5 w-5" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
