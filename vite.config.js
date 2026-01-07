import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
    ],
    esbuild: {
        loader: 'jsx',
        include: /\.jsx?$/,
    },
    define: {
        'global': 'globalThis',
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name]-[hash]-v2.js`,  // Added -v2
                chunkFileNames: `assets/[name]-[hash]-v2.js`,
                assetFileNames: `assets/[name]-[hash]-v2.[ext]`
            }
        }
    }
});