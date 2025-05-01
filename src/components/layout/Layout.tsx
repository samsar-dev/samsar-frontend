import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname === "/messages";
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main
        className={`flex-grow container mx-auto ${isMessagesPage ? "px-0" : "px-4 py-8"} bg-background-secondary dark:bg-background-secondary-dark`}
      >
        <div
          className={`bg-surface-primary dark:bg-surface-primary-dark ${isMessagesPage ? " relative pt-4 z-0" : "p-6 shadow-sm rounded-lg"}`}
        >
          {children}
        </div>
      </main>
      {!isMessagesPage && <Footer />}
    </div>
  );
};

export default Layout;
