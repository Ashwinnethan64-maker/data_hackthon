import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/app/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/server/ai-cios': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/app/__catalyst': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/app\/__catalyst/, '/__catalyst'),
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://localhost:3000/',
          Origin: 'http://localhost:3000'
        }
      },
      '/__catalyst': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://localhost:3000/',
          Origin: 'http://localhost:3000'
        }
      },
      '/accounts': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://localhost:3000/',
          Origin: 'http://localhost:3000'
        }
      },
      '/baas/v1': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        headers: {
          Host: 'localhost:3000',
          Referer: 'http://localhost:3000/',
          Origin: 'http://localhost:3000'
        }
      },
    },
  },
});
