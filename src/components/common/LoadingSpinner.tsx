import type { LoadingSpinnerProps } from "@/types/ui";
import React, { memo } from "react";

/**
 * A highly optimized loading spinner component.
 * Uses CSS-only animations and hardware acceleration for maximum performance.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(
  ({
    size = "md",
    className = "",
    label = "Loading...",
    ariaLive = "polite",
    ariaAtomic = true,
    trackColor = "rgba(229, 231, 235, 0.8)",
    activeColor = "rgb(59, 130, 246)",
    speed = 1,
    ...rest
  }) => {
    // Predefined size classes with optimized border widths
    const sizeClasses = {
      sm: "w-4 h-4 border-2 rounded-full",
      md: "w-8 h-8 border-2 rounded-full",
      lg: "w-12 h-12 border-4 rounded-full",
    };

    // Use CSS variables for better performance
    const spinnerStyle = {
      "--spinner-track-color": trackColor,
      "--spinner-active-color": activeColor,
      "--spinner-animation-duration": `${speed}s`,
      "--spinner-border-width": sizeClasses[size].includes("border-2")
        ? "2px"
        : "4px",
    } as React.CSSProperties & {
      "--spinner-track-color": string;
      "--spinner-active-color": string;
      "--spinner-animation-duration": string;
      "--spinner-border-width": string;
    };

    return (
      <div
        className={`inline-flex items-center justify-center ${className} loading-spinner`}
        role="status"
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        aria-busy="true"
        {...rest}
      >
        <div className={`relative ${sizeClasses[size]}`} style={spinnerStyle}>
          {/* Background track */}
          <div
            className="loading-spinner__track"
            style={{
              borderColor: "var(--spinner-track-color)",
              borderWidth: "var(--spinner-border-width)",
              transform: "translateZ(0)",
              willChange: "transform",
              animationName: "spin",
              animationDuration: `${speed}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
            aria-hidden="true"
          />

          {/* Animated spinner */}
          <div
            className="loading-spinner__indicator"
            style={{
              borderWidth: "var(--spinner-border-width)",
              transform: "translateZ(0)",
              willChange: "transform",
              animationName: "spin",
              animationDuration: `${speed}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
            aria-hidden="true"
          />

          <span className="sr-only">{label}</span>
        </div>
      </div>
    );
  },
);

// Set a display name for better debugging
LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
