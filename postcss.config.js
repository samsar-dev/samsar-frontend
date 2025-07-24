import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      'postcss-purgecss': purgecss({
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}',
          './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
        ],
        safelist: [
          'html',
          'body',
          /^bg-/,
          /^text-/,
          /^border-/,
          /^hover:/,
          /^focus:/,
          /^dark:/,
          /^scrollbar/,
          'btn',
          'btn-primary',
          'input',
          'card',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      })
    } : {}),
  },
};
