module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    
    // Use the main Tailwind config
    require('tailwindcss'),
    
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
