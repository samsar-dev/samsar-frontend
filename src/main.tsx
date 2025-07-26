import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import { preloadAssets } from "./utils/preload";
// import "react-loading-skeleton/dist/skeleton.css";
import "./config/i18n"; // Import i18n configuration

// Import critical styles
import "@/styles/critical.css";

// Defer non-critical CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/assets/index.css';
link.media = 'print';
link.onload = () => {
  link.media = 'all';
};
document.head.appendChild(link);

// Performance monitoring
if (process.env.NODE_ENV === "production") {
  // Report web vitals if in production
  import("web-vitals").then(({ onCLS, onFCP, onLCP }) => {
    // Report metrics with a threshold of 1000ms
    const reportMetric = (metric: any) => {
      console.log({
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: metric.rating,
      });
    };

    onCLS(reportMetric, { reportAllChanges: true });
    onFCP(reportMetric);
    onLCP(reportMetric, { reportAllChanges: true });
  });
}

// Error boundary component with error reporting
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === "production") {
      // In production, report errors to your error tracking service
      console.error("Application error:", { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We're working on fixing this issue.
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Ensure React is properly initialized
const initializeReact = () => {
  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
};

const initializeApp = () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Failed to find the root element");
  }

  // Create root with concurrent features enabled
  const root = createRoot(container, {
    // Enable concurrent features for better performance
    identifierPrefix: "samsar-",
  });

  // Optimize rendering with StrictMode and proper provider nesting
  root.render(
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>,
  );
};

// Optimized app startup with performance monitoring
const startApp = async () => {
  try {
    // Start preloading assets immediately
    const preloadPromise = preloadAssets();

    // Initialize React while assets are preloading
    initializeReact();

    // Wait for critical assets to finish preloading
    await preloadPromise;

    // Report successful initialization
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Application initialized successfully");
    }
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);

    // Show optimized error UI
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div class="text-center max-w-md">
            <div class="mb-4">
              <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Application Error</h2>
            <p class="text-gray-600 mb-6">Failed to load the application. Please try refreshing the page.</p>
            <button 
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onclick="window.location.reload()"
            >
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Add modern browser detection
const checkModernBrowser = () => {
  // Check for modern browser features
  const features = {
    es6: typeof Symbol !== 'undefined' && Symbol.iterator,
    es2017: typeof Object.entries !== 'undefined',
    es2018: typeof Promise.prototype.finally !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
  };
  
  return Object.values(features).every(Boolean);
};

// Modern browser detection script
const browserSupportScript = `
  <script>
    (function() {
      var modernBrowser = 
        'fetch' in window && 
        'IntersectionObserver' in window &&
        'Promise' in window &&
        'assign' in Object &&
        'from' in Array &&
        'entries' in Object;
      
      if (!modernBrowser) {
        var script = document.createElement('script');
        script.src = '/legacy-polyfills.js';
        script.defer = true;
        document.head.appendChild(script);
      }
    })();
  </script>
`;

// Add to your HTML template or use in your build process
document.head.innerHTML += browserSupportScript;

// Start the application with performance timing
if (process.env.NODE_ENV === "development") {
  console.time("⚡ App Startup Time");
}

startApp().finally(() => {
  if (process.env.NODE_ENV === "development") {
    console.timeEnd("⚡ App Startup Time");
  }
});
