/**
 * Preloads critical assets and routes for better performance
 */
export const preloadAssets = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  // Store references to preloaded resources
  const preloadedResources = new Set<string>();

  // Performance monitoring
  const startTime = performance.now();
  let loadedResources = 0;
  const totalResources = 8; // CSS + Fonts + Images + Routes

  const onResourceLoaded = (resourceName: string, success: boolean = true) => {
    loadedResources++;
    const timing = performance.now() - startTime;
    const status = success ? '' : ' (failed)';
    console.debug(`[Perf] ${resourceName}${status} loaded in ${timing.toFixed(2)}ms`);
    
    if (loadedResources >= totalResources) {
      const totalTime = performance.now() - startTime;
      console.debug(`[Perf] All critical assets loaded in ${totalTime.toFixed(2)}ms`);
    }
  };

  // Preload critical CSS
  try {
    const cssLink = createPreloadLink(
      '/assets/main-BYW6yWLQ.css',
      'style',
      'text/css',
      false
    );
    
    if (!cssLink) {
      throw new Error('Failed to create CSS preload link');
    }
    
    cssLink.onload = () => {
      cssLink.rel = 'stylesheet';
      onResourceLoaded('Critical CSS');
    };
    
    cssLink.onerror = () => {
      onResourceLoaded('Critical CSS', false);
    };
    
    document.head.appendChild(cssLink);
  } catch (error) {
    console.error('Error preloading critical CSS:', error);
    onResourceLoaded('Critical CSS', false);
  }

  // Preload critical fonts
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

  try {
    const fontFaceSet = document.fonts as any;
    const loadedFonts = new Set<string>();
    
    if (!fontFaceSet) {
      console.warn('FontFaceSet API not available');
      return;
    }

    // Check for already loaded fonts
    criticalFonts.forEach(({ name }) => {
      if (!loadedFonts.has(name)) {
        const isFontLoaded = Array.from(document.fonts).some(font => 
          font.family.includes(name.split(' ')[0])
        );
        
        if (isFontLoaded) {
          loadedFonts.add(name);
          onResourceLoaded(`${name} (cached)`);
        }
      }
    });

    // Preload remaining fonts
    criticalFonts.forEach(({ href, type, name }) => {
      if (!href || typeof href !== 'string') return;
      
      if (!preloadedResources.has(href)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';
        link.onload = () => {
          preloadedResources.add(href);
          onResourceLoaded(`${name} (loaded)`);
        };
        link.onerror = () => {
          onResourceLoaded(`${name} (failed)`, false);
        };
        document.head.appendChild(link);
      }
    });
  } catch (error) {
    console.error('Error preloading fonts:', error);
  }

  // Preload critical images
  const criticalImages = [
    '/logo.png',
    '/placeholder.jpg',
    '/icons/favicon.ico',
    '/icons/favicon-32x32.png',
    '/icons/favicon-16x16.png'
  ];

  try {
    const preloadImage = async (src: string): Promise<boolean> => {
      if (!src || typeof src !== 'string' || preloadedResources.has(src)) {
        return false;
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
          preloadedResources.add(src);
          onResourceLoaded(`Image: ${src}`);
          resolve(true);
        };
        
        img.onerror = () => {
          onResourceLoaded(`Image: ${src}`, false);
          resolve(false);
        };
      });
    };

    // Preload images with concurrency control
    const batchSize = 3;
    for (let i = 0; i < criticalImages.length; i += batchSize) {
      const batch = criticalImages.slice(i, i + batchSize);
      await Promise.all(batch.map(preloadImage));
    }
  } catch (error) {
    console.error('Error preloading images:', error);
  }

  // Preload critical routes
  const preloadRoute = async (importFn: () => Promise<unknown>): Promise<void> => {
    try {
      if ('requestIdleCallback' in window) {
        await new Promise<void>((resolve) => {
          window.requestIdleCallback(async () => {
            await importFn();
            resolve();
          });
        });
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        await new Promise<void>((resolve) => {
          setTimeout(async () => {
            await importFn();
            resolve();
          }, 2000);
        });
      }
      onResourceLoaded('Route');
    } catch (error) {
      onResourceLoaded('Route', false);
      console.error('Error preloading route:', error);
    }
  };

  try {
    // Preload critical routes - ordered by importance and likelihood of visit
    await Promise.all([
      preloadRoute(() => import('@/pages/Search')),         // Search results - likely next step
      preloadRoute(() => import('@/components/listings/details/ListingCard')) // Used in search and listings
    ]);
  } catch (error) {
    console.error('Error preloading assets:', error);
    // Fallback - preload at least the most critical routes
    try {
      await preloadRoute(() => import('@/pages/Search'));
    } catch (fallbackError) {
      console.error('Fallback preload failed:', fallbackError);
    }
  }
};

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
