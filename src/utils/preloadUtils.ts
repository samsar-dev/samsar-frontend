// Store references to preloaded resources to prevent duplicate preloading
const preloadedResources = new Set<string>();

/**
 * Safely executes a callback during the browser's idle periods
 */
export const safeIdleCallback = (cb: () => void, timeout = 2000) =>
  'requestIdleCallback' in window
    ? window.requestIdleCallback(cb, { timeout })
    : setTimeout(cb, Math.min(timeout, 50));

/**
 * Creates a preload link element for a resource
 */
const createPreloadLink = (
  href: string,
  as: string,
  type?: string,
  crossOrigin: boolean = true
): HTMLLinkElement => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (type) link.type = type;
  if (crossOrigin) link.crossOrigin = 'anonymous';
  
  return link;
};

/**
 * Preloads critical assets that are needed immediately
 */
export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;

  // Only preload critical CSS if not already inlined
  if (!document.querySelector('style#critical-css')) {
    const cssLink = createPreloadLink(
      '/assets/main-BYW6yWLQ.css',
      'style',
      'text/css',
      false
    );
    cssLink.onload = () => cssLink.rel = 'stylesheet';
    document.head.appendChild(cssLink);
  }

  // Preload critical fonts
  const criticalFonts = [
    { href: '/fonts/inter.woff2', type: 'font/woff2' },
    { href: '/fonts/roboto.woff2', type: 'font/woff2' },
  ];

  criticalFonts.forEach(({ href, type }) => {
    if (!preloadedResources.has(href)) {
      const link = createPreloadLink(href, 'font', type);
      link.onload = () => preloadedResources.add(href);
      document.head.appendChild(link);
    }
  });
};

/**
 * Preloads an image and returns a promise that resolves when loaded
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !src) {
      resolve(false);
      return;
    }

    if (preloadedResources.has(src)) {
      resolve(true);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      preloadedResources.add(src);
      resolve(true);
    };
    
    img.onerror = () => resolve(false);
  });
};

/**
 * Preloads multiple images with concurrency control
 */
export const preloadImages = async (
  urls: string[],
  concurrency: number = 3
): Promise<boolean[]> => {
  const results: boolean[] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(url => preloadImage(url)));
    results.push(...batchResults);
    
    // Allow other tasks to run between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};
