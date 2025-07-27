/**
 * CSS Splitting utilities for critical path optimization
 */

export interface CSSOptimizationConfig {
  criticalSelectors: string[];
  deferredSelectors: string[];
  mediaQueries: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export const cssConfig: CSSOptimizationConfig = {
  criticalSelectors: [
    // Layout
    'html', 'body', '#root', '.container',
    // Typography
    'h1', 'h2', 'h3', '.text-', '.font-',
    // Critical components
    '.lcp-element', '.hero-section', '.btn-primary',
    // Flexbox/Grid
    '.flex', '.grid', '.items-', '.justify-',
    // Spacing
    '.p-', '.m-', '.px-', '.py-', '.mx-', '.my-',
    // Colors
    '.bg-white', '.bg-gray-50', '.text-gray-',
    // Critical utilities
    '.sr-only', '.hidden', '.block', '.inline'
  ],
  deferredSelectors: [
    // Animations
    '@keyframes', '.animate-', '.transition-',
    // Complex components
    '.dropdown', '.modal', '.tooltip', '.popover',
    // Form elements
    '.form-', '.input-', '.select-', '.textarea-',
    // Advanced layouts
    '.aspect-', '.object-', '.overflow-',
    // Hover states
    ':hover', ':focus', ':active',
    // Print styles
    '@media print'
  ],
  mediaQueries: {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)'
  }
};

/**
 * Extract critical CSS from a CSS string
 */
export function extractCriticalCSS(cssContent: string): {
  critical: string;
  deferred: string;
} {
  const lines = cssContent.split('\n');
  const criticalLines: string[] = [];
  const deferredLines: string[] = [];
  
  let currentBlock = '';
  let isCritical = false;
  let inMediaQuery = false;
  let mediaQueryContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle media queries
    if (line.startsWith('@media')) {
      inMediaQuery = true;
      mediaQueryContent = line + '\n';
      continue;
    }
    
    if (inMediaQuery) {
      mediaQueryContent += line + '\n';
      if (line === '}' && mediaQueryContent.split('{').length === mediaQueryContent.split('}').length) {
        // Media query block complete
        const isCriticalMedia = cssConfig.criticalSelectors.some(selector => 
          mediaQueryContent.includes(selector)
        );
        
        if (isCriticalMedia) {
          criticalLines.push(mediaQueryContent);
        } else {
          deferredLines.push(mediaQueryContent);
        }
        
        inMediaQuery = false;
        mediaQueryContent = '';
      }
      continue;
    }
    
    // Handle regular CSS rules
    if (line.includes('{')) {
      currentBlock = line;
      isCritical = cssConfig.criticalSelectors.some(selector => 
        line.includes(selector)
      );
    } else if (line === '}') {
      currentBlock += '\n' + line;
      
      if (isCritical) {
        criticalLines.push(currentBlock);
      } else {
        deferredLines.push(currentBlock);
      }
      
      currentBlock = '';
      isCritical = false;
    } else {
      currentBlock += '\n' + line;
    }
  }
  
  return {
    critical: criticalLines.join('\n'),
    deferred: deferredLines.join('\n')
  };
}

/**
 * Load CSS with priority
 */
export function loadCSSWithPriority(href: string, priority: 'critical' | 'high' | 'low' = 'low'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = priority === 'critical' ? 'stylesheet' : 'preload';
    link.as = priority === 'critical' ? undefined : 'style';
    link.href = href;
    
    // Set loading priority
    if (priority === 'critical') {
      link.media = 'all';
    } else if (priority === 'high') {
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
        resolve();
      };
    } else {
      link.media = 'print';
      // Defer low priority CSS
      setTimeout(() => {
        link.media = 'all';
        resolve();
      }, 1000);
    }
    
    link.onerror = reject;
    document.head.appendChild(link);
    
    if (priority === 'critical') {
      resolve();
    }
  });
}

/**
 * Preload critical fonts
 */
export function preloadCriticalFonts(): void {
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/roboto-regular.woff2'
  ];
  
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
 * Optimize CSS delivery for mobile
 */
export function optimizeCSSForMobile(): void {
  // Inject critical CSS immediately
  const criticalCSS = document.getElementById('critical-css');
  if (criticalCSS) {
    criticalCSS.setAttribute('data-optimized', 'true');
  }
  
  // Preload fonts
  preloadCriticalFonts();
  
  // Load non-critical CSS with low priority
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach((stylesheet, index) => {
    const link = stylesheet as HTMLLinkElement;
    if (!link.href.includes('critical') && index > 0) {
      // Convert to preload and defer
      link.rel = 'preload';
      link.as = 'style';
      
      setTimeout(() => {
        link.rel = 'stylesheet';
      }, 100 * (index + 1)); // Stagger loading
    }
  });
}

/**
 * Monitor CSS loading performance
 */
export function monitorCSSPerformance(): void {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('.css')) {
          console.log(`CSS loaded: ${entry.name} in ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}
