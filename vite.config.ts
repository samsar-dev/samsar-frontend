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
    // Configure assets
    assetsInclude: ["**/*.woff2", "**/*.svg", "**/*.css"],
    assetsDir: "static/assets",
    
    // Configure public directory
    publicDir: false, // Disable public directory since we're using assetsDir
    
 

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
      assetsDir: "static/assets",
      assetsInlineLimit: 4096, // 4kb
      
      // Configure asset handling
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: `static/js/[name]-[hash].js`,
          chunkFileNames: `static/js/[name]-[hash].js`,
          assetFileNames: `static/assets/[name]-[hash].[ext]`,
          sourcemap: true,
          sourcemapExcludeSources: false,
          sourcemapFileNames: '[name]-[hash].map',
          manualChunks: {
            // Core React and routing
            react: ["react", "react-dom", "react-router-dom"],
            
            // Large vendor libraries
            "vendor-large": ["framer-motion", "@vercel/speed-insights/react"],
            
            // Common utilities
            vendor: ["axios", "date-fns", "react-i18next"],
            
            // UI components
            ui: ["@headlessui/react", "@heroicons/react", "@emotion/react"],
            
            // Forms and validation
            forms: ["react-hook-form"],
            
            // Maps and location
            maps: ["leaflet", "react-leaflet"],
            
            // Additional optimizations
            lodash: ["lodash"],
            moment: ["moment"],
            
            // Split out analytics
            analytics: ["@vercel/analytics/react"],
          },
          sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            const relativePath = path.relative(process.cwd(), relativeSourcePath);
            return `/${relativePath}`;
          },
        },
        treeshake: {
          moduleSideEffects: true,
          propertyReadSideEffects: true,
          tryCatch: true,
        },
        plugins: [
          // Remove unused exports
          {
            name: 'remove-unused-exports',
            generateBundle(_, bundle) {
              Object.entries(bundle).forEach(([fileName, chunk]) => {
                if (chunk.type === 'asset') return;
                
                // Remove unused exports
                chunk.code = chunk.code.replace(/export\s+default\s+\{[^}]*\};?/g, '');
                chunk.code = chunk.code.replace(/export\s+\{[^}]*\};?/g, '');
              });
            },
          },
        ],
      },
      
      emptyOutDir: true,
      sourcemap: true,
      sourcemapFileNames: '[name]-[hash].map',
      sourcemapIgnoreList: (file) => !file.endsWith('.js'),
      
      minify: isProduction ? "terser" : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: true,
      brotliSize: true,
      
      // Additional optimizations
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        ignoreGlobal: true,
      },
      
      // Dynamic imports optimization
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [/node_modules/],
      },
      
      // Optimize imports
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@emotion/react'
        ],
        esbuildOptions: {
          target: 'es2020',
          define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
          },
          plugins: [
            {
              name: 'optimize-imports',
              setup(build) {
                build.onResolve({ filter: /node_modules/ }, (args) => {
                  const id = args.path;
                  if (id.startsWith('react')) {
                    return { path: id, external: true };
                  }
                });
              },
            },
          ],
        },
      },
      
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
          pure_funcs: ["console.log"],
          passes: 3,
          booleans_as_integers: true,
          collapse_vars: true,
          ecma: 2020,
          sequences: true,
          toplevel: true,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
          unused: true,
        },
        format: {
          comments: false,
          ascii_only: true,
        },
        sourceMap: true,
        mangle: {
          reserved: ['__webpack_public_path__', '__webpack_require__'],
          properties: {
            regex: /^__/,
          },
        },
        module: true,
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
