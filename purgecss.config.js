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
    // Safelist critical classes that might be used dynamically
    'hidden',
    'block',
    'flex',
    'grid',
    'container',
    'dark',
    'light',
    'rtl',
    'ltr',
    // Pattern for dynamic classes
    /^lcp-/, 
    /^hero-/, 
    /^btn-/, 
    /^bg-/, 
    /^text-/, 
    /^border-/, 
    /^w-/, 
    /^h-/, 
    /^p-/, 
    /^m-/, 
    /^gap-/, 
    /^rounded-/, 
    /^shadow-/, 
    /^transition-/, 
    /^duration-/, 
    /^ease-/, 
    /^transform/, 
    /^scale-/, 
    /^translate-/, 
    /^rotate-/, 
    /^opacity-/, 
    /^z-/, 
    /^fixed/, 
    /^absolute/, 
    /^relative/, 
    /^sticky/, 
    /^overflow-/, 
    /^cursor-/, 
    /^hover:/, 
    /^focus:/, 
    /^active:/, 
    /^dark:/,
    // MUI related classes
    /^Mui/, 
    /^makeStyles-/, 
    /^jss/, 
    // Animation classes
    /^animate-/, 
    /^fade-/, 
    /^slide-/, 
    /^pulse-/
  ],
  blocklist: [
    // Blocklist known unused classes
    // Add any specific classes you know are not used
  ],
  variables: true,
  keyframes: true
};
