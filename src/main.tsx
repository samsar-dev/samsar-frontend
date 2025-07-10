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



// Error boundary component with error reporting
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
      // In production, report errors to your error tracking service
      console.error('Application error:', { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're working on fixing this issue.</p>
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

// Initialize the app with error handling
const startApp = () => {
  try {
    preloadAssets();
    initializeReact();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show error UI or redirect to error page
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="text-center">
            <h2 class="text-xl font-semibold mb-2">Application Error</h2>
            <p class="text-gray-600 mb-4">Failed to load the application. Please try again later.</p>
            <button 
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onclick="window.location.reload()"
            >
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Start the application
startApp();
