/**
 * Loads non-critical CSS after the initial render
 */
export function loadNonCriticalCSS(cssPath: string): void {
  // Only run in browser
  if (typeof document === 'undefined') return;

  const loadStyles = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  };

  // Use requestIdleCallback if available, otherwise use load event
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadStyles, { timeout: 2000 });
  } else {
    window.addEventListener('load', loadStyles);
  }
}
