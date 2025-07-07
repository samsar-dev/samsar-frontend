import fs from 'fs';
import path from 'path';

export default function criticalCSSPlugin() {
  return {
    name: 'critical-css',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html) {
        // Read the critical CSS file
        const criticalCSSPath = path.resolve(__dirname, '../src/assets/styles/critical.css');
        let criticalCSS = '';
        
        try {
          criticalCSS = fs.readFileSync(criticalCSSPath, 'utf8');
          // Minify the CSS by removing comments and extra whitespace
          criticalCSS = criticalCSS
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .trim();
        } catch (error) {
          console.error('Error reading critical CSS:', error);
        }
        
        // Replace the placeholder comment with the actual CSS
        return html.replace('/* Critical CSS will be inlined here during build */', criticalCSS);
      },
    },
  };
}
