import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import type { BaseComponentProps } from "@/types/common";
import type { ListingCategory } from "@/types/listings.ts";
import { useUI } from "@/contexts/UIContext";

export interface Category {
  id: string;
  label: string;
  icon: string;
  path: string;
  description?: string;
  subcategories?: Category[];
  category?: ListingCategory;
}

interface CategorySwitcherProps extends BaseComponentProps {
  variant?: "horizontal" | "vertical";
  showIcons?: boolean;
  showDescription?: boolean;
  onCategoryChange?: (category: Category) => void;
}

const categories: Category[] = [
  {
    id: "vehicles",
    label: "Vehicles",
    icon: "🚗",
    path: "/category/vehicles",
    description: "Cars, motorcycles, and other vehicles",
    subcategories: [
      {
        id: "cars",
        label: "Cars",
        icon: "🚗",
        path: "/category/vehicles/cars",
      },
      {
        id: "motorcycles",
        label: "Motorcycles",
        icon: "🏍️",
        path: "/category/vehicles/motorcycles",
      },
    ],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: "🏠",
    path: "/category/real-estate",
    description: "Houses, apartments, and commercial properties",
    subcategories: [
      {
        id: "residential",
        label: "Residential",
        icon: "🏘️",
        path: "/category/real-estate/residential",
      },
      {
        id: "commercial",
        label: "Commercial",
        icon: "🏢",
        path: "/category/real-estate/commercial",
      },
    ],
  },
];

const CategorySwitcher: React.FC<CategorySwitcherProps> = ({
  variant = "horizontal",
  showIcons = true,
  showDescription = false,
  onCategoryChange,
  className,
}) => {
  const location = useLocation();
  const { theme } = useUI();

  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  const categoryStyles = useMemo(
    () => ({
      container: clsx(
        "flex",
        variant === "horizontal" ? "space-x-4" : "flex-col space-y-2",
        className,
      ),
      link: (active: boolean) =>
        clsx(
          "group inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          active
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800",
          showDescription && "flex-col items-start",
        ),
      icon: "transition-transform group-hover:scale-110",
      description: "mt-1 text-xs text-gray-500 dark:text-gray-400",
    }),
    [variant, className, showDescription, theme],
  );

  const handleCategoryClick = (category: Category) => {
    onCategoryChange?.(category);
  };

  return (
    <nav className={categoryStyles.container}>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={category.path}
          className={categoryStyles.link(isActive(category.path))}
          onClick={() => handleCategoryClick(category)}
          aria-current={isActive(category.path) ? "page" : undefined}
        >
          <div className="flex items-center">
            {showIcons && (
              <span className={categoryStyles.icon}>{category.icon}</span>
            )}
            <span className={clsx(showIcons && "ml-2")}>{category.label}</span>
          </div>
          {showDescription && category.description && (
            <span className={categoryStyles.description}>
              {category.description}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
};

export default CategorySwitcher;
