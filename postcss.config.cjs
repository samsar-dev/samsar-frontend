module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    
    // Use the main Tailwind config
    require('tailwindcss'),
    
    // Use existing purgecss.config.js for production builds
    ...(process.env.NODE_ENV === 'production' ? [
      require('@fullhuman/postcss-purgecss')(require('./purgecss.config.js'))
    ] : []),
    
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Safari versions',
        'last 2 Edge versions'
      ]
    })
  ]
};