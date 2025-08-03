import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

// Minimal critical CSS injection - defer the rest
const injectMinimalCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      .hidden{display:none!important}
      #root{min-height:100vh}
      @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);
  }
};

// Inject only minimal CSS immediately
injectMinimalCSS();

// Lazy load everything else
let store: any;
let i18nInitialized = false;

// Initialize heavy dependencies asynchronously
const initializeDependencies = async () => {
  const [storeModule, i18nModule] = await Promise.all([
    import("./store/store"),
    import("./config/i18n")
  ]);
  
  store = storeModule.store;
  i18nInitialized = true;
  
  // Defer CSS optimization to after app loads
  if (typeof window !== 'undefined') {
    requestIdleCallback(async () => {
      try {
        // CSS is now handled by build tools - no manual optimization needed
        await import("@/assets/css/index.css");
      } catch (err) {
        console.warn('CSS optimization failed:', err);
      }
    });
  }
};

// Lazy load components without chunk naming for faster loading
const BrowserRouter = lazy(() =>
  import('react-router-dom').then(m => ({ default: m.BrowserRouter }))
);

const App = lazy(() => import('./App'));

// Defer performance monitoring to after app loads
const initializePerformanceMonitoring = () => {
  if (process.env.NODE_ENV === "production" && typeof window !== 'undefined') {
    // Delay web vitals to avoid blocking startup
    requestIdleCallback(() => {
      import("web-vitals");
    });
  }
};

// Minimal loading fallback
const LoadingFallback = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

// Fast app initialization
const initializeApp = async () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Failed to find the root element");
  }

  // Ensure dependencies are loaded
  if (!store || !i18nInitialized) {
    await initializeDependencies();
  }

  const root = createRoot(container, {
    identifierPrefix: "samsar-",
  });

  root.render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
  
  // Initialize performance monitoring after render
  initializePerformanceMonitoring();
};

// Ultra-fast app startup
const startApp = async () => {
  try {
    // Initialize app immediately without waiting for preloading
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeApp);
    } else {
      await initializeApp();
    }

    // Defer asset preloading to after app loads
    requestIdleCallback(async () => {
      try {
        const { preloadAssetsNow } = await import("./utils/preload");
        await preloadAssetsNow();
        console.log("✅ Assets preloaded");
      } catch (error) {
        console.warn("⚠️ Asset preloading failed:", error);
      }
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Application initialized successfully");
    }
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
  }
};

// Simplified browser detection
const checkModernBrowser = () => {
  return typeof Symbol !== 'undefined' && typeof fetch !== 'undefined';
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
