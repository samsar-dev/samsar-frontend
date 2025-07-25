export default {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/nesting': {},
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
          }
        } 
      : {}
    )
  }
};
