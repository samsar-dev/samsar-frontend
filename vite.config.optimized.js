import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";
import obfuscator from "vite-plugin-obfuscator";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable TypeScript decorators
      tsDecorators: true,
    }),
    splitVendorChunkPlugin(),
    // Obfuscation plugin with aggressive settings
    obfuscator({
      // Basic options
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 4000,
      disableConsoleOutput: false,
      
      // String and identifier obfuscation
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: true,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      
      // Optimization
      target: 'browser',
    }),
    // Visualizer should be last to analyze the final output
    visualizer({
      filename: "bundle-analyzer.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: "esnext",
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React split into smallest possible chunks
          if (id.includes('node_modules/react/')) {
            if (id.includes('react-dom/')) {
              return id.includes('client') ? 'vendor_react_dom_client' : 'vendor_react_dom';
            }
            if (id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
              return 'vendor_react_jsx';
            }
            if (id.includes('react/cjs/') || id.includes('react/umd/')) {
              return 'vendor_react_cjs';
            }
            return 'vendor_react';
          }

          // React Router - split into separate chunks
          if (id.includes('react-router-dom/')) {
            if (id.includes('client.js') || id.includes('index.js')) {
              return 'vendor_router_core';
            }
            return 'vendor_router_components';
          }

          // Split MUI into the smallest possible chunks
          if (id.includes('@mui/material')) {
            // Core MUI utilities
            if (id.includes('@mui/material/utils/') || id.includes('@mui/material/styles/')) {
              return 'vendor_mui_core';
            }
            // Split by component type
            const componentMatch = id.match(/@mui\/material\/([^/]+)/);
            if (componentMatch) {
              const componentName = componentMatch[1];
              return `vendor_mui_${componentName.toLowerCase()}`;
            }
            return 'vendor_mui_utils';
          }

          // Icons - each icon set in its own chunk
          if (id.includes('@mui/icons-material/')) {
            const iconMatch = id.match(/@mui\/icons-material\/([^/]+)/);
            return iconMatch ? `vendor_icons_mui_${iconMatch[1]}` : 'vendor_icons_mui';
          }
          if (id.includes('@heroicons/')) {
            return 'vendor_icons_hero';
          }
          if (id.includes('lucide-react')) {
            return 'vendor_icons_lucide';
          }

          // Form handling - split validation from form logic
          if (id.includes('react-hook-form/')) {
            return 'vendor_forms_core';
          }
          if (id.includes('@hookform/')) {
            return 'vendor_forms_hookform';
          }
          if (id.includes('yup') || id.includes('zod')) {
            return 'vendor_forms_validation';
          }

          // State management - split Redux from other state solutions
          if (id.includes('@reduxjs/toolkit')) {
            return 'vendor_redux_toolkit';
          }
          if (id.includes('react-redux/')) {
            return 'vendor_react_redux';
          }
          if (id.includes('@tanstack/')) {
            return 'vendor_tanstack';
          }

          // Utility libraries - split into smaller chunks
          if (id.includes('lodash')) {
            return 'vendor_utils_lodash';
          }
          if (id.includes('date-fns')) {
            return 'vendor_utils_date';
          }
          if (id.includes('axios')) {
            return 'vendor_utils_axios';
          }

          // UI libraries - each in its own chunk
          if (id.includes('flowbite')) {
            return 'vendor_flowbite';
          }
          if (id.includes('@tremor')) {
            return 'vendor_tremor';
          }
          if (id.includes('react-slick')) {
            return 'vendor_slick';
          }
          if (id.includes('framer-motion')) {
            return 'vendor_framer';
          }

          // Split application code by feature
          if (id.includes('src/')) {
            const featureMatch = id.match(/src\/([^/]+)/);
            if (featureMatch) {
              return `feature_${featureMatch[1].toLowerCase()}`;
            }
          }

          // Group remaining node_modules by package name
          if (id.includes('node_modules/')) {
            const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
            if (match) {
              const packageName = match[1].replace(/[^a-z0-9]/g, '_').toLowerCase();
              return `vendor_${packageName}`;
            }
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3,
        ecma: 2020,
        toplevel: true,
      },
      format: {
        comments: false,
        ecma: 2020,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React split into smaller chunks
          if (id.includes('node_modules/react/')) {
            if (id.includes('react-dom/')) {
              return 'vendor_react_dom';
            }
            if (id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
              return 'vendor_react_jsx';
            }
            return 'vendor_react';
          }

          // React Router
          if (id.includes('react-router-dom/')) {
            return 'vendor_router';
          }

          // Split MUI into smaller, more specific chunks
          if (id.includes('@mui/material')) {
            // Core MUI utilities (small but needed everywhere)
            if (id.includes('@mui/material/utils/') || id.includes('@mui/material/styles/')) {
              return 'vendor_mui_core';
            }
            // Layout components
            if (id.includes('/Grid') || id.includes('/Container') || id.includes('/Box')) {
              return 'vendor_mui_layout';
            }
            // Form components
            if (id.includes('/TextField') || id.includes('/Select') || id.includes('/Checkbox') || 
                id.includes('/Radio') || id.includes('/Form') || id.includes('/Input')) {
              return 'vendor_mui_forms';
            }
            // Data display
            if (id.includes('/Table') || id.includes('/Card') || id.includes('/List')) {
              return 'vendor_mui_data';
            }
            // Feedback components
            if (id.includes('/Dialog') || id.includes('/Snackbar') || id.includes('/Alert')) {
              return 'vendor_mui_feedback';
            }
            // Navigation
            if (id.includes('/Button') || id.includes('/AppBar') || id.includes('/Tabs')) {
              return 'vendor_mui_nav';
            }
            return 'vendor_mui_utils';
          }

          // Icons - split by library
          if (id.includes('@mui/icons-material/')) {
            return 'vendor_icons_mui';
          }
          if (id.includes('@heroicons/')) {
            return 'vendor_icons_hero';
          }
          if (id.includes('lucide-react')) {
            return 'vendor_icons_lucide';
          }

          // Form handling - split validation from form logic
          if (id.includes('react-hook-form/') || id.includes('@hookform/')) {
            return 'vendor_forms_core';
          }
          if (id.includes('yup') || id.includes('zod')) {
            return 'vendor_forms_validation';
          }

          // State management - split Redux from other state solutions
          if (id.includes('@reduxjs/toolkit') || id.includes('@reduxjs/toolkit/')) {
            return 'vendor_redux_toolkit';
          }
          if (id.includes('react-redux/')) {
            return 'vendor_react_redux';
          }
          if (id.includes('@tanstack/')) {
            return 'vendor_tanstack';
          }

          // Utility libraries - split into smaller chunks
          if (id.includes('lodash/')) {
            return 'vendor_utils_lodash';
          }
          if (id.includes('date-fns/')) {
            return 'vendor_utils_date';
          }
          if (id.includes('axios/')) {
            return 'vendor_utils_axios';
          }

          // UI libraries - each in its own chunk
          if (id.includes('flowbite')) {
            return 'vendor_flowbite';
          }
          if (id.includes('@tremor')) {
            return 'vendor_tremor';
          }
          if (id.includes('react-slick')) {
            return 'vendor_slick';
          }
          if (id.includes('framer-motion')) {
            return 'vendor_framer';
          }

          // Map libraries
          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'vendor_leaflet';
          }
          if (id.includes('@react-google-maps')) {
            return 'vendor_gmaps';
          }

          // Group remaining node_modules by package name (first segment)
          if (id.includes('node_modules/')) {
            const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
            if (match) {
              const packageName = match[1];
              // Group by package name for better caching
              return `vendor_${packageName.replace(/[^a-z0-9]/g, '_').toLowerCase()}`;
            }
          }

          // Group application code by feature
          if (id.includes('src/')) {
            const featureMatch = id.match(/src\/([^/]+)/);
            if (featureMatch) {
              return `feature_${featureMatch[1].toLowerCase()}`;
            }
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
      format: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@emotion/react",
      "@emotion/styled",
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`,
      },
    },
  },
});
