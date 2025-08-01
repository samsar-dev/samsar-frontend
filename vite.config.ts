import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import Inspect from 'vite-plugin-inspect';
import path from "path";
import { fileURLToPath } from "url";
import { compression } from "vite-plugin-compression2";
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from "vite-plugin-imagemin";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Set base URL for assets
  const base = process.env.NODE_ENV === "production" ? "/" : "/";

  // Skip type checking during build
  if (command === "build") {
    process.env.TSC_COMPILE_ON_ERROR = "true";
    process.env.TSC_COMPILE_ON_ERROR_WATCH = "true";
  }

  // Only include necessary environment variables
  const envVars: Record<string, string> = {};
  const allowedVars = ["NODE_ENV", "VITE_"];

  Object.entries(env).forEach(([key, value]) => {
    if (
      allowedVars.some((prefix) => key === prefix || key.startsWith(prefix))
    ) {
      envVars[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  });

  const isProduction = mode === "production";

  return {
    base: base,
    // Clear cache on config change
    clearScreen: false,
    // Improved error handling
    logLevel: mode === 'development' ? 'info' : 'warn',
    define: {
      ...envVars,
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Ensure global is defined for some libraries
      global: 'globalThis',
    },
    plugins: [
      react(),
      cssInjectedByJsPlugin(),
      visualizer({
        open: true,
        filename: path.join(__dirname, 'stats.html'),
        gzipSize: true,
        brotliSize: true
      }),
      Inspect(), // Add Inspect plugin for bundle analysis
      (() => ({
        name: 'print-chunks',
        generateBundle(options, bundle) {
          console.log('\n\n--- Generated Chunks ---');
          const chunks = Object.values(bundle)
            .filter((item): item is import('rollup').OutputChunk => (item as any).type === 'chunk')
            .map(item => ({
              name: item.fileName,
              size: `${(item.code.length / 1024).toFixed(2)} kB`
            }))
            .sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
          console.table(chunks);
          console.log('------------------------\n');
        },
      }))(),


      // Cache headers plugin for Cloudflare
      {
        name: 'cache-headers-plugin',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            
            // Set cache headers for static assets
            if (/\.(jpg|jpeg|png|webp|svg|ico|gif|woff2|css|js)$/.test(url)) {
              // Cache static assets for 1 year in production (Cloudflare R2 compatible)
              if (process.env.NODE_ENV === 'production') {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
              } else {
                // Shorter cache for development
                res.setHeader('Cache-Control', 'public, max-age=3600');
              }
            }
            
            // Cache images with Cloudflare R2 optimization headers
            if (/\.(jpg|jpeg|png|webp|svg|ico|gif)$/.test(url)) {
              res.setHeader('CF-Cache-Status', 'HIT');
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              res.setHeader('CDN-Cache-Control', 'public, max-age=31536000');
            }
            
            next();
          });
        },
        generateBundle(_, bundle) {
          // Add cache headers for build output
          Object.keys(bundle).forEach(fileName => {
            const file = bundle[fileName];
            if (file.type === 'asset') {
              // Add cache metadata for CDN optimization
              if (!file.name) file.name = fileName;
            }
          });
        }
      },

      // Image optimization with modern plugin
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        optipng: { optimizationLevel: 5 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.7, 0.9], speed: 4 },
        svgo: { plugins: [{ name: 'removeViewBox' }, { name: 'cleanupIDs' }] },
      }),

      // Modern compression with parallel processing
      compression({
        algorithms: ['brotliCompress', 'gzip'],
        threshold: 1024,
      }),
      
      // Bundle analyzer (only in analyze mode)
      mode === 'analyze' && visualizer({}),
    ].filter(Boolean),

    // Configure static asset handling
    publicDir: "public",
    assetsInclude: ["**/*.woff2", "**/*.svg"],

    preview: {
      port: 5000,
      strictPort: true,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, "src/components"),
        '@pages': path.resolve(__dirname, "src/pages"),
        '@assets': path.resolve(__dirname, "src/assets"),
        '@hooks': path.resolve(__dirname, "src/hooks"),
        '@services': path.resolve(__dirname, "src/services"),
        '@store': path.resolve(__dirname, "src/store"),
        '@types': path.resolve(__dirname, "src/types"),
        '@utils': path.resolve(__dirname, "src/utils"),
        'react-router-dom$'  : 'react-router-dom/dist/index.production.min.js',
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0', 
      strictPort: true, 
      open: false, 
      cors: true,
      hmr: {
        port: 3001, 
        host: 'localhost',
        overlay: true, 
        clientPort: 3001, 
      },
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          timeout: 10000, 
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying request:', req.method, req.url);
            });
          },
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
          timeout: 10000,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Socket proxy error:', err);
            });
          },
        },
      },
      watch: {
        usePolling: false, 
        interval: 100, 
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.env*',
          '**/coverage/**',
          '**/.nyc_output/**',
          '**/.cache/**',
          '**/.temp/**',
          '**/.tmp/**'
        ],
      },
    },

    build: {
      target: 'es2022', 
      outDir: "dist",
      assetsDir: "assets",
      assetsInlineLimit: 4096, 
      emptyOutDir: true,
      sourcemap: false,
      sourcemapIgnoreList: (file) => !file.endsWith(".js"),

      minify: 'terser', 
      cssCodeSplit: true,
      chunkSizeWarningLimit: 300, 
      dynamicImportVarsOptions: { warnOnError: true },
      reportCompressedSize: true,
      
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          dead_code: true,
          unused: true,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          if_return: true,
          join_vars: true,
          reduce_vars: true,
          collapse_vars: true,
          inline: 3,
          passes: 4,
          keep_fargs: false,
          pure_getters: true,
          side_effects: false,
          sequences: true,
          properties: true,
          switches: true,
          negate_iife: true,
          hoist_funs: true,
          hoist_props: true,
          hoist_vars: true,
          module: true,
          toplevel: true,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_methods: true,
          pure_funcs: [
            'console.log',
            'console.info',
            'console.warn',
            'console.error',
            'console.trace',
            'console.debug',
            'console.table'
          ]
        },
        mangle: {
          toplevel: true,
          properties: {
            regex: /^_/
          }
        },
        format: {
          comments: false,
          ascii_only: true,
          beautify: false,
          braces: false,
          semicolons: false
        }
      },

      rollupOptions: {
        external: [
          '@mui/material',
          '@mui/system',
          '@mui/icons-material',
          'react',
          'react-dom'
        ],
        output: {
          compact: true,
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // --- Heavy libraries (split from vendor-misc) ---
            if (id.includes('immer')) return 'immer';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('fuse.js')) return 'fuse-search';
            if (id.includes('cross-fetch')) return 'cross-fetch';
            
            // --- Animation libraries ---
            if (id.includes('motion-dom')) return 'motion-dom';
            if (id.includes('framer-motion')) return 'framer-motion';
            
            // --- Socket libraries ---
            if (id.includes('engine.io-client')) return 'socket-engine';
            if (id.includes('socket.io-client')) return 'socket-client';
            
            // --- Emotion CSS-in-JS ---
            if (id.includes('@emotion/cache')) return 'emotion-cache';
            if (id.includes('@emotion/react')) return 'emotion-react';
            if (id.includes('@emotion/styled')) return 'emotion-styled';
            if (id.includes('@emotion')) return 'emotion-core';
            
            // --- State management ---
            if (id.includes('redux')) return 'redux';
            if (id.includes('reselect')) return 'reselect';
            if (id.includes('zustand')) return 'zustand';
            
            // --- Notifications ---
            if (id.includes('react-hot-toast')) return 'react-hot-toast';
            
            // --- Cookie handling ---
            if (id.includes('set-cookie-parser')) return 'set-cookie-parser';
            
            // --- vendor-misc (remaining utilities) ---
            if (id.includes('react-transition-group')) return 'react-transition-group';
            if (id.includes('object-assign')) return 'object-assign';
            if (id.includes('deepmerge')) return 'deepmerge';
            if (id.includes('hoist-non-react-statics')) return 'hoist-non-react-statics';
            if (id.includes('tiny-invariant')) return 'tiny-invariant';
            if (id.includes('tiny-warning')) return 'tiny-warning';
            if (id.includes('react-error-boundary')) return 'react-error-boundary';
            if (id.includes('react-fast-compare')) return 'react-fast-compare';
            if (id.includes('react-is')) return 'react-is';
            if (id.includes('react-refresh')) return 'react-refresh';
            if (id.includes('rc-util')) return 'rc-util';
            if (id.includes('rc-field-form')) return 'rc-field-form';
            if (id.includes('rc-')) return 'rc-lib';

            // --- i18n (ultra-granular) ---
            if (id.includes('react-i18next')) return 'i18n-react';
            if (id.includes('i18next-browser-languagedetector')) return 'i18n-languagedetector';
            if (id.includes('i18next-http-backend')) return 'i18n-http-backend';
            if (id.includes('i18next')) return 'i18n-core';
            if (id.includes('locales')) return 'i18n-locales';
            if (id.includes('i18next-fs-backend')) return 'i18n-fs-backend';
            if (id.includes('i18next-localstorage-backend')) return 'i18n-localstorage-backend';

            // --- React Router (ultra-granular) ---
            if (id.includes('react-router-dom')) return 'react-router-dom';
            if (id.includes('react-router')) return 'react-router-core';

            // --- More vendor libraries (split out of vendor-misc) ---
            if (id.includes('@date-io')) return 'date-io';
            if (id.includes('zod')) return 'zod';
            if (id.includes('formik')) return 'formik';
            if (id.includes('yup')) return 'yup';
            if (id.includes('notistack')) return 'notistack';
            if (id.includes('uuid')) return 'uuid';
            if (id.includes('qs')) return 'qs';
            if (id.includes('lodash')) return 'lodash';
            if (id.includes('dayjs')) return 'dayjs';
            if (id.includes('moment')) return 'moment';
            if (id.includes('react-toastify')) return 'react-toastify';
            if (id.includes('react-helmet-async')) return 'react-helmet-async';
            if (id.includes('react-helmet')) return 'react-helmet';
            if (id.includes('@heroicons')) return 'heroicons';
            if (id.includes('lucide-react')) return 'lucide-react';
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('@headlessui')) return 'headlessui';
            if (id.includes('tailwind-merge')) return 'tailwind-merge';

            // --- MUI components (ultra-granular) ---
            if (id.includes('@mui/material/Button')) return 'mui-button';
            if (id.includes('@mui/material/Box')) return 'mui-box';
            if (id.includes('@mui/material/Container')) return 'mui-container';
            if (id.includes('@mui/material/Typography')) return 'mui-typography';
            if (id.includes('@mui/material/Grid')) return 'mui-grid';
            if (id.includes('@mui/material/Card')) return 'mui-card';
            if (id.includes('@mui/material/Paper')) return 'mui-paper';
            if (id.includes('@mui/material/Chip')) return 'mui-chip';
            if (id.includes('@mui/material/IconButton')) return 'mui-icon-button';
            if (id.includes('@mui/material/Dialog')) return 'mui-dialog';
            if (id.includes('@mui/material/TextField')) return 'mui-text-field';
            if (id.includes('@mui/material/Form')) return 'mui-form';
            if (id.includes('@mui/material/List')) return 'mui-list';
            if (id.includes('@mui/material/AppBar')) return 'mui-app-bar';
            if (id.includes('@mui/material/Toolbar')) return 'mui-toolbar';
            if (id.includes('@mui/material/styles')) return 'mui-styles';
            if (id.includes('@mui/material/useMediaQuery')) return 'mui-use-media-query';
            if (id.includes('@mui/material/Divider')) return 'mui-divider';
            if (id.includes('@mui/material/Collapse')) return 'mui-collapse';
            if (id.includes('@mui/material/Drawer')) return 'mui-drawer';
            if (id.includes('@mui/material/Skeleton')) return 'mui-skeleton';
            if (id.includes('@mui/material/Tabs')) return 'mui-tabs';
            if (id.includes('@mui/material/Avatar')) return 'mui-avatar';
            if (id.includes('@mui/material/Menu')) return 'mui-menu';
            if (id.includes('@mui/material/Snackbar')) return 'mui-snackbar';
            if (id.includes('@mui/material/Stepper')) return 'mui-stepper';
            if (id.includes('@mui/material/Grid2')) return 'mui-grid2';
            if (id.includes('@mui/material/Accordion')) return 'mui-accordion';
            if (id.includes('@mui/material/AccordionSummary')) return 'mui-accordion-summary';
            if (id.includes('@mui/material/AccordionDetails')) return 'mui-accordion-details';
            if (id.includes('@mui/material/CircularProgress')) return 'mui-circular-progress';
            if (id.includes('@mui/material/LinearProgress')) return 'mui-linear-progress';
            if (id.includes('@mui/material/Rating')) return 'mui-rating';
            if (id.includes('@mui/material/Slider')) return 'mui-slider';
            if (id.includes('@mui/material/Switch')) return 'mui-switch';
            if (id.includes('@mui/material/Tooltip')) return 'mui-tooltip';
            if (id.includes('@mui/material/Popover')) return 'mui-popover';
            if (id.includes('@mui/material/Popper')) return 'mui-popper';
            if (id.includes('@mui/material/Backdrop')) return 'mui-backdrop';
            if (id.includes('@mui/material/Grow')) return 'mui-grow';
            if (id.includes('@mui/material/Fade')) return 'mui-fade';
            if (id.includes('@mui/material/Zoom')) return 'mui-zoom';
            if (id.includes('@mui/material/Slide')) return 'mui-slide';
            if (id.includes('@mui/material/Stepper')) return 'mui-stepper';
            if (id.includes('@mui/material/Grid2')) return 'mui-grid2';
            if (id.includes('@mui/material/Accordion')) return 'mui-accordion';
            if (id.includes('@mui/material/internal')) return 'mui-internal';
            if (id.includes('@mui/material/utils')) return 'mui-utils-internal';
            if (id.includes('@mui/material/styles/')) return 'mui-styles-sub';
            if (id.includes('@mui/material/colors')) return 'mui-colors';
            if (id.includes('@mui/material/locale')) return 'mui-locale';
            if (id.includes('@mui/material/Unstable_')) return 'mui-unstable';
            
            // --- MUI system utilities (split these from mui-misc) ---
            if (id.includes('@mui/system/colorManipulator')) return 'mui-system-color';
            if (id.includes('@mui/system/css')) return 'mui-system-css';
            if (id.includes('@mui/system/styled')) return 'mui-system-styled';
            if (id.includes('@mui/system/useTheme')) return 'mui-system-theme';
            if (id.includes('@mui/system/useMediaQuery')) return 'mui-system-media';
            if (id.includes('@mui/system/createTheme')) return 'mui-system-create-theme';
            if (id.includes('@mui/system/createBreakpoints')) return 'mui-system-breakpoints';
            if (id.includes('@mui/system/style')) return 'mui-system-style';
            
            // --- MUI icons (group by category) ---
            if (id.includes('@mui/icons-material/')) {
              const iconPath = id.toLowerCase();
              if (iconPath.includes('navigation')) return 'mui-icons-navigation';
              if (iconPath.includes('action')) return 'mui-icons-action';
              if (iconPath.includes('content')) return 'mui-icons-content';
              if (iconPath.includes('device')) return 'mui-icons-device';
              if (iconPath.includes('editor')) return 'mui-icons-editor';
              if (iconPath.includes('image')) return 'mui-icons-image';
              if (iconPath.includes('alert')) return 'mui-icons-alert';
              if (iconPath.includes('toggle')) return 'mui-icons-toggle';
              return 'vendor-misc';
            }
            
            // --- MUI lab & data grid ---
            if (id.includes('@mui/lab/')) return 'mui-lab';
            if (id.includes('@mui/x-data-grid')) return 'mui-data-grid';
            
            // --- MUI material components (strategic splits) ---
            if (id.includes('@mui/material/Dialog')) return 'mui-dialog';
            if (id.includes('@mui/material/Drawer')) return 'mui-drawer';
            if (id.includes('@mui/material/Menu')) return 'mui-menu';
            if (id.includes('@mui/material/Popover')) return 'mui-popover';
            if (id.includes('@mui/material/Modal')) return 'mui-modal';
            if (id.includes('@mui/material/Tooltip')) return 'mui-tooltip';
            if (id.includes('@mui/material/Snackbar')) return 'mui-snackbar';
            if (id.includes('@mui/material/Stepper')) return 'mui-stepper';
            if (id.includes('@mui/material/Accordion')) return 'mui-accordion';
            if (id.includes('@mui/material/Progress')) return 'mui-progress';
            if (id.includes('@mui/material/Rating')) return 'mui-rating';
            if (id.includes('@mui/material/Slider')) return 'mui-slider';
            if (id.includes('@mui/material/Switch')) return 'mui-switch';
            
            // --- MUI system (main) ---
            if (id.includes('@mui/system')) return 'mui-system-core';
            if (id.includes('@mui/base')) return 'mui-base';
            if (id.includes('@mui/utils')) return 'mui-utils-core';
            if (id.includes('@mui/icons-material')) return 'mui-icons';
            if (id.includes('@mui/lab')) return 'mui-lab';
            if (id.includes('@mui/x-data-grid')) return 'mui-data-grid';
          
            // --- Other common libraries ---
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('lodash')) return 'lodash';
            if (id.includes('clsx')) return 'clsx';
            if (id.includes('uuid')) return 'uuid';
            if (id.includes('formik')) return 'formik';
            if (id.includes('yup')) return 'yup';
            if (id.includes('notistack')) return 'notistack';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react-hook-form')) return 'react-hook-form';
            if (id.includes('axios')) return 'axios';
          
            // --- React and vendor ---
            if (id.includes('node_modules/react/')) return 'react-vendor';
            if (id.includes('node_modules/react-dom/')) return 'react-dom-vendor';
            if (id.includes('node_modules/@mui/material/')) return 'mui-material-vendor';
            if (id.includes('node_modules/@mui/')) return 'mui-system-vendor';
            if (id.includes('node_modules/core-js/')) return 'polyfills';
            if (id.includes('node_modules/react-router/dist/development/chunk-KIUJAIYX.mjs')) return 'react-router-chunk-kiujaiyx';
            if (id.includes('node_modules/react-router/dist/development/chunk-C37GKA54.mjs')) return 'react-router-chunk-c37gka54';
            if (id.includes('node_modules/react-router/dist/development/chunk-')) {
              // fallback for any other react-router chunk
              return 'react-router-chunks';
            }

          
            // --- Catch-all for any remaining large node_modules chunk ---
            if (id.includes('node_modules/')) return 'vendor-misc';
          },
        },
        treeshake: {
          moduleSideEffects: false,
          preset: 'smallest',
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          unknownGlobalSideEffects: false,
        },
      },
      
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      
      esModule: true,
      
      deadCodeElimination: {
        annotations: true,
      },
      
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@tanstack/react-query',
          'axios',
          'socket.io-client',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
          'react-hook-form',
          'react-i18next',
          'date-fns',
          'clsx',
          'tailwind-merge'
        ],
        esbuildOptions: {
          target: 'es2020',
          treeShaking: true,
          define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
            'global': 'window'
          },
          keepNames: false,
          legalComments: 'none',
          drop: ['debugger', 'console'],
          pure: ['React.createElement', 'React.cloneElement', 'React.memo', 'console.log', 'console.warn', 'console.info']
        },
      },
    },

    css: {
      postcss: "./postcss.config.cjs",
      devSourcemap: mode !== "production",
      modules: {
        generateScopedName: isProduction 
          ? '[hash:base64:5]' 
          : '[name]__[local]--[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
      },
      minify: mode === "production",
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
  };
});