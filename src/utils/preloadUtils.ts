export const safeIdleCallback = (cb: () => void) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(cb)
    : setTimeout(cb, 2000);

export const preloadCriticalAssets = () => {
  // Removed dynamic <link rel="preload"> insertion for CSS and fonts
  // These resources are either non-critical or already referenced by the
  // regular <link rel="stylesheet"> tag in index.html. Injecting additional
  // preload tags caused "preloaded but not used" warnings.
  return;
};
