import { type ReactElement, useEffect, memo, Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import providers
import { AuthProvider, ListingsProvider, FavoritesProvider, UIProvider } from "@/contexts";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import SavedListingsProvider from "./contexts/SavedListingsContext";
import { SocketProvider } from "./contexts/SocketContext";

// Components
const ErrorBoundary = lazy(() => 
  import("@/components/common/ErrorBoundary")
    .then(module => ({ default: module.default }))
);

const SpeedInsights = lazy(() => 
  import("@vercel/speed-insights/react")
    .then(module => ({ default: () => <module.SpeedInsights /> }))
);

const Analytics = lazy(() => 
  import("@vercel/analytics/react")
    .then(module => ({ 
      default: () => {
        const isProd = process.env.NODE_ENV === 'production';
        return isProd ? <module.Analytics /> : null;
      }
    }))
);

const Routes = lazy(() => import("./routes/Routes"));

// Utils
import { setupAuthDebugger } from "@/utils/authDebug";

const App: () => ReactElement = () => {
  useEffect(() => {
    setupAuthDebugger();
  }, []);

  return (
    <Suspense fallback={null}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Application error:", error);
          console.error("Component stack:", errorInfo.componentStack);
        }}
      >
        <AuthProvider>
          <UIProvider>
            <SettingsProvider>
              <ListingsProvider>
                <FavoritesProvider>
                  <SavedListingsProvider>
                    <SocketProvider>
                      <MessagesProvider>
                        <NotificationsProvider>
                          <ErrorBoundary
                            fallback={
                              <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                                <div className="max-w-md w-full space-y-4 text-center">
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    Something went wrong
                                  </h2>
                                  <p className="text-gray-600">
                                    We've encountered an error. Please try refreshing.
                                  </p>
                                  <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                  >
                                    Refresh Page
                                  </button>
                                </div>
                              </div>
                            }
                          >
                            <Routes />
                            <ToastContainer
                              position="top-right"
                              autoClose={5000}
                              hideProgressBar={false}
                              closeOnClick
                              pauseOnHover
                              theme="light"
                            />
                            <SpeedInsights />
                            <Analytics />
                          </ErrorBoundary>
                        </NotificationsProvider>
                      </MessagesProvider>
                    </SocketProvider>
                  </SavedListingsProvider>
                </FavoritesProvider>
              </ListingsProvider>
            </SettingsProvider>
          </UIProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default App;
