import React from "react";
import { cn } from "@/lib/utils";

interface PaperProps {
  elevation?: number;
  variant?: "outlined" | "elevation";
  className?: string;
  children?: React.ReactNode;
}

const elevationClasses = {
  1: "shadow-sm",
  2: "shadow",
  3: "shadow-md",
  4: "shadow-lg",
  5: "shadow-xl",
};

export const Paper = ({
  elevation = 1,
  variant = "elevation",
  className,
  children,
  ...props
}: PaperProps) => {
  return React.createElement(
    "div",
    {
      className: cn(
        "bg-background rounded-lg",
        variant === "outlined" ? "border border-border" : "",
        variant === "elevation"
          ? elevationClasses[elevation as keyof typeof elevationClasses]
          : "",
        className,
      ),
      ...props,
    },
    children,
  );
};
