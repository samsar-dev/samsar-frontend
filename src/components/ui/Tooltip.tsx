import React, { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div
        className={`absolute z-50 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap ${positionClasses[position]}`}
      >
        {content}
        <div
          className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === "top"
              ? "bottom-[-4px] left-1/2 -translate-x-1/2"
              : position === "right"
                ? "left-[-4px] top-1/2 -translate-y-1/2"
                : position === "bottom"
                  ? "top-[-4px] left-1/2 -translate-x-1/2"
                  : "right-[-4px] top-1/2 -translate-y-1/2"
          }`}
        />
      </div>
    </div>
  );
};

export default Tooltip;
