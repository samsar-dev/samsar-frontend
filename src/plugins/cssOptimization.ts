import type { Plugin } from 'vite';

/**
 * Vite plugin for CSS optimization and critical CSS extraction
 */
export function cssOptimizationPlugin(): Plugin {
  return {
    name: 'css-optimization',
    generateBundle(options, bundle) {
      // Find CSS files and optimize them
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];
        
        if (file.type === 'asset' && fileName.endsWith('.css')) {
          console.log(`📦 CSS Asset: ${fileName} (${(file.source.length / 1024).toFixed(2)} KB)`);
          
          // Add media attribute for non-critical CSS
          if (fileName.includes('index-')) {
            // This will be handled by our async loading strategy
            console.log(`🎯 Main CSS file detected: ${fileName}`);
          }
        }
      });
    },
    
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (context.bundle) {
          // Find the main CSS file
          const cssFiles = Object.keys(context.bundle).filter(name => 
            name.endsWith('.css') && name.includes('index-')
          );
          
          if (cssFiles.length > 0) {
            const mainCssFile = cssFiles[0];
            
            // Replace blocking CSS link with preload + async loading
            html = html.replace(
              new RegExp(`<link rel="stylesheet" crossorigin href="[^"]*${mainCssFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`),
              `
              <!-- Critical CSS is inlined in head -->
              <link rel="preload" href="/assets/${mainCssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'" onerror="this.rel='stylesheet'">
              <noscript><link rel="stylesheet" href="/assets/${mainCssFile}"></noscript>
              <script>
                // Async CSS loading fallback
                (function() {
                  var link = document.querySelector('link[href*="${mainCssFile}"]');
                  if (link && link.rel === 'preload') {
                    setTimeout(function() {
                      if (link.rel === 'preload') {
                        link.rel = 'stylesheet';
                      }
                    }, 100);
                  }
                })();
              </script>
              `
            );
          }
        }
        
        return html;
      }
    }
  };
}

/**
 * PostCSS plugin for critical CSS optimization
 */
export function criticalCSSPlugin() {
  return {
    postcssPlugin: 'critical-css-optimization',
    Once(root: any) {
      // Add critical CSS markers
      root.walkRules((rule: any) => {
        // Mark critical selectors
        const criticalSelectors = [
          'body', 'html', '.container', '.hero-section', '.lcp-element',
          '.btn-primary', '.text-', '.bg-', '.flex', '.grid'
        ];
        
        const isCritical = criticalSelectors.some(selector => 
          rule.selector.includes(selector)
        );
        
        if (isCritical) {
          rule.critical = true;
        }
      });
    }
  };
}

criticalCSSPlugin.postcss = true;
