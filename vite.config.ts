import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import Inspect from 'vite-plugin-inspect';
import path from "path";
import { fileURLToPath } from "url";
import { compression } from "vite-plugin-compression2";
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";

  // Skip type checking during build
  if (command === "build") {
    process.env.TSC_COMPILE_ON_ERROR = "true";
    process.env.TSC_COMPILE_ON_ERROR_WATCH = "true";
  }

  // Only include necessary environment variables
  const envVars: Record<string, string> = {};
  const allowedVars = ["NODE_ENV", "VITE_"];

  Object.entries(env).forEach(([key, value]) => {
    if (allowedVars.some(prefix => key === prefix || key.startsWith(prefix))) {
      envVars[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  });

  return {
    base: "/",
    clearScreen: false,
    logLevel: mode === 'development' ? 'info' : 'warn',
    
    // Fixed: Remove React DevTools hook overrides completely
    define: {
      ...envVars,
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
      // Keep only essential flags
      __DEV__: JSON.stringify(!isProduction),
      __PROD__: JSON.stringify(isProduction),
      // Remove React Router v7 flag if not using experimental features
    },

    plugins: [
      react({
        // Let Vite handle React DevTools
        jsxImportSource: 'react',
      }),
      visualizer({
        open: true,
        filename: path.join(__dirname, 'stats.html'),
        gzipSize: true,
        brotliSize: true
      }),
      Inspect(),
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
      {
        name: 'cache-headers-plugin',
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
            const url = req.url || '';
            
            if (/\.(jpg|jpeg|png|webp|svg|ico|gif|woff2|css|js)$/.test(url)) {
              if (process.env.NODE_ENV === 'production') {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
              } else {
                res.setHeader('Cache-Control', 'public, max-age=3600');
              }
            }
            
            if (/\.(jpg|jpeg|png|webp|svg|ico|gif)$/.test(url)) {
              res.setHeader('CF-Cache-Status', 'HIT');
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              res.setHeader('CDN-Cache-Control', 'public, max-age=31536000');
            }
            
            next();
          });
        },
        generateBundle(_: any, bundle: any) {
          Object.keys(bundle).forEach(fileName => {
            const file = bundle[fileName];
            if (file.type === 'asset' && !file.name) {
              file.name = fileName;
            }
          });
        }
      },
      compression({
        algorithms: ['brotliCompress', 'gzip'],
        threshold: 1024,
      }),
      mode === 'analyze' && visualizer({}),
    ].filter(Boolean),

    publicDir: "public",
    assetsInclude: ["**/*.woff2", "**/*.svg"],

    preview: {
      port: 5000,
      strictPort: true,
    },

    resolve: {
      conditions: isProduction ? ['production', 'default'] : ['development', 'default'],
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
        // Fix html-parse-stringify CommonJS issue
        'html-parse-stringify': path.resolve(__dirname, 'node_modules/html-parse-stringify/dist/html-parse-stringify.js'),
      },
      // Add dedupe to prevent duplicate React
      dedupe: ['react', 'react-dom'],
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
            proxy.on('error', (err) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Proxying request:', req.method, req.url);
            });
          },
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
          timeout: 10000,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Socket proxy error:', err);
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
      target: ["es2020", "chrome87", "safari14", "firefox78"],
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      minify: "terser",
      cssCodeSplit: true,
      // Optimize chunk sizes for better loading
      chunkSizeWarningLimit: 1000,
      // Enable advanced optimizations
      reportCompressedSize: false, // Faster builds
      rollupOptions: {
        // Don't externalize React or critical dependencies
        external: [],
        // React Router v7 has better production builds by default
        plugins: [],
        output: {
          compact: true,
          manualChunks: (id) => {
            // Core React - only essential React libraries to prevent initialization issues
            if (
              id.includes("react/") ||
              id.includes("react-dom/") ||
              id.includes("react-jsx-runtime")
            ) {
              return "react-core";
            }

            // React libraries that depend on React but can be separate
            if (
              id.includes("react-i18next") ||
              id.includes("react-redux") ||
              id.includes("use-sync-external-store") ||
              id.includes("react-hook-form") ||
              id.includes("react-hot-toast") ||
              id.includes("react-helmet-async")
            ) {
              return "react-libs";
            }

            // React Router - separate chunk
            if (id.includes("react-router")) {
              return "react-router";
            }

            // Scroll and focus management
            if (
              id.includes("react-remove-scroll") ||
              id.includes("react-focus") ||
              id.includes("use-sidecar")
            ) {
              return "scroll-focus";
            }

            // Lucide icons core (not individual icons)
            if (
              id.includes("lucide-react") &&
              (id.includes("createLucideIcon") ||
                id.includes("defaultAttributes") ||
                id.includes("shared/src"))
            ) {
              return "lucide-core";
            }

            // Style and CSS-in-JS libraries
            if (
              id.includes("goober") ||
              id.includes("react-style-singleton") ||
              id.includes("aria-hidden")
            ) {
              return "styling";
            }

            // Utility libraries
            if (
              id.includes("shallowequal") ||
              id.includes("react-fast-compare") ||
              id.includes("invariant") ||
              id.includes("tslib")
            ) {
              return "utilities";
            }

            // Cookie and parsing libraries
            if (id.includes("cookie") || id.includes("set-cookie-parser")) {
              return "parsers";
            }

            // Callback and ref utilities
            if (
              id.includes("use-callback-ref") ||
              id.includes("react-use-callback-ref") ||
              id.includes("react-compose-refs")
            ) {
              return "ref-utils";
            }

            // Network libraries - split for better tree shaking
            if (id.includes("axios")) {
              return "axios";
            }
            if (id.includes("socket.io-client")) {
              return "socket-io";
            }

            // Utility libraries
            if (id.includes("lodash") || id.includes("date-fns")) {
              return "utils";
            }

            // Form libraries
            if (id.includes("react-hook-form")) {
              return "forms";
            }

            // UI Framework - split Radix UI more granularly
            if (
              id.includes("@radix-ui/react-tabs") ||
              id.includes("@radix-ui/react-accordion")
            ) {
              return "radix-layout";
            }
            if (
              id.includes("@radix-ui/react-select") ||
              id.includes("@radix-ui/react-scroll-area")
            ) {
              return "radix-interactive";
            }
            if (id.includes("@radix-ui/")) {
              return "radix-core";
            }

            // Let Vite handle icons naturally to avoid circular dependencies
            // Removed manual chunking for icons

            // Floating UI
            if (
              id.includes("@floating-ui") ||
              id.includes("react-remove-scroll")
            ) {
              return "floating-ui";
            }

            return null;
          },
          hoistTransitiveImports: false,
          interop: "auto",
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
        },
        treeshake: {
          preset: "smallest",
          moduleSideEffects: (id) => {
            // Allow side effects for CSS and some specific modules
            if (id.includes(".css") || id.includes(".scss")) return true;
            if (id.includes("react-hot-toast")) return true;
            return false;
          },
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          unknownGlobalSideEffects: false,
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: [
            "console.log",
            "console.warn",
            "console.error",
            "console.info",
            "console.debug",
            "console.trace",
            "console.time",
            "console.timeEnd",
            "console.group",
            "console.groupEnd",
          ],
          passes: 4,
          unsafe: false,
          unsafe_arrows: false,
          unsafe_comps: false,
          unsafe_math: true,
          unsafe_methods: false,
          unsafe_proto: false,
          unsafe_regexp: true,
          unsafe_undefined: false,
          booleans_as_integers: true,
          pure_getters: false,
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
          // Additional optimizations for unused code removal
          join_vars: true,
          warnings: false,
          global_defs: {
            "@alert": "console.log",
            DEBUG: false,
          },
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

    // Mobile performance optimizations and production builds
    optimizeDeps: {
      include: ["react", "react-dom", "react-router", "react-router-dom"],
      exclude: [
        "socket.io-client",
        "date-fns",
        "lodash-es",
        "i18next",
        "react-i18next",
      ],
      esbuildOptions: {
        // Enable better tree-shaking
        treeShaking: true,
        // Target modern browsers
        target: "es2020",
        // Force production conditions
        conditions: isProduction ? ["production"] : ["development"],
        define: {
          "process.env.NODE_ENV": isProduction
            ? '"production"'
            : '"development"',
        },
      },
    },
    
    // CommonJS module handling
    commonjsOptions: {
      transformMixedEsModules: true,
      ignoreDynamicRequires: true,
      requireReturnsDefault: true,
    },
    
    // Add CommonJS plugin for Rollup
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-libs': ['react-router', 'react-router-dom'],
          'network': ['axios', 'socket.io-client'],
          'styling': ['clsx', 'tailwind-merge'],
          'utilities': ['lodash-es', 'date-fns'],
        },
      },
    },
    
    css: {
      postcss: "./postcss.config.cjs",
      devSourcemap: mode !== "production",
      modules: {
        generateScopedName: isProduction
          ? "[hash:base64:5]"
          : "[name]__[local]--[hash:base64:5]",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ["es2020", "chrome87", "safari14", "firefox78"],
      supported: {
        "top-level-await": true,
        "dynamic-import": true,
      },
    },
  };
});
