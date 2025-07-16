import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // Set base URL for assets
  const base = process.env.NODE_ENV === 'production' ? '/' : '/';

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
    define: envVars,
    plugins: [
      react({
        // Enable TypeScript decorators
        tsDecorators: true,
        // Development options
        jsxImportSource: "@emotion/react",
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),

      createHtmlPlugin({
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: false,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
        },
        inject: {
          data: {
            title: "Samsar - سمسار",
            description: "سوق السيارات والعقارات الأول في سوريا",
            themeColor: "#1a56db",
          },
          tags: [
            {
              tag: 'meta',
              attrs: {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
              },
              injectTo: 'head-prepend'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'theme-color',
                content: '#1a56db'
              },
              injectTo: 'head-prepend'
            }
          ]
        }
      }),
      // Image optimization will be handled by the build script

      // Compression
      viteCompression({
        threshold: 1024, // Compress files >1KB
        algorithm: "brotliCompress",
        ext: ".br",
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
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "src/components"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@services": path.resolve(__dirname, "src/services"),
        "@store": path.resolve(__dirname, "src/store"),
        "@types": path.resolve(__dirname, "src/types"),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
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
      target: 'es2020',
      outDir: "dist",
      assetsDir: "assets",
      assetsInlineLimit: 4096, // 4kb
      emptyOutDir: true,
      sourcemap: true,
      sourcemapFileNames: '[name]-[hash].map',
      sourcemapIgnoreList: (file) => !file.endsWith('.js'),
      
      minify: isProduction ? "terser" : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      brotliSize: false,
      
      css: {
        modules: {
          localsConvention: "camelCaseOnly",
          generateScopedName:
            mode === "production"
              ? "[hash:base64:5]"
              : "[name]__[local]__[hash:base64:5]",
        },
        preprocessorOptions: {
          scss: {
            additionalData: `@import "@/assets/styles/variables.scss";`
          }
        }
      },
      
      rollupOptions: {
        output: {
          sourcemap: true,
          sourcemapExcludeSources: false,
          sourcemapFileNames: '[name]-[hash].map',
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) return 'framer-motion';
              if (id.includes('@headlessui')) return 'headless-ui';
              if (id.includes('@heroicons')) return 'heroicons';
              if (id.includes('react-router-dom')) return 'react-router';
              if (id.includes('react')) return 'react';
              if (id.includes('date-fns')) return 'date-fns';
              if (id.includes('axios')) return 'axios';
              if (id.includes('i18next')) return 'i18next';
              if (id.includes('leaflet')) return 'leaflet';
              if (id.includes('react-leaflet')) return 'leaflet';
              if (id.includes('react-hook-form')) return 'forms';
              
              // Handle other common packages
              if (id.includes('react-query')) return 'react-query';
              if (id.includes('zustand')) return 'zustand';

              if (id.includes('tailwindcss')) return 'tailwind';
              if (id.includes('clsx')) return 'clsx';
              if (id.includes('react-hot-toast')) return 'toast';
              if (id.includes('socket.io-client')) return 'socket';
              
              // Handle smaller packages together
              if (id.includes('yup') || id.includes('formik')) return 'forms';
              if (id.includes('date-fns-tz')) return 'date-fns';
              if (id.includes('chart.js')) return 'charts';
              if (id.includes('react-chartjs-2')) return 'charts';
              
              // Handle utility libraries
              if (id.includes('lodash')) return 'lodash';
              if (id.includes('clsx')) return 'clsx';
              if (id.includes('nanoid')) return 'nanoid';
              
              // Handle image and media packages
              if (id.includes('sharp')) return 'sharp';
              if (id.includes('image-js')) return 'image';
              
              // Handle other UI components
              if (id.includes('@radix-ui')) return 'radix';
              if (id.includes('react-select')) return 'select';
              if (id.includes('react-table')) return 'table';
              
              // Handle other common utilities
              if (id.includes('axios')) return 'axios';
              if (id.includes('qs')) return 'axios';
              if (id.includes('jwt-decode')) return 'auth';
              
              // Handle analytics and tracking
              if (id.includes('@vercel/analytics')) return 'analytics';
              if (id.includes('react-ga4')) return 'analytics';
              
              // Handle other common utilities
              if (id.includes('uuid')) return 'uuid';
              if (id.includes('date-fns')) return 'date';
              if (id.includes('yup')) return 'validation';
              if (id.includes('formik')) return 'validation';
              
              // Handle other UI components
              if (id.includes('react-modal')) return 'modal';
              if (id.includes('react-datepicker')) return 'datepicker';
              
              // Handle other common utilities
              if (id.includes('classnames')) return 'classnames';
              if (id.includes('prop-types')) return 'react';
              
              // Default vendor chunk for other node_modules
              return 'vendor';
            }
          },
          sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            const relativePath = path.relative(process.cwd(), relativeSourcePath);
            // Use relative path for source maps
            return `/${relativePath}`;
          }
        },
      },
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
          pure_funcs: ["console.log"],
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
        "react-i18next",
        "i18next",
        "date-fns",
        "framer-motion",
      ],
      esbuildOptions: {
        target: ["es2020", "chrome58", "firefox57", "safari11", "edge79"],
        define: {
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development",
          ),
        },
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ["es2020", "chrome58", "firefox57", "safari11", "edge79"],
    },
  };
});
