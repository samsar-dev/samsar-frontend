import { type ReactElement } from "react";
import { HelmetProvider } from "react-helmet-async";

// Core providers - load synchronously for immediate availability
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { UIProvider } from "@/contexts/UIContext";
import { ListingsProvider } from "@/contexts/ListingsContext";

// Layout component for navigation
import Layout from "@/components/layout/Layout";

// Routes - lazy loaded to reduce initial chunk size
import { lazy, Suspense } from 'react';
const Routes = lazy(() => import('./routes/Routes'));

// Simple App component with essential structure
const App: () => ReactElement = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <UIProvider>
            <ListingsProvider>
              <Layout>
                <Suspense fallback={null}>
                  <Routes />
                </Suspense>
              </Layout>
            </ListingsProvider>
          </UIProvider>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
