import type { Config } from "tailwindcss";

const config: Config = {
  // Enable JIT mode for better performance and smaller bundles
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
    // Include specific component libraries that use Tailwind classes
    "./node_modules/@headlessui/react/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroicons/react/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-helmet-async/**/*.{js,ts,jsx,tsx}",
    "./node_modules/framer-motion/**/*.{js,ts,jsx,tsx}",
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
      
      // Optimize spacing scale for common patterns
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Optimize animation durations
      transitionDuration: {
        '2000': '2000ms',
      },
      
      // Optimize z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  
  plugins: [],
};

export default config;