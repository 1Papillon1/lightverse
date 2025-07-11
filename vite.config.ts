import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',        // Glavni Inertia bootstrapping file (sa React)
                'resources/js/styles/app.scss'   // Tvoj SCSS fajl, ako se nalazi ovdje
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
});