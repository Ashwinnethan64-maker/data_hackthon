import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/app/',
  plugins: [
    react(),
    {
      name: 'modify-catalyst-init-js',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.includes('/__catalyst/sdk/init.js')) {
            try {
              const response = await fetch('http://127.0.0.1:3000/__catalyst/sdk/init.js');
              if (response.ok) {
                let content = await response.text();
                content = content.replace(
                  /auth_domain\s*:\s*["']https:\/\/accounts\.zohoportal\.in["']/,
                  'auth_domain : window.location.origin + "/accounts-proxy"'
                );
                res.setHeader('Content-Type', 'application/javascript');
                res.end(content);
                return;
              }
            } catch (_err) {
              // Catalyst emulator (port 3000) not active; fallback stub
              res.setHeader('Content-Type', 'application/javascript');
              res.end('/* Catalyst SDK stub when catalyst serve is not running */');
              return;
            }
          }
          next();
        });
      }
    },
    {
      name: 'copy-404-html',
      closeBundle() {
        try {
          const distDir = path.resolve(process.cwd(), 'dist');
          const srcPath = path.resolve(distDir, 'index.html');
          const destPath = path.resolve(distDir, '404.html');
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        } catch (err) {
          console.error('Failed to copy index.html to 404.html:', err);
        }
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.loca.lt', '.ngrok-free.dev', '.ngrok.io', 'localhost', '127.0.0.1'],
    proxy: {
      '/server/ai-cios': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/accounts-proxy': {
        target: 'https://accounts.zohoportal.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/accounts-proxy/, ''),
        headers: {
          Referer: 'http://localhost:3000/',
          Origin: 'http://localhost:3000'
        }
      },
      '/app/__catalyst': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/app\/__catalyst/, '/__catalyst'),
        bypass: (req) => req.url && req.url.includes('/__catalyst/sdk/init.js') ? req.url : undefined,
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
        bypass: (req) => req.url && req.url.includes('/__catalyst/sdk/init.js') ? req.url : undefined,
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
