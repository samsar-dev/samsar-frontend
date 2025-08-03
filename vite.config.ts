import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import Inspect from 'vite-plugin-inspect';
import path from "path";
import { fileURLToPath } from "url";
import { compression } from "vite-plugin-compression2";
import { visualizer } from 'rollup-plugin-visualizer';
// @ts-ignore
import * as critical from 'critical';
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Critical CSS Plugin for Vite
function criticalCSSPlugin(options: {
  criticalPages: Array<{ uri: string; template: string }>;
  criticalBase?: string;
  width?: number;
  height?: number;
}) {
  return {
    name: 'vite-plugin-critical-css',
    apply: 'build' as const,
    writeBundle: async () => {
      if (process.env.NODE_ENV === 'production') {
        try {
          const distPath = path.resolve(__dirname, 'dist');
          
          for (const page of options.criticalPages) {
            const htmlPath = path.join(distPath, `${page.template}.html`);
            
            // Check if HTML file exists
            if (require('fs').existsSync(htmlPath)) {
              console.log(`Generating critical CSS for ${page.uri}...`);
              
              await critical.generate({
                base: distPath,
                src: `${page.template}.html`,
                dest: `${page.template}.html`,
                width: options.width || 1300,
                height: options.height || 900,
                dimensions: [
                  { width: 320, height: 568 },   // Mobile
                  { width: 768, height: 1024 },  // Tablet
                  { width: 1300, height: 900 }   // Desktop
                ],
                extract: true,
                inlineImages: false,
                timeout: 30000,
                ignore: {
                  atrule: ['@font-face'],
                  rule: [/\.sr-only/]
                }
              });
              
              console.log(`✅ Critical CSS generated for ${page.uri}`);
            }
          }
        } catch (error) {
          console.warn('⚠️ Critical CSS generation failed:', error);
        }
      }
    }
  };
}

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
        generateBundle(_options: any, bundle: any) {
          console.log('\n\n--- Generated Chunks ---');
          const chunks = Object.values(bundle)
            .filter((item: any) => item.type === 'chunk')
            .map((item: any) => ({
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
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
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
        generateBundle(_: any, bundle: any) {
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

      // Modern compression with parallel processing
      compression({
        algorithms: ['brotliCompress', 'gzip'],
        threshold: 1024,
      }),
      
      // Bundle analyzer (only in analyze mode)
      mode === 'analyze' && visualizer({}),
      
      // Critical CSS plugin (production only)
      isProduction && criticalCSSPlugin({
        criticalPages: [
          { uri: '/', template: 'index' },
          { uri: '/login', template: 'index' },
          { uri: '/register', template: 'index' },
          { uri: '/listings', template: 'index' },
        ],
        width: 1300,
        height: 900
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
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
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
      target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: 'terser',
      cssCodeSplit: true,
      modulePreload: {
        polyfill: false,
      },
      rollupOptions: {
        output: {
          compact: true,
          manualChunks: (id) => {
            // Axios chunk
            if (id.includes('axios')) {
              return 'axios';
            }
            // Socket.io chunk
            if (id.includes('socket.io-client')) {
              return 'socket';
            }
            // Lodash and other utilities
            if (id.includes('lodash') || id.includes('fuse.js') || id.includes('date-fns')) {
              return 'utils';
            }
            // React core
            if (id.includes('react-dom') || id.includes('react/jsx-runtime') || id.includes('react.production.min')) {
              return 'react-core';
            }
            // React router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // UI components and libraries
            if (id.includes('lucide-react') || id.includes('radix-ui') || id.includes('react-icons') || 
                id.includes('react-select') || id.includes('react-tabs') || id.includes('react-accordion')) {
              return 'ui-components';
            }
            // UI utilities
            if (id.includes('floating-ui') || id.includes('goober') || id.includes('clsx') || 
                id.includes('@radix-ui') || id.includes('use-sidecar') || id.includes('use-callback-ref')) {
              return 'ui-utilities';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            // State management
            if (id.includes('zustand') || id.includes('immer') || id.includes('redux') || id.includes('react-redux')) {
              return 'state';
            }
            // Toast and notifications
            if (id.includes('react-hot-toast') || id.includes('react-toastify')) {
              return 'notifications';
            }
            // Forms
            if (id.includes('react-hook-form')) {
              return 'forms';
            }
            return null;
          },
          hoistTransitiveImports: false,
          interop: 'auto',
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          unknownGlobalSideEffects: false,
          computedPropertySideEffects: false,
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: ['console.log', 'console.warn', 'console.error', 'console.info', 'console.debug'],
          passes: 4,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
          booleans_as_integers: true,
          pure_getters: true,
          keep_fargs: false,
          keep_fnames: false,
          hoist_funs: true,
          hoist_vars: true,
          reduce_vars: true,
          reduce_funcs: true,
          collapse_vars: true,
          sequences: true,
          dead_code: true,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          toplevel: true,
          top_retain: [],
          side_effects: false,
          arguments: true,
          properties: true,
          join_vars: true,
        },
        mangle: {
          safari10: true,
          toplevel: true,
          eval: true,
          module: true,
          properties: {
            regex: '^__',
          },
        },
        format: {
          comments: false,
          beautify: false,
          indent_level: 0,
          max_line_len: 0,
          preserve_annotations: false,
        },
      },
    },
    
    // Mobile performance optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
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
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
      supported: {
        'top-level-await': true,
        'dynamic-import': true,
      },
    },
  };
});