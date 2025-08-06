import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { prefetchOnInteraction } from "@/utils/prefetch";

interface PrefetchLinkProps extends LinkProps {
  prefetchRoute?: () => Promise<any>;
  prefetchKey?: string;
}

/**
 * Enhanced Link component that prefetches routes on hover/focus
 * Improves perceived performance by preloading routes before navigation
 */
const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  prefetchRoute,
  prefetchKey,
  onMouseEnter,
  onFocus,
  children,
  ...linkProps
}) => {
  const handlePrefetch = () => {
    if (prefetchRoute) {
      prefetchOnInteraction(prefetchRoute, prefetchKey);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handlePrefetch();
    onMouseEnter?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLAnchorElement>) => {
    handlePrefetch();
    onFocus?.(event);
  };

  return (
    <Link {...linkProps} onMouseEnter={handleMouseEnter} onFocus={handleFocus}>
      {children}
    </Link>
  );
};

export default PrefetchLink;

// Pre-defined prefetch routes for common pages
export const prefetchRoutes = {
  profile: () => import("@/pages/Profile"),
  settings: () => import("@/pages/Settings"),
  messages: () => import("@/pages/Messages"),
  createListing: () => import("@/components/listings/create/CreateListing"),
  search: () => import("@/pages/Search"),
  vehicles: () => import("@/pages/Vehicles"),
  realEstate: () => import("@/pages/RealEstate"),
};
