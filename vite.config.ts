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
    define: {
      ...envVars,
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins: [
      react({
        // Use modern browser targets
        jsxImportSource: 'react',
        // Enable fast refresh
        plugins: [],
      }),
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
      dedupe: ["react", "react-dom"],
    },

    server: {
      port: 3000,
      open: false,
      strictPort: true,
      proxy: {
        // API proxy configuration
        "/api": {
          target: process.env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
      },
    },

    build: {
      target: 'es2022', // Modern target to avoid legacy transforms
      outDir: "dist",
      assetsDir: "assets",
      assetsInlineLimit: 4096, // 4kb
      emptyOutDir: true,
      sourcemap: true,
      sourcemapIgnoreList: (file) => !file.endsWith(".js"),

      minify: 'esbuild', // Faster than terser and produces modern output
      cssCodeSplit: true,
      chunkSizeWarningLimit: 200, // More aggressive chunk size warning
      reportCompressedSize: true, // Report compressed sizes
      
      // Aggressive tree-shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatch: false,
      },
      
      // Optimize imports
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      
      // Optimize ES modules
      esModule: true,
      
      // Remove dead code
      deadCodeElimination: {
        annotations: true,
      },
      
      // Optimize output
      output: {
        compact: true,
        inlineDynamicImports: true,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-ui';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          // Your smart app-specific chunking logic
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
          if (id.includes('/components/listings/')) {
            return 'listings-components';
          }
          if (id.includes('/components/auth/')) {
            return 'auth-components';
          }
          if (id.includes('/components/chat/')) {
            return 'chat-components';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      brotliSize: false,
      cssTarget: 'es2022',

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Group vendor libraries
            if (id.includes('node_modules')) {
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-ui';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              return 'vendor'; // Catch-all for other node_modules
            }

            // App-specific chunking
            if (id.includes('/pages/')) {
              const pageName = id.split('/pages/')[1].split('.')[0];
              if (pageName.includes('admin')) return 'admin-pages';
              if (pageName.includes('profile')) return 'profile-pages';
              if (pageName.includes('settings')) return 'settings-pages';
              return `page-${pageName.toLowerCase()}`;
            }
            if (id.includes('/components/listings/')) {
              return 'listings-components';
            }
            if (id.includes('/components/auth/')) {
              return 'auth-components';
            }
            if (id.includes('/components/chat/')) {
              return 'chat-components';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) return 'assets/css/[name]-[hash][extname]';
            return 'assets/media/[name]-[hash][extname]';
          },
        },
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
        "react-router-dom",
        "react-i18next",
        "i18next",
        "axios",
        "clsx",
        "tailwind-merge",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled"
      ],
      exclude: [
        "framer-motion",
        "lodash",
        "date-fns",
        "leaflet",
        "react-leaflet"
      ],
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
