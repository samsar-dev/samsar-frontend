import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Only use the new JSX transform in production
      jsxRuntime: 'automatic',
      // Enable fast refresh
      fastRefresh: true,
      // Babel configuration for modern browsers
      babel: {
        plugins: [
          // Remove console.log in production
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
        presets: [
          ['@babel/preset-env', 
            { 
              targets: '>0.2%, not dead, not op_mini all',
              useBuiltIns: 'usage',
              corejs: 3,
              modules: false,
              debug: false
            }
          ]
        ]
      }
    }),
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'bundle-analyzer.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react';
            }
            if (id.includes('@mui')) {
              return 'vendor_mui';
            }
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'vendor_utils';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`,
      },
    },
  },
});
