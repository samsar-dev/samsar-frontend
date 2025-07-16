// PostCSS configuration
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import purgecss from '@fullhuman/postcss-purgecss';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    // Only add PurgeCSS in production
    ...(isProduction ? [
      purgecss({
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}'
        ],
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: [
          /bg-/, 
          /text-/, 
          /border-/, 
          /rounded-/, 
          /shadow-/
        ]
      })
    ] : [])
  ]
};

export default config;
