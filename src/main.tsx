import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import { preloadAssets } from "./utils/preload";
// import "react-loading-skeleton/dist/skeleton.css";
import "./config/i18n"; // Import i18n configuration

// Import critical styles
import "./assets/css/index.css";

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



// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return children;
};

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

  // Create root with error boundary
  const root = createRoot(container);

  // Use concurrent mode features
  root.render(
    <HelmetProvider>
      <BrowserRouter>
        <Provider store={store}>
          <ErrorBoundary>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </ErrorBoundary>
        </Provider>
      </BrowserRouter>
    </HelmetProvider>,
  );
};

// Initialize the app
preloadAssets();
initializeReact();
