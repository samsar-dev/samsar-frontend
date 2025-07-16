// PostCSS configuration
const postcssImport = require('postcss-import');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  postcssImport,
  tailwindcss,
  autoprefixer
];

// Only add PurgeCSS in production
if (isProduction) {
  plugins.push(
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
  );
}

module.exports = {
  plugins: plugins
};
