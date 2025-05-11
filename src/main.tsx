import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./config/i18n"; // Import i18n configuration
import "./assets/css/index.css";

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Report web vitals if in production
  import('web-vitals').then(({ onCLS, onFCP, onLCP }) => {
    // Report metrics with a threshold of 1000ms
    const reportMetric = (metric: any) => {
      console.log({
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: metric.rating
      });
    };

    onCLS(reportMetric, { reportAllChanges: true });
    onFCP(reportMetric);
    onLCP(reportMetric, { reportAllChanges: true });
  });
}

// Preload critical assets
const preloadAssets = () => {
  if (typeof window !== 'undefined') {
    // Preload important routes when idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Preload common assets like images, fonts, etc.
        const imagesToPreload = [
          '/logo.png',
          '/placeholder.jpg'
        ];
        
        imagesToPreload.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      });
    }
  }
};

preloadAssets();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(container);

// Use concurrent mode features
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
