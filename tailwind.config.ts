import type { Config } from "tailwindcss";
import * as tailwindcssAnimate from "tailwindcss-animate";
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
    elevated: {
      light: "#ffffff",
      dark: "#323232",
    },
  },
  text: {
    primary: {
      light: "#1a1a1a",
      dark: "#e5e5e5",
    },
    secondary: {
      light: "#4b5563",
      dark: "#a3a3a3",
    },
    muted: {
      light: "#6b7280",
      dark: "#8b8b8b",
    },
  },
  border: {
    primary: {
      light: "#e5e7eb",
      dark: "#2e2e2e",
    },
    secondary: {
      light: "#f3f4f6",
      dark: "#404040",
    },
  },
  input: {
    background: {
      light: "#ffffff",
      dark: "#1e1e1e",
    },
    border: {
      light: "#d1d5db",
      dark: "#404040",
    },
    placeholder: {
      light: "#9ca3af",
      dark: "#6b6b6b",
    },
  },
  accent: {
    blue: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
    green: {
      light: "#22c55e",
      dark: "#4ade80",
    },
    red: {
      light: "#ef4444",
      dark: "#f87171",
    },
    yellow: {
      light: "#f59e0b",
      dark: "#fbbf24",
    },
  },
};

// Container configuration
const container = {
  center: true,
  padding: {
    DEFAULT: "1rem",
    sm: "2rem",
    lg: "4rem",
    xl: "5rem",
    "2xl": "6rem",
  },
  screens,
};

// Animation configuration
const animations = {
  keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    slideUp: {
      "0%": { transform: "translateY(20px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    shake: {
      "0%, 100%": { transform: "translateX(0)" },
      "25%": { transform: "translateX(-4px)" },
      "75%": { transform: "translateX(4px)" },
    },
  },
  animation: {
    "fade-in": "fadeIn 0.5s ease-in",
    "slide-up": "slideUp 0.5s ease-out",
    shake: "shake 0.5s ease-in-out",
  },
};

import plugin from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'],
  mode: 'jit',
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: ['dark'], // Always include dark mode classes
    },
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Arabic", "sans-serif"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        content: "1200px",
      },
      ...animations,
      backgroundColor: {
        DEFAULT: "var(--background-primary-light)",
        surface: "var(--surface-primary-light)",
      },
      textColor: {
        DEFAULT: "var(--text-primary-light)",
      },
      borderColor: {
        DEFAULT: "var(--border-primary-light)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    plugin,
    aspectRatio,
    typography,
    // Add @tailwindcss/forms if needed
    // require('@tailwindcss/forms'),
    function ({ addBase }) {
      addBase({
        ":root": {
          "--background-primary-light": colors.background.primary.light,
          "--background-primary-dark": colors.background.primary.dark,
          "--background-secondary-light": colors.background.secondary.light,
          "--background-secondary-dark": colors.background.secondary.dark,
          "--background-elevated-light": colors.background.elevated.light,
          "--background-elevated-dark": colors.background.elevated.dark,
          "--surface-primary-light": colors.surface.primary.light,
          "--surface-primary-dark": colors.surface.primary.dark,
          "--surface-secondary-light": colors.surface.secondary.light,
          "--surface-secondary-dark": colors.surface.secondary.dark,
          "--surface-elevated-light": colors.surface.elevated.light,
          "--surface-elevated-dark": colors.surface.elevated.dark,
          "--text-primary-light": colors.text.primary.light,
          "--text-primary-dark": colors.text.primary.dark,
          "--text-secondary-light": colors.text.secondary.light,
          "--text-secondary-dark": colors.text.secondary.dark,
          "--text-muted-light": colors.text.muted.light,
          "--text-muted-dark": colors.text.muted.dark,
          "--border-primary-light": colors.border.primary.light,
          "--border-primary-dark": colors.border.primary.dark,
          "--border-secondary-light": colors.border.secondary.light,
          "--border-secondary-dark": colors.border.secondary.dark,
          "--input-background-light": colors.input.background.light,
          "--input-background-dark": colors.input.background.dark,
          "--input-border-light": colors.input.border.light,
          "--input-border-dark": colors.input.border.dark,
          "--input-placeholder-light": colors.input.placeholder.light,
          "--input-placeholder-dark": colors.input.placeholder.dark,
          "--accent-blue-light": colors.accent.blue.light,
          "--accent-blue-dark": colors.accent.blue.dark,
          "--accent-green-light": colors.accent.green.light,
          "--accent-green-dark": colors.accent.green.dark,
          "--accent-red-light": colors.accent.red.light,
          "--accent-red-dark": colors.accent.red.dark,
          "--accent-yellow-light": colors.accent.yellow.light,
          "--accent-yellow-dark": colors.accent.yellow.dark,
        },
        ".dark": {
          "--background-primary": colors.background.primary.dark,
          "--background-secondary": colors.background.secondary.dark,
          "--background-elevated": colors.background.elevated.dark,
          "--surface-primary": colors.surface.primary.dark,
          "--surface-secondary": colors.surface.secondary.dark,
          "--surface-elevated": colors.surface.elevated.dark,
          "--text-primary": colors.text.primary.dark,
          "--text-secondary": colors.text.secondary.dark,
          "--text-muted": colors.text.muted.dark,
          "--border-primary": colors.border.primary.dark,
          "--border-secondary": colors.border.secondary.dark,
          "--input-background": colors.input.background.dark,
          "--input-border": colors.input.border.dark,
          "--input-placeholder": colors.input.placeholder.dark,
          "--accent-blue": colors.accent.blue.dark,
          "--accent-green": colors.accent.green.dark,
          "--accent-red": colors.accent.red.dark,
          "--accent-yellow": colors.accent.yellow.dark,
        },
      });
    },
    tailwindcssAnimate,
  ],
};

export default config;
