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
// Performance monitoring
const measureResourceTiming = (resourceName: string, startTime: number) => {
  if (window.performance) {
    const timing = performance.now() - startTime;
    console.debug(`[Perf] ${resourceName} loaded in ${timing.toFixed(2)}ms`);
  }
};

export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  let loadedResources = 0;
  const totalResources = 2; // CSS + Fonts

  const onResourceLoaded = (resourceName: string) => {
    loadedResources++;
    measureResourceTiming(resourceName, startTime);
    
    if (loadedResources >= totalResources) {
      const totalTime = performance.now() - startTime;
      console.debug(`[Perf] All critical assets loaded in ${totalTime.toFixed(2)}ms`);
    }
  };

  // Only preload critical CSS if not already inlined
  if (!document.querySelector('style#critical-css')) {
    const cssLink = createPreloadLink(
      '/assets/main-BYW6yWLQ.css',
      'style',
      'text/css',
      false
    );
    cssLink.onload = () => {
      cssLink.rel = 'stylesheet';
      onResourceLoaded('Critical CSS');
    };
    cssLink.onerror = () => onResourceLoaded('Critical CSS (failed)');
    document.head.appendChild(cssLink);
  } else {
    onResourceLoaded('Critical CSS (inlined)');
  }

  // Preload critical fonts with font-display: swap
  const criticalFonts = [
    { 
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      type: 'font/woff2',
      name: 'Inter Font'
    },
    { 
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons&display=swap',
      type: 'font/woff2',
      name: 'Material Icons'
    },
  ];

  // Check if fonts are already loaded
  const fontFaceSet = document.fonts as any;
  const loadedFonts = new Set<string>();
  
  const checkFontsLoaded = () => {
    criticalFonts.forEach(({ name }) => {
      if (!loadedFonts.has(name)) {
        // Check if the font is already in the document
        const isFontLoaded = Array.from(document.fonts).some(font => 
          font.family.includes(name.split(' ')[0])
        );
        
        if (isFontLoaded) {
          loadedFonts.add(name);
          onResourceLoaded(`${name} (cached)`);
        }
      }
    });
    
    if (loadedFonts.size < criticalFonts.length) {
      requestAnimationFrame(checkFontsLoaded);
    }
  };
  
  // Start checking for loaded fonts
  requestAnimationFrame(checkFontsLoaded);

  // Preload fonts that aren't already loaded
  criticalFonts.forEach(({ href, type, name }) => {
    if (!preloadedResources.has(href)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.crossOrigin = 'anonymous';
      link.onload = () => onResourceLoaded(`${name} (loaded)`);
      link.onerror = () => onResourceLoaded(`${name} (failed)`);
      document.head.appendChild(link);
      preloadedResources.add(href);
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
