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

// Protected routes (require valid Catalyst session)
app.use('/cases', verifyToken, casesRouter);
app.use('/analytics', verifyToken, analyticsRouter);
app.use('/ai', verifyToken, aiRouter);
app.use('/network', verifyToken, networkRouter);
app.use('/map', verifyToken, mapRouter);
app.use('/reports', verifyToken, reportsRouter);
app.use('/settings', verifyToken, settingsRouter);

module.exports = app;

// ── Local development: bind to port ────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ AI-CIOS API running locally on http://localhost:${PORT}`);
    console.log(`   Login: http://localhost:${PORT}/auth/login`);
  });
}
