import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import { obfuscator } from "vite-plugin-obfuscator";
import { splitVendorChunkPlugin } from "vite";

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
        tsDecorators: true,
        jsxImportSource: "@emotion/react",
      }),
      splitVendorChunkPlugin(),
      // Obfuscation in production only
      isProduction && obfuscator({
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false, // Disable in development
        debugProtectionInterval: 4000,
        disableConsoleOutput: isProduction,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: true,
        rotateStringArray: true,
        selfDefending: true,
        shuffleStringArray: true,
        splitStrings: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
        target: 'browser',
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
      mode === "analyze" && visualizer({
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
      target: "esnext",
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false, // Disable source maps in production for smaller bundle
      minify: isProduction ? "terser" : false,
      cssCodeSplit: true,
      cssMinify: isProduction,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core React split into smallest possible chunks
            if (id.includes('node_modules/react/')) {
              if (id.includes('react-dom/')) {
                return id.includes('client') ? 'vendor_react_dom_client' : 'vendor_react_dom';
              }
              if (id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
                return 'vendor_react_jsx';
              }
              return 'vendor_react';
            }

            // React Router
            if (id.includes('react-router-dom/')) {
              return 'vendor_router';
            }

            // UI Libraries
            if (id.includes('@mui/material') || id.includes('@emotion')) {
              return 'vendor_mui';
            }
            if (id.includes('@headlessui/react') || id.includes('@heroicons/react')) {
              return 'vendor_headlessui';
            }

            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor_forms';
            }
            if (id.includes('yup') || id.includes('zod')) {
              return 'vendor_validation';
            }

            // State Management
            if (id.includes('@tanstack/')) {
              return 'vendor_tanstack';
            }

            // Split application code by feature
            if (id.includes('src/')) {
              const featureMatch = id.match(/src\/([^/]+)/);
              if (featureMatch) {
                return `feature_${featureMatch[1].toLowerCase()}`;
              }
            }

            // Group remaining node_modules by package name
            if (id.includes('node_modules/')) {
              const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
              if (match) {
                const packageName = match[1].replace(/[^a-z0-9]/g, '_').toLowerCase();
                return `vendor_${packageName}`;
              }
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 3,
          ecma: 2020,
          toplevel: true,
        },
        format: {
          comments: false,
          ecma: 2020,
        },
        mangle: {
          properties: {
            regex: /^_/,
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
