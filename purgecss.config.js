export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/contexts/**/*.{js,jsx,ts,tsx}',
    './src/hooks/**/*.{js,jsx,ts,tsx}',
  ],
  css: [
    './src/assets/css/index.css',
  ],
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
  safelist: [
    // Critical layout classes
    'hidden', 'block', 'flex', 'grid', 'container',
    'rtl', 'ltr', 'dark', 'light',
    
    // RTL specific classes
    'text-right', 'text-left', 'text-center',
    'ml-auto', 'mr-auto', 'mx-auto',
    'pl-2', 'pr-2', 'pl-4', 'pr-4', 'pl-6', 'pr-6',
    'ml-2', 'mr-2', 'ml-4', 'mr-4', 'ml-6', 'mr-6',
    
    // Spacing and sizing
    /^w-/, /^h-/, /^p-/, /^m-/, /^gap-/, /^space-/,
    /^min-w-/, /^min-h-/, /^max-w-/, /^max-h-/,
    
    // Colors and backgrounds
    /^bg-/, /^text-/, /^border-/, /^shadow-/,
    
    // Layout and positioning
    /^rounded-/, /^inset-/, /^top-/, /^right-/, /^bottom-/, /^left-/,
    /^object-/, /^overflow-/, /^z-/,
    
    // Flexbox and grid
    /^items-/, /^justify-/, /^self-/, /^place-/,
    /^col-/, /^row-/,
    
    // Transitions and animations
    /^transition-/, /^duration-/, /^ease-/, /^transform/,
    
    // Focus states
    'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500',
    
    // Hover states
    /^hover:/,
    
    // Dark mode
    /^dark:/,
    
    // RTL utilities
    'ml-auto', 'mr-auto', 'text-right', 'text-left',
    
    // Common responsive classes
    'sm:', 'md:', 'lg:', 'xl:',
    
    // Form classes
    'form-input', 'form-textarea', 'form-select',
    'form-checkbox', 'form-radio',
    
    // Loading states
    'animate-spin', 'animate-pulse',
  ],
  blocklist: [
    // Aggressively block unused Tailwind features
    /^ring-/,
    /^backdrop-/,
    /^filter/,
    /^blur-/,
    /^brightness-/,
    /^contrast-/,
    /^drop-shadow-/,
    /^grayscale/,
    /^hue-rotate-/,
    /^invert/,
    /^saturate-/,
    /^sepia-/,
    /^backdrop-blur-/,
    /^backdrop-brightness-/,
    /^backdrop-contrast-/,
    /^backdrop-grayscale/,
    /^backdrop-hue-rotate-/,
    /^backdrop-invert-/,
    /^backdrop-opacity-/,
    /^backdrop-saturate-/,
    /^backdrop-sepia-/,
    /^skew-/,
    /^scale-/,
    /^rotate-/,
    /^translate-/,
    /^origin-/,
    /^will-change-/,
    /^isolate/,
    /^mix-blend-/,
    /^bg-blend-/,
  ],
  keyframes: true,
  fontFace: true,
  variables: true,
};
