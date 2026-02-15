import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  
  plugins: [
    laravel({
      input: [
        'resources/js/app.jsx',
        'resources/js/styles/app.scss',
      ],
      refresh: true,
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },

  // Silence broken PURE annotations (ox)
  esbuild: {
    legalComments: 'none',
  },

  // Prevent ox from being prebundled
  optimizeDeps: {
    exclude: ['ox'],
    include: [
      'eventemitter3',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
    ],
  },

  build: {
    sourcemap: false,
    reportCompressedSize: false,
    
    // ✅ INCREASE CHUNK SIZE WARNING LIMIT
    chunkSizeWarningLimit: 2000,
    
    commonjsOptions: {
      include: [/eventemitter3/, /node_modules/],
    },

    rollupOptions: {
      external: ['ox'],

      treeshake: {
        annotations: false,
      },

      // ✅ CRITICAL: SPLIT INTO SMALLER CHUNKS
      output: {
        manualChunks(id) {
          // Three.js and related (HUGE libraries)
          if (id.includes('three') || 
              id.includes('@react-three') || 
              id.includes('drei')) {
            return 'three-vendor';
          }

          // React core
          if (id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('scheduler')) {
            return 'react-vendor';
          }

          // MobX
          if (id.includes('mobx')) {
            return 'mobx-vendor';
          }

          // Inertia
          if (id.includes('@inertiajs') || 
              id.includes('inertia')) {
            return 'inertia-vendor';
          }

          // GSAP animations
          if (id.includes('gsap')) {
            return 'gsap-vendor';
          }

          // All other node_modules → vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // ✅ Better chunk file naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // ✅ REDUCE MEMORY USAGE DURING BUILD
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Remove console.logs
        drop_debugger: true,     // Remove debugger statements
        pure_funcs: ['console.log'], // Remove specific functions
      },
      mangle: {
        safari10: true,
      },
    },
  },

  // ✅ SERVER CONFIG (for npm run dev)
  server: {
    hmr: {
      host: 'localhost',
    },
  },
});