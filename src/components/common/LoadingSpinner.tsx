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
    } as React.CSSProperties & {
      "--spinner-track-color": string;
      "--spinner-active-color": string;
      "--spinner-animation-duration": string;
    };

    // Inline critical styles
    const inlineStyles = {
      "--spinner-track-color": trackColor,
      "--spinner-active-color": activeColor,
      "--spinner-animation-duration": `${speed}s`,
    };

    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        role="status"
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        aria-busy="true"
        {...rest}
      >
        <div className={`relative ${sizeClasses[size]}`} style={spinnerStyle}>
          {/* Background track */}
          <div
            className="absolute inset-0 border-solid border-transparent"
            style={{
              borderColor: "var(--spinner-track-color)",
              borderWidth: sizeClasses[size].includes('border-2') ? '2px' : '4px',
              borderRadius: '50%',
              transform: 'translateZ(0)',
              willChange: 'transform',
              animationName: 'spin',
              animationDuration: `${speed}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
            aria-hidden="true"
          />

          {/* Animated spinner */}
          <div
            className="absolute inset-0 border-solid border-t-[color:var(--spinner-active-color)] border-transparent"
            style={{
              borderWidth: sizeClasses[size].includes('border-2') ? '2px' : '4px',
              borderRadius: '50%',
              transform: 'translateZ(0)',
              willChange: 'transform',
              animationName: 'spin',
              animationDuration: `${speed}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
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
