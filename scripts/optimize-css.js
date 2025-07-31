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
    // Critical only - exclude all transform utilities
    'html', 'body', '#root',
    // Layout only
    /^flex/, /^hidden/, /^block/, /^inline/,
    /^w-/, /^h-/, /^p-/, /^m-/,
    // Colors only
    /^bg-/, /^text-/, /^border-/,
    // Border radius only
    /^rounded/,
    // Responsive only
    /^sm:/, /^md:/,
    // No transform utilities at all
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

    // Create PostCSS processor with plugins - exclude transform utilities
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
          // Exclude transform utilities
          const matches = content.match(/[A-Za-z0-9-_:/]+/g) || [];
          const filtered = matches.filter(selector => 
            !selector.includes('translate') && 
            !selector.includes('rotate') && 
            !selector.includes('scale') && 
            !selector.includes('skew') &&
            !selector.includes('transform')
          );
          selectors.push(...filtered);
          return selectors;
        }
      }),
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifySelectors: true,
          reduceIdents: false,
          zindex: false
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
    
    // Define minimal critical CSS patterns - exclude transform utilities
    const criticalPatterns = [
      // Base only
      /html\s*{[^}]*}/g,
      /body\s*{[^}]*}/g,
      /#root\s*{[^}]*}/g,
      
      // Essential layout only - no transforms
      /\.flex\s*{[^}]*}/g,
      /\.hidden\s*{[^}]*}/g,
      /\.w-full\s*{[^}]*}/g,
      
      // Essential spacing only
      /\.p-4\s*{[^}]*}/g,
      /\.m-4\s*{[^}]*}/g,
      
      // Essential text only
      /\.text-center\s*{[^}]*}/g,
      /\.text-xl\s*{[^}]*}/g,
      
      // Essential colors only
      /\.bg-white\s*{[^}]*}/g,
      /\.text-gray-900\s*{[^}]*}/g,
      
      // Essential borders only
      /\.border\s*{[^}]*}/g,
    ];

    let criticalCSS = '';
    
    // Extract critical CSS rules
    criticalPatterns.forEach(pattern => {
      const matches = css.match(pattern);
      if (matches) {
        criticalCSS += matches.join('\n') + '\n';
      }
    });

    // Add ultra-minimal critical CSS - exclude all transforms
    criticalCSS += `
/* Ultra-minimal critical CSS */
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; }

.lcp-text {
  font-size: 1.875rem;
  font-weight: 800;
  text-align: center;
  margin: 0;
}

@media (min-width: 768px) {
  .lcp-text { font-size: 2.25rem; }
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
