import type { LoadingSpinnerProps } from "@/types/ui";
import React from "react";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
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
