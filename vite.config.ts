import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Critical CSS plugin
const criticalCSS = (): PluginOption => {
  let criticalCSS = '';
  
  return {
    name: 'critical-css',
    apply: 'build',
    
    // Read critical CSS during build
    configResolved() {
      try {
        criticalCSS = readFileSync(
          path.resolve(__dirname, 'src/assets/css/critical.css'),
          'utf-8'
        );
      } catch (e) {
        console.warn('Failed to load critical CSS:', e);
      }
    },
    
    // Inject critical CSS into HTML
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        return html.replace(
          '<style id="critical-css">',
          `<style id="critical-css">${criticalCSS}`
        );
      },
    },
  };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  // Only include necessary environment variables
  const envVars: Record<string, string> = {};
  const allowedVars = ['NODE_ENV', 'VITE_'];
  
  Object.entries(env).forEach(([key, value]) => {
    if (allowedVars.some(prefix => key === prefix || key.startsWith(prefix))) {
      envVars[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  });
  
  return {
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      'process.env.VITE_API_URL': `"${env.VITE_API_URL || ''}"`,
      ...envVars
    },
    plugins: [
      // Workaround for react-helmet-async
      {
        name: 'react-helmet-async',
        enforce: 'pre',
        resolveId(source) {
          if (source === 'react-helmet-async') {
            return require.resolve('react-helmet-async/lib/index.js');
          }
          return null;
        }
      } as PluginOption,
      criticalCSS(),
      react({
        jsxImportSource: '@emotion/react',
        jsxRuntime: 'automatic',
        babel: {
          plugins: [
            'babel-plugin-macros',
            ['@emotion/babel-plugin', { sourceMap: !isProduction }]
          ]
        },
      }),
      createHtmlPlugin({
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
          removeEmptyAttributes: true,
          removeTagWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: false,
        } : false,
        inject: {
          data: {
            title: 'Samsar - سمسار',
            description: 'سوق السيارات والعقارات الأول في سوريا',
            themeColor: '#1a56db',
          },
        },
      }),
      viteCompression({
        threshold: 1024,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      viteCompression({
        threshold: 1024,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      isProduction && visualizer({
        open: false,
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
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
        { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
        { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
        { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
        { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
        { find: '@types', replacement: path.resolve(__dirname, 'src/types') },
        { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      ],
    },
    
    server: {
      port: 3000,
      open: true,
      strictPort: true,
      proxy: {
        // API proxy configuration
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
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
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      cssCodeSplit: true,
      minify: 'terser',
      chunkSizeWarningLimit: 1600,
      reportCompressedSize: false,
      target: 'esnext',
      modulePreload: {
        polyfill: false,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['lodash', 'axios', 'date-fns'],
            ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
            forms: ['formik', 'yup', 'react-hook-form'],
            maps: ['leaflet', 'react-leaflet'],
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'index.css') {
              return 'assets/css/index.[hash].css';
            }
            return 'assets/[name].[hash][extname]';
          },
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
        format: {
          comments: false,
        },
      },
    },
    
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/css/index.css";`
        }
      }
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
        'lodash'
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
