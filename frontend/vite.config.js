import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Match all requests starting with /server/ai-cios-api
            // Strip prefix before forwarding to the local Express server on port 3000
            // e.g. /server/ai-cios-api/auth/login  →  http://localhost:3000/auth/login
            '/server/ai-cios-api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/server\/ai-cios-api/, ''),
            },
        },
    },
});
