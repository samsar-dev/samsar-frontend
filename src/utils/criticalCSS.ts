/**
 * Critical CSS utilities for optimizing above-the-fold content
 */

// Base styles and resets
export const criticalCSS = `
/* Critical CSS for LCP optimization - Above the fold only */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --background: #ffffff;
  --text: #1f2937;
  --border: #e5e7eb;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
}

/* Responsive display classes */
.hidden {
  display: none !important;
}

@media (min-width: 768px) {
  .md:flex {
    display: flex !important;
  }
  .md:block {
    display: block !important;
  }
}

/* Critical layout utilities */
@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
  }
}

/* Critical navigation styles */
.navbar {
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  padding: 0.5rem 1rem;
}

.navbar-brand {
  color: var(--text);
  text-decoration: none;
}

.navbar-brand:hover {
  color: var(--primary);
}

.navbar-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar-link {
  color: var(--text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.navbar-link:hover {
  color: var(--primary);
  background-color: var(--gray-50);
}

/* Critical search bar styles */
.search-bar {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
}

.search-bar:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary);
}

/* Critical button styles */
.button {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--primary-dark);
}

/* Critical select styles */
.select {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary);
}

/* Critical text styles */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

/* Critical colors */
.text-gray-600 { color: #4b5563; }
.text-gray-800 { color: var(--gray-800); }
.text-gray-900 { color: var(--gray-900); }
.text-blue-600 { color: var(--primary); }
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: var(--gray-50); }
.bg-blue-600 { background-color: var(--primary); }

/* Critical button styles */
.btn-primary {
  background-color: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

/* Critical header/hero styles */
.hero-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  min-height: 60vh;
}

.lcp-element {
  will-change: transform;
  font-weight: 700;
  font-size: 2.25rem;
  line-height: 2.5rem;
}

/* Critical responsive */
@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
  
  .lcp-element {
    font-size: 3rem;
    line-height: 1.2;
  }
  
  .text-4xl {
    font-size: 3rem;
    line-height: 1.2;
  }
}

/* Critical loading states */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Dark mode critical styles */
.dark {
  --background: #111827;
  --text: #f9fafb;
  --border: #374151;
}

.dark body {
  background-color: var(--background);
  color: var(--text);
}

.dark .bg-white {
  background-color: #1f2937;
}

.dark .text-gray-800 {
  color: #f3f4f6;
}

.dark .text-gray-600 {
  color: #9ca3af;
}
`;

/**
 * Inject critical CSS into document head
 */
export const injectCriticalCSS = () => {
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.id = 'critical-css';
  document.head.appendChild(style);
};

export const cleanupCriticalCSS = () => {
  const style = document.getElementById('critical-css');
  if (style) {
    document.head.removeChild(style);
  }
};

/**
 * Preload non-critical CSS asynchronously
 */
export function preloadNonCriticalCSS(): void {
  if (typeof document === 'undefined') return;
  
  // Find the main CSS file
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    if (href && href.includes('index-') && href.endsWith('.css')) {
      // Convert to preload
      (link as HTMLLinkElement).rel = 'preload';
      (link as HTMLLinkElement).as = 'style';
      
      // Load asynchronously after critical path
      setTimeout(() => {
        (link as HTMLLinkElement).rel = 'stylesheet';
      }, 100);
    }
  });
}

/**
 * Load CSS asynchronously with fallback
 */
export function loadCSSAsync(href: string, media = 'all'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.media = 'print'; // Load with low priority
    
    link.onload = () => {
      link.media = media; // Switch to target media
      resolve();
    };
    
    link.onerror = reject;
    
    document.head.appendChild(link);
    
    // Fallback timeout
    setTimeout(() => {
      link.media = media;
      resolve();
    }, 1000);
  });
}
