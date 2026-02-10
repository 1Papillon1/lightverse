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
    
    include: ["eventemitter3"],
  
  },

  build: {
    sourcemap: false,
    reportCompressedSize: false,
    commonjsOptions: {
      //      include: [/eventemitter3/, /node_modules/],
       include: [/eventemitter3/, /node_modules/],
    },

    rollupOptions: {
      // ONLY externalize ox
      external: ['ox'],

      treeshake: {
        annotations: false,
      },
    },
  },
});