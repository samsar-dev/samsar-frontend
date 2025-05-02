import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc"; // Faster than default react plugin
import path from "path";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      compression({
        threshold: 1024,
        algorithm: "brotliCompress", // Also supports 'gzip'
        ext: ".br",
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
      port: parseInt(env.VITE_PORT || "3000"),
      open: env.VITE_OPEN_BROWSER === "true",
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          ws: true,
        },
      },
      cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      },
    },
    build: {
      target: "esnext", // Future-proof JS output
      outDir: env.VITE_BUILD_DIR || "dist",
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-react";
              if (id.includes("socket.io")) return "vendor-socket";
              return "vendor";
            }
          },
        },
      },
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    define: {
      "process.env": {},
    },
  };
});
