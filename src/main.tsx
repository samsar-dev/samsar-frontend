import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

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

// Import store synchronously for immediate Redux Provider availability
import { store } from "./store/store";

// Import i18n configuration synchronously to ensure it's initialized
import "./config/i18n";

// Defer CSS optimization to after app loads
const initializeCSS = () => {
  if (typeof window !== 'undefined') {
    requestIdleCallback(async () => {
      try {
        await import("@/assets/css/index.css");
      } catch (err) {
        console.warn('CSS optimization failed:', err);
      }
    });
  }
};

// Critical components imported synchronously - no lazy loading for frame

// Defer performance monitoring to after app loads
const initializePerformanceMonitoring = () => {
  if (process.env.NODE_ENV === "production" && typeof window !== 'undefined') {
    // Delay web vitals to avoid blocking startup
    requestIdleCallback(() => {
      import("web-vitals");
    });
  }
};

       

 

// Loading fallback no longer needed since critical components load synchronously

// Fast app initialization
const initializeApp = async () => {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Failed to find the root element");
  }

  const root = createRoot(container, {
    identifierPrefix: "samsar-",
  });

  // Initialize CSS optimization after app loads
  initializeCSS();

  // Start app immediately
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
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
