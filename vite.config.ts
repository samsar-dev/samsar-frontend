import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from 'vite-plugin-html';
import Pages from 'vite-plugin-pages';
import { visualizer } from 'rollup-plugin-visualizer';
import { readFileSync } from 'fs';
import type { PluginOption } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read critical CSS
const criticalCSS = readFileSync(path.resolve(__dirname, 'src/styles/critical.css'), 'utf-8');

export default defineConfig(({ mode }): UserConfig => {
  // Base configuration
  const config: UserConfig = {
    base: './',
    define: {
      'process.env': {}
    },
    plugins: [
      react(),
      Pages({
        routeStyle: 'next',
        exclude: ['**/components/**/*'],
      }),
      createHtmlPlugin({
        minify: true,
        entry: 'src/main.tsx',
        template: 'index.html',
        inject: {
          data: {
            title: 'Samsar',
            description: 'سوق السيارات والعقارات الأول في سوريا',
            criticalCSS: `<style>${criticalCSS}</style>`,
          },
        },
      }),
      viteCompression({
        threshold: 10240,
        algorithm: "brotliCompress",
        ext: ".br",
      }),
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
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
            proxy.on(
              "error",
              (err: { code?: string; message: string }, _req, _res) => {
                console.log("Proxy Error:", err.message);
                if (err.code === "ECONNREFUSED") {
                  console.log(
                    "Backend server is not running. Please start the backend server."
                  );
                }
              }
            );
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(`[Proxy] ${req.method} ${req.url}`);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                `[Proxy] ${proxyRes.statusCode} ${req.method} ${req.url}`
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
      outDir: process.env.VITE_BUILD_DIR || 'dist',
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('@headlessui') || id.includes('@heroicons')) return 'vendor-ui';
              if (id.includes('date-fns') || id.includes('lodash') || id.includes('axios') || id.includes('framer-motion')) return 'vendor-utils';
              if (id.includes('leaflet')) return 'vendor-maps';
              return 'vendor';
            }
            return undefined;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') return 'assets/[name]-[hash].js';
            if (chunkInfo.name?.startsWith('vendor-')) return 'assets/[name]-[hash].js';
            return 'assets/[name]-[hash].js';
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      } : undefined,
    },
    css: {
      modules: {
        scopeBehaviour: 'local',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-i18next',
        '@headlessui/react',
        '@heroicons/react/outline',
        '@heroicons/react/solid',
        'date-fns',
        'lodash',
        'axios',
        'framer-motion',
        'leaflet',
        'react-leaflet'
      ],
      esbuildOptions: {
        target: "es2020",
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' as const },
      target: "es2020",
    },
  };

  // Add manual chunks for better code splitting
  if (mode === 'production') {
    config.build = {
      ...config.build,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('@headlessui') || id.includes('@heroicons')) return 'vendor-ui';
              if (id.includes('date-fns') || id.includes('lodash') || id.includes('axios') || id.includes('framer-motion')) return 'vendor-utils';
              if (id.includes('leaflet')) return 'vendor-maps';
              return 'vendor';
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') return 'assets/[name]-[hash].js';
            if (chunkInfo.name?.startsWith('vendor-')) return 'assets/[name]-[hash].js';
            return 'assets/[name]-[hash].js';
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    };
  }

  if (mode === 'production') {
    config.build.terserOptions = {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    };
  }

  return config;
});
