import type { LoadingSpinnerProps } from "@/types/ui";
import React, { memo, useMemo, useEffect } from "react";

/**
 * A highly performant and accessible loading spinner component.
 * Uses CSS transforms and hardware acceleration for smooth animations.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
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
  // Memoize the size classes to prevent recalculation on every render
  const sizeClasses = useMemo(() => ({
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }), []);

  // Memoize the spinner style to prevent unnecessary recalculations
  const spinnerStyle = useMemo(() => ({
    '--spinner-track-color': trackColor,
    '--spinner-active-color': activeColor,
    '--spinner-animation-duration': `${speed}s`,
  } as React.CSSProperties & {
    '--spinner-track-color': string;
    '--spinner-active-color': string;
    '--spinner-animation-duration': string;
  }), [trackColor, activeColor, speed]);

  // Add global styles for the spinner animation
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Create or update the style element
    let styleElement = document.getElementById('spinner-styles');
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'spinner-styles';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .spinner-animate {
        animation: spin var(--spinner-animation-duration, 1s) linear infinite;
      }
    `;
    
    // Clean up the style element when the component unmounts
    return () => {
      if (styleElement && styleElement.parentNode === document.head) {
        document.head.removeChild(styleElement);
      }
    };
  }, [speed]);

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-busy="true"
      {...rest}
    >
      <div 
        className={`relative ${sizeClasses[size]}`}
        style={spinnerStyle}
      >
        {/* Background track */}
        <div 
          className="absolute inset-0 rounded-full border-solid border-transparent"
          style={{
            borderColor: 'var(--spinner-track-color, rgba(229, 231, 235, 0.8))',
            borderWidth: 'inherit',
          }}
          aria-hidden="true"
        />
        
        {/* Animated spinner */}
        <div 
          className="absolute inset-0 rounded-full border-solid border-t-[color:var(--spinner-active-color)] border-transparent spinner-animate"
          style={{
            borderWidth: 'inherit',
            willChange: 'transform',
          }}
          aria-hidden="true"
        />
        
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
});

// Set a display name for better debugging
LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
