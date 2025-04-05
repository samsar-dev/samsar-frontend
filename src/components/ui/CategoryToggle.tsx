import React from "react";
import type { CategoryToggleProps } from "@/types/ui";

const CategoryToggle: React.FC<CategoryToggleProps> = ({
  selected,
  onChange,
  categories,
}) => {
  return (
    <div className="flex space-x-2 p-2 bg-gray-100 rounded-lg">
      {categories.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            selected === id
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="mr-2">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default CategoryToggle;
