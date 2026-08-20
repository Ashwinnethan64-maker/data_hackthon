const express = require('express');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');

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
app.use(express.json());

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
