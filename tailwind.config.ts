import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  safelist: [
    // Only include absolutely necessary dynamic classes
    'rtl', 'ltr',
    // Add specific dynamic classes used in your components
    ...['bg-blue-500', 'text-white', 'hover:bg-blue-600'], // Add your most used classes
  ],
  darkMode: 'class',
  mode: 'jit',
  // Disable all core plugins by default
  corePlugins: {
    // Enable only what you need
    preflight: true,
    container: true,
    accessibility: true,
    // Disable opacity plugins as they're rarely needed
    backdropOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    textOpacity: false,
    // Disable other unused features
    float: false,
    clear: false,
    // Keep essential layout features
    position: true,
    display: true,
    flex: true,
 
  },
  theme: {
    // Optimize breakpoints - remove unused ones
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Reduce color palette to only what's needed
      colors: {
        // Keep only colors you actually use
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
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
      // Optimize font stack
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      // Optimize spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Simplify animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      // Optimize container
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      // Disable unused variants
      variants: {
        extend: {
          opacity: ['disabled'],
          cursor: ['disabled'],
        }
      }
    },
  },
  // Performance optimizations
 
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [
    // Only include essential plugins
    function({ addUtilities }: any) {
      addUtilities({
        '.lcp-optimized': {
          'contain': 'paint layout style',
          'content-visibility': 'auto',
        },
      });
    },
  ],
};

export default config;