import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Export the configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === 'production';

  // Include only env variables with VITE_ prefix
  const envVars = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, val]) => [[`import.meta.env.${key}`], JSON.stringify(val)])
  );

  // PostCSS is configured in postcss.config.js

  return {
    base: '/',
    define: envVars,
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        tsDecorators: true
      }),

      viteCompression({ threshold: 1024, algorithm: 'brotliCompress', ext: '.br' }),
      viteCompression({ threshold: 1024, algorithm: 'gzip', ext: '.gz' }),

      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: 'Samsar - سمسار',
            description: 'سوق السيارات والعقارات الأول في سوريا',
            themeColor: '#1a56db'
          },
          tags: [
            {
              tag: 'meta',
              attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1' },
              injectTo: 'head-prepend'
            },
            {
              tag: 'meta',
              attrs: { name: 'theme-color', content: '#1a56db' },
              injectTo: 'head-prepend'
            }
          ]
        }
      }),

      isProduction && visualizer({
        open: true,
        filename: 'bundle-analyzer.html',
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    server: {
      port: 3000,
      open: false,
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          ws: true
        }
      }
    },

    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProduction ? '[hash:base64:5]' : '[name]__[local]__[hash:base64:5]'
      }
    },

    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
      minify: 'terser',
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: ['console.log']
        },
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('react-router-dom')) return 'vendor-router';
            if (id.includes('@headlessui')) return 'vendor-headlessui';
            if (id.includes('axios')) return 'vendor-axios';
            return 'vendor';
          }
        }
      }
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: ['es2020']
      }
    }
  };
});
