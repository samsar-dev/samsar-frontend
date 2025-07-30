const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    
    // Only run PurgeCSS in production
    ...(process.env.NODE_ENV === 'production' ? [
      purgecss({
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './public/index.html',
          './src/components/**/*.{js,jsx,ts,tsx}',
          './src/pages/**/*.{js,jsx,ts,tsx}',
          './src/contexts/**/*.{js,jsx,ts,tsx}',
          './src/hooks/**/*.{js,jsx,ts,tsx}',
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
          
          // Responsive prefixes
          'sm:', 'md:', 'lg:', 'xl:',
          
          // Common utilities
          /^bg-/, /^text-/, /^border-/, /^shadow-/,
          /^w-/, /^h-/, /^p-/, /^m-/, /^gap-/,
          /^rounded-/, /^inset-/, /^top-/, /^right-/, /^bottom-/, /^left-/,
          /^object-/, /^overflow-/, /^z-/,
          /^items-/, /^justify-/, /^self-/,
          /^transition-/, /^duration-/, /^ease-/,
          /^hover:/, /^focus:/, /^dark:/,
        ],
        blocklist: [
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
          /^skew-/,
          /^scale-/,
          /^rotate-/,
          /^translate-/,
        ]
      })
    ] : []),
    
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Safari versions',
        'last 2 Edge versions'
      ]
    })
  ]
};
