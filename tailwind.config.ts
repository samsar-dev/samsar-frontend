import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
  ],
  safelist: [
    // Only safelist classes actually used in the codebase
    { pattern: /^(bg-|text-|border-|shadow-|rounded-|w-|h-|p-|m-|flex|grid|container)/ },
    'rtl', 'ltr', 'dark', 'light',
    // RTL specific classes
    'text-right', 'text-left', 'text-center',
    'ml-auto', 'mr-auto', 'mx-auto',
    // Common responsive classes
    'sm:', 'md:', 'lg:', 'xl:',
  ],
  darkMode: 'class',
  mode: 'jit',
  // Aggressively disable unused features
  corePlugins: {
    // Keep only essential features
    preflight: true,
    container: true,
    accessibility: true,
    
    // Disable unused features
    backdropOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    textOpacity: false,
    
    // Disable advanced features not used
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropSaturate: false,
    backdropSepia: false,
    
    blur: false,
    brightness: false,
    contrast: false,
    dropShadow: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    
    // Disable transforms not used
    skew: false,
    scale: false,
    rotate: false,
    translate: false,
    transform: false,
    transformOrigin: false,
    
    // Keep spacing and layout
    space: true,
    divideWidth: true,
    divideColor: true,
  },
  theme: {
    // Optimize breakpoints for mobile-first
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Main primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
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
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      // Optimize spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Mobile-optimized animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Critical layout utilities
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  },
  // Optimize for production
  ...(process.env.NODE_ENV === 'production' && {
    // Removed experimental features to avoid warnings
  }),
  plugins: [
    // Add container queries for better mobile optimization
    function({ addUtilities }: any) {
      addUtilities({
        '.lcp-optimized': {
          'contain': 'layout style paint',
          'will-change': 'transform',
          'font-display': 'swap',
        },
        '.mobile-optimized': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'text-rendering': 'optimizeSpeed',
        },
        '.critical-resource': {
          'loading': 'eager',
          'fetchpriority': 'high',
        },
      });
    },
  ],
};

export default config;
