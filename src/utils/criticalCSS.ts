// Base styles and resets
export const criticalCSS = `
/* Critical CSS - Mobile-first essentials */
:root {
  --primary: #2563eb;
  --background: #ffffff;
  --text: #1f2937;
  --border: #e5e7eb;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
}

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; }

.container { max-width: 100%; margin: 0 auto; padding: 0 1rem; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }

.p-4 { padding: 1rem; }
.m-4 { margin: 1rem; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }

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
