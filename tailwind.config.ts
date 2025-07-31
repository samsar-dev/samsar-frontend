import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Exclude node_modules and test files
    "!./node_modules/**",
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Essential transform utilities based on actual usage
    'translate-x-1/2', 'translate-y-1/2', 'translate-x-28', 'translate-x-0',
    'opacity-0', 'opacity-100', 'group-hover:opacity-100', 'group-hover:translate-x-0',
    'transform', '-translate-x-1/2', '-translate-y-1/2',
    // RTL support
    'rtl', 'ltr',
  ],
  darkMode: 'class',
  mode: 'jit',
  // Optimize by disabling unused core plugins
  corePlugins: {
    preflight: true,
    container: true,
    accessibility: true,
    
    // Disable unused transform utilities
    skew: false,
    rotate: false,
    scale: false,
    
    // Disable unused layout utilities
    float: false,
    clear: false,
    objectFit: false,
    objectPosition: false,
    
    // Disable unused spacing utilities
    space: false,
    divideWidth: false,
    divideColor: false,
    divideStyle: false,
    
    // Disable unused typography utilities
    listStyleType: false,
    listStylePosition: false,
    
    // Disable unused background utilities
    backgroundAttachment: false,
    backgroundClip: false,
    backgroundOrigin: false,
    
    // Disable unused border utilities
    borderStyle: false,
    borderCollapse: false,
    
    // Disable unused sizing utilities
    minHeight: false,
    maxHeight: false,
    
    // Disable unused opacity utilities
    backdropOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    textOpacity: false,
  },
  theme: {
    // Optimize breakpoints - limit to essential ones
    screens: {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      // Optimize translate utilities to only what's needed
      translate: {
        '1/2': '50%',
        'full': '100%',
        '0': '0px',
        '1': '0.25rem',
        '28': '7rem',
      },
      // Reduce color palette to only essential colors
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
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
        // Essential semantic colors only
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
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
      // Optimize spacing to essential values only
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Simplify animations to essential ones
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
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