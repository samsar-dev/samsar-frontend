/**
 * CSS utilities for mobile optimization and font preloading
 */

/**
 * Preload critical fonts
 */
export function preloadCriticalFonts(): void {
  if (typeof document === 'undefined') return;
  
  // Preload only essential fonts
  const fonts = ['/fonts/inter-var.woff2'];
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });
}

/**
 * Optimize CSS delivery for mobile devices
 */
export function optimizeCSSForMobile(): void {
  if (typeof document === 'undefined') return;
  
  // Mark critical CSS as loaded
  const criticalCSS = document.getElementById('critical-css');
  if (criticalCSS) {
    criticalCSS.setAttribute('data-optimized', 'true');
  }
  
  // Preload fonts
  preloadCriticalFonts();
  
  // Handle mobile-specific CSS loading
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  const isMobile = window.innerWidth <= 768;
  
  stylesheets.forEach((sheet, index) => {
    const link = sheet as HTMLLinkElement;
    
    // Skip critical CSS
    if (link.href.includes('critical')) return;
    
    // Handle mobile-specific loading
    if (isMobile) {
      // On mobile: defer non-critical CSS
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      
      // Stagger loading for mobile
      setTimeout(() => {
        link.media = 'all';
      }, 500 * (index + 1));
    } else {
      // On desktop: load normally
      link.media = 'all';
    }
  });
}

/**
 * Load CSS with priority
 */
export function loadCSSWithPriority(href: string): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = (event: Event) => resolve();
    document.head.appendChild(link);
  });
}
