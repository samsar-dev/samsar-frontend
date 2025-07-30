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
        algorithms: ['brotliCompress'],
        threshold: 1024,
      }),
      compression({
        algorithms: ['gzip'],
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
      chunkSizeWarningLimit: 500, 
      reportCompressedSize: true,

      
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
          'floating-ui/core',
          'floating-ui/dom',
          'react-i18next',
          'framer-motion',
          'axios',
          'socket.io-client',
          '@tanstack/react-query',
          'react',
          'react-dom',
          '@radix-ui/react-slot',
          '@radix-ui/react-icons',
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
          keepNames: true,
          legalComments: 'none',
          drop: ['debugger', 'console'],
          pure: ['React.createElement', 'React.cloneElement', 'React.memo']
        },
      },
      
      build: {
        rollupOptions: {
          output: {
            compact: true,
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: (chunkInfo) => {
              if (chunkInfo.name === 'app') {
                return 'assets/app-[hash].js';
              }
              if (chunkInfo.name === 'react-router-dom') {
                return 'assets/react-router-dom-[hash].js';
              }
              if (chunkInfo.name === 'react-helmet') {
                return 'assets/react-helmet-[hash].js';
              }
              return 'assets/[name]-[hash].js';
            },
            assetFileNames: 'assets/[name]-[hash].[ext]',
           
            
           
          },
          treeshake: {
            moduleSideEffects: false,  // More aggressive tree-shaking
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          },
          minifyInternalExports: true,

        },
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.warn'],
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
            // Less aggressive settings to avoid React error #61
            passes: 2,
            keep_fargs: false,
            pure_getters: true,
            side_effects: true
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/,
              reserved: ['__esModule', 'default']
            }
          },
          keep_classnames: false,
          keep_fnames: false,
          format: {
            comments: false,
            ascii_only: true
          }
        }
      },
      
      plugins: [
        {
          name: 'dynamic-imports',
          async generateBundle(_, bundle) {
            const dynamicImports = {
              'components': [
                'ImageFallback',
                'SkeletonGrid',
                'PreloadImages',
                'PriceConverter',
                'ErrorBoundary'
              ],
              'utils': [
                'locationUtils',
                'useTranslation'
              ]
            };

            for (const file in bundle) {
              if (bundle[file].type === 'asset') {
                const fileName = bundle[file].fileName;
                if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) {
                  // Add image optimization logic here
                } else if (fileName.endsWith('.woff2') || fileName.endsWith('.woff')) {
                  // Add font optimization logic here
                }
              }
            }
          }
        }
      ],
      
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'global': 'window'
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      },
      
      output: {
        compact: true,

        manualChunks: (id) => {
          // More balanced code splitting strategy to reduce main-thread work
          if (id.includes('node_modules')) {
            // Critical libraries that should be loaded early
            if (id.includes('react')) {
              if (id.includes('react-dom')) {
                return 'react-dom';
              }
              return 'react';
            }
            
            // Routing as a separate chunk
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            
            // UI libraries grouped more reasonably
            if (id.includes('@mui/material') || id.includes('@emotion')) {
              return 'mui';
            }
            
            if (id.includes('framer-motion') || id.includes('@headlessui') || id.includes('@radix-ui')) {
              return 'ui-animations';
            }
            
            // Forms and data handling
            if (id.includes('react-hook-form') || id.includes('react-select') || id.includes('react-dropzone')) {
              return 'forms';
            }
            
            // Utilities and helpers
            if (id.includes('date-fns') || id.includes('lodash') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            
            // Network and real-time
            if (id.includes('axios') || id.includes('socket.io-client')) {
              return 'network';
            }
            
            // Icons
            if (id.includes('react-icons') || id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'icons';
            }
            
            // Internationalization
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // Maps
            if (id.includes('react-leaflet') || id.includes('leaflet')) {
              return 'maps';
            }
            
            // Search
            if (id.includes('fuse.js')) {
              return 'search';
            }
            
            // Notifications
            if (id.includes('react-toastify') || id.includes('notistack')) {
              return 'notifications';
            }
            
            // State management
            if (id.includes('react-redux') || id.includes('@reduxjs/toolkit') || id.includes('zustand')) {
              return 'state';
            }
            
            // All other vendor libraries
            return 'vendor';
          }
          
          // Split pages into separate chunks but more conservatively
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            // Group related pages together
            if (pageName.includes('admin')) return 'admin-pages';
            if (pageName.includes('profile') || pageName.includes('settings')) return 'user-pages';
            return 'pages';
          }
          
          // Components by major feature
          if (id.includes('/components/')) {
            if (id.includes('/components/listings/')) {
              return 'listings-components';
            }
            if (id.includes('/components/auth/')) return 'auth-components';
            if (id.includes('/components/chat/')) return 'chat-components';
            if (id.includes('/components/layout/')) return 'layout-components';
            return 'components';
          }
          
          // Default behavior
          return undefined;
        }, 
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.toString();
          if (name.includes('vendor')) return 'vendor.[hash].js';
          return '[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
      sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
        const relativePath = path.relative(
          process.cwd(),
          relativeSourcePath,
        );
        return `/${relativePath}`;
      },
    },

    css: {
      postcss: "./postcss.config.cjs",
      devSourcemap: mode !== "production",
      modules: {
        localsConvention: "camelCaseOnly",
        generateScopedName:
          mode === "production"
            ? "[hash:base64:5]"
            : "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
      },
      minify: mode === "production",
      // Enhanced CSS optimization for mobile
      lightningcss: {
        targets: {
          chrome: 90 * 65536,
          firefox: 88 * 65536,
          safari: 15 * 65536,
          edge: 92 * 65536,
        },
        // Enable advanced optimizations
        minify: true,
        sourceMap: false,
        cssModules: {
          pattern: "[hash]_[local]",
        },
      },
      // Code splitting for CSS
      codeSplit: true,
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-router-dom",
        "@emotion/react",
        "@emotion/styled",
        "@mui/material/Box",
        "@mui/material/Button",
        "@mui/material/Container",
        "@mui/material/styles",
        "@mui/material/useMediaQuery",
        "@headlessui/react",
        "@heroicons/react/24/outline",
        "@heroicons/react/24/solid",
        "framer-motion", 
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@mui/system",
        "socket.io-client",
        "axios",
        "react-toastify",
        "react-i18next",
        "i18next",
        "clsx",
        "tailwind-merge",
        "react-helmet-async",
        "react-hook-form",
        "date-fns",
        "lucide-react",
      ],
      exclude: [
        "@vercel/analytics", 
        "@vercel/speed-insights",
        "fsevents" 
      ],
      force: true,
      esbuildOptions: {
        target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
        define: {
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development",
          ),
        },
        treeShaking: true,
        keepNames: true, // Preserve React component names for better debugging
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
  };
});