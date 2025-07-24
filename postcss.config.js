export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}',
          './public/**/*.html',
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
          /^active:/,
          /^disabled:/,
          /^placeholder:/,
          /^selection:/,
          /^first:/,
          /^last:/,
          /^odd:/,
          /^even:/,
          /^visited:/,
          /^checked:/,
          /^group-hover:/,
          /^group-focus:/,
          /^focus-within:/,
          /^focus-visible:/,
          /^motion-safe:/,
          /^motion-reduce:/,
          /^dark:/,
          /^sm:/,
          /^md:/,
          /^lg:/,
          /^xl:/,
          /^2xl:/,
          /^ltr:/,
          /^rtl:/,
          /^print:/,
          /^screen:/,
          // Safe list common component classes
          /^(container|flex|grid|hidden|block|inline|inline-block)$/,
          // Safe list animation classes
          /^(animate-|transition-|duration-|delay-|ease-|transform|scale|rotate|translate|skew|opacity)$/,
          // Safe list form classes
          /^(form-|input-|select-|textarea-|checkbox-|radio-|button-|label-|fieldset|legend)$/,
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      }
    } : {})
  },
};
