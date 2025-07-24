import type { Config } from "tailwindcss";
import * as tailwindcssAnimate from "tailwindcss-animate";
import plugin from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";

// Screen breakpoints configuration
const screens = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Color palette configuration
const colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  // Semantic colors for light/dark modes
  background: {
    primary: {
      light: "#ffffff",
      dark: "#121212",
    },
    secondary: {
      light: "#f8fafc",
      dark: "#1a1a1a",
    },
    elevated: {
      light: "#ffffff",
      dark: "#242424",
    },
  },
  surface: {
    primary: {
      light: "#ffffff",
      dark: "#1e1e1e",
    },
    secondary: {
      light: "#f3f4f6",
      dark: "#2a2a2a",
    },
  },
  text: {
    primary: {
      light: "#1f2937",
      dark: "#f9fafb",
    },
    secondary: {
      light: "#4b5563",
      dark: "#d1d5db",
    },
    muted: {
      light: "#6b7280",
      dark: "#9ca3af",
    },
  },
  border: {
    light: "#e5e7eb",
    dark: "#374151",
  },
  success: {
    light: "#10b981",
    dark: "#34d399",
  },
  warning: {
    light: "#f59e0b",
    dark: "#fbbf24",
  },
  error: {
    light: "#ef4444",
    dark: "#f87171",
  },
  info: {
    light: "#3b82f6",
    dark: "#60a5fa",
  },
};

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  safelist: [
    // Essential layout classes only
    'flex',
    'flex-col',
    'min-h-screen',
    'container',
    'mx-auto',
    'px-4',
    'py-8',
    'p-0',
    'm-0',
    'p-6',
    'shadow-sm',
    'rounded-lg',
    'flex-grow',
    'bg-white',
    'dark:bg-gray-900',
    'bg-gray-50',
    'dark:bg-gray-800',
    'text-gray-900',
    'dark:text-gray-100',
  ],
  darkMode: "class",
  mode: "jit",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Minimal color palette
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      zIndex: {
        "50": "50",
      },
    },
  },

  plugins: [
    plugin({
      strategy: "class",
    }),
    aspectRatio,
  ],
};

export default config;
