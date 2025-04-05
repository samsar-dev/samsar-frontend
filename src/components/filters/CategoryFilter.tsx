import React from "react";
import { useTranslation } from "react-i18next";
import { ListingCategory } from "@/types/listings";

interface CategoryFilterProps {
  selectedCategory?: ListingCategory;
  onCategoryChange: (category: ListingCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { t } = useTranslation();

  const categories = Object.values(ListingCategory).map((category) => ({
    value: category,
    label: t(`categories.${category.toLowerCase()}`),
  }));

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("filters.category")}
      </label>
      <select
        value={selectedCategory || ""}
        onChange={(e) => onCategoryChange(e.target.value as ListingCategory)}
        className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">{t("filters.allCategories")}</option>
        {categories.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
