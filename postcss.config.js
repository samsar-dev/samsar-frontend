// PostCSS configuration
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    // Only add PurgeCSS in production
    ...(isProduction ? [
      require('@fullhuman/postcss-purgecss')({
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

module.exports = config;
