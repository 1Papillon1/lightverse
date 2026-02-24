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

  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
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
    
    // ✅ CRITICAL: Disable minification entirely (way less memory)
    minify: false,
    
    // ✅ CRITICAL: Reduce chunk size to prevent memory spikes
    chunkSizeWarningLimit: 10000,
    
    // ✅ CRITICAL: Limit concurrent transformations
    rollupOptions: {
      external: ['ox'],
      
      // ✅ Reduce parallel processing
      maxParallelFileOps: 1,
      
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        
        // ✅ NO manual chunks - let Vite auto-handle everything
        // Manual chunking was breaking Three.js circular dependencies
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