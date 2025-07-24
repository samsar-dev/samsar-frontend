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
    // Essential layout classes
    'bg-blue-600',
    'bg-white',
    'dark:bg-gray-800',
    'dark:bg-gray-900',
    'text-white',
    'text-gray-700',
    'text-gray-800',
    'dark:text-gray-200',
    'text-gray-600',
    'text-red-600',
    'dark:text-red-400',
    'border-gray-300',
    'dark:border-gray-600',
    'border-gray-100',
    'dark:border-gray-700',
    'border-red-600',
    'dark:border-red-400',
    
    // Spacing and layout
    'px-4',
    'py-2',
    'px-3',
    'py-1',
    'w-full',
    'w-48',
    'w-16',
    'h-16',
    'h-8',
    'min-h-screen',
    'max-w-md',
    'space-y-4',
    'space-x-4',
    'space-x-2',
    
    // Flexbox
    'flex',
    'flex-col',
    'items-center',
    'items-start',
    'justify-center',
    'justify-between',
    'inline-flex',
    
    // Positioning
    'absolute',
    'fixed',
    'relative',
    'sticky',
    'top-0',
    'left-0',
    'right-0',
    'bottom-0',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    'mt-2',
    'mt-[-4px]',
    'ml-[-50px]',
    'z-50',
    
    // Rounded corners
    'rounded-md',
    'rounded-lg',
    'rounded-full',
    
    // Shadows
    'shadow-lg',
    'shadow-sm',
    
    // Transitions
    'transition-all',
    'duration-200',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'hover:bg-blue-700',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    
    // Display and visibility
    'block',
    'inline-block',
    'hidden',
    'opacity-100',
    'opacity-0',
    'scale-100',
    'scale-95',
    'pointer-events-none',
    
    // Text styling
    'text-sm',
    'text-base',
    'text-2xl',
    'font-medium',
    'font-bold',
    'text-center',
    
    // Animation
    'animate-spin',
    
    // Responsive
    'container',
    
    // State classes
    'disabled:opacity-50',
    'hover:text-gray-900',
    'dark:hover:text-gray-100',
  ],
  darkMode: "class",
  mode: "jit",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
        },
        gray: {
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        red: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderColor: {
        DEFAULT: '#e5e7eb',
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
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      backgroundColor: ["active", "disabled"],
      textColor: ["active", "disabled"],
      borderColor: ["active", "disabled"],
    },
  },
  plugins: [
    plugin({
      strategy: "class",
    }),
    aspectRatio,
    typography({
      className: 'prose',
    }),
    require("flowbite/plugin"),
  ],
};

export default config;
