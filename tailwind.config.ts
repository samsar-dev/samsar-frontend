import type { Config } from "tailwindcss";

// Add Node.js process type
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'rtl',
    'ltr',
    'dark',
    // Safe-list any dynamic classes that can't be detected statically
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
  ],
  darkMode: 'class',
  mode: 'jit',
  corePlugins: {
    preflight: true,
    container: true,
  },
  future: {
    hoverOnlyWhenSupported: true,
  },

  theme: {
    // Only include breakpoints actually used in the project
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
    },
    extend: {
      // Reduce color palette to only what's needed
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
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
      // Simplify animations - only essential ones
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      // Optimize container
      container: {
        center: true,
        padding: '1rem',
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
  // Performance optimizations - removed experimental features
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