import { type ReactElement } from "react";

// Core providers - load synchronously for immediate availability
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { UIProvider } from "@/contexts/UIContext";
import { ListingsProvider } from "@/contexts/ListingsContext";

// Layout component for navigation
import Layout from "@/components/layout/Layout";

// Routes - direct import to avoid Suspense delays
import Routes from "./routes/Routes";

// Simple App component with essential structure
const App: () => ReactElement = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <UIProvider>
          <ListingsProvider>
            <Layout>
              <Routes />
            </Layout>
          </ListingsProvider>
        </UIProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
