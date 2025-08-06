import { useLocation } from "react-router-dom";
import { memo } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname.includes("messages");
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-16">
      <Navbar />
      <main className="flex-grow w-full">
        <div
          className={`w-full ${isMessagesPage ? "p-0 m-0" : "px-4 py-8"} bg-gray-50 dark:bg-gray-900`}
        >
          <div className={`max-w-7xl mx-auto w-full`}>
            <div
              className={`bg-white dark:bg-gray-800 ${isMessagesPage ? "p-0 m-0" : "p-6 shadow-sm rounded-lg"}`}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
      <div className="w-full">{!isMessagesPage && <Footer />}</div>
    </div>
  );
});

export default Layout;
