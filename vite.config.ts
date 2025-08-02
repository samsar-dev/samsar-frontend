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
      target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: 'terser',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          compact: true,
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
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: ['console.log', 'console.warn', 'console.error', 'console.info', 'console.debug'],
          passes: 3,
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
        },
        mangle: {
          safari10: true,
          toplevel: true,
          eval: true,
          module: true,
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
      exclude: ['@headlessui/react', 'framer-motion'],
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