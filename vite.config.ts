import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer"; // Add this after installing the package

// Ensure __dirname works correctly with ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx']
      }
    }),
    process.env.ANALYZE === "true" && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@types": path.resolve(__dirname, "src/types"),
      "@api": path.resolve(__dirname, "src/api"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@config": path.resolve(__dirname, "src/config"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: parseInt(process.env.VITE_PORT || "3000"),
    open: process.env.VITE_OPEN_BROWSER === "true",
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err: Error & { code?: string }, _req, _res) => {
            console.log("Proxy Error:", err.message);
            if (err.code === "ECONNREFUSED") {
              console.log(
                "Backend server is not running. Please start the backend server.",
              );
            }
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(`[Proxy] ${req.method} ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              `[Proxy] ${proxyRes.statusCode} ${req.method} ${req.url}`,
            );
          });
        },
      },
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
    },
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
  },
  build: {
    outDir: process.env.VITE_BUILD_DIR || "dist",
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.VITE_ENV === "development",
    minify: "terser",
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    reportCompressedSize: true,
    terserOptions: {
      compress: {
        drop_console: process.env.VITE_ENV !== "development",
        drop_debugger: true,
        pure_funcs: process.env.VITE_ENV !== "development" ? ['console.log'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: (id) => {
          // Core libraries that change infrequently
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            if (id.includes('headlessui') || id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // All other node_modules
            return 'vendor-other';
          }
          
          // Application code splitting
          if (id.includes('/components/listings/')) {
            return 'app-listings';
          }
          if (id.includes('/components/profile/')) {
            return 'app-profile';
          }
          if (id.includes('/components/common/')) {
            return 'app-common';
          }
          if (id.includes('/contexts/')) {
            return 'app-contexts';
          }
          if (id.includes('/hooks/')) {
            return 'app-hooks';
          }
        },
      },
    },
    target: "es2020",
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`,
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
      "lodash",
      "@headlessui/react",
      "react-icons",
      "lucide-react",
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
  define: {
    "process.env": {},
  },
});
