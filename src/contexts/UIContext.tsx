import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { UIContextType, UIPreferences, ToastPosition } from "@/types/ui";
import { DEFAULT_SETTINGS } from "@/config";

/**
 * Default UI preferences.
 */
const defaultPreferences: UIPreferences = {
  fontSize: "medium",
  reducedMotion: false,
  highContrast: false,
  enableAnimations: true,
  sidebarCollapsed: false,
  denseMode: false,
  enableSoundEffects: false,
  toastPosition: "top-right" as ToastPosition,
};

/**
 * UI context.
 */
const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * Hook to access the UI context.
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

/**
 * UI provider component.
 */
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Try to get theme from localStorage first
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    // If no saved theme, use the default setting
    const defaultTheme = DEFAULT_SETTINGS.theme;
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return defaultTheme as "light" | "dark";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toastPosition, setToastPosition] =
    useState<ToastPosition>("top-right");
  const [preferences, setPreferences] =
    useState<UIPreferences>(defaultPreferences);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme: "light" | "dark") =>
      prevTheme === "light" ? "dark" : "light",
    );
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<UIPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  const value: UIContextType = {
    theme,
    setTheme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    isLoading,
    setLoading,
    isMobile,
    toastPosition,
    setToastPosition,
    preferences,
    updatePreferences,
    resetPreferences,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
