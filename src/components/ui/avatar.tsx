import * as React from "react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const OptimizedAvatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, alt = "", fallback, className, size = "md", children, ...props },
    ref,
  ) => {
    const [imgError, setImgError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
          className,
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="aspect-square h-full w-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {children || fallback?.[0]?.toUpperCase() || "U"}
          </span>
        )}
      </div>
    );
  },
);

OptimizedAvatar.displayName = "OptimizedAvatar";

export default OptimizedAvatar;
