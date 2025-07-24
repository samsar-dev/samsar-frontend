import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
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
      purgecss: purgecss({
        content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
        safelist: { standard: [/^Toastify/, /^leaflet/] },
      })
    } : {}),
  },
};
