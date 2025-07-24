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
    'bg-blue-600',
    'hover:bg-blue-700',
    'text-white',
    'border-gray-300',
    'dark:border-gray-600',
    'focus:ring-blue-500',
    'bg-white',
    'dark:bg-gray-800',
    'shadow-md',
    'rounded-lg',
    'px-4',
    'py-2',
    'w-full',
    'h-full',
    'min-h-screen',
    'overflow-x-hidden',
    'antialiased',
    'text-gray-800',
    'dark:text-gray-200',
  ],
  darkMode: "class",
  mode: "jit",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens,
    extend: {
      colors: {
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        gray: {
          200: "#e5e7eb",
          300: "#d1d5db",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "elevation-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "elevation-2":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "elevation-3":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "elevation-4":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "elevation-5": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      backgroundColor: ["active", "disabled"],
      textColor: ["active", "disabled"],
      borderColor: ["active", "disabled"],
    },
  },
  plugins: [
    require("flowbite/plugin"),
  ],
};

export default config;
