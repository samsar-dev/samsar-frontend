import { forwardRef, useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, className = "", delay = 0, position = "top" }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
      setTimeout(() => setShowTooltip(true), delay);
    };

    const handleMouseLeave = () => {
      setShowTooltip(false);
    };

    const positionClasses = {
      top: "bottom-full mt-2",
      bottom: "top-full -mt-2",
      left: "right-full -ml-2",
      right: "left-full -mr-2",
    };

    const horizontalClasses = {
      top: "left-1/2 -translate-x-1/2",
      bottom: "left-1/2 -translate-x-1/2",
      left: "top-1/2 -translate-y-1/2",
      right: "top-1/2 -translate-y-1/2",
    };

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
      >
        {children}
        {showTooltip && (
          <div
            className={`absolute ${positionClasses[position]} ${horizontalClasses[position]} px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 ${className} transition-all duration-150 ease-out transform translate-y-[-6px] opacity-0 pointer-events-none`}
            style={{
              transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
              opacity: showTooltip ? 1 : 0,
              transform: showTooltip ? "translateY(0)" : "translateY(-6px)",
            }}
            role="tooltip"
          >
            {content}
          </div>
        )}
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";
