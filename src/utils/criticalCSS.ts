// Base styles and resets
export const criticalCSS = `
/* Critical CSS - Essential only */
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; }

/* Essential container */
.container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }

/* Essential utilities */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }

/* Essential spacing */
.p-4 { padding: 1rem; }
.m-4 { margin: 1rem; }

/* Essential typography */
.text-center { text-align: center; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-bold { font-weight: 700; }

/* Essential responsive */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}
@media (min-width: 768px) {
  .container { max-width: 768px; }
}
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}
@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

/* RTL support */
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
`;

/**
 * Inject minimal critical CSS only
 */
export function injectCriticalCSS() {
  if (typeof document === 'undefined') return;
  
  const styleId = 'critical-css';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = criticalCSS;
  
  const head = document.head;
  if (head.firstChild) {
    head.insertBefore(style, head.firstChild);
  } else {
    head.appendChild(style);
  }
}

// Cleanup critical CSS
export function cleanupCriticalCSS() {
  if (typeof document === 'undefined') return;
  
  const style = document.getElementById('critical-css');
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
}
