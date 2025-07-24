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
    define: envVars,
    plugins: [
      react({
        // Enable TypeScript decorators
        tsDecorators: true,
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz",
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
      target: ["es2022", "chrome90", "firefox88", "safari15", "edge92"],
      outDir: "dist",
      assetsDir: "assets",
      assetsInlineLimit: 4096, // 4kb
      emptyOutDir: true,
      sourcemap: true,
      sourcemapIgnoreList: (file) => !file.endsWith(".js"),

      minify: isProduction ? "terser" : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      brotliSize: false,
      cssTarget: ["es2022", "chrome90", "firefox88", "safari15", "edge92"],

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Preserve i18n bundle
            if (id.includes('react-i18next') || id.includes('i18next')) {
              return 'i18n-core';
            }
            // Aggressive tree-shaking for large dependencies
            if (id.includes('framer-motion') && id.includes('drag')) {
              return 'motion-drag';
            }
            if (id.includes('framer-motion') && id.includes('gestures')) {
              return 'motion-gestures';
            }
            if (id.includes('framer-motion') && id.includes('projection')) {
              return 'motion-projection';
            }
            if (id.includes('date-fns') && id.includes('format')) {
              return 'date-format';
            }
            if (id.includes('date-fns') && id.includes('locale')) {
              return 'date-locale';
            }
            if (id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('axios')) {
              return 'vendor-essential';
            }
            if (id.includes('@headlessui') || id.includes('@heroicons')) {
              return 'vendor-ui';
            }
            if (id.includes('react-hook-form')) {
              return 'vendor-forms';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('framer-motion')) {
              return 'motion-core';
            }
            if (id.includes('react-toastify')) {
              return 'vendor-toast';
            }
            if (id.includes('react-helmet-async')) {
              return 'vendor-helmet';
            }
            if (id.includes('@floating-ui')) {
              return 'vendor-floating';
            }
            if (id.includes('engine.io-client')) {
              return 'vendor-engine';
            }
            return null;
          },
          chunkFileNames: "[name]-[hash].js",
          entryFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash].[ext]",
          hoistTransitiveImports: false,
          minifyInternalExports: true,
          compact: true,
        },
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
      },
    
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? [
            "console.log", "console.info", "console.debug", "console.warn", "console.trace",
            "console.error", "console.table", "console.group", "console.groupEnd", "console.time",
            "console.timeEnd", "console.assert", "console.clear", "console.count", "console.dir",
            "console.dirxml", "console.groupCollapsed", "console.profile", "console.profileEnd",
            "console.timeStamp", "console.context", "console.memory"
          ] : [],
          passes: 5,
          dead_code: true,
          unused: true,
          reduce_funcs: true,
          reduce_vars: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          collapse_vars: true,
          pure_getters: true,
          side_effects: true,
          sequences: true,
          properties: true,
          evaluate: true,
          unsafe: false,
          unsafe_arrows: false,
          unsafe_comps: false,
          unsafe_math: false,
          unsafe_proto: false,
          unsafe_regexp: false,
        },
        mangle: {
          toplevel: isProduction,
          safari10: true,
          keep_classnames: false,
          keep_fnames: false,
        },
        format: {
          comments: false,
          beautify: false,
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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? [
            "console.log", "console.info", "console.debug", "console.warn", "console.trace",
            "console.error", "console.table", "console.group", "console.groupEnd", "console.time",
            "console.timeEnd", "console.assert", "console.clear", "console.count", "console.dir",
            "console.dirxml", "console.groupCollapsed", "console.profile", "console.profileEnd",
            "console.timeStamp", "console.context", "console.memory"
          ] : [],
          passes: 5,
          dead_code: true,
          unused: true,
          reduce_funcs: true,
          reduce_vars: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          collapse_vars: true,
          pure_getters: true,
          side_effects: true,
          sequences: true,
          properties: true,
          evaluate: true,
          unsafe: false,
          unsafe_arrows: false,
          unsafe_comps: false,
          unsafe_math: false,
          unsafe_proto: false,
          unsafe_regexp: false,
        },
        mangle: {
          toplevel: isProduction,
          safari10: true,
          keep_classnames: false,
          keep_fnames: false,
        },
        format: {
          comments: false,
          beautify: false,
        },
      },
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
        "date-fns",
        "framer-motion",
      ],
      esbuildOptions: {
        target: ["es2022", "chrome90", "firefox88", "safari15", "edge92"],
        define: {
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development",
          ),
        },
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: ["es2022", "chrome90", "firefox88", "safari15", "edge92"],
    },
  };
});
