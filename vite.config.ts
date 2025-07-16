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
          rollupOptions: {
            output: {
              sourcemap: true,
              sourcemapExcludeSources: false,
              sourcemapFileNames: '[name]-[hash].map',
              manualChunks(id) {
                if (!id.includes('node_modules')) return;
          
                // React ecosystem
                if (id.includes('react-router-dom')) return 'vendor-react-router';
                if (id.includes('react')) return 'vendor-react'; // Includes react, react-dom, etc.
                if (id.includes('@emotion')) return 'vendor-emotion';
          
                // UI libraries
                if (id.includes('@headlessui')) return 'vendor-headlessui';
                if (id.includes('@heroicons')) return 'vendor-heroicons';
                if (id.includes('@radix-ui')) return 'vendor-radix';
                if (id.includes('react-modal')) return 'vendor-modal';
                if (id.includes('react-datepicker')) return 'vendor-datepicker';
                if (id.includes('react-select')) return 'vendor-select';
                if (id.includes('react-table')) return 'vendor-table';
          
                // Forms
                if (id.includes('react-hook-form')) return 'vendor-forms';
                if (id.includes('yup')) return 'vendor-forms';
                if (id.includes('formik')) return 'vendor-forms';
          
                // Styling & helpers
                if (id.includes('tailwindcss')) return 'vendor-tailwind';
                if (id.includes('clsx')) return 'vendor-clsx';
                if (id.includes('classnames')) return 'vendor-clsx';
                if (id.includes('prop-types')) return 'vendor-proptypes';
          
                // Maps
                if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
          
                // Animations
                if (id.includes('framer-motion')) return 'vendor-framer';
          
                // Date
                if (id.includes('date-fns')) return 'vendor-date';
          
                // State management & utils
                if (id.includes('zustand')) return 'vendor-zustand';
                if (id.includes('nanoid')) return 'vendor-utils';
                if (id.includes('lodash')) return 'vendor-utils';
                if (id.includes('uuid')) return 'vendor-utils';
          
                // Charts
                if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
          
                // Network
                if (id.includes('axios') || id.includes('qs')) return 'vendor-network';
                if (id.includes('jwt-decode')) return 'vendor-auth';
          
                // Realtime & analytics
                if (id.includes('socket.io-client')) return 'vendor-realtime';
                if (id.includes('@vercel/analytics') || id.includes('react-ga4')) return 'vendor-analytics';
          
                // Fallback: everything else from node_modules
                return 'vendor';
              },
              sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
                const relativePath = path.relative(process.cwd(), relativeSourcePath);
                return `/${relativePath}`;
              },
            },
          },
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
