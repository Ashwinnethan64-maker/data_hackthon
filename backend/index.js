const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('./middleware/auth');

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

// Security middlewares
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Must allow credentials for cookies to work with CORS if hitting a separate domain
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Structured Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.warn(`[API WARN] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    } else {
      console.info(`[API INFO] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// System Health (Unprotected)
app.use('/system', systemRouter);

// Root (Unprotected)
app.get('/', (req, res) => {
  res.json({ status: 'AI-CIOS API online', platform: 'Node.js Express REST API' });
});

// Auth router handles login/logout without token requirement
app.use('/auth', authRouter);

// Protect all other API routers with JWT verification middleware
app.use('/cases', verifyToken, casesRouter);
app.use('/analytics', verifyToken, analyticsRouter);
app.use('/ai', verifyToken, aiRouter);
app.use('/network', verifyToken, networkRouter);
app.use('/map', verifyToken, mapRouter);
app.use('/reports', verifyToken, reportsRouter);
app.use('/settings', verifyToken, settingsRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ── Local development: bind to port ────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅  AI-CIOS API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/system/health`);
  console.log(`   Auth:   http://localhost:${PORT}/auth/login`);
  console.log(`   Cases:  http://localhost:${PORT}/cases`);
  console.log(`   AI:     http://localhost:${PORT}/ai/chat\n`);
});

