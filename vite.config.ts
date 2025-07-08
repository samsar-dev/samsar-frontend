import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Only include necessary environment variables
  const envVars: Record<string, string> = {};
  const allowedVars = ['NODE_ENV', 'VITE_'];
  
  Object.entries(env).forEach(([key, value]) => {
    if (allowedVars.some(prefix => key === prefix || key.startsWith(prefix))) {
      envVars[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  });
  
  const isProduction = mode === 'production';
  
  return {
    define: envVars,
    plugins: [
      react({
        // Enable TypeScript decorators
        tsDecorators: true,
        // Development options
        jsxImportSource: '@emotion/react',
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
            title: 'Samsar - سمسار',
            description: 'سوق السيارات والعقارات الأول في سوريا',
            themeColor: '#1a56db',
          },
        },
      }),
      // Image optimization will be handled by the build script
      
      // Compression
      viteCompression({
        threshold: 1024, // Compress files >1KB
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      viteCompression({
        threshold: 1024, // Compress files >1KB
        algorithm: 'gzip',
        ext: '.gz',
      }),
      
      // Bundle analyzer (only in analyze mode)
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'bundle-analyzer-report.html',
        gzipSize: true,
        brotliSize: true,
      })
    ].filter(Boolean),
    
    // Configure static asset handling
    publicDir: 'public',
    assetsInclude: ['**/*.woff2', '**/*.svg'],
    
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
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          ws: true
        }
      }
    },
    
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
      brotliSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            'vendor-large': ['framer-motion'],
            vendor: ['axios', 'date-fns'],
            ui: ['@headlessui/react', '@heroicons/react'],
            forms: ['formik', 'yup', 'react-hook-form'],
            maps: ['leaflet', 'react-leaflet'],
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: ['console.log'],
        },
        format: {
          comments: false,
        },
      },
    },
    
    css: {
      postcss: './postcss.config.js',
      devSourcemap: mode !== 'production',
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: mode === 'production' ? '[hash:base64:5]' : '[name]__[local]__[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
      },
      // Minify in production
      minify: mode === 'production',
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-i18next',
        'i18next',
        'date-fns',
        'framer-motion',
        
      ],
      esbuildOptions: {
        target: ['es2020', 'chrome58', 'firefox57', 'safari11', 'edge79'],
        define: {
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development'
          )
        }
      }
    },
    
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: ['es2020', 'chrome58', 'firefox57', 'safari11', 'edge79']
    }
  };
});
