export const safeIdleCallback = (cb: () => void) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(cb)
    : setTimeout(cb, 2000);

export const preloadCriticalAssets = () => {
  if (typeof window !== "undefined") {
    // Only preload truly critical assets - defer non-critical ones
    // Fonts and CSS are now handled by browser optimization
  }
};
