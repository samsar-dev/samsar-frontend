import type { LoadingSpinnerProps } from "@/types/ui";
import React, { memo } from "react";

/**
 * A simple loading spinner component.
 * Uses minimal styling and no runtime style injection.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = "md",
  className = "",
  label = "Loading...",
  ariaLive = "polite",
  ariaAtomic = true,
  ...rest
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }[size];

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-busy="true"
      {...rest}
    >
      <div className={`relative ${sizeClasses}`}>
        <div 
          className="absolute inset-0 rounded-full border-solid border-gray-200 border-t-blue-500 animate-spin"
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
