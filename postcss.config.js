export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {
      // Target modern browsers for smaller CSS
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead',
        'not ie 11'
      ]
    },
    ...(process.env.NODE_ENV === 'production' 
      ? {
          // Enhanced CSS optimization for mobile
          cssnano: {
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifyFontValues: true,
              minifySelectors: true,
              reduceIdents: false,
              zindex: false,
              // Advanced optimizations for mobile
              mergeLonghand: true,
              mergeRules: true,
              discardDuplicates: true,
              discardEmpty: true,
              discardOverridden: true,
              // Preserve important units
              convertValues: {
                length: false // Preserve rem units
              }
            }]
          }
        } 
      : {}
    )
  }
};
