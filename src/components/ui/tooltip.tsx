import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    let timeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeout = setTimeout(() => setShowTooltip(true), delay);
    };

    const handleMouseLeave = () => {
      clearTimeout(timeout);
      setShowTooltip(false);
    };

    // Calculate position classes based on position prop
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
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${positionClasses[position]} ${horizontalClasses[position]} px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 ${className}`}
              role="tooltip"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";
