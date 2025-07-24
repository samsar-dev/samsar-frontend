const purgecss = require('@fullhuman/postcss-purgecss');

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx,vue}',
          './public/**/*.html',
          './index.html',
        ],
        safelist: [
          'html',
          'body',
          'dark',
          /^bg-/,
          /^text-/,
          /^border-/,
          /^hover:/,
          /^focus:/,
          /^disabled:/,
          /^dark:/,
          /^min-h-/,
          /^w-/,
          /^h-/,
          /^max-w-/,
          /^rounded-/,
          /^shadow-/,
          /^flex/,
          /^grid/,
          /^space-/,
          /^p-/,
          /^m-/,
          /^px-/,
          /^py-/,
          /^pt-/,
          /^pb-/,
          /^pl-/,
          /^pr-/,
        ],
        keyframes: true,
        variables: true,
        fontFace: true,
      },
    } : {}),
  },
};
