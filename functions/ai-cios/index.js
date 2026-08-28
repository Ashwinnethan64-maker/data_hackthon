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
