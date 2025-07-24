import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
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
      // Disable unused features to reduce bundle size
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  // Optimize CSS generation - JIT mode is enabled by default in Tailwind 3.x
  // Enable JIT mode for better performance
  mode: 'jit',
  // Disable dark mode variants if not used extensively
  darkMode: 'class',
  plugins: [],
};

export default config;
