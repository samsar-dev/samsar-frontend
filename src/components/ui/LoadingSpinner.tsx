import React from "react";
import type { LoadingSpinnerProps } from "@/types/ui";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div
      className={`flex justify-center items-center ${className}`}
      role="status"
    >
      <div
        className={`animate-spin rounded-full border-4 border-t-blue-500 border-gray-200 ${sizeClasses[size]}`}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
