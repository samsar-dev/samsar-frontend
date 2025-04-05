import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AuthProvider } from "@/contexts/AuthContext";
import { UIProvider } from "@/contexts/UIContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import "./config/i18n"; // Import i18n configuration
import "./assets/css/index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UIProvider>
          <AuthProvider>
            <NotificationsProvider>
              <SavedListingsProvider>
                <App />
              </SavedListingsProvider>
            </NotificationsProvider>
          </AuthProvider>
        </UIProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
