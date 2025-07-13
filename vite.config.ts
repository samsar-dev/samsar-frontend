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
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
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
        },
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
      sourcemap: isProduction ? 'hidden' : false,
      sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
        const relativePath = path.relative(process.cwd(), relativeSourcePath);
        return `https://samsar.app/assets/${relativePath}`;
      },
      
      minify: isProduction ? "terser" : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 300,
      reportCompressedSize: false,
      brotliSize: false,
      
      // Enable tree shaking for all dependencies
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        ignoreTryCatch: false,
      },
      
      // Better module splitting
      modulePreload: {
        polyfill: false,
      },
      
      // Better code splitting
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Split node_modules into smaller chunks
              if (id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-mui';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer';
              }
              if (id.includes('date-fns') || id.includes('lodash') || id.includes('axios')) {
                return 'vendor-utils';
              }
              if (id.includes('i18next') || id.includes('i18n')) {
                return 'vendor-i18n';
              }
              if (id.includes('@headlessui') || id.includes('@heroicons')) {
                return 'vendor-ui';
              }
              if (id.includes('formik') || id.includes('yup') || id.includes('react-hook-form')) {
                return 'vendor-forms';
              }
              if (id.includes('leaflet')) {
                return 'vendor-maps';
              }
              return 'vendor';
            }
          },
          sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            const relativePath = path.relative(process.cwd(), relativeSourcePath);
            // Ensure source maps point to the correct CDN location
            return `https://samsar.app/assets/${relativePath}`;
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
        sourceMap: true,
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
      // Minify in production
      minify: mode === "production",
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
