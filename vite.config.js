import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    root: 'www',
    publicDir: false,
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'www/index.html'),
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    },
    server: {
        port: 5173,
        open: true
    }
});