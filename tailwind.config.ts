import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'dark',
    'rtl',
    'ltr',
    'bg-primary',
    'text-secondary',
    'text-accent',
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: true,
    container: true,
    float: false,
    clear: false,
    // Add more disabled ones if unused
  },
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
    },
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [
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
