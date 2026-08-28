const express = require('express');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');
const zlib = require('zlib');

// Import routers
const authRouter = require('./auth/authRouter');
const casesRouter = require('./cases/casesRouter');
const analyticsRouter = require('./analytics/analyticsRouter');
const aiRouter = require('./ai/aiRouter');
const networkRouter = require('./network/networkRouter');
const mapRouter = require('./map/mapRouter');
const reportsRouter = require('./reports/reportsRouter');
const settingsRouter = require('./settings/settingsRouter');
const systemRouter = require('./system/systemRouter');

const app = express();
app.use(express.json({ limit: '2mb' }));

// Logo and SVG asset synchronization from uploaded Ai-cios_2.ico
try {
  const fs = require('fs');
  const path = require('path');
  const pubDir = path.resolve(__dirname, '..', '..', 'frontend', 'public');
  const icoPath = path.join(pubDir, 'Ai-cios_2.ico');
  if (fs.existsSync(icoPath)) {
    const buf = fs.readFileSync(icoPath);
    const numImages = buf.readUInt16LE(4);
    let bestImg = null;
    let maxArea = 0;

    for (let i = 0; i < numImages; i++) {
      const w = buf.readUInt8(6 + i * 16) || 256;
      const h = buf.readUInt8(7 + i * 16) || 256;
      const len = buf.readUInt32LE(14 + i * 16);
      const off = buf.readUInt32LE(18 + i * 16);
      const imgData = buf.slice(off, off + len);

      if (w === 256 && h === 256) fs.writeFileSync(path.join(pubDir, 'favicon-256x256.png'), imgData);
      if (w === 128 && h === 128) fs.writeFileSync(path.join(pubDir, 'favicon-128x128.png'), imgData);
      if (w === 64 && h === 64) fs.writeFileSync(path.join(pubDir, 'favicon-64x64.png'), imgData);
      if (w === 48 && h === 48) fs.writeFileSync(path.join(pubDir, 'favicon-48x48.png'), imgData);
      if (w === 32 && h === 32) fs.writeFileSync(path.join(pubDir, 'favicon-32x32.png'), imgData);
      if (w === 16 && h === 16) fs.writeFileSync(path.join(pubDir, 'favicon-16x16.png'), imgData);

      if (w * h >= maxArea) {
        maxArea = w * h;
        bestImg = imgData;
      }
    }

    if (bestImg) {
      fs.writeFileSync(path.join(pubDir, 'ai-cios-logo.png'), bestImg);
      fs.writeFileSync(path.join(pubDir, 'logo.png'), bestImg);
      fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), bestImg);
      fs.writeFileSync(path.join(pubDir, 'favicon-512x512.png'), bestImg);
      fs.writeFileSync(path.join(pubDir, 'favicon.ico'), buf);
      fs.writeFileSync(path.join(pubDir, 'ai-cios-favicon.ico'), buf);

      // Generate SVG Logo & Favicon with vector-compatible responsive viewBox
      const b64 = bestImg.toString('base64');
      const mime = (bestImg[0] === 0x89) ? 'image/png' : 'image/jpeg';
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">' +
        '<image href="data:' + mime + ';base64,' + b64 + '" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid meet" />' +
        '</svg>';

      fs.writeFileSync(path.join(pubDir, 'ai-cios-logo.svg'), svgContent);
      fs.writeFileSync(path.join(pubDir, 'logo.svg'), svgContent);
      fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgContent);
      fs.writeFileSync(path.join(pubDir, 'ai-cios-favicon.svg'), svgContent);
    }
  }
} catch (e) {
  console.warn('Logo SVG sync note:', e.message);
}

// Security Headers Middleware (OWASP recommended)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
});

// Lightweight Response Compression Middleware
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) {
    return next();
  }

  const originalSend = res.send.bind(res);
  res.send = (body) => {
    if (typeof body === 'string' && body.length > 1024) {
      res.setHeader('Content-Encoding', 'gzip');
      res.removeHeader('Content-Length');
      zlib.gzip(Buffer.from(body), (err, zipped) => {
        if (err) return originalSend(body);
        return originalSend(zipped);
      });
      return res;
    }
    return originalSend(body);
  };
  next();
});

// Structured Latency & Access Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Unprotected routes
app.use('/system', systemRouter);
app.use('/auth', authRouter);
app.use('/server/ai-cios/system', systemRouter);
app.use('/server/ai-cios/auth', authRouter);

const { errorHandler } = require('./middleware/errorHandler');

// Protected routes (require valid Catalyst session)
app.use('/cases', verifyToken, casesRouter);
app.use('/analytics', verifyToken, analyticsRouter);
app.use('/ai', verifyToken, aiRouter);
app.use('/network', verifyToken, networkRouter);
app.use('/map', verifyToken, mapRouter);
app.use('/reports', verifyToken, reportsRouter);
app.use('/settings', verifyToken, settingsRouter);

app.use('/server/ai-cios/cases', verifyToken, casesRouter);
app.use('/server/ai-cios/analytics', verifyToken, analyticsRouter);
app.use('/server/ai-cios/ai', verifyToken, aiRouter);
app.use('/server/ai-cios/network', verifyToken, networkRouter);
app.use('/server/ai-cios/map', verifyToken, mapRouter);
app.use('/server/ai-cios/reports', verifyToken, reportsRouter);
app.use('/server/ai-cios/settings', verifyToken, settingsRouter);

// Global Error Handler
app.use(errorHandler);

module.exports = app;

// ── Local development: bind to port ────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ AI-CIOS API running locally on http://localhost:${PORT}`);
    console.log(`   Login: http://localhost:${PORT}/auth/login`);
  });
}
