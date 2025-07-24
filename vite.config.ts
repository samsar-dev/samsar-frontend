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
    define: {
      ...envVars,
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins: [
      react(),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
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
      target: 'esnext', // Target modern browsers for minimal transpilation
      outDir: "dist",
      assetsDir: "assets",
      assetsInlineLimit: 4096, // 4kb
      emptyOutDir: true,
      sourcemap: true,
      sourcemapIgnoreList: (file) => !file.endsWith(".js"),

      minify: 'esbuild', // Faster than terser and produces modern output
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      brotliSize: false,
      cssTarget: 'es2022',

      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', '@headlessui/react', '@heroicons/react'],
            'i18n-vendor': ['i18next', 'react-i18next', 'i18next-http-backend'],
            'utils-vendor': ['lodash', 'axios', 'date-fns'],
            'forms-vendor': ['react-hook-form'],
            'maps-vendor': ['leaflet', 'react-leaflet'],
            'icons-vendor': ['react-icons'],
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
          // Use relative path for source maps
          return `/${relativePath}`;
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
        "date-fns",
        "framer-motion",
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
      target: 'esnext',
    },
  };
});
