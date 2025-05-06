import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useBlockNavigation = (shouldBlock: boolean, message: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shouldBlock) return;

    // Handle page refresh or closing tab with a standard browser dialog
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Handle back/forward browser navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      
      // Use a custom styled dialog if available in the future
      // For now, use the standard browser confirm dialog
      const confirmed = window.confirm(message);
      
      if (!confirmed) {
        // Prevent navigation and restore current location
        navigate(location.pathname + location.search, { replace: true });
      }
    };

    const handleNavigation = (e: MouseEvent) => {
      if (!shouldBlock) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        e.preventDefault();
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // Prevent navigation if user cancels
          return;
        }
        
        // Get the href from the link element
        const href = link.getAttribute('href');
        if (href) {
          // Use window.location for external links
          if (href.startsWith('http')) {
            window.location.href = href;
          } else {
            // Use navigate for internal links
            navigate(href);
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleNavigation);
    };
  }, [shouldBlock, message, location.pathname, location.search, navigate]);

  // Return a function that can be used to block navigation
  return (action: () => void) => {
    if (!shouldBlock) {
      action();
      return;
    }

    const confirmed = window.confirm(message);
    if (confirmed) {
      action();
    }
  };
};
