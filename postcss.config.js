const purgecss = require('@fullhuman/postcss-purgecss');

export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' 
      ? {
          cssnano: {
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifyFontValues: true,
              minifySelectors: true,
              reduceIdents: false,
              zindex: false,
            }]
          },
          purgecss: {
            content: [
              './src/**/*.tsx',
              './src/**/*.ts'
            ],
            defaultExtractor: content => content.match(/[^<"`\s]*[^<"`\s:]/g) || [],
            whitelistPatterns: [/hero/, /navbar/, /btn/, /skeleton/]
          }
        } 
      : {}
    )
  }
};
