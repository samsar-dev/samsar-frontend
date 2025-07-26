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
          drop: ['debugger', 'console']
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
              'react': ['react', 'react-dom'],
              'radix': ['@radix-ui/react-slot', '@radix-ui/react-icons'],
              'utils': ['clsx', 'tailwind-merge']
            },
            inlineDynamicImports: true,
            compact: true,
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          
            
           
          },
          treeshake: {
            moduleSideEffects: true,
            propertyReadSideEffects: false,
            tryCatch: false
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
              if (id.includes('Button')) {
                return 'mui-button';
              }
              if (id.includes('Card')) {
                return 'mui-card';
              }
              if (id.includes('Table')) {
                return 'mui-table';
              }
              if (id.includes('Dialog')) {
                return 'mui-dialog';
              }
              return 'mui-core';
            }
            if (id.includes('@emotion')) {
              return 'emotion';
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
            
            if (id.includes('react-hook-form') || id.includes('yup') || id.includes('@hookform')) {
              return 'forms';
            }
            
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'maps';
            }
            
            if (id.includes('react-dnd') || id.includes('dnd-core')) {
              return 'dnd';
            }
            
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux';
            }
            
            if (id.includes('socket.io')) {
              return 'socket';
            }
            
            if (id.includes('react-image-crop') || id.includes('browser-image-compression')) {
              return 'image-utils';
            }
            
            if (id.includes('formik') || id.includes('formik-yup')) {
              return 'formik';
            }
            
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
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-router-dom",
        "@headlessui/react",
        "@heroicons/react/24/outline",
        "@heroicons/react/24/solid",
        "framer-motion",
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
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
  };
});
