import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import imagemin from "vite-plugin-imagemin";

 

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
      visualizer({
        open: true,
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
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
      createHtmlPlugin({
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: {
            ecma: 2020,
          },
        },
        inject: {
          data: {
            title: "Samsar - سمسار",
            description: "سوق السيارات والعقارات الأول في سوريا",
            themeColor: "#1a56db",
          },
        },
      }),
      // Image optimization
      imagemin({
        gifsicle: { optimizationLevel: 4, interlaced: true, colors: 256 },
        optipng: { optimizationLevel: 8 },
        mozjpeg: { quality: 75, progressive: true },
        pngquant: { quality: [0.7, 0.85], speed: 6, dithering: 0.5 },
        svgo: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeEmptyAttrs', active: true },
            { name: 'removeEmptyText', active: true },
            { name: 'removeComments', active: true },
            { name: 'removeDesc', active: true },
            { name: 'removeTitle', active: true },
            { name: 'removeMetadata', active: true },
            { name: 'removeUselessDefs', active: true },
            { name: 'removeXMLNS', active: true },
            { name: 'removeStyleElement', active: true },
            { name: 'removeScriptElement', active: true },
            { name: 'removeDimensions', active: true }
          ]
        }
      }),
      // Compression
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress'
      }),
      viteCompression({
        threshold: 1024, // Compress files >1KB
        algorithm: "gzip",
        ext: ".gz",
      }),

      // Bundle analyzer (only in analyze mode)
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "bundle-analyzer-report.html",
          gzipSize: true,
          brotliSize: true,
        }),
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
      chunkSizeWarningLimit: 100, 
      reportCompressedSize: true,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'floating-ui': ['@floating-ui/dom', '@floating-ui/core'],
            'headlessui': ['@headlessui/react'],
            'react-router-dom': ['react-router-dom'],
            'react-helmet': ['react-helmet-async'],
            'core-vendors': ['react', 'react-dom', 'react-redux'],
          },
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
        },
      },
      
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatch: false,
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
            manualChunks: {
              'floating-ui': ['floating-ui/core', 'floating-ui/dom'],
              'react-i18next': ['react-i18next'],
              'framer-motion': ['framer-motion'],
              'axios': ['axios'],
              'socket.io': ['socket.io-client'],
              'react-query': ['@tanstack/react-query'],
              'react': ['react'],
              'radix': ['@radix-ui/react-slot', '@radix-ui/react-icons'],
              'utils': ['clsx', 'tailwind-merge'],
              'react-dom': ['react-dom'],
              'react-dom-client': ['react-dom/client'],
              'react-dom-server': ['react-dom/server'],
              'react-router': [
                'react-router',
                'react-router-dom',
                'react-router-dom/server',
                'react-router-dom/client'
              ],
              'react-select': [
                'react-select',
                'react-select/async',
                'react-select/async-creatable',
                'react-select/creatable'
              ],
              'react-dnd': [
                'react-dnd',
                'react-dnd-html5-backend',
                'react-dnd-touch-backend',
                'react-dropzone',
                'browser-image-compression',
                'file-selector',
                'attr-accept',
                'lodash.throttle',
                'ua-parser-js',
                'react-device-detect',
                'fast-deep-equal',
                'shallowequal',
                'asap',
                'prop-types',
                'invariant'
              ]
            },
 
            compact: true,
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          
            
           
          },
          treeshake: {
            moduleSideEffects: 'no-external',
            propertyReadSideEffects: false,
            tryCatch: false
          },
          minifyInternalExports: true,
          manualChunks: {
            'react-dom': ['react-dom'],
            'react-dom-client': ['react-dom/client'],
            'react-dom-server': ['react-dom/server']
          }
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
            join_vars: true
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
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              if (id.includes('react/jsx-runtime')) {
                return 'react-runtime';
              }
              if (id.includes('react/jsx-dev-runtime')) {
                return 'react-dev-runtime';
              }
              return 'react-core';
            }
            if (id.includes('react-dom')) {
              if (id.includes('react-dom/client')) {
                return 'react-dom-client';
              }
              if (id.includes('react-dom/server')) {
                return 'react-dom-server';
              }
              if (id.includes('react-dom/cjs/react-dom.production.min.js')) {
                return 'react-dom-cjs';
              }
              return 'react-dom';
            }
            
            if (id.includes('react-router')) {
              if (id.includes('react-router-dom')) {
                return 'react-router-dom';
              }
              return 'react-router';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            if (id.includes('@mui/material')) {
              // Ultra-aggressive splitting for MUI system components
              if (id.includes('DefaultPropsProvider') || id.includes('ThemeProvider') || id.includes('CssBaseline') || id.includes('StyledEngineProvider') || id.includes('GlobalStyles') || id.includes('useTheme') || id.includes('useColorScheme')) {
                return 'mui-system';
              }
              if (id.includes('Button')) {
                return 'mui-button';
              }
              if (id.includes('Card') || id.includes('Paper') || id.includes('CardContent') || id.includes('CardActions')) {
                return 'mui-surfaces';
              }
              if (id.includes('Table')) {
                return 'mui-table';
              }
              if (id.includes('Dialog') || id.includes('Modal')) {
                return 'mui-dialog';
              }
              if (id.includes('Typography') || id.includes('Text')) {
                return 'mui-typography';
              }
              if (id.includes('Box') || id.includes('Grid') || id.includes('Container') || id.includes('Stack')) {
                return 'mui-layout';
              }
              if (id.includes('@headlessui')) {
                return 'headlessui';
              }
              return 'mui-core';
            }
            if (id.includes('@floating-ui')) {
              // Optimize floating-ui imports
              if (id.includes('dom')) {
                return 'floating-ui-dom';
              }
              if (id.includes('core')) {
                return 'floating-ui-core';
              }
            }
            if (id.includes('@emotion')) {
              // Ultra-aggressive splitting for emotion styling system
              if (id.includes('@emotion/react') || id.includes('emotion-element')) {
                return 'emotion-react';
              }
              if (id.includes('@emotion/styled')) {
                return 'emotion-styled';
              }
              if (id.includes('@emotion/cache') || id.includes('emotion-cache')) {
                return 'emotion-cache';
              }
              if (id.includes('@emotion/utils') || id.includes('emotion-utils')) {
                return 'emotion-utils';
              }
              if (id.includes('emotion-use-insertion-effect')) {
                return 'emotion-insertion';
              }
              return 'emotion-core';
            }
            // Gesture-related libraries
            if (id.includes('@react-spring')) {
              if (id.includes('core')) {
                return 'spring-core';
              }
              if (id.includes('gestures')) {
                return 'spring-gestures';
              }
              if (id.includes('web')) {
                return 'spring-web';
              }
              return 'spring-core';
            }
            if (id.includes('@use-gesture')) {
              if (id.includes('core')) {
                return 'use-gesture-core';
              }
              if (id.includes('react')) {
                return 'use-gesture-react';
              }
              return 'use-gesture';
            }
            if (id.includes('framer-motion')) {
              if (id.includes('gestures')) {
                return 'motion-gestures';
              }
              if (id.includes('dom')) {
                return 'motion-dom';
              }
              return 'motion-core';
            }
            if (id.includes('framer-motion')) {
              if (id.includes('dom')) {
                return 'motion-dom';
              }
              return 'motion-core';
            }
            if (id.includes('@headlessui')) {
              if (id.includes('Listbox')) {
                return 'listbox';
              }
              if (id.includes('Dialog')) {
                return 'dialog';
              }
              if (id.includes('Button')) {
                return 'headlessui-button';
              }
              return 'headlessui-core';
            }
            if (id.includes('@heroicons')) {
              return 'heroicons';
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            
            if (id.includes('lodash')) {
              return 'lodash';
            }
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // Core UI and state management
            if (id.includes('react-helmet') || id.includes('react-helmet-async')) {
              return 'helmet';
            }
            
            if (id.includes('react-toastify')) {
              return 'toast';
            }
            
            // Socket.IO and its dependencies
            if (id.includes('socket.io') || id.includes('engine.io') || id.includes('component-emitter')) {
              return 'socketio';
            }
            
            // React DOM and scheduler
            if (id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-dom';
            }
            
            // React Router and related
            if (id.includes('react-router') || id.includes('@remix-run/router')) {
              return 'router';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('yup') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // Chart libraries
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'charts';
            }
            
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf';
            }
            
            if (id.includes('react-ga4') || id.includes('@amplitude')) {
              return 'analytics';
            }
            
            if (id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }

            if (id.includes('react-hook-form') || id.includes('yup')) {
              return 'forms';
            }

            if (id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'icons';
            }

            if (id.includes('react-dropzone') || id.includes('browser-image-compression')) {
              return 'image-libs';
            }

            if (id.includes('@headlessui/react') || id.includes('react-toastify')) {
              return 'ui-libs';
            }

            if (id.includes('date-fns')) {
              return 'date-utils';
            }

            // Split MUI Select components into their own chunk
            if (id.includes('@mui/material/Select') || 
                id.includes('@mui/material/MenuItem') ||
                id.includes('@mui/material/FormControl') ||
                id.includes('@mui/material/FormLabel') ||
                id.includes('@mui/material/OutlinedInput')) {
              return 'mui-select';
            }

            // Split MUI Table components into their own chunk
            // Group Radix UI Avatar components together
            // Group optimized avatar components
            if (id.includes('avatar') || 
                id.includes('@radix-ui/react-avatar') || 
                id.includes('/ui/avatar') ||
                id.includes('Avatar.') || 
                id.includes('AvatarPrimitive')) {
              return 'avatar';
            }

            // Group chat-related components together
            if (id.includes('MessagesContext') || 
                id.includes('ConversationsList') || 
                id.includes('ChatSection') || 
                id.includes('ChatItem') || 
                id.includes('UserDetails')) {
              return 'chat-components';
            }

            if (id.includes('@mui/material/Table') || 
                id.includes('@mui/material/TableBody') ||
                id.includes('@mui/material/TableCell') ||
                id.includes('@mui/material/TableContainer') ||
                id.includes('@mui/material/TableHead') ||
                id.includes('@mui/material/TableRow') ||
                id.includes('@mui/material/TablePagination') ||
                id.includes('@mui/material/TableFooter')) {
              return 'mui-table';
            }

            if (id.includes('react-icons')) return 'icons';

            // Let Vite handle the rest of the vendor modules automatically
          }
          
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            if (pageName.includes('admin')) {
              return 'admin-pages';
            }
            if (pageName.includes('profile')) {
              return 'profile-pages';
            }
            if (pageName.includes('settings')) {
              return 'settings-pages';
            }
            return `page-${pageName.toLowerCase()}`;
          }
          
          if (id.includes('/components/listings/')) {
            const feature = id.split('/components/listings/')[1].split('/')[0];
            switch (feature) {
              case 'create':
                return 'listings-create';
              case 'details':
                return 'listings-details';
              case 'filters':
                return 'listings-filters';
              case 'images':
                return 'listings-images';
              case 'map':
                return 'listings-map';
              default:
                return 'listings-core';
            }
          }
          
          if (id.includes('/components/auth/')) {
            return 'auth';
          }
          
          if (id.includes('/components/chat/')) {
            return 'chat';
          }
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
      postcss: "./postcss.config.js",
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
      lightningcss: {
        targets: {
          chrome: 90 * 65536,
          firefox: 88 * 65536,
          safari: 15 * 65536,
          edge: 92 * 65536,
        },
      },
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
        "yup",
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
