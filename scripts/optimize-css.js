#!/usr/bin/env node

/**
 * CSS Optimization Script
 * Optimizes CSS for production builds by extracting critical CSS and purging unused styles
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const purgecss = require('@fullhuman/postcss-purgecss');

// Configuration
const config = {
  inputCSS: './dist/assets/index.css',
  outputCSS: './dist/assets/index-optimized.css',
  criticalCSS: './dist/assets/critical.css',
  contentPaths: [
    './dist/index.html',
    './dist/assets/**/*.js',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Always keep these classes
    'html', 'body', '#root',
    // Safe list common patterns
    /^bg-/, /^text-/, /^border-/,
    /^flex/, /^grid/, /^hidden/, /^block/, /^inline/,
    /^relative/, /^absolute/, /^fixed/, /^sticky/,
    /^z-/, /^w-/, /^h-/, /^p-/, /^m-/, /^space-/,
    /^rounded/, /^shadow/, /^opacity/, /^transition/,
    /^duration/, /^ease/, /^transform/, /^scale/, /^rotate/,
    /^translate/, /^skew/,
    // Responsive prefixes
    /^sm:/, /^md:/, /^lg:/, /^xl:/, /^2xl:/,
    // State variants
    /^hover:/, /^focus:/, /^active:/, /^disabled:/, /^visited:/,
    // Animation classes
    /^animate-/,
    // Component classes
    /^btn/, /^card/, /^modal/, /^dropdown/, /^tooltip/, /^popover/,
  ]
};

// Utility functions
const log = (message) => {
  console.log(`[CSS Optimization] ${message}`);
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// CSS optimization pipeline
async function optimizeCSS() {
  try {
    log('Starting CSS optimization...');
    
    // Check if input CSS exists
    if (!fs.existsSync(config.inputCSS)) {
      log(`Input CSS file not found: ${config.inputCSS}`);
      return;
    }

    // Read CSS file
    const css = fs.readFileSync(config.inputCSS, 'utf8');
    const originalSize = Buffer.byteLength(css, 'utf8');
    log(`Original CSS size: ${formatBytes(originalSize)}`);

    // Create PostCSS processor with plugins
    const processor = postcss([
      autoprefixer({
        overrideBrowserslist: [
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'last 2 Safari versions',
          'last 2 Edge versions'
        ]
      }),
      purgecss({
        content: config.contentPaths,
        safelist: config.safelist,
        variables: true,
        keyframes: true,
        fontFace: true,
        defaultExtractor: content => {
          const selectors = [];
          const matches = content.match(/[A-Za-z0-9-_:/]+/g) || [];
          selectors.push(...matches);
          return selectors;
        }
      }),
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifySelectors: true,
          reduceIdents: false, // Keep ID selectors for critical CSS
          zindex: false // Keep z-index values
        }]
      })
    ]);

    // Process CSS
    const result = await processor.process(css, { from: config.inputCSS, to: config.outputCSS });
    
    // Write optimized CSS
    fs.writeFileSync(config.outputCSS, result.css);
    const optimizedSize = Buffer.byteLength(result.css, 'utf8');
    
    // Calculate savings
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    log(`Optimized CSS size: ${formatBytes(optimizedSize)}`);
    log(`CSS savings: ${formatBytes(savings)} (${savingsPercent}%)`);

    // Create critical CSS for above-the-fold content
    await extractCriticalCSS(css, originalSize);

    log('CSS optimization completed successfully!');
    
  } catch (error) {
    log(`Error during CSS optimization: ${error.message}`);
    process.exit(1);
  }
}

// Extract critical CSS for above-the-fold content
async function extractCriticalCSS(css, originalSize) {
  try {
    log('Extracting critical CSS...');
    
    // Define critical CSS patterns (above-the-fold content)
    const criticalPatterns = [
      // Base resets and typography
      /html\s*{[^}]*}/g,
      /body\s*{[^}]*}/g,
      /#root\s*{[^}]*}/g,
      
      // Layout utilities
      /\.container\s*{[^}]*}/g,
      /\.flex\s*{[^}]*}/g,
      /\.grid\s*{[^}]*}/g,
      /\.hidden\s*{[^}]*}/g,
      /\.block\s*{[^}]*}/g,
      /\.inline\s*{[^}]*}/g,
      
      // Responsive utilities
      /\.sm:[^\s{]*\s*{[^}]*}/g,
      /\.md:[^\s{]*\s*{[^}]*}/g,
      /\.lg:[^\s{]*\s*{[^}]*}/g,
      
      // Common spacing utilities
      /\.p-[0-9]*\s*{[^}]*}/g,
      /\.m-[0-9]*\s*{[^}]*}/g,
      /\.space-[xy]-[0-9]*\s*{[^}]*}/g,
      
      // Color utilities
      /\.bg-[a-z-]*\s*{[^}]*}/g,
      /\.text-[a-z-]*\s*{[^}]*}/g,
      /\.border-[a-z-]*\s*{[^}]*}/g,
    ];

    let criticalCSS = '';
    
    // Extract critical CSS rules
    criticalPatterns.forEach(pattern => {
      const matches = css.match(pattern);
      if (matches) {
        criticalCSS += matches.join('\n') + '\n';
      }
    });

    // Add essential base styles
    criticalCSS += `
/* Critical base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
}

#root {
  min-height: 100vh;
}

/* Critical layout utilities */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.flex {
  display: flex;
}

.grid {
  display: grid;
}

.hidden {
  display: none;
}

.block {
  display: block;
}

/* Critical responsive utilities */
@media (min-width: 640px) {
  .sm\:flex { display: flex; }
  .sm\:block { display: block; }
}

@media (min-width: 768px) {
  .md\:flex { display: flex; }
  .md\:block { display: block; }
}

@media (min-width: 1024px) {
  .lg\:flex { display: flex; }
  .lg\:block { display: block; }
}
`;

    // Minify critical CSS
    const criticalProcessor = postcss([
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
        }]
      })
    ]);

    const criticalResult = await criticalProcessor.process(criticalCSS, { from: undefined });
    
    // Write critical CSS
    fs.writeFileSync(config.criticalCSS, criticalResult.css);
    const criticalSize = Buffer.byteLength(criticalResult.css, 'utf8');
    
    log(`Critical CSS size: ${formatBytes(criticalSize)}`);
    log(`Critical CSS extraction completed!`);
    
  } catch (error) {
    log(`Error extracting critical CSS: ${error.message}`);
  }
}

// Main execution
if (require.main === module) {
  optimizeCSS().catch(console.error);
}

module.exports = { optimizeCSS, extractCriticalCSS };
