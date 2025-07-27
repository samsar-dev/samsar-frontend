import React, { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { preloadAssets } from "./utils/preload";
import "./config/i18n";
import "@/assets/css/index.css";

// Import store directly since it's needed immediately
import { store } from "./store/store";

// Lazy load components with chunk naming
const BrowserRouter = lazy(() =>
  import('react-router-dom').then(m => ({
    default: m.BrowserRouter,
    __chunkName: 'react-router-dom'
  }))
);

const HelmetProvider = lazy(() =>
  import('react-helmet-async').then(m => ({
    default: m.HelmetProvider,
    __chunkName: 'react-helmet'
  }))
);

const App = lazy(() =>
  import('./App').then(m => ({
    default: m.default,
    __chunkName: 'app'
  }))
);

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
    <StrictMode>
      <Suspense fallback={null}>
        <HelmetProvider>
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </HelmetProvider>
      </Suspense>
    </StrictMode>
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
    // Error will be handled by the ErrorBoundary component
  }
}

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
