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

  // ✅ REMOVED esbuild.drop - keep console.log in dev mode!
  esbuild: {
    legalComments: 'none',
  },

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
    
    chunkSizeWarningLimit: 10000,
    
    rollupOptions: {
      external: ['ox'],
      
      maxParallelFileOps: 1,
      
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    commonjsOptions: {
      include: [/node_modules/],
    },
  },

  server: {
    hmr: {
      host: 'localhost',
    },
  },
});