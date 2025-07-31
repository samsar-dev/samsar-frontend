import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'rtl',
    'ltr',
    'dark',
  ],
  darkMode: 'class',
  mode: 'jit',
  corePlugins: {
    preflight: true,
    container: true,
    // Aggressively disable utilities causing unused CSS
    transform: false,
    translate: false,
    rotate: false,
    skew: false,
    scale: false,
    transformOrigin: false,
    // Disable gradient utilities causing 17KB unused
    gradientColorStops: false,
    backgroundImage: false,
    backgroundSize: false,
    backgroundPosition: false,
    backgroundRepeat: false,
    // Disable other unused utilities
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
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
    // Disable sizing utilities
    width: false,
    height: false,
    minWidth: false,
    maxWidth: false,
    minHeight: false,
    maxHeight: false,
    // Disable flexbox utilities if not used
    flex: false,
 
    // Disable position utilities
    position: false,
    inset: false,
    zIndex: false,
  },
  theme: {
    // Optimize breakpoints - remove unused ones
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
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