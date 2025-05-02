import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname.includes("messages");
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main
        className={` mx-auto ${isMessagesPage ? "p-0 m-0" : "px-4 py-8 flex-grow container"} bg-background-secondary dark:bg-background-secondary-dark`}
      >
        <div
          className={`bg-surface-primary dark:bg-surface-primary-dark ${isMessagesPage ? "p-0 m-0" : "p-6 shadow-sm rounded-lg"}`}
        >
          {children}
        </div>
      </main>
      {!isMessagesPage && <Footer />}
    </div>
  );
};

export default Layout;
