import { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { minify } from 'csso';
import { createHash } from 'crypto';

export default function criticalCSS(): Plugin {
  return {
    name: 'vite-plugin-critical-css',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { path }) {
        if (!path.endsWith('index.html')) return html;
        
        // Generate critical CSS from Tailwind
        const criticalCSS = generateCriticalCSS();
        
        // Inject critical CSS into the head
        return html.replace(
          '<style id="critical-css">',
          `<style id="critical-css">${criticalCSS}`
        );
      },
    },
  };
}

function generateCriticalCSS(): string {
  // This is a simplified version - in a real app, you'd want to use a tool like
  // critters, penthouse, or critical to generate the actual critical CSS
  
  const baseStyles = `
    :root {
      --primary-color: #0ea5e9;
      --text-primary: #1a1a1a;
      --bg-primary: #ffffff;
    }
    
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
    }
    
    html {
      line-height: 1.5;
      -webkit-text-size-adjust: 100%;
      tab-size: 4;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    }
    
    body {
      margin: 0;
      line-height: inherit;
      color: var(--text-primary);
      background-color: var(--bg-primary);
    }
    
    /* Add more critical styles as needed */
  `;
  
  // Minify the CSS
  const { css } = minify(baseStyles, {
    restructure: true,
    forceMediaMerge: true,
  });
  
  return css;
}
