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

  // Silence broken PURE annotations (ox / reown)
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
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
    minify: false,

    // Suppress chunk size warnings — not splitting manually
    chunkSizeWarningLimit: 10000,

    commonjsOptions: {
      // Ensures CJS packages (including React) share one module registry
      include: [/node_modules/],
      // This is the key fix: treat React as a singleton in CJS interop
      requireReturnsDefault: 'auto',
    },

    rollupOptions: {
      external: ['ox'],

      treeshake: {
        annotations: false,
      },

      output: {
        // ✅ NO manualChunks — Vite handles React singleton automatically
        // Adding manualChunks breaks CJS interop load order for React
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    hmr: {
      host: 'localhost',
    },
  },
});