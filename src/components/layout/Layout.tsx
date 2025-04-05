import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 bg-background-secondary dark:bg-background-secondary-dark">
        <div className="bg-surface-primary dark:bg-surface-primary-dark rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
