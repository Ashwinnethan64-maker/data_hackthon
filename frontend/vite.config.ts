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
          const destPath = path.resolve(distDir, '404.html');
          const spa404Html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI-CIOS Redirecting...</title>
    <script>
      sessionStorage.redirect = location.href;
      var target = '/app/index.html';
      if (location.search) target += location.search;
      if (location.hash) target += location.hash;
      location.replace(target);
    </script>
  </head>
  <body style="background: #020617; color: #94a3b8; font-family: sans-serif; display: flex; height: 100vh; align-items: center; justify-content: center;">
    <p>Loading AI-CIOS...</p>
  </body>
</html>`;
          fs.writeFileSync(destPath, spa404Html, 'utf-8');
        } catch (err) {
          console.error('Failed to generate 404.html:', err);
        }
      }
    }
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['echarts', 'echarts-for-react'],
          'vendor-maps': ['leaflet'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-query': ['@tanstack/react-query']
        }
      }
    }
  },
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
