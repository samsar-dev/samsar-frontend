import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable TypeScript decorators
      tsDecorators: true,
    }),
    splitVendorChunkPlugin(),
    visualizer({
      filename: "bundle-analyzer.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    treeshake: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor_react";
            }
            if (id.includes("@mui")) {
              return "vendor_mui";
            }
            if (id.includes("lodash") || id.includes("date-fns")) {
              return "vendor_utils";
            }
            return "vendor";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
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
      "@mui/material",
      "@emotion/react",
      "@emotion/styled",
    ],
    esbuildOptions: {
      // Use modern syntax for browsers that support ES modules (most mobile browsers today)
     target: "es2022",
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`,
      },
    },
  },
});
